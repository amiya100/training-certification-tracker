# app/routes/__init__.py
from .employees import router as employees_router
from .departments import router as department_router
__all__ = ["employees_router","department_router"]