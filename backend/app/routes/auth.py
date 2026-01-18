# app/routes/auth.py
from fastapi import APIRouter, HTTPException, status, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel
from datetime import datetime, timedelta
from jose import jwt, JWTError
from typing import Optional

SECRET_KEY = "supersecretkey"  # use .env in production
ALGITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60

router = APIRouter(tags=["auth"], prefix="/auth")

# Hardcoded user
USER = {
    "email": "skillflow@gmail.com",
    "password": "skillflow1"
}

class LoginRequest(BaseModel):
    email: str
    password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"

@router.post("/login", response_model=TokenResponse)
def login(data: LoginRequest):  
    if data.email.strip().lower() != USER["email"].lower() or data.password != USER["password"]:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid email or password")
    
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    payload = {"sub": USER["email"], "exp": expire}
    token = jwt.encode(payload, SECRET_KEY, algorithm=ALGITHM)
    
    return {"access_token": token}