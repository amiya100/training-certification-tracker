from sqlalchemy.orm import Session
from typing import List, Optional
from ..models.certification import Certification
from ..schemas.certification import CertificationCreate, CertificationUpdate

class CRUDCertification:

    def get(self, db: Session, id: int) -> Optional[Certification]:
        return db.query(Certification).filter(Certification.id == id).first()

    def get_multi(self, db: Session, skip=0, limit=100) -> List[Certification]:
        return db.query(Certification).offset(skip).limit(limit).all()

    def get_total_count(self, db: Session) -> int:
        return db.query(Certification).count()

    def create(self, db: Session, *, obj_in: CertificationCreate) -> Certification:
        obj = Certification(**obj_in.model_dump())
        db.add(obj)
        db.commit()
        db.refresh(obj)
        return obj

    def update(
        self,
        db: Session,
        *,
        db_obj: Certification,
        obj_in: CertificationUpdate
    ) -> Certification:
        for field, value in obj_in.model_dump(exclude_unset=True).items():
            setattr(db_obj, field, value)
        db.commit()
        db.refresh(db_obj)
        return db_obj

    def remove(self, db: Session, *, id: int) -> Certification:
        obj = db.query(Certification).get(id)
        if obj:
            db.delete(obj)
            db.commit()
        return obj

certification = CRUDCertification()
