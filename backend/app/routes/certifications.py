from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from ..database import get_db
from ..crud import certification as crud_certification
from ..schemas.certification import Certification, CertificationCreate, CertificationUpdate, CertificationList

router = APIRouter(prefix="/certifications", tags=["certifications"])

@router.post("/", response_model=Certification, status_code=status.HTTP_201_CREATED)
def create_certification(certification: CertificationCreate, db: Session = Depends(get_db)):
    return crud_certification.create(db, obj_in=certification)

@router.get("/", response_model=CertificationList)
def read_certifications(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    items = crud_certification.get_multi(db, skip, limit)
    total = crud_certification.get_total_count(db)
    return CertificationList(certifications=items, total=total, skip=skip, limit=limit)

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
