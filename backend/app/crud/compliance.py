# app/services/compliance_service.py
from sqlalchemy.orm import Session
from sqlalchemy import func, and_, or_
from datetime import datetime, date, timedelta
from typing import Dict, Any, List
from ..models import Employee, Department, Training, Enrollment, Certification
from ..schemas import ComplianceMetrics, DepartmentCompliance, CertificationStatus, UpcomingExpiration, MissingCertification
import pandas as pd
from io import BytesIO

class CRUDCompliance:
    def __init__(self):
        pass
    
    def get_compliance_report(self, db: Session, filters: Dict[str, Any]) -> ComplianceMetrics:
        """Generate comprehensive compliance report"""
        
        # Get all employees
        query = db.query(Employee)
        
        # Apply department filter
        if filters.get('department') and filters['department'] != 'all':
            query = query.join(Department).filter(Department.name == filters['department'])
        
        employees = query.all()
        total_employees = len(employees)
        
        # Calculate compliance metrics
        compliance_data = self._calculate_compliance_metrics(db, employees, filters)
        
        # Get department-wise compliance
        department_compliance = self._get_department_compliance(db, filters)
        
        # Get certification status
        certification_status = self._get_certification_status(db, filters)
        
        # Get upcoming expirations
        upcoming_expirations = self._get_upcoming_expirations(db, filters)
        
        # Get missing certifications
        missing_certifications = self._get_missing_certifications(db, filters)
        
        # Get training statistics
        training_stats = self._get_training_statistics(db, filters)
        
        return ComplianceMetrics(
            total_employees=total_employees,
            compliant_employees=compliance_data['compliant_employees'],
            non_compliant_employees=compliance_data['non_compliant_employees'],
            expiring_soon=compliance_data['expiring_soon'],
            expired_certifications=compliance_data['expired_certifications'],
            total_trainings=training_stats['total_trainings'],
            completed_trainings=training_stats['completed_trainings'],
            pending_trainings=training_stats['pending_trainings'],
            overall_compliance_rate=compliance_data['overall_compliance_rate'],
            department_compliance=department_compliance,
            certification_status=certification_status,
            upcoming_expirations=upcoming_expirations,
            missing_certifications=missing_certifications
        )
    
    def _calculate_compliance_metrics(self, db: Session, employees: List[Employee], filters: Dict[str, Any]) -> Dict[str, Any]:
        """Calculate overall compliance metrics"""
        
        today = date.today()
        thirty_days_from_now = today + timedelta(days=30)
        
        compliant_employees = 0
        expiring_soon = 0
        expired_certifications = 0
        
        for employee in employees:
            # Get employee certifications with training
            certs = (
                db.query(Certification)
                .filter(Certification.employee_id == employee.id)
                .all()
            )
            
            # Check if employee has valid certifications
            has_valid_certs = all(
                cert.status == "active" and 
                (not cert.expires_at or cert.expires_at >= today)
                for cert in certs
            ) if certs else True
            
            has_expiring = any(
                cert.expires_at and today <= cert.expires_at <= thirty_days_from_now 
                for cert in certs
            )
            has_expired = any(
                cert.expires_at and cert.expires_at < today 
                for cert in certs
            )
            
            # Check training completion
            enrollments = db.query(Enrollment).filter(
                Enrollment.employee_id == employee.id
            ).all()
            
            # Employee is compliant if they have completed all trainings
            has_completed_trainings = all(
                enrollment.status == "completed" 
                for enrollment in enrollments
            ) if enrollments else True
            
            # Employee is compliant if they have valid certs and completed trainings
            if has_valid_certs and has_completed_trainings:
                compliant_employees += 1
            
            if has_expiring:
                expiring_soon += 1
            
            if has_expired:
                expired_certifications += 1
        
        non_compliant_employees = len(employees) - compliant_employees
        overall_compliance_rate = (compliant_employees / len(employees)) * 100 if employees else 0
        
        return {
            'compliant_employees': compliant_employees,
            'non_compliant_employees': non_compliant_employees,
            'expiring_soon': expiring_soon,
            'expired_certifications': expired_certifications,
            'overall_compliance_rate': round(overall_compliance_rate, 2)
        }
    
    def _get_department_compliance(self, db: Session, filters: Dict[str, Any]) -> List[DepartmentCompliance]:
        """Get compliance statistics by department"""
        
        departments = db.query(Department).all()
        department_compliance = []
        
        for dept in departments:
            employees = db.query(Employee).filter(
                Employee.department_id == dept.id
            ).all()
            
            if not employees:
                continue
            
            compliant_count = 0
            for emp in employees:
                # Get certifications for employee
                certs = db.query(Certification).filter(
                    Certification.employee_id == emp.id
                ).all()
                
                # Get enrollments for employee
                enrollments = db.query(Enrollment).filter(
                    Enrollment.employee_id == emp.id
                ).all()
                
                # Check if employee has valid certifications
                has_valid_certs = all(
                    cert.status == "active" and 
                    (not cert.expires_at or cert.expires_at >= date.today())
                    for cert in certs
                ) if certs else True
                
                # Check if employee has completed all trainings
                has_completed_trainings = all(
                    enrollment.status == "completed" 
                    for enrollment in enrollments
                ) if enrollments else True
                
                if has_valid_certs and has_completed_trainings:
                    compliant_count += 1
            
            compliance_rate = (compliant_count / len(employees)) * 100
            
            department_compliance.append(
                DepartmentCompliance(
                    department=dept.name,
                    compliance_rate=round(compliance_rate, 2),
                    total_employees=len(employees),
                    compliant_employees=compliant_count
                )
            )
        
        return department_compliance
    
    def _get_certification_status(self, db: Session, filters: Dict[str, Any]) -> List[CertificationStatus]:
        """Get certification status statistics - using training name from training_id"""
        
        today = date.today()
        thirty_days_from_now = today + timedelta(days=30)
        
        # Get all certifications with their training
        certifications = (
            db.query(Certification)
            .join(Training, Certification.training_id == Training.id)
            .all()
        )
        
        # Group certifications by training name
        cert_by_training = {}
        for cert in certifications:
            # Get training name directly from the training relationship
            training_name = cert.training.name if cert.training else "Unknown Training"
            
            if training_name not in cert_by_training:
                cert_by_training[training_name] = []
            cert_by_training[training_name].append(cert)
    
        certification_status = []
        
        for training_name, certs in cert_by_training.items():
            total = len(certs)
            
            # Count valid certifications (active status and not expired)
            valid = sum(1 for cert in certs 
                       if cert.status == "active" and 
                       (not cert.expires_at or cert.expires_at >= today))
            
            # Count certifications expiring soon
            expiring_soon = sum(1 for cert in certs 
                              if cert.expires_at and 
                              today <= cert.expires_at <= thirty_days_from_now)
            
            # Count expired certifications
            expired = sum(1 for cert in certs 
                         if cert.expires_at and 
                         cert.expires_at < today)
            
            # Calculate compliance rate
            compliance_rate = (valid / total) * 100 if total > 0 else 0
            
            certification_status.append(
                CertificationStatus(
                    certification=training_name,  # Use training name as certification name
                    total=total,
                    valid=valid,
                    expiring_soon=expiring_soon,
                    expired=expired,
                    compliance_rate=round(compliance_rate, 2)
                )
            )
        
        return certification_status
    
    def _get_upcoming_expirations(self, db: Session, filters: Dict[str, Any]) -> List[UpcomingExpiration]:
        """Get certifications expiring soon"""
        
        today = date.today()
        thirty_days_from_now = today + timedelta(days=30)
        
        # Get certifications expiring within next 30 days with training name
        expiring_certs = (
            db.query(Certification)
            .join(Training, Certification.training_id == Training.id)
            .join(Employee, Certification.employee_id == Employee.id)
            .join(Department, Employee.department_id == Department.id)
            .filter(
                and_(
                    Certification.expires_at >= today,
                    Certification.expires_at <= thirty_days_from_now
                )
            )
            .all()
        )
        
        upcoming_expirations = []
        for cert in expiring_certs:
            days_until_expiry = (cert.expires_at - today).days
            
            # Get training name directly from training relationship
            training_name = cert.training.name if cert.training else "Unknown Training"
            
            upcoming_expirations.append(
                UpcomingExpiration(
                    id=cert.id,
                    employee_name=cert.employee.name,
                    certification_name=training_name,  # Use training name
                    expiry_date=cert.expires_at,
                    days_until_expiry=days_until_expiry,
                    department=cert.employee.department.name if cert.employee.department else "N/A"
                )
            )
        
        return sorted(upcoming_expirations, key=lambda x: x.days_until_expiry)
    
    def _get_missing_certifications(self, db: Session, filters: Dict[str, Any]) -> List[MissingCertification]:
        """Get employees missing required certifications"""
        
        # Find employees who have completed trainings but don't have corresponding certifications
        missing_certifications = []
        today = date.today()
        
        # Get all completed enrollments
        completed_enrollments = (
            db.query(Enrollment)
            .join(Employee, Enrollment.employee_id == Employee.id)
            .join(Training, Enrollment.training_id == Training.id)
            .filter(Enrollment.status == "completed")
            .all()
        )
        
        for enrollment in completed_enrollments:
            # Check if employee has certification for this training
            has_cert = (
                db.query(Certification)
                .filter(
                    and_(
                        Certification.employee_id == enrollment.employee_id,
                        Certification.training_id == enrollment.training_id
                    )
                )
                .first()
            )
            
            if not has_cert:
                days_overdue = 0
                if enrollment.completed_date:
                    completion_date = enrollment.completed_date.date()
                    days_overdue = max(0, (today - completion_date).days - 30)  # 30-day grace period
                
                missing_certifications.append(
                    MissingCertification(
                        id=enrollment.employee_id,
                        employee_name=enrollment.employee.first_name + enrollment.employee.last_name,
                        required_certification=enrollment.training.name,
                        department=enrollment.employee.department.name if enrollment.employee.department else "N/A",
                        days_overdue=days_overdue
                    )
                )
        
        return missing_certifications
    
    def _get_training_statistics(self, db: Session, filters: Dict[str, Any]) -> Dict[str, int]:
        """Get training completion statistics"""
        
        total_trainings = db.query(Training).count()
        
        enrollments = db.query(Enrollment).all()
        completed_trainings = sum(1 for e in enrollments if e.status == "completed")
        pending_trainings = sum(1 for e in enrollments if e.status in ["enrolled", "in_progress"])
        
        return {
            'total_trainings': total_trainings,
            'completed_trainings': completed_trainings,
            'pending_trainings': pending_trainings
        }
    
    def export_to_excel(self, db: Session, filters: Dict[str, Any]) -> BytesIO:
        """Export compliance report to Excel"""
        
        report = self.get_compliance_report(db, filters)
        
        # Create Excel writer
        output = BytesIO()
        
        with pd.ExcelWriter(output, engine='openpyxl') as writer:
            # Summary sheet
            summary_data = {
                'Metric': [
                    'Total Employees', 'Compliant Employees', 'Non-Compliant Employees',
                    'Overall Compliance Rate', 'Expiring Soon', 'Expired Certifications',
                    'Total Trainings', 'Completed Trainings', 'Pending Trainings'
                ],
                'Value': [
                    report.total_employees, report.compliant_employees, report.non_compliant_employees,
                    f"{report.overall_compliance_rate}%", report.expiring_soon, report.expired_certifications,
                    report.total_trainings, report.completed_trainings, report.pending_trainings
                ]
            }
            pd.DataFrame(summary_data).to_excel(writer, sheet_name='Summary', index=False)
            
            # Department Compliance sheet
            dept_data = [
                {
                    'Department': dept.department,
                    'Compliance Rate': f"{dept.compliance_rate}%",
                    'Total Employees': dept.total_employees,
                    'Compliant Employees': dept.compliant_employees
                }
                for dept in report.department_compliance
            ]
            pd.DataFrame(dept_data).to_excel(writer, sheet_name='Department Compliance', index=False)
            
            # Certification Status sheet
            cert_data = [
                {
                    'Certification': cert.certification,
                    'Total': cert.total,
                    'Valid': cert.valid,
                    'Expiring Soon': cert.expiring_soon,
                    'Expired': cert.expired,
                    'Compliance Rate': f"{cert.compliance_rate}%"
                }
                for cert in report.certification_status
            ]
            pd.DataFrame(cert_data).to_excel(writer, sheet_name='Certification Status', index=False)
            
            # Upcoming Expirations sheet
            expiry_data = [
                {
                    'Employee': exp.employee_name,
                    'Certification': exp.certification_name,
                    'Expiry Date': exp.expiry_date.strftime('%Y-%m-%d'),
                    'Days Until Expiry': exp.days_until_expiry,
                    'Department': exp.department
                }
                for exp in report.upcoming_expirations
            ]
            pd.DataFrame(expiry_data).to_excel(writer, sheet_name='Upcoming Expirations', index=False)
            
            # Missing Certifications sheet
            missing_data = [
                {
                    'Employee': missing.employee_name,
                    'Required Certification': missing.required_certification,
                    'Department': missing.department,
                    'Days Overdue': missing.days_overdue
                }
                for missing in report.missing_certifications
            ]
            pd.DataFrame(missing_data).to_excel(writer, sheet_name='Missing Certifications', index=False)
        
        output.seek(0)
        return output
    
    def export_to_pdf(self, db: Session, filters: Dict[str, Any]) -> BytesIO:
        """Export compliance report to PDF"""
        # For simplicity, returning Excel for now
        # In production, you'd use a PDF library like ReportLab or WeasyPrint
        return self.export_to_excel(db, filters)

# Create the object instance
compliance = CRUDCompliance()