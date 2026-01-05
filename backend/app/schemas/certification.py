from pydantic import BaseModel
from typing import Optional
from datetime import datetime

# Base schema
class CertificationBase(BaseModel):
    employee_id: int
    training_id: int
    cert_number: str
    expires_at: Optional[datetime] = None
    status: Optional[str] = "active"
    file_url: Optional[str] = None

# Create schema
class CertificationCreate(CertificationBase):
    pass

# Update schema
class CertificationUpdate(BaseModel):
    employee_id: Optional[int]
    training_id: Optional[int]
    expires_at: Optional[datetime]
    status: Optional[str]
    file_url: Optional[str]

# Response schema
class Certification(CertificationBase):
    id: int
    issued_date: datetime
    created_at: datetime

    class Config:
        from_attributes = True

class CertificationList(BaseModel):
    certifications: list[Certification]
    total: int
    skip: int
    limit: int
