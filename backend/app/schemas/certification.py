from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

class CertificationBase(BaseModel):
    employee_id: int
    training_id: int
    enrollment_id: int
    cert_number: str = Field(..., max_length=100)
    expires_at: Optional[datetime] = None
    status: Optional[str] = "active"
    file_url: Optional[str] = None

class CertificationCreate(CertificationBase):
    pass

class CertificationUpdate(BaseModel):
    expires_at: Optional[datetime] = None
    status: Optional[str] = None
    file_url: Optional[str] = None

    class Config:
        extra = "forbid"

class Certification(CertificationBase):
    id: int
    issued_date: datetime
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class CertificationList(BaseModel):
    certifications: list[Certification]
    total: int
    skip: int
    limit: int