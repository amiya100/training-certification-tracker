# schemas/department.py
from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime

class DepartmentBase(BaseModel):
    name: str
    description: Optional[str] = None

class DepartmentCreate(DepartmentBase):
    pass

class DepartmentUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None

class Department(DepartmentBase):
    id: int
    total_employees: int = Field(default=0, description="Number of employees in the department")
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True

class DepartmentList(BaseModel):
    departments: List[Department]
    total: int
    skip: int
    limit: int