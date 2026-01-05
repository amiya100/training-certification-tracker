from pydantic import BaseModel
from typing import Optional
from datetime import datetime

# Base
class EnrollmentBase(BaseModel):
    user_id: int
    training_id: int
    status: Optional[str] = "enrolled"
    completion_date: Optional[datetime] = None

# Create
class EnrollmentCreate(EnrollmentBase):
    pass

# Update
class EnrollmentUpdate(BaseModel):
    status: Optional[str] = None
    completion_date: Optional[datetime] = None

# Response
class Enrollment(EnrollmentBase):
    id: int
    enrollment_date: datetime
    created_at: datetime

    class Config:
        from_attributes = True

class EnrollmentList(BaseModel):
    enrollments: list[Enrollment]
    total: int
    skip: int
    limit: int
