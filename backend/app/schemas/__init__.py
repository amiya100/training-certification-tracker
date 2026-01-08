# app/schemas/__init__.py
from .employee import Employee, EmployeeCreate, EmployeeUpdate, EmployeeList
from .department import Department, DepartmentCreate, DepartmentUpdate, DepartmentList
from .training import Training, TrainingCreate, TrainingUpdate, TrainingList
from .certification import Certification, CertificationCreate, CertificationUpdate, CertificationList
from .dashboard import (
    StatusDistributionItem,
    TopPerformer,
    EmployeeStatus,
    TrainingCertificationStatus,
    TrainingProgressItem,
    HRMetricItem,
    HRMetrics,
    DashboardStats,
    DashboardDataResponse
)

__all__ = [
    # Employee
    "Employee",
    "EmployeeCreate", 
    "EmployeeUpdate",
    "EmployeeList",
    
    # Department
    "Department",
    "DepartmentCreate",
    "DepartmentUpdate",
    "DepartmentList",
    
    # Training
    "Training",
    "TrainingCreate",
    "TrainingUpdate",
    "TrainingList",
    
    # Certification
    "Certification",
    "CertificationCreate",
    "CertificationUpdate",
    "CertificationList",
    
    # Dashboard
    "StatusDistributionItem",
    "TopPerformer",
    "EmployeeStatus",
    "TrainingCertificationStatus",
    "TrainingProgressItem",
    "HRMetricItem",
    "HRMetrics",
    "DashboardStats",
    "DashboardDataResponse"
]