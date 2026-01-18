from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from ..database import get_db
from ..crud import certification as crud_certification
from ..schemas.certification import Certification, CertificationCreate, CertificationUpdate, CertificationList
from ..dependecies import get_current_user

router = APIRouter(prefix="/certifications", tags=["certifications"])

@router.get("", response_model=CertificationList)
def read_certifications(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    status: Optional[str] = Query(None, description="Filter by status"),
    employee_id: Optional[int] = Query(None, description="Filter by employee ID"),
    db: Session = Depends(get_db), 
    current_user: dict = Depends(get_current_user)
):
    items = crud_certification.get_multi(db, skip, limit)
    
    # Apply filters if provided
    if status:
        items = [item for item in items if item.status == status]
    if employee_id:
        items = [item for item in items if item.employee_id == employee_id]
    
    total = crud_certification.get_total_count(db)
    return CertificationList(certifications=items, total=total, skip=skip, limit=limit)

@router.get("/{certification_id}", response_model=Certification)
def read_certification(
    certification_id: int, 
    db: Session = Depends(get_db), 
    current_user: dict = Depends(get_current_user)):
    obj = crud_certification.get(db, certification_id)
    if not obj:
        raise HTTPException(404, "Certification not found")
    return obj
