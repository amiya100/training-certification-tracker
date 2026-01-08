from sqlalchemy import func, case, and_, or_
from datetime import datetime, timedelta
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload, aliased
import pytz
from typing import Dict, List, Any, Tuple
from ..database import get_db
from .. import models, schemas

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
    local_midnight = IST.localize(datetime.combine(local_date, datetime.min.time()))
    return local_midnight.astimezone(pytz.utc)

@router.get("/dashboard-data", response_model=schemas.DashboardDataResponse)
async def get_dashboard_data(db: Session = Depends(get_db)):
    """
    Returns fully processed dashboard data including:
    - Stats with growth percentages
    - Employee status distribution
    - Training certifications status
    - Training progress
    - HR metrics
    """
    try:
        # Get current time in IST
        now_ist = datetime.now(IST)
        today_ist = now_ist.date()
        yesterday_ist = today_ist - timedelta(days=1)
        
        # Convert IST dates to UTC for database queries
        today_midnight_utc = get_local_midnight_utc(today_ist)
        yesterday_midnight_utc = get_local_midnight_utc(yesterday_ist)
        
        # ===== 1. DASHBOARD STATS =====
        def count_up_to_ist_date(model, date_field, ist_date):
            local_end_of_day = IST.localize(
                datetime.combine(ist_date, datetime.max.time())
            )
            utc_end_of_day = local_end_of_day.astimezone(pytz.utc)
            return db.query(func.count(model.id)).filter(
                getattr(model, date_field) <= utc_end_of_day
            ).scalar() or 0
        
        # Total counts
        total_employees = db.query(func.count(models.Employee.id)).scalar() or 0
        total_trainings = db.query(func.count(models.Training.id)).scalar() or 0
        total_departments = db.query(func.count(models.Department.id)).scalar() or 0
        active_enrollments = db.query(func.count(models.Enrollment.id)).filter(
            models.Enrollment.status.in_(["enrolled", "in_progress"])
        ).scalar() or 0
        total_certifications = db.query(func.count(models.Certification.id)).scalar() or 0
        
        # Growth calculations
        employees_yesterday = count_up_to_ist_date(models.Employee, 'created_at', yesterday_ist)
        employee_growth_percentage = calculate_growth(total_employees, employees_yesterday)
        
        trainings_yesterday = count_up_to_ist_date(models.Training, 'created_at', yesterday_ist)
        training_growth_percentage = calculate_growth(total_trainings, trainings_yesterday)
        
        enrollments_yesterday = count_up_to_ist_date(models.Enrollment, 'enrolled_date', yesterday_ist)
        total_enrollments = db.query(func.count(models.Enrollment.id)).scalar() or 0
        enrollment_growth_percentage = calculate_growth(total_enrollments, enrollments_yesterday)
        
        certifications_yesterday = count_up_to_ist_date(models.Certification, 'issued_date', yesterday_ist)
        certification_growth_percentage = calculate_growth(total_certifications, certifications_yesterday)
        
        # Expiring certifications (next 30 days)
        thirty_days_from_now_ist = now_ist + timedelta(days=30)
        thirty_days_from_now_utc = thirty_days_from_now_ist.astimezone(pytz.utc)
        
        expiring_certifications = db.query(func.count(models.Certification.id)).filter(
            models.Certification.expires_at <= thirty_days_from_now_utc,
            models.Certification.expires_at > now_ist.astimezone(pytz.utc),
            models.Certification.status == "active"
        ).scalar() or 0
        
        # Completion rate
        completed_enrollments = db.query(func.count(models.Enrollment.id)).filter(
            models.Enrollment.status == "completed"
        ).scalar() or 0
        total_enrollments_count = db.query(func.count(models.Enrollment.id)).scalar() or 1
        completion_rate = round((completed_enrollments / total_enrollments_count) * 100, 1)
        
        completed_yesterday = count_up_to_ist_date(models.Enrollment, 'completed_date', yesterday_ist)
        completion_change_percentage = calculate_growth(completed_enrollments, completed_yesterday)
        
        # Total training hours
        total_training_hours_result = db.query(
            func.sum(models.Training.duration_hours)
        ).select_from(models.Enrollment).join(
            models.Training, models.Training.id == models.Enrollment.training_id
        ).filter(
            models.Enrollment.status == "completed"
        ).scalar()
        total_training_hours = total_training_hours_result or 0
        
        stats = {
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
            "expiring_change_percentage": 0.0,
            "completion_change_percentage": completion_change_percentage,
            "training_hours_growth_percentage": 0.0,
            "training_growth_percentage": training_growth_percentage
        }
        
        # ===== 2. EMPLOYEE STATUS =====
        # Get employees in training (enrolled or in_progress)
        in_training_subq = db.query(models.Enrollment.employee_id).filter(
            models.Enrollment.status.in_(["enrolled", "in_progress"])
        ).distinct().subquery()
        
        # Get certified employees
        certified_subq = db.query(models.Certification.employee_id).filter(
            models.Certification.status == "active"
        ).distinct().subquery()
        
        # Get employees with completed enrollments
        completed_subq = db.query(models.Enrollment.employee_id).filter(
            models.Enrollment.status == "completed"
        ).distinct().subquery()
        
        # FIXED: Use correct case() syntax for SQLAlchemy 1.4+
        status_counts_query = db.query(
            func.count(
                case(
                    (models.Employee.id.in_(db.query(in_training_subq.c.employee_id)), 1),
                    else_=None
                )
            ).label('in_training'),
            func.count(
                case(
                    (models.Employee.id.in_(db.query(certified_subq.c.employee_id)), 1),
                    else_=None
                )
            ).label('certified'),
            func.count(
                case(
                    (
                        ~models.Employee.id.in_(db.query(in_training_subq.c.employee_id)) &
                        ~models.Employee.id.in_(db.query(certified_subq.c.employee_id)),
                        1
                    ),
                    else_=None
                )
            ).label('available'),
            func.count(
                case(
                    (models.Employee.id.in_(db.query(completed_subq.c.employee_id)), 1),
                    else_=None
                )
            ).label('completed')
        )
        
        status_counts = status_counts_query.scalar()
        
        # Handle the tuple result
        if isinstance(status_counts, tuple):
            in_training_count, certified_count, available_count, completed_count = status_counts
        else:
            # If scalar() returns a single value, we need to adjust
            in_training_count = status_counts_query.first()
            if in_training_count:
                in_training_count, certified_count, available_count, completed_count = in_training_count
            else:
                in_training_count = certified_count = available_count = completed_count = 0
        
        employee_status = {
            "totalEmployees": total_employees,
            "distribution": [
                {
                    "label": "In Training",
                    "count": in_training_count or 0,
                    "percent": round((in_training_count or 0) / total_employees * 100, 1) if total_employees > 0 else 0,
                    "color": "#3B82F6"
                },
                {
                    "label": "Certified",
                    "count": certified_count or 0,
                    "percent": round((certified_count or 0) / total_employees * 100, 1) if total_employees > 0 else 0,
                    "color": "#10B981"
                },
                {
                    "label": "Available",
                    "count": available_count or 0,
                    "percent": round((available_count or 0) / total_employees * 100, 1) if total_employees > 0 else 0,
                    "color": "#6B7280"
                },
                {
                    "label": "Completed",
                    "count": completed_count or 0,
                    "percent": round((completed_count or 0) / total_employees * 100, 1) if total_employees > 0 else 0,
                    "color": "#8B5CF6"
                }
            ],
            "topPerformer": get_top_performer(db, total_trainings)
        }
        
        # ===== 3. TRAINING CERTIFICATIONS =====
        enrolled_count = db.query(func.count(models.Enrollment.id)).filter(
            models.Enrollment.status.in_(["enrolled", "in_progress"])
        ).scalar() or 0
        
        certified_count = db.query(func.count(models.Certification.id)).filter(
            models.Certification.status == "active"
        ).scalar() or 0
        
        expired_count = db.query(func.count(models.Certification.id)).filter(
            models.Certification.status == "expired"
        ).scalar() or 0
        
        not_started_count = max(0, total_trainings - enrolled_count - certified_count)
        
        training_certifications = {
            "totalTrainings": total_trainings,
            "certificationStatuses": [
                {
                    "label": "Certified",
                    "count": certified_count,
                    "percent": round(certified_count / total_trainings * 100, 1) if total_trainings > 0 else 0,
                    "color": "#10B981"
                },
                {
                    "label": "In Progress",
                    "count": enrolled_count,
                    "percent": round(enrolled_count / total_trainings * 100, 1) if total_trainings > 0 else 0,
                    "color": "#3B82F6"
                },
                {
                    "label": "Not Started",
                    "count": not_started_count,
                    "percent": round(not_started_count / total_trainings * 100, 1) if total_trainings > 0 else 0,
                    "color": "#6B7280"
                },
                {
                    "label": "Expired",
                    "count": expired_count,
                    "percent": round(expired_count / total_trainings * 100, 1) if total_trainings > 0 else 0,
                    "color": "#EF4444"
                }
            ],
            "expiringSoonCount": expiring_certifications,
            "expiringAvatars": get_expiring_avatars(db, now_ist),
            "upcomingDeadlines": get_upcoming_deadlines_count(db, now_ist)
        }
        
        # ===== 4. TRAINING PROGRESS =====
        training_progress = get_training_progress_data(db)
        
        # ===== 5. HR METRICS =====
        hr_metrics = get_hr_metrics_data(db)
        
        return {
            "stats": stats,
            "employeeStatus": employee_status,
            "trainingCertifications": training_certifications,
            "trainingProgress": training_progress,
            "hrMetrics": hr_metrics
        }
        
    except Exception as e:
        print(f"Dashboard processed data error: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Failed to process dashboard data: {str(e)}")


