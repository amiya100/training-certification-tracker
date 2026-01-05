# app/routes/__init__.py
from .employees import router as employee_router
from .departments import router as department_router
from .trainings import router as training_router
from .enrollments import router as enrollment_router
from .certifications import router as certification_router
from .dashboard import router as dashboard_router  

__all__ = [
    "employee_router",
    "department_router", 
    "training_router",
    "enrollment_router",
    "certification_router",
    "dashboard_router", 
]