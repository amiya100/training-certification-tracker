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
)
from ..crud import compliance  # Changed from app.crud to app.services
from ..dependecies import get_current_user

router = APIRouter(prefix="/api/compliance", tags=["compliance"])

@router.post("/report", response_model=ComplianceMetrics)
async def generate_compliance_report(
    filters: ReportFilters,
    db: Session = Depends(get_db), 
    current_user: dict = Depends(get_current_user)
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
    db: Session = Depends(get_db), 
    current_user: dict = Depends(get_current_user)
):
    """
    Export compliance report in specified format
    
    - **format**: Export format (excel or pdf)
    - **filters**: Same filters as the compliance report endpoint
    
    Returns a downloadable file in the specified format.
    """
    try:
        filters_dict = filters.dict()
        
        if format.lower() in ["excel", "xlsx"]:  # Accept both 'excel' and 'xlsx'
            excel_data = compliance.export_to_excel(db, filters_dict)
            
            # FIX: Use .xlsx extension explicitly
            filename = f"compliance_report_{datetime.now().strftime('%Y%m%d_%H%M%S')}.xlsx"
            
            # FIX: Use correct MIME type for .xlsx
            return StreamingResponse(
                excel_data,
                media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                headers={
                    "Content-Disposition": f'attachment; filename="{filename}"'
                }
            )
        elif format.lower() == "pdf":
            pdf_data = compliance.export_to_pdf(db, filters_dict)
            
            filename = f"compliance_report_{datetime.now().strftime('%Y%m%d_%H%M%S')}.pdf"
            
            return StreamingResponse(
                pdf_data,
                media_type="application/pdf",
                headers={
                    "Content-Disposition": f'attachment; filename="{filename}"'
                }
            )
        else:
            raise HTTPException(
                status_code=400, 
                detail=f"Unsupported format: {format}. Supported formats: excel (for .xlsx), pdf"
            )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(
            status_code=500, 
            detail=f"Failed to export compliance report: {str(e)}"
        )