from fastapi import FastAPI
from app.database import engine, Base  # Use correct import path

app = FastAPI(title="Training & Certification Tracker")

# Test: create tables (will do nothing if none defined yet)
Base.metadata.create_all(bind=engine)

@app.get("/")
def root():
    return {"message": "FastAPI + SQLAlchemy connected to Aiven MySQL successfully!"}

@app.get("/health")
def health_check():
    return {"status": "OK"}
