# app/schemas/employee.py
from pydantic import BaseModel, EmailStr, Field, validator, ConfigDict
from typing import Optional
from datetime import date, datetime

# Create a base Department schema
class DepartmentBase(BaseModel):
    id: int
    name: str
    description: Optional[str] = None
    model_config = ConfigDict(from_attributes=True)

class EmployeeBase(BaseModel):
    employee_id: str = Field(..., min_length=1, max_length=50)
    first_name: str = Field(..., min_length=1, max_length=100)
    last_name: str = Field(..., min_length=1, max_length=100)
    email: EmailStr
    department_id: Optional[int] = None
    position: Optional[str] = Field(None, max_length=100)
    hire_date: Optional[date] = None
    model_config = ConfigDict(from_attributes=True)

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
    model_config = ConfigDict(from_attributes=True)

# Updated Employee response model with department
class Employee(EmployeeBase):
    id: int
    is_active: bool
    department: Optional[DepartmentBase] = None  # Add this line
    created_at: datetime
    updated_at: datetime
    model_config = ConfigDict(from_attributes=True)

class EmployeeList(BaseModel):
    employees: list[Employee]
    total: int
    skip: int
    limit: int