# app/schemas/compliance.py
from pydantic import BaseModel
from datetime import date, datetime
from typing import List, Optional

class ReportFilters(BaseModel):
    department: Optional[str] = "all"
    date_range: dict
    compliance_threshold: Optional[int] = 80
    include_expired: Optional[bool] = True
    include_expiring_soon: Optional[bool] = True
    certification_type: Optional[str] = "all"

class DepartmentCompliance(BaseModel):
    department: str
    compliance_rate: float
    total_employees: int
    compliant_employees: int

class CertificationStatus(BaseModel):
    certification: str
    total: int
    valid: int
    expiring_soon: int
    expired: int
    compliance_rate: float

class UpcomingExpiration(BaseModel):
    id: int
    employee_name: str
    certification_name: str
    expiry_date: date
    days_until_expiry: int
    department: str

class MissingCertification(BaseModel):
    id: int
    employee_name: str
    required_certification: str
    department: str
    days_overdue: int

class ComplianceMetrics(BaseModel):
    total_employees: int
    compliant_employees: int
    non_compliant_employees: int
    expiring_soon: int
    expired_certifications: int
    total_trainings: int
    completed_trainings: int
    pending_trainings: int
    overall_compliance_rate: float
    department_compliance: List[DepartmentCompliance]
    certification_status: List[CertificationStatus]
    upcoming_expirations: List[UpcomingExpiration]
    missing_certifications: List[MissingCertification]