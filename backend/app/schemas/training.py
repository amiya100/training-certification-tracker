from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

# Base schema
class TrainingBase(BaseModel):
    name: str = Field(..., max_length=200)
    description: Optional[str] = None
    status: Optional[str] = "scheduled"
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    employee_id: Optional[int] = None  # the employee attending

# Create schema
class TrainingCreate(TrainingBase):
    pass

# Update schema
class TrainingUpdate(BaseModel):
    name: Optional[str]
    description: Optional[str]
    status: Optional[str]
    start_date: Optional[datetime]
    end_date: Optional[datetime]
    employee_id: Optional[int]

# Response schema
class Training(TrainingBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class TrainingList(BaseModel):
    trainings: list[Training]
    total: int
    skip: int
    limit: int
