from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database import get_db
from schemas import CreateFundRequest, CreateFundResponse
from services.case_service import create_escrow_for_case

router = APIRouter(prefix="/api/fund", tags=["fund"])


@router.post("", response_model=CreateFundResponse)
def create_fund(request: CreateFundRequest, db: Session = Depends(get_db)):
    try:
        case = create_escrow_for_case(request.case_id, db)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

    return CreateFundResponse(
        case_id=case.id,
        amount_xrp=case.amount_xrp,
        escrow_tx_hash=case.tx_hash_create,
        status=case.status,
        message="Escrow created. Patient can now arrive at clinic for identity verification.",
    )

# from fastapi import APIRouter, Depends, HTTPException
# from sqlalchemy.orm import Session
# from database import get_db
# from schemas import CreateFundRequest, CreateFundResponse
# from services.voucher_service import create_funding_case

# router = APIRouter(prefix="/api/fund", tags=["fund"])


# @router.post("", response_model=CreateFundResponse)
# def create_fund(request: CreateFundRequest, db: Session = Depends(get_db)):
#     """
#     Create a new funding case.
#     Submits EscrowCreate to XRPL and returns voucher_id.
#     Expected latency: 5-15 seconds (XRPL tx confirmation).
#     """
#     try:
#         case, voucher = create_funding_case(request.amount_xrp, db)
#     except Exception as e:
#         raise HTTPException(status_code=500, detail=f"Failed to create escrow: {str(e)}")

#     return CreateFundResponse(
#         case_id=case.id,
#         voucher_id=voucher.id,
#         amount_xrp=case.amount_xrp,
#         escrow_tx_hash=case.tx_hash_create,
#         status=case.status,
#         message="Escrow created. Voucher ready to use.",
    # )