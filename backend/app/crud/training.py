from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime
from ..models.training import Training
from ..schemas.training import TrainingCreate, TrainingUpdate

class CRUDTraining:

    def get(self, db: Session, id: int) -> Optional[Training]:
        return db.query(Training).filter(Training.id == id).first()

    def get_multi(self, db: Session, skip=0, limit=100) -> List[Training]:
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

    def remove(self, db: Session, *, id: int) -> Training:
        obj = db.query(Training).get(id)
        if obj:
            db.delete(obj)
            db.commit()
        return obj

training = CRUDTraining()
