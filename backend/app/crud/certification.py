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

    def get_by_employee_training(
        self,
        db: Session,
        employee_id: int,
        training_id: int
    ) -> Optional[Certification]:
        """Get certification for specific employee and training"""
        return (
            db.query(Certification)
            .filter(
                Certification.employee_id == employee_id,
                Certification.training_id == training_id
            )
            .first()
        )

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

    def update(self, db: Session, *, db_obj: Certification, obj_in: CertificationUpdate) -> Certification:
        data = obj_in.model_dump(exclude_unset=True)
        if data:
            db_obj.updated_at = datetime.utcnow()
            for field, value in data.items():
                setattr(db_obj, field, value)
        db.commit()
        db.refresh(db_obj)
        return db_obj

    def remove(self, db: Session, *, id: int) -> Optional[Certification]:
        obj = db.query(Certification).get(id)
        if obj:
            db.delete(obj)
            db.commit()
        return obj

    def get_by_employee(self, db: Session, employee_id: int) -> List[Certification]:
        return db.query(Certification).filter(Certification.employee_id == employee_id).all()

    def get_by_training(self, db: Session, training_id: int) -> List[Certification]:
        return db.query(Certification).filter(Certification.training_id == training_id).all()

    def get_by_status(self, db: Session, status: str) -> List[Certification]:
        return db.query(Certification).filter(Certification.status == status).all()

    def get_expiring_certifications(self, db: Session, days: int = 30) -> List[Certification]:
        cutoff_date = datetime.utcnow() + timedelta(days=days)
        return db.query(Certification).filter(
            Certification.expires_at <= cutoff_date,
            Certification.expires_at > datetime.utcnow(),
            Certification.status == "active"
        ).all()

    def get_expired_certifications(self, db: Session) -> List[Certification]:
        return db.query(Certification).filter(
            Certification.expires_at <= datetime.utcnow(),
            Certification.status == "active"
        ).all()

    def renew_certification(self, db: Session, id: int, new_expiry_date: datetime) -> Optional[Certification]:
        cert = self.get(db, id)
        if cert:
            cert.expires_at = new_expiry_date
            cert.updated_at = datetime.utcnow()
            db.commit()
            db.refresh(cert)
        return cert

certification = CRUDCertification()