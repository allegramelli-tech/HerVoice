import os
import uuid
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session

from database import get_db
from schemas import SubmitProofResponse
from services.appointment_service import submit_completion_proof
from services.voucher_service import confirm_service_and_release
from models import CompletionProof, Voucher, CareStatus, AppointmentStatus

UPLOAD_DIR = "uploads"
MAX_PDF_SIZE = 5 * 1024 * 1024  # 5 MB

os.makedirs(UPLOAD_DIR, exist_ok=True)

router = APIRouter(prefix="/api/proof", tags=["proof"])


def _remove_file_if_exists(filename: Optional[str]) -> None:
    if not filename:
        return
    file_path = os.path.join(UPLOAD_DIR, filename)
    if os.path.exists(file_path):
        os.remove(file_path)


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
    if total_cost_eur <= 0:
        raise HTTPException(
            status_code=400,
            detail={
                "error": "INVALID_TOTAL_COST",
                "detail": "total_cost_eur must be greater than 0.",
            },
        )

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
        unique_suffix = uuid.uuid4().hex
        safe_filename = f"{appointment_id}_{unique_suffix}_{safe_original_name}"
        file_path = os.path.join(UPLOAD_DIR, safe_filename)

        try:
            with open(file_path, "wb") as f:
                f.write(file_bytes)
        except OSError:
            raise HTTPException(
                status_code=500,
                detail={
                    "error": "PROOF_FILE_SAVE_FAILED",
                    "detail": "Failed to save uploaded proof file.",
                },
            )

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
        _remove_file_if_exists(pdf_filename)
        raise HTTPException(
            status_code=400,
            detail={
                "error": "SUBMIT_PROOF_FAILED",
                "detail": str(e),
            },
        )
    except Exception:
        _remove_file_if_exists(pdf_filename)
        raise HTTPException(
            status_code=500,
            detail={
                "error": "SUBMIT_PROOF_FAILED",
                "detail": "Unexpected error while submitting proof.",
            },
        )

    message = "Proof submitted."
    if proof.escrow_tx_hash:
        message = "Proof submitted. Payment released on XRPL."

    print(
        f"[PROOF_SUBMITTED] proof_id={proof.id} "
        f"appointment_id={proof.appointment_id} "
        f"escrow_tx_hash={proof.escrow_tx_hash}"
    )

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

    if appointment.status != AppointmentStatus.COMPLETED:
        raise HTTPException(
            status_code=400,
            detail={
                "error": "APPOINTMENT_NOT_COMPLETED",
                "detail": "Payout can only be retried for completed appointments.",
            },
        )

    if appointment.patient_case and appointment.patient_case.care_status == CareStatus.PAYMENT_RELEASED:
        raise HTTPException(
            status_code=400,
            detail={
                "error": "CASE_ALREADY_PAID",
                "detail": "This patient case is already marked as payment released.",
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
        print(
            f"[RETRY_PAYOUT_ERROR] proof_id={proof.id} "
            f"appointment_id={proof.appointment_id} "
            f"funding_case_id={appointment.funding_case_id} "
            f"error={str(e)}"
        )
        raise HTTPException(
            status_code=500,
            detail={
                "error": "RETRY_PAYOUT_FAILED",
                "detail": "Unexpected error while retrying payout.",
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
