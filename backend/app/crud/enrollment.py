from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime
from ..models.enrollment import Enrollment
from ..schemas.enrollment import EnrollmentCreate, EnrollmentUpdate

class CRUDEnrollment:
    def get(self, db: Session, id: int) -> Optional[Enrollment]:
        return db.query(Enrollment).filter(Enrollment.id == id).first()

    def get_multi(self, db: Session, skip: int = 0, limit: int = 100) -> List[Enrollment]:
        return db.query(Enrollment).offset(skip).limit(limit).all()

    def get_total_count(self, db: Session) -> int:
        return db.query(Enrollment).count()

    def create(self, db: Session, *, obj_in: EnrollmentCreate) -> Enrollment:
        db_obj = Enrollment(**obj_in.model_dump())
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj

    def update(self, db: Session, *, db_obj: Enrollment, obj_in: EnrollmentUpdate) -> Enrollment:
        data = obj_in.model_dump(exclude_unset=True)
        if data:
            db_obj.updated_at = datetime.utcnow()
            for field, value in data.items():
                setattr(db_obj, field, value)
        db.commit()
        db.refresh(db_obj)
        return db_obj

    def remove(self, db: Session, *, id: int) -> Optional[Enrollment]:
        obj = db.query(Enrollment).get(id)
        if obj:
            db.delete(obj)
            db.commit()
        return obj

    def get_by_employee(self, db: Session, employee_id: int) -> List[Enrollment]:
        return db.query(Enrollment).filter(Enrollment.employee_id == employee_id).all()

    def get_by_training(self, db: Session, training_id: int) -> List[Enrollment]:
        return db.query(Enrollment).filter(Enrollment.training_id == training_id).all()

    def get_by_status(self, db: Session, status: str) -> List[Enrollment]:
        return db.query(Enrollment).filter(Enrollment.status == status).all()

    def get_active_enrollments(self, db: Session) -> List[Enrollment]:
        return db.query(Enrollment).filter(
            Enrollment.status.in_(["enrolled", "in_progress"])
        ).all()

    # NEW METHOD: Update progress for an enrollment
    def update_progress(self, db: Session, *, enrollment_id: int, progress: int) -> Optional[Enrollment]:
        """Update progress percentage for an enrollment (0-100)"""
        obj = self.get(db, enrollment_id)
        if not obj:
            return None
        
        # Clamp progress between 0 and 100
        progress = max(0, min(100, progress))
        obj.progress = progress
        
        # Auto-update status based on progress
        if progress == 100 and obj.status != "completed":
            obj.status = "completed"
            obj.completed_date = datetime.utcnow()
        elif progress > 0 and obj.status == "enrolled":
            obj.status = "in_progress"
        
        obj.updated_at = datetime.utcnow()
        db.commit()
        db.refresh(obj)
        return obj

    # NEW METHOD: Complete enrollment (sets progress to 100 and marks as completed)
    def complete_enrollment(self, db: Session, enrollment_id: int) -> Optional[Enrollment]:
        """Mark enrollment as completed (progress=100)"""
        return self.update_progress(db, enrollment_id=enrollment_id, progress=100)

    # NEW METHOD: Get enrollments with progress data
    def get_with_progress(self, db: Session, min_progress: int = 0, max_progress: int = 100) -> List[Enrollment]:
        """Get enrollments filtered by progress range"""
        return db.query(Enrollment).filter(
            Enrollment.progress >= min_progress,
            Enrollment.progress <= max_progress
        ).all()

enrollment = CRUDEnrollment()