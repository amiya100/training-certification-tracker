# main.py
from fastapi import FastAPI
from app.database import engine, Base
from app.routes import employees, departments  # Import your routers

app = FastAPI(title="Training & Certification Tracker")

# Import and include routers AFTER creating app
from app.routes import employees, departments

app.include_router(employees.router)
app.include_router(departments.router)

# Test: create tables (will do nothing if none defined yet)
Base.metadata.create_all(bind=engine)

@app.get("/")
def root():
    return {"message": "FastAPI + SQLAlchemy connected to Aiven MySQL successfully!"}

@app.get("/health")
def health_check():
    return {"status": "OK"}