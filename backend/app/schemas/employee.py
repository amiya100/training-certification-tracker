from pydantic import BaseModel, EmailStr, Field, validator
from typing import Optional
from datetime import date, datetime

class EmployeeBase(BaseModel):
    employee_id: str = Field(..., min_length=1, max_length=50)
    first_name: str = Field(..., min_length=1, max_length=100)
    last_name: str = Field(..., min_length=1, max_length=100)
    email: EmailStr
    department_id: Optional[int] = None
    position: Optional[str] = Field(None, max_length=100)
    hire_date: Optional[date] = None

class EmployeeCreate(EmployeeBase):
    @validator('employee_id')
    def employee_id_alphanumeric(cls, v):
        if not v.replace('_', '').replace('-', '').isalnum():
            raise ValueError('Employee ID must be alphanumeric')
        return v

class EmployeeUpdate(BaseModel):
    first_name: Optional[str] = Field(None, min_length=1, max_length=100)
    last_name: Optional[str] = Field(None, min_length=1, max_length=100)
    email: Optional[EmailStr] = None
    department_id: Optional[int] = None
    position: Optional[str] = Field(None, max_length=100)
    hire_date: Optional[date] = None
    is_active: Optional[bool] = None

class Employee(EmployeeBase):
    id: int
    is_active: bool
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

class EmployeeList(BaseModel):
    employees: list[Employee]
    total: int
    skip: int
    limit: int