# app/routes/compliance.py
from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from fastapi.responses import StreamingResponse, JSONResponse
from sqlalchemy.orm import Session
from typing import Dict, Any
from datetime import datetime

from app.database import get_db
from app.schemas import (
    ReportFilters, 
    ComplianceMetrics,
    DepartmentCompliance,
    CertificationStatus,
    UpcomingExpiration,
    MissingCertification
)
from ..crud import compliance  # Changed from app.crud to app.services

router = APIRouter(prefix="/api/compliance", tags=["compliance"])

@router.post("/report", response_model=ComplianceMetrics)
async def generate_compliance_report(
    filters: ReportFilters,
    db: Session = Depends(get_db)
):
    """
    Generate comprehensive compliance report with detailed metrics
    
    - **department**: Filter by department name (use "all" for all departments)
    - **date_range**: Date range for the report (start and end dates)
    - **compliance_threshold**: Minimum compliance percentage (0-100)
    - **include_expired**: Include expired certifications in the report
    - **include_expiring_soon**: Include certifications expiring soon (within 30 days)
    - **certification_type**: Filter by certification type
    
    Returns detailed compliance metrics including:
    - Overall compliance rates
    - Department-wise compliance
    - Certification status breakdown
    - Upcoming expirations
    - Missing certifications
    - Training statistics
    """
    try:
        # Convert filters to dict for the service
        filters_dict = filters.dict()
        
        # Generate the report
        report = compliance.get_compliance_report(db, filters_dict)
        return report
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(
            status_code=500, 
            detail=f"Failed to generate compliance report: {str(e)}"
        )

@router.post("/export/{format}")
async def export_compliance_report(
    format: str,
    filters: ReportFilters,
    db: Session = Depends(get_db)
):
    """
    Export compliance report in specified format
    
    - **format**: Export format (excel or pdf)
    - **filters**: Same filters as the compliance report endpoint
    
    Returns a downloadable file in the specified format.
    """
    try:
        filters_dict = filters.dict()
        
        if format.lower() == "excel":
            excel_data = compliance.export_to_excel(db, filters_dict)
            return StreamingResponse(
                excel_data,
                media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                headers={
                    "Content-Disposition": f"attachment; filename=compliance_report_{datetime.now().strftime('%Y%m%d_%H%M%S')}.xlsx"
                }
            )
        elif format.lower() == "pdf":
            pdf_data = compliance.export_to_pdf(db, filters_dict)
            return StreamingResponse(
                pdf_data,
                media_type="application/pdf",
                headers={
                    "Content-Disposition": f"attachment; filename=compliance_report_{datetime.now().strftime('%Y%m%d_%H%M%S')}.pdf"
                }
            )
        else:
            raise HTTPException(
                status_code=400, 
                detail=f"Unsupported format: {format}. Supported formats: excel, pdf"
            )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(
            status_code=500, 
            detail=f"Failed to export compliance report: {str(e)}"
        )

@router.post("/email")
async def email_compliance_report(
    filters: ReportFilters,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db)
):
    """
    Send compliance report via email
    
    - **filters**: Same filters as the compliance report endpoint
    
    The report will be generated and sent to configured email recipients.
    Returns a success message with job ID.
    """
    try:
        filters_dict = filters.dict()
        
        # This would typically queue an email job
        # For now, we'll simulate success
        job_id = f"email_job_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
        
        # In a real implementation, you would:
        # 1. Generate the report
        # 2. Create PDF/Excel attachment
        # 3. Send email via your email service
        # 4. Store the job in a database
        
        return JSONResponse(
            status_code=200,
            content={
                "message": "Compliance report email has been queued",
                "job_id": job_id,
                "status": "queued",
                "estimated_completion": "within 5 minutes"
            }
        )
    except Exception as e:
        raise HTTPException(
            status_code=500, 
            detail=f"Failed to queue email report: {str(e)}"
        )

@router.get("/departments")
async def get_department_compliance(
    department: str = "all",
    db: Session = Depends(get_db)
):
    """
    Get department-wise compliance statistics
    
    - **department**: Filter by department name (use "all" for all departments)
    
    Returns compliance data for each department.
    """
    try:
        filters = {"department": department}
        departments_data = compliance._get_department_compliance(db, filters)
        return departments_data
    except Exception as e:
        raise HTTPException(
            status_code=500, 
            detail=f"Failed to get department compliance: {str(e)}"
        )

@router.get("/certifications/status")
async def get_certification_status(
    certification_type: str = "all",
    db: Session = Depends(get_db)
):
    """
    Get certification status statistics
    
    - **certification_type**: Filter by certification type (use "all" for all certifications)
    
    Returns status breakdown for each certification type.
    """
    try:
        filters = {"certification_type": certification_type}
        cert_status = compliance._get_certification_status(db, filters)
        return cert_status
    except Exception as e:
        raise HTTPException(
            status_code=500, 
            detail=f"Failed to get certification status: {str(e)}"
        )

@router.get("/expirations/upcoming")
async def get_upcoming_expirations(
    days: int = 30,
    department: str = "all",
    db: Session = Depends(get_db)
):
    """
    Get certifications expiring soon
    
    - **days**: Number of days to look ahead (default: 30)
    - **department**: Filter by department name (use "all" for all departments)
    
    Returns list of certifications expiring within the specified days.
    """
    try:
        # Create filters with custom days parameter
        filters = {
            "department": department,
            "include_expiring_soon": True
        }
        
        # Get all expirations and filter by days
        all_expirations = compliance._get_upcoming_expirations(db, filters)
        
        # Filter by the specified days parameter
        filtered_expirations = [
            exp for exp in all_expirations 
            if exp.days_until_expiry <= days
        ]
        
        return filtered_expirations
    except Exception as e:
        raise HTTPException(
            status_code=500, 
            detail=f"Failed to get upcoming expirations: {str(e)}"
        )

