# app/crud/employee.py
from sqlalchemy.orm import Session
from typing import List, Optional
from ..models.employee import Employee
from ..schemas.employee import EmployeeCreate, EmployeeUpdate
from datetime import datetime


class CRUDEmployee:
    def get(self, db: Session, id: int) -> Optional[Employee]:
        return db.query(Employee).filter(Employee.id == id).first()
    
    def get_by_email(self, db: Session, email: str) -> Optional[Employee]:
        return db.query(Employee).filter(Employee.email == email).first()
    
    def get_by_employee_id(self, db: Session, employee_id: str) -> Optional[Employee]:
        return db.query(Employee).filter(Employee.employee_id == employee_id).first()
    
    def get_multi(
        self, 
        db: Session, 
        skip: int = 0, 
        limit: int = 100,
        is_active: Optional[bool] = None,
        department: Optional[str] = None
    ) -> List[Employee]:
        query = db.query(Employee)
        
        if is_active is not None:
            query = query.filter(Employee.is_active == is_active)
        
        if department:
            query = query.filter(Employee.department == department)
        
        return query.offset(skip).limit(limit).all()
    
    def get_total_count(
        self,
        db: Session,
        is_active: Optional[bool] = None,
        department: Optional[str] = None
    ) -> int:
        query = db.query(Employee)
        
        if is_active is not None:
            query = query.filter(Employee.is_active == is_active)
        
        if department:
            query = query.filter(Employee.department == department)
        
        return query.count()
    
    def create(self, db: Session, *, obj_in: EmployeeCreate) -> Employee:
        db_employee = Employee(
            employee_id=obj_in.employee_id,
            first_name=obj_in.first_name,
            last_name=obj_in.last_name,
            email=obj_in.email,
            department=obj_in.department,
            position=obj_in.position,
            hire_date=obj_in.hire_date
        )
        db.add(db_employee)
        db.commit()
        db.refresh(db_employee)
        return db_employee
    
    def update(
        self, 
        db: Session, 
        *, 
        db_obj: Employee,
        obj_in: EmployeeUpdate
    ) -> Employee:
        update_data = obj_in.model_dump(exclude_unset=True)
        
        if any(update_data.values()):
            db_obj.updated_at = datetime.utcnow()
        
        for field, value in update_data.items():
            setattr(db_obj, field, value)
        
        db.commit()
        db.refresh(db_obj)
        return db_obj
    
    def remove(self, db: Session, *, id: int) -> Employee:
        obj = db.query(Employee).get(id)
        if obj:
            db.delete(obj)
            db.commit()
        return obj


# Create an instance
employee = CRUDEmployee()