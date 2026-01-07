from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from ..database import get_db
from ..crud import certification as crud_certification
from ..schemas.certification import Certification, CertificationCreate, CertificationUpdate, CertificationList

router = APIRouter(prefix="/certifications", tags=["certifications"])

@router.post("/", response_model=Certification, status_code=status.HTTP_201_CREATED)
def create_certification(certification: CertificationCreate, db: Session = Depends(get_db)):
    # Check if cert number already exists
    existing = crud_certification.get_by_cert_number(db, certification.cert_number)
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Certificate number already exists"
        )
    return crud_certification.create(db, obj_in=certification)

@router.get("/", response_model=CertificationList)
def read_certifications(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    status: Optional[str] = Query(None, description="Filter by status"),
    employee_id: Optional[int] = Query(None, description="Filter by employee ID"),
    db: Session = Depends(get_db)
):
    items = crud_certification.get_multi(db, skip, limit)
    
    # Apply filters if provided
    if status:
        items = [item for item in items if item.status == status]
    if employee_id:
        items = [item for item in items if item.employee_id == employee_id]
    
    total = crud_certification.get_total_count(db)
    return CertificationList(certifications=items, total=total, skip=skip, limit=limit)

@router.get("/expiring", response_model=List[Certification])
def get_expiring_certifications(
    days: int = Query(30, ge=1, le=365, description="Days to check for expiry"),
    db: Session = Depends(get_db)
):
    return crud_certification.get_expiring_certifications(db, days=days)

@router.get("/{certification_id}", response_model=Certification)
def read_certification(certification_id: int, db: Session = Depends(get_db)):
    obj = crud_certification.get(db, certification_id)
    if not obj:
        raise HTTPException(404, "Certification not found")
    return obj

@router.put("/{certification_id}", response_model=Certification)
def update_certification(certification_id: int, certification_update: CertificationUpdate, db: Session = Depends(get_db)):
    obj = crud_certification.get(db, certification_id)
    if not obj:
        raise HTTPException(404, "Certification not found")
    return crud_certification.update(db, db_obj=obj, obj_in=certification_update)

@router.delete("/{certification_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_certification(certification_id: int, db: Session = Depends(get_db)):
    obj = crud_certification.remove(db, id=certification_id)
    if not obj:
        raise HTTPException(404, "Certification not found")
    return None

@router.post("/{certification_id}/renew", response_model=Certification)
def renew_certification(
    certification_id: int,
    new_expiry_date: str,  # ISO format date string
    db: Session = Depends(get_db)
):
    from datetime import datetime
    try:
        expiry_date = datetime.fromisoformat(new_expiry_date)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid date format. Use ISO format (YYYY-MM-DD)")
    
    obj = crud_certification.renew_certification(db, certification_id, expiry_date)
    if not obj:
        raise HTTPException(404, "Certification not found")
    return obj