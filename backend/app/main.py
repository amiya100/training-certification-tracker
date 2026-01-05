# main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import engine, Base  # Use correct import path
from app.routes import (
    employee_router,
    department_router,
    training_router,
    enrollment_router,
    certification_router,
    dashboard_router
)
app = FastAPI(title="Training & Certification Tracker")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"], 
)

app.include_router(employee_router)
app.include_router(department_router)
app.include_router(training_router)
app.include_router(enrollment_router)
app.include_router(certification_router)

app.include_router(dashboard_router)

# Test: create tables (will do nothing if none defined yet)
Base.metadata.create_all(bind=engine)

@app.get("/")
def root():
    return {"message": "FastAPI + SQLAlchemy connected to Aiven MySQL successfully!"}

@app.get("/health")
def health_check():
    return {"status": "OK"}