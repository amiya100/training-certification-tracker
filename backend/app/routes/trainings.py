from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import Optional
from ..database import get_db
from ..crud import training as crud_training
from ..schemas.training import Training, TrainingCreate, TrainingUpdate, TrainingList

router = APIRouter(prefix="/trainings", tags=["trainings"])

@router.post("/", response_model=Training, status_code=status.HTTP_201_CREATED)
def create_training(training: TrainingCreate, db: Session = Depends(get_db)):
    return crud_training.create(db, obj_in=training)

@router.get("/", response_model=TrainingList)
def read_trainings(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    name: Optional[str] = Query(None, description="Search by name"),
    db: Session = Depends(get_db)
):
    if name:
        items = crud_training.search_by_name(db, name)
        total = len(items)
        items = items[skip:skip+limit]
    else:
        items = crud_training.get_multi(db, skip, limit)
        total = crud_training.get_total_count(db)
    
    return TrainingList(trainings=items, total=total, skip=skip, limit=limit)

@router.get("/{training_id}", response_model=Training)
def read_training(training_id: int, db: Session = Depends(get_db)):
    obj = crud_training.get(db, training_id)
    if not obj:
        raise HTTPException(404, "Training not found")
    return obj

@router.put("/{training_id}", response_model=Training)
def update_training(training_id: int, training_update: TrainingUpdate, db: Session = Depends(get_db)):
    obj = crud_training.get(db, training_id)
    if not obj:
        raise HTTPException(404, "Training not found")
    return crud_training.update(db, db_obj=obj, obj_in=training_update)

@router.delete("/{training_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_training(training_id: int, db: Session = Depends(get_db)):
    obj = crud_training.remove(db, id=training_id)
    if not obj:
        raise HTTPException(404, "Training not found")
    return None