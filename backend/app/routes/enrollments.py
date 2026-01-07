from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from ..database import get_db
from ..crud import enrollment as crud_enrollment
from ..schemas.enrollment import Enrollment, EnrollmentCreate, EnrollmentUpdate, EnrollmentList

router = APIRouter(prefix="/enrollments", tags=["enrollments"])

@router.post("/", response_model=Enrollment, status_code=status.HTTP_201_CREATED)
def create_enrollment(enrollment: EnrollmentCreate, db: Session = Depends(get_db)):
    # Check if employee is already enrolled in this training
    from ..crud import enrollment as crud_enrollment
    existing_enrollments = crud_enrollment.get_by_employee(db, enrollment.employee_id)
    for existing in existing_enrollments:
        if existing.training_id == enrollment.training_id and existing.status in ["enrolled", "in_progress"]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Employee is already enrolled in this training"
            )
    
    return crud_enrollment.create(db, obj_in=enrollment)

@router.get("/", response_model=EnrollmentList)
def read_enrollments(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    status: Optional[str] = Query(None, description="Filter by status"),
    employee_id: Optional[int] = Query(None, description="Filter by employee ID"),
    training_id: Optional[int] = Query(None, description="Filter by training ID"),
    min_progress: Optional[int] = Query(None, ge=0, le=100, description="Minimum progress percentage"),
    max_progress: Optional[int] = Query(None, ge=0, le=100, description="Maximum progress percentage"),
    db: Session = Depends(get_db)
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

@router.get("/active", response_model=List[Enrollment])
def get_active_enrollments(db: Session = Depends(get_db)):
    return crud_enrollment.get_active_enrollments(db)

@router.get("/{enrollment_id}", response_model=Enrollment)
def read_enrollment(enrollment_id: int, db: Session = Depends(get_db)):
    obj = crud_enrollment.get(db, enrollment_id)
    if not obj:
        raise HTTPException(404, "Enrollment not found")
    return obj

@router.put("/{enrollment_id}", response_model=Enrollment)
def update_enrollment(
    enrollment_id: int,
    enrollment_update: EnrollmentUpdate,
    db: Session = Depends(get_db)
):
    obj = crud_enrollment.get(db, enrollment_id)
    if not obj:
        raise HTTPException(404, "Enrollment not found")
    
    # If marking as completed, set completed_date
    if enrollment_update.status == "completed" and obj.status != "completed":
        from datetime import datetime
        enrollment_update.completed_date = datetime.utcnow()
        if enrollment_update.progress is None:
            enrollment_update.progress = 100
    
    # If progress is 100, auto-mark as completed
    if enrollment_update.progress == 100 and enrollment_update.status is None:
        enrollment_update.status = "completed"
        enrollment_update.completed_date = datetime.utcnow()
    
    return crud_enrollment.update(db, db_obj=obj, obj_in=enrollment_update)

# NEW ENDPOINT: Update enrollment progress
@router.patch("/{enrollment_id}/progress", response_model=Enrollment)
def update_enrollment_progress(
    enrollment_id: int,
    progress: int = Query(..., ge=0, le=100, description="Progress percentage (0-100)"),
    db: Session = Depends(get_db)
):
    """Update the progress percentage for an enrollment"""
    obj = crud_enrollment.update_progress(db, enrollment_id=enrollment_id, progress=progress)
    if not obj:
        raise HTTPException(404, "Enrollment not found")
    return obj

# NEW ENDPOINT: Mark enrollment as completed (alternative to PUT)
@router.post("/{enrollment_id}/complete", response_model=Enrollment)
def complete_enrollment(enrollment_id: int, db: Session = Depends(get_db)):
    """Mark enrollment as completed (sets progress to 100)"""
    obj = crud_enrollment.complete_enrollment(db, enrollment_id)
    if not obj:
        raise HTTPException(404, "Enrollment not found")
    
    # Optionally, create a certification automatically
    from ..crud import certification as crud_certification
    from ..schemas.certification import CertificationCreate
    from datetime import datetime, timedelta
    
    # Generate certificate number
    cert_number = f"CERT-{datetime.utcnow().strftime('%Y%m%d')}-{enrollment_id}"
    
    # Set expiry date (e.g., 1 year from now)
    expires_at = datetime.utcnow() + timedelta(days=365)
    
    certification_data = CertificationCreate(
        employee_id=obj.employee_id,
        training_id=obj.training_id,
        enrollment_id=obj.id,
        cert_number=cert_number,
        expires_at=expires_at,
        status="active"
    )
    
    # Create certification
    crud_certification.create(db, obj_in=certification_data)
    
    return obj

@router.delete("/{enrollment_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_enrollment(enrollment_id: int, db: Session = Depends(get_db)):
    obj = crud_enrollment.remove(db, id=enrollment_id)
    if not obj:
        raise HTTPException(404, "Enrollment not found")
    return None