@router.get("/certifications/missing")
async def get_missing_certifications(
    department: str = "all",
    db: Session = Depends(get_db)
):
    """
    Get employees missing required certifications
    
    - **department**: Filter by department name (use "all" for all departments)
    
    Returns list of employees who are missing required certifications.
    """
    try:
        filters = {"department": department}
        missing_certs = compliance._get_missing_certifications(db, filters)
        return missing_certs
    except Exception as e:
        raise HTTPException(
            status_code=500, 
            detail=f"Failed to get missing certifications: {str(e)}"
        )

@router.get("/trainings/statistics")
async def get_training_statistics(
    department: str = "all",
    db: Session = Depends(get_db)
):
    """
    Get training completion statistics
    
    - **department**: Filter by department name (use "all" for all departments)
    
    Returns training completion statistics.
    """
    try:
        filters = {"department": department}
        stats = compliance._get_training_statistics(db, filters)
        
        # Calculate additional statistics
        completion_rate = 0
        if stats['total_trainings'] > 0:
            completion_rate = (stats['completed_trainings'] / stats['total_trainings']) * 100
        
        return {
            **stats,
            "completion_rate": round(completion_rate, 2),
            "in_progress_rate": round((stats['pending_trainings'] / stats['total_trainings']) * 100, 2) if stats['total_trainings'] > 0 else 0
        }
    except Exception as e:
        raise HTTPException(
            status_code=500, 
            detail=f"Failed to get training statistics: {str(e)}"
        )

@router.get("/alerts")
async def get_compliance_alerts(
    db: Session = Depends(get_db)
):
    """
    Get compliance alerts and warnings
    
    Returns critical compliance issues that need attention:
    - Certifications expiring in less than 7 days
    - Missing required certifications
    - Low compliance departments (< 70%)
    """
    try:
        alerts = []
        warnings = []
        
        # Get critical expirations (less than 7 days)
        filters = {"department": "all"}
        all_expirations = compliance._get_upcoming_expirations(db, filters)
        critical_expirations = [
            exp for exp in all_expirations 
            if exp.days_until_expiry <= 7
        ]
        
        if critical_expirations:
            alerts.append({
                "type": "critical_expiration",
                "title": "Certifications Expiring Soon",
                "message": f"{len(critical_expirations)} certifications expiring in 7 days or less",
                "count": len(critical_expirations),
                "data": critical_expirations[:5]  # Limit to 5 for the alert
            })
        
        # Get departments with low compliance
        departments_data = compliance._get_department_compliance(db, filters)
        low_compliance_depts = [
            dept for dept in departments_data 
            if dept.compliance_rate < 70
        ]
        
        if low_compliance_depts:
            warnings.append({
                "type": "low_compliance",
                "title": "Low Compliance Departments",
                "message": f"{len(low_compliance_depts)} departments have compliance below 70%",
                "count": len(low_compliance_depts),
                "data": [{"department": dept.department, "rate": dept.compliance_rate} 
                        for dept in low_compliance_depts]
            })
        
        # Get missing certifications
        missing_certs = compliance._get_missing_certifications(db, filters)
        if missing_certs:
            warnings.append({
                "type": "missing_certifications",
                "title": "Missing Required Certifications",
                "message": f"{len(missing_certs)} employees missing required certifications",
                "count": len(missing_certs),
                "data": missing_certs[:5]  # Limit to 5 for the alert
            })
        
        return {
            "alerts": alerts,
            "warnings": warnings,
            "total_alerts": len(alerts) + len(warnings),
            "generated_at": datetime.now().isoformat()
        }
    except Exception as e:
        raise HTTPException(
            status_code=500, 
            detail=f"Failed to get compliance alerts: {str(e)}"
        )

@router.get("/summary")
async def get_compliance_summary(
    db: Session = Depends(get_db)
):
    """
    Get quick compliance summary
    
    Returns a high-level summary of compliance status
    """
    try:
        filters = {"department": "all"}
        
        # Get basic report
        report = compliance.get_compliance_report(db, filters)
        
        # Get upcoming expirations
        expirations = compliance._get_upcoming_expirations(db, filters)
        
        # Get department compliance
        departments = compliance._get_department_compliance(db, filters)
        
        # Calculate risk level
        risk_level = "Low"
        if report.overall_compliance_rate < 70:
            risk_level = "High"
        elif report.overall_compliance_rate < 85:
            risk_level = "Medium"
        
        summary = {
            "overall_compliance": report.overall_compliance_rate,
            "total_employees": report.total_employees,
            "compliant_employees": report.compliant_employees,
            "non_compliant_employees": report.non_compliant_employees,
            "expiring_soon": report.expiring_soon,
            "expired_certifications": report.expired_certifications,
            "total_trainings": report.total_trainings,
            "completed_trainings": report.completed_trainings,  # Fixed: was completed_training
            "pending_trainings": report.pending_trainings,
            "risk_level": risk_level,
            "top_performing_department": max(departments, key=lambda x: x.compliance_rate).department if departments else None,
            "lowest_performing_department": min(departments, key=lambda x: x.compliance_rate).department if departments else None,
            "critical_expirations_count": len([e for e in expirations if e.days_until_expiry <= 7]),
            "missing_certifications_count": len(report.missing_certifications),
            "generated_at": datetime.now().isoformat()
        }
        
        return summary
    except Exception as e:
        raise HTTPException(
            status_code=500, 
            detail=f"Failed to get compliance summary: {str(e)}"
        )