from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime, timedelta
from ..models.certification import Certification
from ..schemas.certification import CertificationCreate, CertificationUpdate

class CRUDCertification:
    def get(self, db: Session, id: int) -> Optional[Certification]:
        return db.query(Certification).filter(Certification.id == id).first()

    def get_by_cert_number(self, db: Session, cert_number: str) -> Optional[Certification]:
        return db.query(Certification).filter(Certification.cert_number == cert_number).first()

    def get_by_enrollment(self, db: Session, enrollment_id: int) -> Optional[Certification]:
        """Get certification by enrollment ID"""
        return db.query(Certification).filter(Certification.enrollment_id == enrollment_id).first()


    def get_multi(self, db: Session, skip: int = 0, limit: int = 100) -> List[Certification]:
        return db.query(Certification).offset(skip).limit(limit).all()

    def get_total_count(self, db: Session) -> int:
        return db.query(Certification).count()

    def create(self, db: Session, *, obj_in: CertificationCreate) -> Certification:
        db_obj = Certification(**obj_in.model_dump())
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj

certification = CRUDCertification()