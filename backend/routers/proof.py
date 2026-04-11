import os
import shutil
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session
from database import get_db
from schemas import SubmitProofResponse
from services.appointment_service import submit_completion_proof
from models import CompletionProof, Voucher, CareStatus
from services.voucher_service import confirm_service_and_release

UPLOAD_DIR = "uploads"
MAX_PDF_SIZE = 5 * 1024 * 1024  # 5 MB

os.makedirs(UPLOAD_DIR, exist_ok=True)

router = APIRouter(prefix="/api/proof", tags=["proof"])


@router.post("", response_model=SubmitProofResponse)
def submit_proof(
    appointment_id: str = Form(...),
    rpps_invoice_number: str = Form(...),
    total_cost_eur: int = Form(..., description="Total cost in EUR cents. Example: 45000 = 450.00 EUR"),
    pdf: Optional[UploadFile] = File(None),
    db: Session = Depends(get_db),
):
    """
    Submit completion proof for an appointment.

    This endpoint uses multipart/form-data (not JSON) because it accepts an optional PDF file.

    pdf: optional. If provided, it must be a PDF and smaller than 5 MB.
    """
    pdf_filename = None

    if pdf:
        original_name = pdf.filename or ""

        if not original_name.lower().endswith(".pdf"):
            raise HTTPException(
                status_code=400,
                detail={
                    "error": "INVALID_PROOF_FILE",
                    "detail": "Only PDF files are allowed.",
                },
            )

        if pdf.content_type != "application/pdf":
            raise HTTPException(
                status_code=400,
                detail={
                    "error": "INVALID_PROOF_FILE",
                    "detail": "Uploaded file must have content type application/pdf.",
                },
            )

        file_bytes = pdf.file.read()
        file_size = len(file_bytes)

        if file_size > MAX_PDF_SIZE:
            raise HTTPException(
                status_code=400,
                detail={
                    "error": "PROOF_FILE_TOO_LARGE",
                    "detail": "PDF file must be smaller than 5 MB.",
                },
            )

        safe_original_name = os.path.basename(original_name)
        safe_filename = f"{appointment_id}_{safe_original_name}"
        file_path = os.path.join(UPLOAD_DIR, safe_filename)

        with open(file_path, "wb") as f:
            f.write(file_bytes)

        pdf_filename = safe_filename

    try:
        proof = submit_completion_proof(
            appointment_id=appointment_id,
            rpps_invoice_number=rpps_invoice_number,
            total_cost_eur=total_cost_eur,
            pdf_filename=pdf_filename,
            db=db,
        )
    except ValueError as e:
        raise HTTPException(
            status_code=400,
            detail={
                "error": "SUBMIT_PROOF_FAILED",
                "detail": str(e),
            },
        )

    message = "Proof submitted."
    if proof.escrow_tx_hash:
        message = "Proof submitted. Payment released on XRPL."

    return SubmitProofResponse(
        proof_id=proof.id,
        appointment_id=proof.appointment_id,
        escrow_tx_hash=proof.escrow_tx_hash,
        message=message,
    )
    
@router.post("/{proof_id}/retry-payout")
def retry_payout(proof_id: str, db: Session = Depends(get_db)):
    """
    Retry payout for a proof that was submitted successfully
    but did not complete XRPL release automatically.

    Success path:
    - proof exists
    - appointment has linked funding_case_id
    - funding_case has an unused voucher
    - confirm_service_and_release succeeds

    On success:
    - proof.escrow_tx_hash is updated
    - patient_case.care_status becomes PAYMENT_RELEASED
    """
    proof = db.query(CompletionProof).filter(CompletionProof.id == proof_id).first()
    if not proof:
        raise HTTPException(
            status_code=404,
            detail={
                "error": "PROOF_NOT_FOUND",
                "detail": "Proof not found.",
            },
        )

    if proof.escrow_tx_hash:
        raise HTTPException(
            status_code=400,
            detail={
                "error": "PAYOUT_ALREADY_COMPLETED",
                "detail": "This proof already has a payout transaction hash.",
            },
        )

    appointment = proof.appointment
    if not appointment:
        raise HTTPException(
            status_code=400,
            detail={
                "error": "APPOINTMENT_NOT_FOUND",
                "detail": "This proof is not linked to a valid appointment.",
            },
        )

    if not appointment.funding_case_id:
        raise HTTPException(
            status_code=400,
            detail={
                "error": "FUNDING_NOT_LINKED",
                "detail": "This appointment is not linked to any funding case.",
            },
        )

    voucher = db.query(Voucher).filter(
        Voucher.funding_case_id == appointment.funding_case_id
    ).first()

    if not voucher:
        raise HTTPException(
            status_code=404,
            detail={
                "error": "VOUCHER_NOT_FOUND",
                "detail": "No voucher found for the linked funding case.",
            },
        )

    try:
        result = confirm_service_and_release(voucher.id, db)
    except ValueError as e:
        raise HTTPException(
            status_code=400,
            detail={
                "error": "RETRY_PAYOUT_FAILED",
                "detail": str(e),
            },
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail={
                "error": "RETRY_PAYOUT_FAILED",
                "detail": str(e),
            },
        )

    proof.escrow_tx_hash = result["tx_hash"]
    if appointment.patient_case:
        appointment.patient_case.care_status = CareStatus.PAYMENT_RELEASED
    db.commit()
    db.refresh(proof)

    print(
        f"[PROOF_SUBMITTED] proof_id={proof.id} appointment_id={appointment_id} "
        f"funding_case_id={appointment.funding_case_id}"
    )

    return {
        "proof_id": proof.id,
        "appointment_id": proof.appointment_id,
        "escrow_tx_hash": proof.escrow_tx_hash,
        "message": "Payout retried successfully.",
    }