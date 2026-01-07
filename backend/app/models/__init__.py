#app/models/__init__.py
from .employee import Employee
from .department import Department
from .training import Training
from .certification import Certification
from .enrollment import Enrollment

__all__ = [
    "Employee",
    "Department",
    "Training",
    "Certification"
    "Enrollment"
]

