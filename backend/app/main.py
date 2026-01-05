from fastapi import FastAPI
from app.database import engine, Base

from app.routes.employees import router as employee_router
from app.routes.departments import router as department_router
from app.routes.trainings import router as training_router
from app.routes.certifications import router as certification_router

app = FastAPI(title="Training & Certification Tracker")

# Create DB tables
Base.metadata.create_all(bind=engine)

# Include routers
app.include_router(employee_router)
app.include_router(department_router)
app.include_router(training_router)
app.include_router(certification_router)

@app.get("/")
def root():
    return {"message": "Training & Certification Tracker API running"}

@app.get("/health")
def health_check():
    return {"status": "OK"}
