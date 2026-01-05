# app/models/employee.py
from sqlalchemy import Column, Integer, String, Date, DateTime, Boolean, ForeignKey

from sqlalchemy.orm import relationship
from datetime import datetime
from ..database import Base


class Employee(Base):
    __tablename__ = "employees"
    
    class Employee(Base):
        __tablename__ = "employees"

        id = Column(Integer, primary_key=True, index=True)
        employee_id = Column(String(50), unique=True, index=True, nullable=False)
        first_name = Column(String(100), nullable=False)
        last_name = Column(String(100), nullable=False)
        email = Column(String(255), unique=True, index=True, nullable=False)
        department_id = Column(Integer, ForeignKey("departments.id"))
        position = Column(String(100))
        hire_date = Column(Date)
        is_active = Column(Boolean, default=True)
        created_at = Column(DateTime, default=datetime.utcnow)
        updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

        department = relationship("Department", back_populates="employees")
        trainings = relationship("Training", back_populates="employee")
        certifications = relationship("Certification", back_populates="employee")

    
    # Relationships (will be defined when other models are created)
    # training_enrollments = relationship("TrainingEnrollment", back_populates="employee")
    # certifications = relationship("EmployeeCertification", back_populates="employee")