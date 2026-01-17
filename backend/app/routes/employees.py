# app/api/employees.py - FIXED VERSION
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from ..database import get_db
from ..crud import employee as crud_employee
from ..schemas.employee import Employee, EmployeeCreate, EmployeeUpdate, EmployeeList

router = APIRouter(prefix="/employees", tags=["employees"])

@router.post("/", response_model=Employee, status_code=status.HTTP_201_CREATED)
def create_employee(employee: EmployeeCreate, db: Session = Depends(get_db)):
    # Check if employee with email already exists
    db_employee = crud_employee.get_by_email(db, email=employee.email)
    if db_employee:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Check if employee ID already exists
    db_employee = crud_employee.get_by_employee_id(db, employee_id=employee.employee_id)
    if db_employee:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Employee ID already exists"
        )
    
    return crud_employee.create(db, obj_in=employee)

@router.get("", response_model=EmployeeList)
def read_employees(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    is_active: Optional[bool] = Query(None, description="Filter by active status"),
    department_id: Optional[int] = Query(None, description="Filter by department ID"),  
    db: Session = Depends(get_db)
):
    employees = crud_employee.get_multi(
        db, skip=skip, limit=limit, is_active=is_active, department_id=department_id  # Fixed parameter name
    )
    total = crud_employee.get_total_count(db, is_active=is_active, department_id=department_id)  # Fixed parameter name
    
    return EmployeeList(
        employees=employees,
        total=total,
        skip=skip,
        limit=limit
    )

@router.get("/{employee_id}", response_model=Employee)
def read_employee(employee_id: int, db: Session = Depends(get_db)):
    db_employee = crud_employee.get(db, id=employee_id)
    if db_employee is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Employee not found"
        )
    return db_employee

@router.put("/{employee_id}", response_model=Employee)
def update_employee(
    employee_id: int,
    employee_update: EmployeeUpdate,
    db: Session = Depends(get_db)
):
    db_employee = crud_employee.get(db, id=employee_id)
    if db_employee is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Employee not found"
        )
    
    # Check if new email already exists (if provided)
    if employee_update.email and employee_update.email != db_employee.email:
        existing = crud_employee.get_by_email(db, email=employee_update.email)
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered"
            )
    
    return crud_employee.update(db, db_obj=db_employee, obj_in=employee_update)

@router.delete("/{employee_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_employee(employee_id: int, db: Session = Depends(get_db)):
    db_employee = crud_employee.remove(db, id=employee_id)
    if db_employee is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Employee not found"
        )
    return None