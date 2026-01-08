from sqlalchemy.orm import Session, selectinload
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
    
    def get_multi_with_employees(self, db: Session, skip: int = 0, limit: int = 100) -> List[Department]:
        """Get departments with their employees loaded for counting"""
        departments = (
            db.query(Department)
            .options(selectinload(Department.employees))
            .offset(skip)
            .limit(limit)
            .all()
        )
        return departments

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
        return (
            db.query(Department)
            .options(selectinload(Department.employees))
            .filter(Department.id == id)
            .first()
        )
    
    def get_with_employee_count(self, db: Session, id: int) -> Optional[Department]:
        """Get department with employee count calculated"""
        department = (
            db.query(Department)
            .options(selectinload(Department.employees))
            .filter(Department.id == id)
            .first()
        )
        
        if department:
            # Add the count as a dynamic property
            department.total_employees = len(department.employees) if department.employees else 0
        
        return department
    
    def get_all_with_employee_counts(self, db: Session, skip: int = 0, limit: int = 100) -> List[Department]:
        """Get all departments with their employee counts"""
        departments = (
            db.query(Department)
            .options(selectinload(Department.employees))
            .offset(skip)
            .limit(limit)
            .all()
        )
        
        # Calculate and add employee count for each department
        for dept in departments:
            dept.total_employees = len(dept.employees) if dept.employees else 0
        
        return departments

department = CRUDDepartment()