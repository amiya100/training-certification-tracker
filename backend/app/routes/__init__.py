from .employees import router as employee_router
from .departments import router as department_router
from .trainings import router as training_router
from .certifications import router as certification_router
from .enrollments import router as enrollment_router  # NEW
from .dashboard import router as dashboard_router
from .compliance import router as compliance_router

__all__ = [
    "employee_router",
    "department_router",
    "training_router",
    "certification_router",
    "enrollment_router",  # NEW
    "dashboard_router",
    "compliance_router"
]