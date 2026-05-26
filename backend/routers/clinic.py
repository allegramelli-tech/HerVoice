from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database import get_db
from schemas import VerifyAndReleaseRequest, VerifyAndReleaseResponse
from services.case_service import verify_and_release

router = APIRouter(prefix="/api/clinic", tags=["clinic"])

@router.post("/verify-and-release", response_model=VerifyAndReleaseResponse)
def verify_and_release_endpoint(
    request: VerifyAndReleaseRequest,
    db: Session = Depends(get_db),
):
    try:
        result = verify_and_release(
            name=request.patient_identity.name,
            date_of_birth=request.patient_identity.date_of_birth,
            insurance_number=request.patient_identity.insurance_number,
            db=db,
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

    return VerifyAndReleaseResponse(
        matched=result["matched"],
        case_id=result["case_id"],
        appointment_id=result["appointment_id"],
        tx_hash=result["tx_hash"],
        amount_xrp=result["amount_xrp"],
        message=result["message"],
    )
    