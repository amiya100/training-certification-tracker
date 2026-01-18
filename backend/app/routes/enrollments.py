from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from ..database import get_db
from ..crud import enrollment as crud_enrollment
from ..crud import certification as crud_certification
from ..schemas.certification import CertificationCreate
from datetime import datetime, timedelta
from ..schemas.enrollment import Enrollment, EnrollmentCreate, EnrollmentUpdate, EnrollmentList
from ..dependecies import get_current_user

router = APIRouter(prefix="/enrollments", tags=["enrollments"])

@router.post("", response_model=Enrollment, status_code=status.HTTP_201_CREATED)
def create_enrollment(enrollment: EnrollmentCreate, db: Session = Depends(get_db), current_user: dict = Depends(get_current_user)):
    # Check if employee is already enrolled in this training
    existing_enrollments = crud_enrollment.get_by_employee(db, enrollment.employee_id)
    for existing in existing_enrollments:
        if existing.training_id == enrollment.training_id and existing.status in ["enrolled", "in_progress"]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Employee is already enrolled in this training"
            )
    
    return crud_enrollment.create(db, obj_in=enrollment)

@router.get("", response_model=EnrollmentList)
def read_enrollments(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    status: Optional[str] = Query(None, description="Filter by status"),
    employee_id: Optional[int] = Query(None, description="Filter by employee ID"),
    training_id: Optional[int] = Query(None, description="Filter by training ID"),
    min_progress: Optional[int] = Query(None, ge=0, le=100, description="Minimum progress percentage"),
    max_progress: Optional[int] = Query(None, ge=0, le=100, description="Maximum progress percentage"),
    db: Session = Depends(get_db), 
    current_user: dict = Depends(get_current_user)
):
    items = crud_enrollment.get_multi(db, skip, limit)
    
    # Apply filters
    if status:
        items = [item for item in items if item.status == status]
    if employee_id:
        items = [item for item in items if item.employee_id == employee_id]
    if training_id:
        items = [item for item in items if item.training_id == training_id]
    if min_progress is not None:
        items = [item for item in items if item.progress >= min_progress]
    if max_progress is not None:
        items = [item for item in items if item.progress <= max_progress]
    
    total = crud_enrollment.get_total_count(db)
    return EnrollmentList(enrollments=items, total=total, skip=skip, limit=limit)

@router.put("/{enrollment_id}", response_model=Enrollment)
def update_enrollment(
    enrollment_id: int,
    enrollment_update: EnrollmentUpdate,
    db: Session = Depends(get_db), 
    current_user: dict = Depends(get_current_user)
):
    obj = crud_enrollment.get(db, enrollment_id)
    if not obj:
        raise HTTPException(404, "Enrollment not found")
    print(enrollment_update)
    
    # If marking as completed, set completed_date
    if enrollment_update.status == "completed" and obj.status != "completed":
        from datetime import datetime
        enrollment_update.completed_date = datetime.utcnow()
        if enrollment_update.progress is None:
            enrollment_update.progress = 100
            create_certificate_if_not_exists(db, enrollment=obj)
    
    # If progress is 100, auto-mark as completed
    if enrollment_update.progress == 100 and obj.status in ["in_progress","enrolled"]:
        from datetime import datetime
        enrollment_update.status = "completed"
        enrollment_update.completed_date = datetime.utcnow()
        create_certificate_if_not_exists(db, enrollment=obj)
    
    return crud_enrollment.update(db, db_obj=obj, obj_in=enrollment_update)

# NEW ENDPOINT: Update enrollment progress
@router.patch("/{enrollment_id}/progress", response_model=Enrollment)
def update_enrollment_progress(
    enrollment_id: int,
    progress: int = Query(..., ge=0, le=100, description="Progress percentage (0-100)"),
    db: Session = Depends(get_db), 
    current_user: dict = Depends(get_current_user)
):
    """Update the progress percentage for an enrollment"""
    obj = crud_enrollment.update_progress(db, enrollment_id=enrollment_id, progress=progress)
    if not obj:
        raise HTTPException(404, "Enrollment not found")
    
    # Create certificate if progress is 100
    if progress == 100:
        create_certificate_if_not_exists(db, enrollment=obj)
    
    return obj

@router.post("/{enrollment_id}/complete", response_model=Enrollment)
def complete_enrollment(enrollment_id: int, db: Session = Depends(get_db), current_user: dict = Depends(get_current_user)):
    """Mark enrollment as completed (sets progress to 100)"""
    obj = crud_enrollment.complete_enrollment(db, enrollment_id)
    if not obj:
        raise HTTPException(404, "Enrollment not found")
    
    # Create certificate if not already exists
    create_certificate_if_not_exists(db, enrollment=obj)
    
    return obj

@router.delete("/{enrollment_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_enrollment(enrollment_id: int, db: Session = Depends(get_db), current_user: dict = Depends(get_current_user)):
    obj = crud_enrollment.remove(db, id=enrollment_id)
    if not obj:
        raise HTTPException(404, "Enrollment not found")
    return None


#Helper function to create certificate on completion of enrollment
def create_certificate_if_not_exists(db: Session, enrollment):
    """Helper function to create certificate for completed enrollment"""
    
    # Check if certificate already exists for this enrollment
    existing_cert = crud_certification.get_by_enrollment(db, enrollment_id=enrollment.id)
    if existing_cert:
        return existing_cert  # Certificate already exists
    
    # Generate certificate number
    cert_number = f"CERT-{datetime.utcnow().strftime('%Y%m%d')}-{enrollment.id}"
    
    # Set expiry date (e.g., 1 year from now)
    expires_at = datetime.utcnow() + timedelta(days=365)
    
    certification_data = CertificationCreate(
        employee_id=enrollment.employee_id,
        training_id=enrollment.training_id,
        enrollment_id=enrollment.id,
        cert_number=cert_number,
        expires_at=expires_at,
        status="active"
    )
    
    # Create certification
    return crud_certification.create(db, obj_in=certification_data)