#Helper functions
def get_top_performer(db: Session, total_trainings: int) -> Dict[str, Any]:
    """Get top performing employee based on certifications"""
    try:
        result = db.query(
            models.Employee.id,
            models.Employee.first_name,
            models.Employee.last_name,
            models.Employee.position,
            func.count(models.Certification.id).label('cert_count')
        ).join(
            models.Certification, models.Certification.employee_id == models.Employee.id, isouter=True
        ).filter(
            models.Certification.status == "active"
        ).group_by(
            models.Employee.id
        ).order_by(
            func.count(models.Certification.id).desc()
        ).first()
        
        if result and result.first_name and result.last_name:
            performance = round((result.cert_count or 0) / max(total_trainings, 1) * 100, 1)
            
            return {
                "name": f"{result.first_name} {result.last_name}",
                "role": result.position or "Employee",
                "performance": min(performance, 100)
            }
    except Exception as e:
        print(f"Error getting top performer: {e}")
    
    return {
        "name": "No top performer yet",
        "role": "Assign employees to trainings",
        "performance": 0
    }

def get_expiring_avatars(db: Session, now_ist: datetime) -> List[str]:
    """Get avatar URLs for employees with expiring certifications"""
    try:
        thirty_days_from_now_ist = now_ist + timedelta(days=30)
        thirty_days_from_now_utc = thirty_days_from_now_ist.astimezone(pytz.utc)
        
        expiring_employees = db.query(
            models.Employee.id,
            models.Employee.first_name,
            models.Employee.last_name
        ).join(
            models.Certification, models.Certification.employee_id == models.Employee.id
        ).filter(
            models.Certification.expires_at <= thirty_days_from_now_utc,
            models.Certification.expires_at > now_ist.astimezone(pytz.utc),
            models.Certification.status == "active"
        ).distinct().limit(4).all()
        
        avatars = []
        for emp in expiring_employees:
            first_initial = emp.first_name[0] if emp.first_name else 'E'
            last_initial = emp.last_name[0] if emp.last_name else 'm'
            initials = f"{first_initial}{last_initial}"
            avatars.append(f"https://ui-avatars.com/api/?name={initials}&background=random&color=fff&size=40")
        
        return avatars
    except Exception as e:
        print(f"Error getting expiring avatars: {e}")
        return []

