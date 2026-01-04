from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

# Base
class DepartmentBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    description: Optional[str] = None

# Create
class DepartmentCreate(DepartmentBase):
    pass

# Update
class DepartmentUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=100)
    description: Optional[str] = None

# Response
class Department(DepartmentBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class DepartmentList(BaseModel):
    departments: list[Department]
    total: int
    skip: int
    limit: int
