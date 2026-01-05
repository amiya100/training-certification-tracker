from fastapi import FastAPI
from app.database import engine, Base  # Use correct import path
from backend.app.routes.employees import employee_router,department_router,training_router,enrollment_router,certification_router
app = FastAPI(title="Training & Certification Tracker")

# Test: create tables (will do nothing if none defined yet)
Base.metadata.create_all(bind=engine)

app.include_router(employee_router)
app.include_router(department_router)
app.include_router(training_router)
app.include_router(enrollment_router)
app.include_router(certification_router)
@app.get("/")
def root():
    return {"message": "FastAPI + SQLAlchemy connected to Aiven MySQL successfully!"}

@app.get("/health")
def health_check():
    return {"status": "OK"}
