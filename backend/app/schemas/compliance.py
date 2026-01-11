# app/schemas/compliance.py
from pydantic import BaseModel, ConfigDict
from datetime import date, datetime
from typing import List, Optional

# Helper function to convert snake_case to camelCase
def to_camel(string: str) -> str:
    """Convert snake_case string to camelCase"""
    words = string.split('_')
    return words[0] + ''.join(word.capitalize() for word in words[1:])

class ReportFilters(BaseModel):
    department: str = "all"
    date_range: Optional[dict] = {
        "start": "2024-01-01",
        "end": "2024-12-31"
    }
    model_config = ConfigDict(
        alias_generator=to_camel,
        populate_by_name=True
    )

class DepartmentCompliance(BaseModel):
    department: str
    compliance_rate: float
    total_employees: int
    compliant_employees: int
    completed_trainings: Optional[int] = 0
    pending_trainings: Optional[int] = 0
    total_trainings: Optional[int] = 0
    
    model_config = ConfigDict(
        alias_generator=to_camel,
        populate_by_name=True
    )

class CertificationStatus(BaseModel):
    certification: str
    total: int
    valid: int
    expiring_soon: int
    expired: int
    compliance_rate: float
    
    model_config = ConfigDict(
        alias_generator=to_camel,
        populate_by_name=True
    )

class UpcomingExpiration(BaseModel):
    id: int
    employee_name: str
    certification_name: str
    expiry_date: date
    days_until_expiry: int
    department: str
    
    model_config = ConfigDict(
        alias_generator=to_camel,
        populate_by_name=True
    )

class MissingCertification(BaseModel):
    id: int
    employee_name: str
    required_certification: str
    department: str
    days_overdue: int
    
    model_config = ConfigDict(
        alias_generator=to_camel,
        populate_by_name=True
    )

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
    
    model_config = ConfigDict(
        alias_generator=to_camel,
        populate_by_name=True
    )