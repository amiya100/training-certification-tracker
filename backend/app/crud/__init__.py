# app/crud/__init__.py
from .employee import employee
from .department import department
from .training import training
from .enrollment import enrollment
from .certification import certification

__all__ = ["employee","department","training","enrollment","certification",]