import os
import shutil
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session
from database import get_db
from schemas import SubmitProofResponse
from services.appointment_service import submit_completion_proof

UPLOAD_DIR = "uploads"
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

    If appointment has a linked funding_case, triggers EscrowFinish automatically.
    Expected latency if escrow release is triggered: 5-15 seconds.

    pdf: optional. If provided, saved to uploads/ directory. Not parsed in MVP.
    """
    pdf_filename = None
    if pdf:
        safe_filename = f"{appointment_id}_{pdf.filename}"
        file_path = os.path.join(UPLOAD_DIR, safe_filename)
        with open(file_path, "wb") as f:
            shutil.copyfileobj(pdf.file, f)
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
        raise HTTPException(status_code=400, detail=str(e))

    message = "Proof submitted."
    if proof.escrow_tx_hash:
        message = "Proof submitted. Payment released on XRPL."

    return SubmitProofResponse(
        proof_id=proof.id,
        appointment_id=proof.appointment_id,
        escrow_tx_hash=proof.escrow_tx_hash,
        message=message,
    )