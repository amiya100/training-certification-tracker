from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from ..database import get_db
from ..crud import enrollment as crud_enrollment
from ..schemas.enrollment import (
    Enrollment,
    EnrollmentCreate,
    EnrollmentUpdate,
    EnrollmentList
)

router = APIRouter(prefix="/enrollments", tags=["enrollments"])

@router.post("/", response_model=Enrollment, status_code=status.HTTP_201_CREATED)
def create_enrollment(
    enrollment: EnrollmentCreate,
    db: Session = Depends(get_db)
):
    return crud_enrollment.create(db, obj_in=enrollment)

@router.get("/", response_model=EnrollmentList)
def read_enrollments(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1),
    db: Session = Depends(get_db)
):
    enrollments = crud_enrollment.get_multi(db, skip, limit)
    total = crud_enrollment.get_total_count(db)

    return EnrollmentList(
        enrollments=enrollments,
        total=total,
        skip=skip,
        limit=limit
    )

@router.get("/{enrollment_id}", response_model=Enrollment)
def read_enrollment(enrollment_id: int, db: Session = Depends(get_db)):
    obj = crud_enrollment.get(db, id=enrollment_id)
    if not obj:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Enrollment not found"
        )
    return obj

@router.put("/{enrollment_id}", response_model=Enrollment)
def update_enrollment(
    enrollment_id: int,
    enrollment_update: EnrollmentUpdate,
    db: Session = Depends(get_db)
):
    obj = crud_enrollment.get(db, id=enrollment_id)
    if not obj:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Enrollment not found"
        )
    return crud_enrollment.update(db, db_obj=obj, obj_in=enrollment_update)

@router.delete("/{enrollment_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_enrollment(enrollment_id: int, db: Session = Depends(get_db)):
    obj = crud_enrollment.remove(db, id=enrollment_id)
    if not obj:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Enrollment not found"
        )
    return None
