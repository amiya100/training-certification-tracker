from sqlalchemy import func
from datetime import datetime, timedelta
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
import pytz
from ..database import get_db
from .. import models

router = APIRouter(prefix="/api/dashboard", tags=["dashboard"])

# Your timezone (Asia/Kolkata = IST = UTC+5:30)
IST = pytz.timezone('Asia/Kolkata')

def calculate_growth(today_total: int, yesterday_total: int) -> float:
    """Calculate percentage growth from yesterday to today"""
    if yesterday_total > 0:
        growth = ((today_total - yesterday_total) / yesterday_total) * 100
        # Cap unrealistic values
        if growth > 1000:
            return 100.0
        return round(growth, 1)
    elif today_total > 0 and yesterday_total == 0:
        return 100.0  # Infinite growth
    else:
        return 0.0

def get_local_midnight_utc(local_date):
    """Convert local date to UTC datetime for that day's midnight"""
    # Create datetime at midnight in local timezone
    local_midnight = IST.localize(datetime.combine(local_date, datetime.min.time()))
    # Convert to UTC
    return local_midnight.astimezone(pytz.utc)

@router.get("/stats")
async def get_dashboard_stats(db: Session = Depends(get_db)):
    try:
        # Get current time in IST
        now_ist = datetime.now(IST)
        today_ist = now_ist.date()
        yesterday_ist = today_ist - timedelta(days=1)
        
        # Convert IST dates to UTC for database queries
        today_midnight_utc = get_local_midnight_utc(today_ist)
        yesterday_midnight_utc = get_local_midnight_utc(yesterday_ist)
        
        print(f"DEBUG - IST Today: {today_ist}, UTC: {today_midnight_utc}")
        print(f"DEBUG - IST Yesterday: {yesterday_ist}, UTC: {yesterday_midnight_utc}")
        
        # Helper to count records up to a specific IST date (converted to UTC)
        def count_up_to_ist_date(model, date_field, ist_date):
            """Count records created up to the end of IST date"""
            # Convert IST date to UTC datetime (end of day in IST)
            local_end_of_day = IST.localize(
                datetime.combine(ist_date, datetime.max.time())
            )
            utc_end_of_day = local_end_of_day.astimezone(pytz.utc)
            
            return db.query(func.count(model.id)).filter(
                getattr(model, date_field) <= utc_end_of_day
            ).scalar() or 0
        
        # 1. Total Employees (current)
        total_employees = db.query(func.count(models.Employee.id)).scalar() or 0
        
        # Employees as of yesterday (IST time)
        employees_yesterday = count_up_to_ist_date(models.Employee, 'created_at', yesterday_ist)
        employee_growth_percentage = calculate_growth(total_employees, employees_yesterday)
        
        # 2. Total Trainings (current)
        total_trainings = db.query(func.count(models.Training.id)).scalar() or 0
        
        # Trainings as of yesterday
        trainings_yesterday = count_up_to_ist_date(models.Training, 'created_at', yesterday_ist)
        training_growth_percentage = calculate_growth(total_trainings, trainings_yesterday)
        
        # 3. Active Enrollments (current)
        active_enrollments = db.query(func.count(models.Enrollment.id)).filter(
            models.Enrollment.status.in_(["enrolled", "in_progress"])
        ).scalar() or 0
        
        # Total enrollments growth
        total_enrollments = db.query(func.count(models.Enrollment.id)).scalar() or 0
        enrollments_yesterday = count_up_to_ist_date(models.Enrollment, 'enrolled_date', yesterday_ist)
        enrollment_growth_percentage = calculate_growth(total_enrollments, enrollments_yesterday)
        
        # 4. Total Certifications (current)
        total_certifications = db.query(func.count(models.Certification.id)).scalar() or 0
        
        # Certifications as of yesterday
        certifications_yesterday = count_up_to_ist_date(models.Certification, 'issued_date', yesterday_ist)
        certification_growth_percentage = calculate_growth(total_certifications, certifications_yesterday)
        
        # 5. Total Departments
        total_departments = db.query(func.count(models.Department.id)).scalar() or 0
        
        # 6. Expiring Certifications (within next 30 days from now in IST)
        thirty_days_from_now_ist = now_ist + timedelta(days=30)
        thirty_days_from_now_utc = thirty_days_from_now_ist.astimezone(pytz.utc)
        
        expiring_certifications = db.query(func.count(models.Certification.id)).filter(
            models.Certification.expires_at <= thirty_days_from_now_utc,
            models.Certification.expires_at > now_ist.astimezone(pytz.utc),
            models.Certification.status == "active"
        ).scalar() or 0
        
        # Expiring change: yesterday vs today
        yesterday_30_days = (now_ist - timedelta(days=1)) + timedelta(days=30)
        yesterday_30_days_utc = yesterday_30_days.astimezone(pytz.utc)
        yesterday_now_utc = (now_ist - timedelta(days=1)).astimezone(pytz.utc)
        
        expiring_yesterday = db.query(func.count(models.Certification.id)).filter(
            models.Certification.expires_at <= yesterday_30_days_utc,
            models.Certification.expires_at > yesterday_now_utc,
            models.Certification.status == "active"
        ).scalar() or 0
        
        expiring_change_percentage = calculate_growth(expiring_certifications, expiring_yesterday)
        
        # 7. Completion Rate
        total_enrollments_count = db.query(func.count(models.Enrollment.id)).scalar() or 1
        completed_enrollments = db.query(func.count(models.Enrollment.id)).filter(
            models.Enrollment.status == "completed"
        ).scalar() or 0
        completion_rate = round((completed_enrollments / total_enrollments_count) * 100, 1)
        
        # Completion change
        completed_yesterday = count_up_to_ist_date(models.Enrollment, 'completed_date', yesterday_ist)
        completion_change_percentage = calculate_growth(completed_enrollments, completed_yesterday)
        
        # 8. Total Training Hours
        total_training_hours_result = db.query(
            func.sum(models.Training.duration_hours)
        ).select_from(models.Enrollment).join(
            models.Training, models.Training.id == models.Enrollment.training_id
        ).filter(
            models.Enrollment.status == "completed"
        ).scalar()
        
        total_training_hours = total_training_hours_result or 0
        
        # Training hours growth (simplified - compare totals)
        # For more accuracy, you'd need to sum hours up to yesterday
        training_hours_growth_percentage = 0.0  # Simplified
        
        print("=" * 80)
        print("DEBUG - Dashboard Stats (IST Timezone):")
        print(f"IST Date: {today_ist}")
        print(f"Employees: Today={total_employees}, Yesterday={employees_yesterday}, Growth={employee_growth_percentage}%")
        print(f"Trainings: Today={total_trainings}, Yesterday={trainings_yesterday}, Growth={training_growth_percentage}%")
        print("=" * 80)
        
        return {
            "total_employees": total_employees,
            "total_trainings": total_trainings,
            "total_certifications": total_certifications,
            "active_enrollments": active_enrollments,
            "total_departments": total_departments,
            "expiring_certifications": expiring_certifications,
            "completion_rate": completion_rate,
            "total_training_hours": total_training_hours,
            "employee_growth_percentage": employee_growth_percentage,
            "enrollment_growth_percentage": enrollment_growth_percentage,
            "certification_growth_percentage": certification_growth_percentage,
            "expiring_change_percentage": expiring_change_percentage,
            "completion_change_percentage": completion_change_percentage,
            "training_hours_growth_percentage": training_hours_growth_percentage,
            "training_growth_percentage": training_growth_percentage
        }
        
    except Exception as e:
        print(f"Dashboard stats error: {str(e)}")
        import traceback
        traceback.print_exc()
        # Return safe defaults
        return {
            "total_employees": 0,
            "total_trainings": 0,
            "total_certifications": 0,
            "active_enrollments": 0,
            "total_departments": 0,
            "expiring_certifications": 0,
            "completion_rate": 0.0,
            "total_training_hours": 0,
            "employee_growth_percentage": 0.0,
            "enrollment_growth_percentage": 0.0,
            "certification_growth_percentage": 0.0,
            "expiring_change_percentage": 0.0,
            "completion_change_percentage": 0.0,
            "training_hours_growth_percentage": 0.0,
            "training_growth_percentage": 0.0
        }