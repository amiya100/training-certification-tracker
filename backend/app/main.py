from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import engine, Base
import os

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

# Get FRONTEND_URL from environment or use defaults
frontend_url = os.getenv(
    "FRONTEND_URL"
)

# Build origins list for CORS
origins = [
    "http://localhost:5173",  # Vite default
    "http://localhost:3000",  # Create React App default
    frontend_url,
]

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create DB tables
Base.metadata.create_all(bind=engine)

# Include routers (NO prefix)
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

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", "8000"))
    uvicorn.run(app, host="0.0.0.0", port=port)