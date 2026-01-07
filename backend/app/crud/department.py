from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime
from ..models.department import Department
from ..schemas.department import DepartmentCreate, DepartmentUpdate

class CRUDDepartment:
    def get(self, db: Session, id: int) -> Optional[Department]:
        return db.query(Department).filter(Department.id == id).first()

    def get_by_name(self, db: Session, name: str) -> Optional[Department]:
        return db.query(Department).filter(Department.name == name).first()

    def get_multi(self, db: Session, skip: int = 0, limit: int = 100) -> List[Department]:
        return db.query(Department).offset(skip).limit(limit).all()

    def get_total_count(self, db: Session) -> int:
        return db.query(Department).count()

    def create(self, db: Session, *, obj_in: DepartmentCreate) -> Department:
        db_obj = Department(**obj_in.model_dump())
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj

    def update(self, db: Session, *, db_obj: Department, obj_in: DepartmentUpdate) -> Department:
        data = obj_in.model_dump(exclude_unset=True)
        if data:
            db_obj.updated_at = datetime.utcnow()
            for field, value in data.items():
                setattr(db_obj, field, value)
        db.commit()
        db.refresh(db_obj)
        return db_obj

    def remove(self, db: Session, *, id: int) -> Optional[Department]:
        obj = db.query(Department).get(id)
        if obj:
            db.delete(obj)
            db.commit()
        return obj

    def get_with_employees(self, db: Session, id: int) -> Optional[Department]:
        return db.query(Department).filter(Department.id == id).first()

department = CRUDDepartment()