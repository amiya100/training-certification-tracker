from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import engine, Base
from app.routes import auth  # import the auth router

from app.routes import (
    employee_router,
    department_router, 
    training_router,
    enrollment_router,
    certification_router,
    dashboard_router,
    compliance_router,
    auth
)

app = FastAPI(title="Training & Certification Tracker")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=[ "http://localhost:5173"],  # React dev servers
    allow_credentials=True,
    allow_methods=["*"],  # Allow all methods (GET, POST, PUT, DELETE, etc.)
    allow_headers=["*"],  # Allow all headers
)

# Create DB tables
Base.metadata.create_all(bind=engine)

# Include routers
app.include_router(employee_router)
app.include_router(department_router)
app.include_router(training_router)
app.include_router(enrollment_router)
app.include_router(certification_router)
app.include_router(dashboard_router)
app.include_router(compliance_router)
app.include_router(auth.router)


@app.get("/")
def root():
    return {"message": "Training & Certification Tracker API running"}

@app.get("/health")
def health_check():
    return {"status": "OK"}