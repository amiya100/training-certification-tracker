from sqlalchemy.orm import Session
from typing import List, Optional
from ..models.enrollment import Enrollment
from ..schemas.enrollment import EnrollmentCreate, EnrollmentUpdate

class CRUDEnrollment:

    def get(self, db: Session, id: int) -> Optional[Enrollment]:
        return db.query(Enrollment).filter(Enrollment.id == id).first()

    def get_multi(self, db: Session, skip=0, limit=100) -> List[Enrollment]:
        return db.query(Enrollment).offset(skip).limit(limit).all()

    def get_total_count(self, db: Session) -> int:
        return db.query(Enrollment).count()

    def create(self, db: Session, *, obj_in: EnrollmentCreate) -> Enrollment:
        obj = Enrollment(**obj_in.model_dump())
        db.add(obj)
        db.commit()
        db.refresh(obj)
        return obj

    def update(
        self,
        db: Session,
        *,
        db_obj: Enrollment,
        obj_in: EnrollmentUpdate
    ) -> Enrollment:
        data = obj_in.model_dump(exclude_unset=True)
        for field, value in data.items():
            setattr(db_obj, field, value)
        db.commit()
        db.refresh(db_obj)
        return db_obj

    def remove(self, db: Session, *, id: int) -> Enrollment:
        obj = db.query(Enrollment).get(id)
        if obj:
            db.delete(obj)
            db.commit()
        return obj

enrollment = CRUDEnrollment()
