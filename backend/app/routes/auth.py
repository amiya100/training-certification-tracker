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

class TokenValidationResponse(BaseModel):
    valid: bool
    expires_at: Optional[str] = None
    message: Optional[str] = None
    email: Optional[str] = None

# Security scheme for token validation
security = HTTPBearer()

def verify_token(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """
    Dependency to verify and decode JWT token
    """
    token = credentials.credentials
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGITHM])
        email = payload.get("sub")
        exp = payload.get("exp")
        
        if email is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token payload"
            )
            
        # Check if token is expired
        if exp and datetime.utcnow() > datetime.fromtimestamp(exp):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Token has expired"
            )
            
        return payload
        
    except JWTError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Invalid token: {str(e)}"
        )

@router.post("/login", response_model=TokenResponse)
def login(data: LoginRequest):
    if data.email.strip().lower() != USER["email"].lower() or data.password != USER["password"]:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid email or password")
    
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    payload = {"sub": USER["email"], "exp": expire}
    token = jwt.encode(payload, SECRET_KEY, algorithm=ALGITHM)
    
    return {"access_token": token}

@router.get("/validate", response_model=TokenValidationResponse)
def validate_token(token_data: dict = Depends(verify_token)):
    """
    Validate the JWT token and return its status
    """
    try:
        email = token_data.get("sub")
        exp_timestamp = token_data.get("exp")
        
        if not email:
            return TokenValidationResponse(
                valid=False,
                message="Invalid token: No subject found"
            )
        
        # Check expiration
        if exp_timestamp:
            expiration_time = datetime.fromtimestamp(exp_timestamp)
            current_time = datetime.utcnow()
            
            if current_time >= expiration_time:
                return TokenValidationResponse(
                    valid=False,
                    expires_at=expiration_time.isoformat(),
                    message="Token has expired"
                )
            
            # Calculate time remaining
            time_remaining = expiration_time - current_time
            minutes_remaining = time_remaining.total_seconds() / 60
            
            # If token expires in less than 5 minutes, consider it almost expired
            if minutes_remaining < 5:
                message = f"Token expires in {int(minutes_remaining)} minutes"
            else:
                message = "Token is valid"
                
            return TokenValidationResponse(
                valid=True,
                expires_at=expiration_time.isoformat(),
                message=message,
                email=email
            )
        else:
            return TokenValidationResponse(
                valid=False,
                message="Invalid token: No expiration time"
            )
            
    except JWTError as e:
        return TokenValidationResponse(
            valid=False,
            message=f"Token validation error: {str(e)}"
        )
    except Exception as e:
        return TokenValidationResponse(
            valid=False,
            message=f"Unexpected error: {str(e)}"
        )
