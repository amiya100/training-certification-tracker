# app/crud/employee.py
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime
from ..models.employee import Employee
from ..schemas.employee import EmployeeCreate, EmployeeUpdate

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
        department_id: Optional[int] = None
    ) -> List[Employee]:
        query = db.query(Employee)
        
        if is_active is not None:
            query = query.filter(Employee.is_active == is_active)
        
        if department_id:
            query = query.filter(Employee.department_id == department_id)
        
        return query.offset(skip).limit(limit).all()
    
    def get_total_count(
        self,
        db: Session,
        is_active: Optional[bool] = None,
        department_id: Optional[int] = None
    ) -> int:
        query = db.query(Employee)
        
        if is_active is not None:
            query = query.filter(Employee.is_active == is_active)
        
        if department_id:
            query = query.filter(Employee.department_id == department_id)
        
        return query.count()
    
    def create(self, db: Session, *, obj_in: EmployeeCreate) -> Employee:
        db_employee = Employee(**obj_in.model_dump())
        db.add(db_employee)
        db.commit()
        db.refresh(db_employee)
        return db_employee
    
    def update(self, db: Session, *, db_obj: Employee, obj_in: EmployeeUpdate) -> Employee:
        update_data = obj_in.model_dump(exclude_unset=True)
        
        if any(update_data.values()):
            db_obj.updated_at = datetime.utcnow()
        
        for field, value in update_data.items():
            setattr(db_obj, field, value)
        
        db.commit()
        db.refresh(db_obj)
        return db_obj
    
    def remove(self, db: Session, *, id: int) -> Optional[Employee]:
        obj = db.query(Employee).get(id)
        if obj:
            db.delete(obj)
            db.commit()
        return obj

employee = CRUDEmployee()