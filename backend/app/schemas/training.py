from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

class TrainingBase(BaseModel):
    name: str = Field(..., max_length=200)
    description: Optional[str] = None
    duration_hours: Optional[float] = Field(0.0, ge=0)

class TrainingCreate(TrainingBase):
    pass

class TrainingUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    duration_hours: Optional[float] = Field(None, ge=0)

    class Config:
        extra = "forbid"

class Training(TrainingBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class TrainingList(BaseModel):
    trainings: list[Training]
    total: int
    skip: int
    limit: int