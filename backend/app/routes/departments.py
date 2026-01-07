from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List
from ..database import get_db
from ..crud import department as crud_department
from ..schemas.department import (
    Department,
    DepartmentCreate,
    DepartmentUpdate,
    DepartmentList
)

router = APIRouter(prefix="/departments", tags=["departments"])

@router.post("/", response_model=Department, status_code=status.HTTP_201_CREATED)
def create_department(dept: DepartmentCreate, db: Session = Depends(get_db)):
    if crud_department.get_by_name(db, dept.name):
        raise HTTPException(status_code=400, detail="Department already exists")
    return crud_department.create(db, obj_in=dept)

@router.get("/", response_model=DepartmentList)
def read_departments(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1),
    db: Session = Depends(get_db)
):
    depts = crud_department.get_multi(db, skip, limit)
    total = crud_department.get_total_count(db)
    return DepartmentList(
        departments=depts,
        total=total,
        skip=skip,
        limit=limit
    )

@router.get("/{dept_id}", response_model=Department)
def read_department(dept_id: int, db: Session = Depends(get_db)):
    dept = crud_department.get(db, dept_id)
    if not dept:
        raise HTTPException(status_code=404, detail="Department not found")
    return dept

@router.get("/{dept_id}/employees", response_model=List[dict])
def get_department_employees(dept_id: int, db: Session = Depends(get_db)):
    dept = crud_department.get_with_employees(db, dept_id)
    if not dept:
        raise HTTPException(status_code=404, detail="Department not found")
    return [{"id": emp.id, "name": f"{emp.first_name} {emp.last_name}", "email": emp.email} for emp in dept.employees]

@router.put("/{dept_id}", response_model=Department)
def update_department(
    dept_id: int,
    dept_update: DepartmentUpdate,
    db: Session = Depends(get_db)
):
    dept = crud_department.get(db, dept_id)
    if not dept:
        raise HTTPException(status_code=404, detail="Department not found")
    
    # Check if new name conflicts with existing
    if dept_update.name and dept_update.name != dept.name:
        existing = crud_department.get_by_name(db, dept_update.name)
        if existing:
            raise HTTPException(status_code=400, detail="Department name already exists")
    
    return crud_department.update(db, db_obj=dept, obj_in=dept_update)

@router.delete("/{dept_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_department(dept_id: int, db: Session = Depends(get_db)):
    dept = crud_department.remove(db, id=dept_id)
    if not dept:
        raise HTTPException(status_code=404, detail="Department not found")
    return None