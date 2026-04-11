from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from schemas import VerifyVoucherRequest, VerifyVoucherResponse, ConfirmServiceRequest, ConfirmServiceResponse
from services.voucher_service import verify_voucher, confirm_service_and_release, get_voucher_with_case
from models import Appointment, CareStatus

router = APIRouter(prefix="/api/clinic", tags=["clinic"])


@router.post("/verify", response_model=VerifyVoucherResponse)
def verify(request: VerifyVoucherRequest, db: Session = Depends(get_db)):
    """Check if voucher is valid. Does not modify any state. Call before confirm."""
    result = verify_voucher(request.voucher_id, db)
    return VerifyVoucherResponse(
        voucher_id=request.voucher_id,
        valid=result["valid"],
        status=result["status"],
        amount_xrp=result["amount_xrp"],
        message=result["message"],
    )


@router.post("/confirm", response_model=ConfirmServiceResponse)
def confirm(request: ConfirmServiceRequest, db: Session = Depends(get_db)):
    """
    Confirm service delivered and release escrow.
    Expected response time: 5-15 seconds. Frontend must show loading state.

    v2 consistency fix:
    If this voucher belongs to an appointment-linked funding case,
    also update PatientCase.care_status to PAYMENT_RELEASED.
    """
    try:
        result = confirm_service_and_release(request.voucher_id, db)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

    print(
        f"[MANUAL_ESCROW_RELEASE_SUCCESS] voucher_id={request.voucher_id} "
        f"tx_hash={result['tx_hash']}"
    )

    case_result = get_voucher_with_case(request.voucher_id, db)
    case = case_result[1]

    # v2 consistency fix:
    # if this funding case is linked to an appointment, update patient case status too
    appointment = db.query(Appointment).filter(
        Appointment.funding_case_id == case.id
    ).first()

    if appointment and appointment.patient_case:
        appointment.patient_case.care_status = CareStatus.PAYMENT_RELEASED
        db.commit()

    return ConfirmServiceResponse(
        voucher_id=request.voucher_id,
        case_id=case.id,
        tx_hash=result["tx_hash"],
        amount_xrp=result["amount_xrp"],
        clinic_address=result["clinic_address"],
        message="Payment released to clinic.",
    )