def get_upcoming_deadlines_count(db: Session, now_ist: datetime) -> int:
    """Count enrollments with deadlines within 7 days"""
    try:
        seven_days_from_now_ist = now_ist + timedelta(days=7)
        seven_days_from_now_utc = seven_days_from_now_ist.astimezone(pytz.utc)
        now_utc = now_ist.astimezone(pytz.utc)
        
        count = db.query(func.count(models.Enrollment.id)).filter(
            models.Enrollment.end_date <= seven_days_from_now_utc,
            models.Enrollment.end_date > now_utc,
            models.Enrollment.status.in_(["enrolled", "in_progress"])
        ).scalar() or 0
        
        return count
    except Exception as e:
        print(f"Error getting upcoming deadlines: {e}")
        return 0

def get_training_progress_data(db: Session) -> List[Dict[str, Any]]:
    """Get training progress data for recent enrollments"""
    try:
        enrollments = db.query(
            models.Enrollment,
            models.Employee,
            models.Training
        ).join(
            models.Employee, models.Employee.id == models.Enrollment.employee_id
        ).join(
            models.Training, models.Training.id == models.Enrollment.training_id
        ).order_by(
            models.Enrollment.created_at.desc()
        ).limit(8).all()
        
        progress_data = []
        
        # Get current time once
        now = datetime.now()
        
        for enrollment, employee, training in enrollments:
            # Check if employee has certification for this training
            has_certification = db.query(models.Certification).filter(
                models.Certification.employee_id == employee.id,
                models.Certification.training_id == training.id,
                models.Certification.status == "active"
            ).first() is not None
            
            # Check if overdue - Compare dates only (ignore timezone)
            is_overdue = False
            if enrollment.end_date:
                # Convert both to date objects for comparison
                end_date = enrollment.end_date
                if hasattr(end_date, 'date'):
                    end_date_date = end_date.date() if hasattr(end_date, 'date') else end_date
                else:
                    end_date_date = end_date
                
                current_date = now.date()
                
                if end_date_date < current_date and enrollment.status not in ["completed", "cancelled"]:
                    is_overdue = True
            
            # Get avatar
            first_initial = employee.first_name[0] if employee.first_name else 'E'
            last_initial = employee.last_name[0] if employee.last_name else 'm'
            avatar_url = f"https://ui-avatars.com/api/?name={first_initial}{last_initial}&background=random&color=fff&size=40"
            
            # Helper function to format dates safely
            def safe_date_format(date_obj):
                if not date_obj:
                    return None
                try:
                    if hasattr(date_obj, 'date'):
                        return date_obj.date().isoformat()
                    return date_obj.isoformat()[:10]
                except:
                    return None
            
            progress_data.append({
                "id": str(enrollment.id),
                "name": f"{employee.first_name or ''} {employee.last_name or ''}".strip() or "Unknown Employee",
                "role": employee.position or "Employee",
                "avatarUrl": avatar_url,
                "trainingName": training.name or "Unknown Training",
                "progress": min(100, max(0, enrollment.progress or 0)),
                "status": "overdue" if is_overdue else (enrollment.status or "enrolled"),
                "startDate": safe_date_format(enrollment.start_date),
                "endDate": safe_date_format(enrollment.end_date),
                "deadline": safe_date_format(enrollment.end_date),
                "completionDate": safe_date_format(enrollment.completed_date),
                "hasCertification": has_certification
            })
        
        return progress_data
    except Exception as e:
        print(f"Error getting training progress: {e}")
        import traceback
        traceback.print_exc()
        return []

