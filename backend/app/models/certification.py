from sqlalchemy import Column, Integer, String, DateTime
from datetime import datetime
from ..database import Base

class Certification(Base):
    __tablename__ = "certifications"

    id = Column(Integer, primary_key=True, index=True)
    enrollment_id = Column(Integer, unique=True, nullable=False)
    cert_number = Column(String(100), unique=True, nullable=False)
    issued_date = Column(DateTime, default=datetime.utcnow)
    expires_at = Column(DateTime)
    status = Column(String(20), default="active")
    file_url = Column(String(500))
    created_at = Column(DateTime, default=datetime.utcnow)
