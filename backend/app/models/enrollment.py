from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from ..database import Base

# In your Enrollment model
class Enrollment(Base):
    __tablename__ = "enrollments"

    id = Column(Integer, primary_key=True, index=True)
    employee_id = Column(Integer, ForeignKey("employees.id"))
    training_id = Column(Integer, ForeignKey("trainings.id"))
    status = Column(String(20), default="enrolled")  # enrolled, in_progress, completed, cancelled
    progress = Column(Integer, default=0)  # Percentage 0-100
    enrolled_date = Column(DateTime, default=datetime.utcnow)
    start_date = Column(DateTime)
    end_date = Column(DateTime)
    completed_date = Column(DateTime)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    employee = relationship("Employee", back_populates="enrollments")
    training = relationship("Training", back_populates="enrollments")