def get_hr_metrics_data(db: Session) -> Dict[str, Any]:
    """Get HR metrics data (employees, trainings, departments)"""
    try:
        # Employees
        employees = db.query(models.Employee).limit(4).all()
        employee_data = []
        
        for emp in employees:
            # Check employee status
            active_enrollments = db.query(func.count(models.Enrollment.id)).filter(
                models.Enrollment.employee_id == emp.id,
                models.Enrollment.status.in_(["enrolled", "in_progress"])
            ).scalar() or 0
            
            active_certifications = db.query(func.count(models.Certification.id)).filter(
                models.Certification.employee_id == emp.id,
                models.Certification.status == "active"
            ).scalar() or 0
            
            status = "Available"
            status_color = "bg-green-500/20 text-green-300 border border-green-500/40 px-2 py-1 rounded-full"
            
            if active_enrollments > 0:
                status = "In Training"
                status_color = "bg-blue-500/20 text-blue-300 border border-blue-500/40 px-2 py-1 rounded-full"
            elif active_certifications > 0:
                status = f"{active_certifications} Certified"
                status_color = "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2 py-1 rounded-full"
            
            # Get department
            dept_name = "Unassigned"
            if emp.department_id:
                dept = db.query(models.Department).filter(models.Department.id == emp.department_id).first()
                dept_name = dept.name if dept else f"Dept {emp.department_id}"
            
            # Get avatar
            first_initial = emp.first_name[0] if emp.first_name else 'E'
            last_initial = emp.last_name[0] if emp.last_name else 'm'
            avatar_url = f"https://ui-avatars.com/api/?name={first_initial}{last_initial}&background=random&color=fff&size=40"
            
            employee_data.append({
                "id": str(emp.id),
                "avatarUrl": avatar_url,
                "name": f"{emp.first_name or ''} {emp.last_name or ''}".strip() or "Employee",
                "role": emp.position or "Employee",
                "status": status,
                "statusColor": status_color,
                "departmentName": dept_name
            })
        
        # Trainings
        trainings = db.query(models.Training).limit(4).all()
        training_data = []
        
        for train in trainings:
            enrollment_count = db.query(func.count(models.Enrollment.id)).filter(
                models.Enrollment.training_id == train.id
            ).scalar() or 0
            
            training_data.append({
                "id": str(train.id),
                "avatarUrl": "https://ui-avatars.com/api/?name=TR&background=6366f1&color=fff&size=40",
                "name": train.name or "Training Program",
                "role": train.description or "Training",
                "trainingCount": enrollment_count
            })
        
        # Departments
        departments = db.query(models.Department).limit(4).all()
        department_data = []
        
        for dept in departments:
            employee_count = db.query(func.count(models.Employee.id)).filter(
                models.Employee.department_id == dept.id
            ).scalar() or 0
            
            training_count = db.query(func.count(models.Enrollment.id)).join(
                models.Employee, models.Employee.id == models.Enrollment.employee_id
            ).filter(
                models.Employee.department_id == dept.id
            ).scalar() or 0
            
            # Get department initials
            dept_name = dept.name or "Unnamed Department"
            words = dept_name.split()
            if len(words) >= 2:
                dept_initials = f"{words[0][0]}{words[1][0]}".upper()
            elif dept_name:
                dept_initials = dept_name[:2].upper()
            else:
                dept_initials = "DP"
            
            status = f"{employee_count} employees"
            status_color = "bg-purple-500/20 text-purple-300 border border-purple-500/40 px-2 py-1 rounded-full"
            
            if employee_count == 0:
                status = "No employees"
                status_color = "bg-gray-500/20 text-gray-300 border border-gray-500/40 px-2 py-1 rounded-full"
            elif employee_count > 30:
                status = f"{employee_count} employees (Large)"
                status_color = "bg-green-500/20 text-green-300 border border-green-500/40 px-2 py-1 rounded-full"
            
            department_data.append({
                "id": str(dept.id),
                "avatarUrl": f"https://ui-avatars.com/api/?name={dept_initials}&background=8b5cf6&color=fff&size=40",
                "name": dept_name,
                "status": status,
                "statusColor": status_color,
                "employeeCount": employee_count,
                "trainingCount": training_count
            })
        
        return {
            "employees": employee_data,
            "trainings": training_data,
            "departments": department_data
        }
    except Exception as e:
        print(f"Error getting HR metrics: {e}")
        return {
            "employees": [],
            "trainings": [],
            "departments": []
        }