# app/schemas/dashboard.py
from pydantic import BaseModel
from typing import List, Optional
from datetime import date

class StatusDistributionItem(BaseModel):
    label: str
    count: int
    percent: float
    color: str

class TopPerformer(BaseModel):
    name: str
    role: str
    performance: float

class EmployeeStatus(BaseModel):
    totalEmployees: int
    distribution: List[StatusDistributionItem]
    topPerformer: TopPerformer

class TrainingCertificationStatus(BaseModel):
    totalTrainings: int
    certificationStatuses: List[StatusDistributionItem]
    expiringSoonCount: int
    expiringAvatars: List[str]
    upcomingDeadlines: int

class TrainingProgressItem(BaseModel):
    id: str
    name: str
    role: str
    avatarUrl: Optional[str] = None
    trainingName: str
    progress: int
    status: str
    startDate: Optional[str] = None
    endDate: Optional[str] = None
    deadline: Optional[str] = None
    completionDate: Optional[str] = None
    hasCertification: Optional[bool] = None

class HRMetricItem(BaseModel):
    id: str
    avatarUrl: str
    name: str
    role: Optional[str] = None
    status: Optional[str] = None
    statusColor: Optional[str] = None
    departmentName: Optional[str] = None
    trainingCount: Optional[int] = None
    employeeCount: Optional[int] = None

class HRMetrics(BaseModel):
    employees: List[HRMetricItem]
    trainings: List[HRMetricItem]
    departments: List[HRMetricItem]

class DashboardStats(BaseModel):
    total_employees: int
    total_trainings: int
    total_certifications: int
    active_enrollments: int
    total_departments: int
    expiring_certifications: int
    completion_rate: float
    total_training_hours: float
    employee_growth_percentage: float
    enrollment_growth_percentage: float
    certification_growth_percentage: float
    expiring_change_percentage: float
    completion_change_percentage: float
    training_hours_growth_percentage: float
    training_growth_percentage: float

class DashboardDataResponse(BaseModel):
    stats: DashboardStats
    employeeStatus: EmployeeStatus
    trainingCertifications: TrainingCertificationStatus
    trainingProgress: List[TrainingProgressItem]
    hrMetrics: HRMetrics