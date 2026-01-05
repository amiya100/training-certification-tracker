# app/crud/training.py
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime
from ..models.training import Training
from ..schemas.training import TrainingCreate, TrainingUpdate

class CRUDTraining:

    def get(self, db: Session, id: int) -> Optional[Training]:
        """Get a single training by ID"""
        return db.query(Training).filter(Training.id == id).first()

    def get_multi(self, db: Session, skip: int = 0, limit: int = 100) -> List[Training]:
        """Get multiple trainings with pagination"""
        return db.query(Training).offset(skip).limit(limit).all()

    def get_total_count(self, db: Session) -> int:
        """Get total count of trainings"""
        return db.query(Training).count()

    def create(self, db: Session, *, obj_in: TrainingCreate) -> Training:
        """Create a new training"""
        # Auto-calculate duration if not provided but dates are given
        data = obj_in.model_dump()
        
        if data.get('start_date') and data.get('end_date') and not data.get('duration_hours'):
            # Calculate duration from start and end dates
            duration = data['end_date'] - data['start_date']
            data['duration_hours'] = int(duration.total_seconds() / 3600)
        
        obj = Training(**data)
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
        """Update an existing training"""
        data = obj_in.model_dump(exclude_unset=True)
        
        # Auto-calculate duration if dates are updated and duration not provided
        if ('start_date' in data or 'end_date' in data) and 'duration_hours' not in data:
            # Use updated dates if provided, otherwise use existing dates
            start_date = data.get('start_date', db_obj.start_date)
            end_date = data.get('end_date', db_obj.end_date)
            
            if start_date and end_date:
                duration = end_date - start_date
                data['duration_hours'] = int(duration.total_seconds() / 3600)
        
        if data:
            db_obj.updated_at = datetime.utcnow()
            for field, value in data.items():
                setattr(db_obj, field, value)
        
        db.commit()
        db.refresh(db_obj)
        return db_obj

    def remove(self, db: Session, *, id: int) -> Optional[Training]:
        """Delete a training"""
        obj = db.query(Training).get(id)
        if obj:
            db.delete(obj)
            db.commit()
        return obj

    def get_by_status(self, db: Session, status: str) -> List[Training]:
        """Get trainings by status"""
        return db.query(Training).filter(Training.status == status).all()

    def get_active_trainings(self, db: Session) -> List[Training]:
        """Get active trainings (status = 'active' or 'scheduled')"""
        return db.query(Training).filter(
            Training.status.in_(["active", "scheduled"])
        ).all()

    def calculate_duration(self, db: Session, training_id: int) -> Optional[int]:
        """Calculate duration in hours from start and end dates"""
        training = self.get(db, training_id)
        if not training or not training.start_date or not training.end_date:
            return None
        
        # Calculate hours difference
        duration = training.end_date - training.start_date
        hours = int(duration.total_seconds() / 3600)
        return hours

    def update_duration_from_dates(self, db: Session, training_id: int) -> Optional[Training]:
        """Update duration_hours based on start and end dates"""
        training = self.get(db, training_id)
        if not training:
            return None
        
        hours = self.calculate_duration(db, training_id)
        if hours is not None:
            training.duration_hours = hours
            training.updated_at = datetime.utcnow()
            db.commit()
            db.refresh(training)
        
        return training

    def backfill_durations(self, db: Session) -> int:
        """Backfill duration_hours for all trainings that have dates but no duration"""
        updated_count = 0
        trainings = db.query(Training).filter(
            Training.start_date.isnot(None),
            Training.end_date.isnot(None),
            Training.duration_hours.is_(None)
        ).all()
        
        for training in trainings:
            duration = training.end_date - training.start_date
            hours = int(duration.total_seconds() / 3600)
            training.duration_hours = hours
            updated_count += 1
        
        if updated_count > 0:
            db.commit()
        
        return updated_count

    def get_total_training_hours(self, db: Session) -> int:
        """Get sum of all training duration hours"""
        from sqlalchemy import func
        result = db.query(func.sum(Training.duration_hours)).scalar()
        return result or 0

    def get_trainings_by_instructor(self, db: Session, instructor_id: int) -> List[Training]:
        """Get all trainings by a specific instructor"""
        return db.query(Training).filter(Training.instructor_id == instructor_id).all()

    def search_by_name(self, db: Session, name: str) -> List[Training]:
        """Search trainings by name (case-insensitive partial match)"""
        return db.query(Training).filter(Training.name.ilike(f"%{name}%")).all()

# Create an instance of the CRUDTraining class
training = CRUDTraining()