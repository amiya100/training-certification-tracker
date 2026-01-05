from sqlalchemy import Column, Integer, DateTime, String
from datetime import datetime
from ..database import Base

class Enrollment(Base):
    __tablename__ = "enrollments"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, nullable=False)
    training_id = Column(Integer, nullable=False)
    enrollment_date = Column(DateTime, default=datetime.utcnow)
    status = Column(String(20), default="enrolled")
    completion_date = Column(DateTime)
    created_at = Column(DateTime, default=datetime.utcnow)
