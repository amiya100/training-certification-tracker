# app/crud/training.py
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime
from ..models.training import Training
from ..schemas.training import TrainingCreate, TrainingUpdate

class CRUDTraining:

    def get(self, db: Session, id: int) -> Optional[Training]:
        return db.query(Training).filter(Training.id == id).first()

    def get_multi(self, db: Session, skip: int = 0, limit: int = 100) -> List[Training]:
        return db.query(Training).offset(skip).limit(limit).all()

    def get_total_count(self, db: Session) -> int:
        return db.query(Training).count()

    def create(self, db: Session, *, obj_in: TrainingCreate) -> Training:
        obj = Training(**obj_in.model_dump())
        db.add(obj)
        db.commit()
        db.refresh(obj)
        return obj

    def update(
        self,
        db: Session,
        *,
        db_obj: Training,
        obj_in: TrainingUpdate
    ) -> Training:
        data = obj_in.model_dump(exclude_unset=True)
        if data:
            db_obj.updated_at = datetime.utcnow()
            for field, value in data.items():
                setattr(db_obj, field, value)
        db.commit()
        db.refresh(db_obj)
        return db_obj

    def remove(self, db: Session, *, id: int) -> Optional[Training]:
        obj = db.query(Training).get(id)
        if obj:
            db.delete(obj)
            db.commit()
        return obj

    def get_by_status(self, db: Session, status: str) -> List[Training]:
        return db.query(Training).filter(Training.status == status).all()

    def get_active_trainings(self, db: Session) -> List[Training]:
        return db.query(Training).filter(
            Training.status.in_(["active", "scheduled"])
        ).all()

    def search_by_name(self, db: Session, name: str) -> List[Training]:
        return db.query(Training).filter(
            Training.name.ilike(f"%{name}%")
        ).all()

training = CRUDTraining()
