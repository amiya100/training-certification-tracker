from pydantic import BaseModel, Field, validator
from typing import Optional
from datetime import datetime

class EnrollmentBase(BaseModel):
    employee_id: int
    training_id: int
    status: Optional[str] = "enrolled"
    progress: Optional[int] = Field(default=0, ge=0, le=100)  # Added: Percentage 0-100
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None

    @validator('progress')
    def validate_progress(cls, v):
        if v is not None:
            if v < 0 or v > 100:
                raise ValueError('Progress must be between 0 and 100')
        return v

class EnrollmentCreate(EnrollmentBase):
    pass

class EnrollmentUpdate(BaseModel):
    status: Optional[str] = None
    progress: Optional[int] = Field(None, ge=0, le=100)  # Added
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    completed_date: Optional[datetime] = None

    class Config:
        extra = "forbid"

class Enrollment(EnrollmentBase):
    id: int
    enrolled_date: datetime
    completed_date: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class EnrollmentList(BaseModel):
    enrollments: list[Enrollment]
    total: int
    skip: int
    limit: int