from .employees import router as employee_router
from .departments import router as department_router
from .trainings import router as training_router
from .certifications import router as certification_router

__all__ = [
    "employee_router",
    "department_router",
    "training_router",
    "certification_router"
]
