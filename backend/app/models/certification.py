from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from ..database import Base

class Certification(Base):
    __tablename__ = "certifications"

    id = Column(Integer, primary_key=True, index=True)
    employee_id = Column(Integer, ForeignKey("employees.id"))
    training_id = Column(Integer, ForeignKey("trainings.id"))
    enrollment_id = Column(Integer, ForeignKey("enrollments.id"))
    cert_number = Column(String(100), unique=True, nullable=False)
    issued_date = Column(DateTime, default=datetime.utcnow)
    expires_at = Column(DateTime)
    status = Column(String(20), default="active")  # active, expired, revoked
    file_url = Column(String(500))
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    employee = relationship("Employee", back_populates="certifications")
    training = relationship("Training", back_populates="certifications")
    enrollment = relationship("Enrollment")