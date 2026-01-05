from pydantic import BaseModel
from typing import Optional
from datetime import datetime

# Base
class CertificationBase(BaseModel):
    enrollment_id: int
    cert_number: str
    expires_at: Optional[datetime] = None
    status: Optional[str] = "active"
    file_url: Optional[str] = None

# Create
class CertificationCreate(CertificationBase):
    pass

# Update
class CertificationUpdate(BaseModel):
    expires_at: Optional[datetime] = None
    status: Optional[str] = None
    file_url: Optional[str] = None

# Response
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
