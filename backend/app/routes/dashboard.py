from sqlalchemy import func, case, and_, or_
from datetime import datetime, timedelta
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
import pytz
from typing import Dict, List, Any
from ..database import get_db
from ..models import Employee, Training, Department, Enrollment, Certification
from ..schemas.dashboard import DashboardDataResponse
from ..dependecies import get_current_user

router = APIRouter(prefix="/api/dashboard", tags=["dashboard"])

# Your timezone (Asia/Kolkata = IST = UTC+5:30)
IST = pytz.timezone('Asia/Kolkata')

@router.get("/dashboard-data", response_model=DashboardDataResponse)
async def get_dashboard_data(
    db: Session = Depends(get_db), 
    current_user: dict = Depends(get_current_user)):
    """
    Returns fully processed dashboard data including:
    - Stats with growth percentages
    - Employee status distribution
    - Certification alerts (expiring/expired)
    - Training progress
    - HR metrics
    """
    try:
        # Get current time in IST
        now_ist = datetime.now(IST)
        today_ist = now_ist.date()
        yesterday_ist = today_ist - timedelta(days=1)
        
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
        total_employees = db.query(func.count(Employee.id)).scalar() or 0
        total_trainings = db.query(func.count(Training.id)).scalar() or 0
        total_departments = db.query(func.count(Department.id)).scalar() or 0
        active_enrollments = db.query(func.count(Enrollment.id)).filter(
            Enrollment.status.in_(["enrolled", "in_progress"])
        ).scalar() or 0
        total_certifications = db.query(func.count(Certification.id)).scalar() or 0
        
        # Growth calculations
        employees_yesterday = count_up_to_ist_date(Employee, 'created_at', yesterday_ist)
        employee_growth_percentage = calculate_growth(total_employees, employees_yesterday)
        
        trainings_yesterday = count_up_to_ist_date(Training, 'created_at', yesterday_ist)
        training_growth_percentage = calculate_growth(total_trainings, trainings_yesterday)
        
        enrollments_yesterday = count_up_to_ist_date(Enrollment, 'enrolled_date', yesterday_ist)
        total_enrollments = db.query(func.count(Enrollment.id)).scalar() or 0
        enrollment_growth_percentage = calculate_growth(total_enrollments, enrollments_yesterday)
        
        certifications_yesterday = count_up_to_ist_date(Certification, 'issued_date', yesterday_ist)
        certification_growth_percentage = calculate_growth(total_certifications, certifications_yesterday)
        
        # Expiring certifications (next 30 days)
        thirty_days_from_now_ist = now_ist + timedelta(days=30)
        thirty_days_from_now_utc = thirty_days_from_now_ist.astimezone(pytz.utc)
        
        expiring_certifications = db.query(func.count(Certification.id)).filter(
            Certification.expires_at <= thirty_days_from_now_utc,
            Certification.expires_at > now_ist.astimezone(pytz.utc),
            Certification.status == "active"
        ).scalar() or 0
        
        # Expired certifications
        expired_certifications = db.query(func.count(Certification.id)).filter(
            Certification.status == "expired"
        ).scalar() or 0
        
        # Completion rate
        completed_enrollments = db.query(func.count(Enrollment.id)).filter(
            Enrollment.status == "completed"
        ).scalar() or 0
        total_enrollments_count = db.query(func.count(Enrollment.id)).scalar() or 1
        completion_rate = round((completed_enrollments / total_enrollments_count) * 100, 1)
        
        completed_yesterday = count_up_to_ist_date(Enrollment, 'completed_date', yesterday_ist)
        completion_change_percentage = calculate_growth(completed_enrollments, completed_yesterday)
        
        # Total training hours
        total_training_hours_result = db.query(
            func.sum(Training.duration_hours)
        ).select_from(Enrollment).join(
            Training, Training.id == Enrollment.training_id
        ).filter(
            Enrollment.status == "completed"
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
        
        # ===== 2. EMPLOYEE STATUS (FIXED) =====
        # Create subqueries for employee statuses
        in_training_subq = db.query(Enrollment.employee_id).filter(
            Enrollment.status.in_(["enrolled", "in_progress"])
        ).distinct().subquery()
        
        certified_subq = db.query(Certification.employee_id).filter(
            Certification.status == "active"
        ).distinct().subquery()
        
        # FIXED LOGIC: Employees should be in only one category with priority:
        # 1. In Training (highest priority - if currently training, show as in training)
        # 2. Certified (if not training but has active certifications)
        # 3. Available (if not training and no certifications)
        
        # Count employees in each category (mutually exclusive)
        in_training_count = db.query(func.count()).filter(
            Employee.id.in_(db.query(in_training_subq.c.employee_id))
        ).scalar() or 0
        
        certified_count = db.query(func.count()).filter(
            ~Employee.id.in_(db.query(in_training_subq.c.employee_id)),  # Not in training
            Employee.id.in_(db.query(certified_subq.c.employee_id))      # But certified
        ).scalar() or 0
        
        available_count = db.query(func.count()).filter(
            ~Employee.id.in_(db.query(in_training_subq.c.employee_id)),  # Not in training
            ~Employee.id.in_(db.query(certified_subq.c.employee_id))     # Not certified
        ).scalar() or 0
        
        # FIXED: Calculate completed differently - employees who have completed enrollments
        # but don't have active certifications for those trainings
        completed_subq = db.query(Enrollment.employee_id).filter(
            Enrollment.status == "completed"
        ).distinct().subquery()
        
        # Get employees who have completed training but no active certification for that training
        completed_count_query = db.query(func.count(func.distinct(Employee.id))).filter(
            Employee.id.in_(db.query(completed_subq.c.employee_id)),
            ~Employee.id.in_(db.query(in_training_subq.c.employee_id)),  # Not currently in training
            ~Employee.id.in_(db.query(certified_subq.c.employee_id))     # No active certifications
        )
        
        completed_count = completed_count_query.scalar() or 0
        
        # Adjust available count to exclude completed employees
        available_count = max(0, available_count - completed_count)
        
        # Verify counts (for debugging)
        calculated_total = in_training_count + certified_count + available_count + completed_count
        
        # If there's a discrepancy due to data issues, adjust available count
        if total_employees > 0 and abs(calculated_total - total_employees) > 1:
            print(f"Debug: Employee count mismatch. Total: {total_employees}, Calculated: {calculated_total}")
            # Adjust available count to match total
            available_count = max(0, total_employees - (in_training_count + certified_count + completed_count))
        
        employee_status = {
            "totalEmployees": total_employees,
            "distribution": [
                {
                    "label": "In Training",
                    "count": in_training_count,
                    "percent": round((in_training_count / total_employees) * 100, 1) if total_employees > 0 else 0,
                    "color": "#3B82F6"
                },
                {
                    "label": "Certified",
                    "count": certified_count,
                    "percent": round((certified_count / total_employees) * 100, 1) if total_employees > 0 else 0,
                    "color": "#10B981"
                },
                {
                    "label": "Available",
                    "count": available_count,
                    "percent": round((available_count / total_employees) * 100, 1) if total_employees > 0 else 0,
                    "color": "#6B7280"
                },
                {
                    "label": "Completed",
                    "count": completed_count,
                    "percent": round((completed_count / total_employees) * 100, 1) if total_employees > 0 else 0,
                    "color": "#8B5CF6"
                }
            ],
            "topPerformer": get_top_performer(db, total_trainings)
        }
        
        # ===== 3. CERTIFICATION ALERTS (replacing Training Certifications) =====
        certification_alerts = get_certification_alerts_data(db, now_ist)
        
        # ===== 4. TRAINING PROGRESS =====
        training_progress = get_training_progress_data(db)
        
        # ===== 5. HR METRICS =====
        hr_metrics = get_hr_metrics_data(db)
        
        return {
            "stats": stats,
            "employeeStatus": employee_status,
            "certificationAlerts": certification_alerts,
            "trainingProgress": training_progress,
            "hrMetrics": hr_metrics
        }
        
    except Exception as e:
        print(f"Dashboard processed data error: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Failed to process dashboard data: {str(e)}")
    

# Helper functions
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

def get_certification_alerts_data(db: Session, now_ist: datetime) -> Dict[str, Any]:
    """Get categorized certification alerts for expiring/expired certifications"""
    try:
        now_utc = now_ist.astimezone(pytz.utc)
        thirty_days_from_now_utc = (now_ist + timedelta(days=30)).astimezone(pytz.utc)
        
        # Query certifications that are expiring or expired
        certifications = db.query(
            Certification,
            Employee,
            Training
        ).join(
            Employee, Employee.id == Certification.employee_id
        ).join(
            Training, Training.id == Certification.training_id
        ).filter(
            Certification.expires_at <= thirty_days_from_now_utc,
            Certification.status.in_(["active", "expired"])
        ).order_by(
            Certification.expires_at.asc()
        ).all()
        
        # Initialize categorized lists
        expired_alerts = []
        expiring_soon_alerts = []
        expiring_later_alerts = []
        
        for cert, employee, training in certifications:
            # Handle timezone comparison properly
            if cert.expires_at:
                # Make both datetimes offset-aware for comparison
                expires_at_aware = cert.expires_at
                if cert.expires_at.tzinfo is None:
                    # If expires_at is naive, assume it's UTC
                    expires_at_aware = pytz.utc.localize(cert.expires_at)
                
                # Determine status
                if cert.status == "expired" or expires_at_aware < now_utc:
                    status = "expired"
                elif expires_at_aware <= (now_utc + timedelta(days=7)):
                    status = "expiring_soon"
                else:
                    status = "expiring_later"
            else:
                # If no expiry date, treat as not expiring
                if cert.status == "expired":
                    status = "expired"
                else:
                    # Skip certifications without expiry dates (they shouldn't be in alerts)
                    continue
            
            # Get department
            dept_name = "Unassigned"
            if employee.department_id:
                dept = db.query(Department).filter(Department.id == employee.department_id).first()
                dept_name = dept.name if dept else "Unknown"
            
            # Get avatar
            first_initial = employee.first_name[0] if employee.first_name else 'E'
            last_initial = employee.last_name[0] if employee.last_name else 'm'
            avatar_url = f"https://ui-avatars.com/api/?name={first_initial}{last_initial}&background=random&color=fff&size=40"
            
            # Format date
            expiry_date = ""
            if cert.expires_at:
                # Convert to IST for display
                if cert.expires_at.tzinfo is None:
                    expires_at_local = pytz.utc.localize(cert.expires_at).astimezone(IST)
                else:
                    expires_at_local = cert.expires_at.astimezone(IST)
                expiry_date = expires_at_local.strftime("%Y-%m-%d")
            
            alert_item = {
                "id": str(cert.id),
                "name": f"{employee.first_name or ''} {employee.last_name or ''}".strip() or "Unknown Employee",
                "role": employee.position or "Employee",
                "department": dept_name,
                "certificationName": training.name or "Unknown Certification",
                "expiryDate": expiry_date,
                "status": status,
                "avatarUrl": avatar_url
            }
            
            # Categorize
            if status == "expired":
                expired_alerts.append(alert_item)
            elif status == "expiring_soon":
                expiring_soon_alerts.append(alert_item)
            elif status == "expiring_later":
                expiring_later_alerts.append(alert_item)
        
        return {
            "total": len(expired_alerts) + len(expiring_soon_alerts) + len(expiring_later_alerts),
            "expired": expired_alerts,
            "expiring_soon": expiring_soon_alerts,
            "expiring_later": expiring_later_alerts,
            "period_label": "30 Days Outlook"
        }
        
    except Exception as e:
        print(f"Error getting certification alerts: {e}")
        import traceback
        traceback.print_exc()
        return {
            "total": 0,
            "expired": [],
            "expiring_soon": [],
            "expiring_later": [],
            "period_label": "30 Days Outlook"
        }

def get_top_performer(db: Session, total_trainings: int) -> Dict[str, Any]:
    """Get top performing employee based on certifications"""
    try:
        result = db.query(
            Employee.id,
            Employee.first_name,
            Employee.last_name,
            Employee.position,
            func.count(Certification.id).label('cert_count')
        ).join(
            Certification, Certification.employee_id == Employee.id, isouter=True
        ).filter(
            Certification.status == "active"
        ).group_by(
            Employee.id
        ).order_by(
            func.count(Certification.id).desc()
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
            Employee.id,
            Employee.first_name,
            Employee.last_name
        ).join(
            Certification, Certification.employee_id == Employee.id
        ).filter(
            Certification.expires_at <= thirty_days_from_now_utc,
            Certification.expires_at > now_ist.astimezone(pytz.utc),
            Certification.status == "active"
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
        
        count = db.query(func.count(Enrollment.id)).filter(
            Enrollment.end_date <= seven_days_from_now_utc,
            Enrollment.end_date > now_utc,
            Enrollment.status.in_(["enrolled", "in_progress"])
        ).scalar() or 0
        
        return count
    except Exception as e:
        print(f"Error getting upcoming deadlines: {e}")
        return 0

def get_training_progress_data(db: Session) -> List[Dict[str, Any]]:
    """Get training progress data for recent enrollments"""
    try:
        enrollments = db.query(
            Enrollment,
            Employee,
            Training
        ).join(
            Employee, Employee.id == Enrollment.employee_id
        ).join(
            Training, Training.id == Enrollment.training_id
        ).order_by(
            Enrollment.created_at.desc()
        ).limit(8).all()
        
        progress_data = []
        
        # Get current time once
        now = datetime.now()
        
        for enrollment, employee, training in enrollments:
            # Check if employee has certification for this training
            has_certification = db.query(Certification).filter(
                Certification.employee_id == employee.id,
                Certification.training_id == training.id,
                Certification.status == "active"
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
        employees = db.query(Employee).limit(4).all()
        employee_data = []
        
        for emp in employees:
            # Check employee status
            active_enrollments = db.query(func.count(Enrollment.id)).filter(
                Enrollment.employee_id == emp.id,
                Enrollment.status.in_(["enrolled", "in_progress"])
            ).scalar() or 0
            
            active_certifications = db.query(func.count(Certification.id)).filter(
                Certification.employee_id == emp.id,
                Certification.status == "active"
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
                dept = db.query(Department).filter(Department.id == emp.department_id).first()
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
        trainings = db.query(Training).limit(4).all()
        training_data = []
        
        for train in trainings:
            enrollment_count = db.query(func.count(Enrollment.id)).filter(
                Enrollment.training_id == train.id
            ).scalar() or 0
            
            training_data.append({
                "id": str(train.id),
                "avatarUrl": "https://ui-avatars.com/api/?name=TR&background=6366f1&color=fff&size=40",
                "name": train.name or "Training Program",
                "role": train.description or "Training",
                "trainingCount": enrollment_count
            })
        
        # Departments
        departments = db.query(Department).limit(4).all()
        department_data = []
        
        for dept in departments:
            employee_count = db.query(func.count(Employee.id)).filter(
                Employee.department_id == dept.id
            ).scalar() or 0
            
            training_count = db.query(func.count(Enrollment.id)).join(
                Employee, Employee.id == Enrollment.employee_id
            ).filter(
                Employee.department_id == dept.id
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