import os
import hashlib

from xrpl.clients import WebsocketClient
from xrpl.wallet import Wallet
from xrpl.models.transactions import EscrowCreate, EscrowFinish
from xrpl.models.transactions.transaction import Memo
from xrpl.models.requests import AccountInfo
from xrpl.transaction import submit_and_wait
from xrpl.utils import drops_to_xrp

from config import (
    XRPL_NODE_URL,
    FUNDER_WALLET_SEED,
    CLINIC_WALLET_SEED,
    CLINIC_WALLET_ADDRESS,
)

def compute_patient_hash(name: str, date_of_birth: str, insurance_number: str) -> str:
    """
    Compute SHA256 hash of patient identity fields.

    Input is normalized before hashing:
    - name: stripped and lowercased
    - date_of_birth: stripped
    - insurance_number: stripped and uppercased

    Returns uppercase hex string.
    """
    
    date_of_birth = date_of_birth.strip().replace("/", "-")
    
    normalized = (
        name.strip().lower()
        + date_of_birth.strip()
        + insurance_number.strip().upper()
    )
    return hashlib.sha256(normalized.encode("utf-8")).hexdigest().upper()


def generate_condition() -> dict:
    """
    Generate PREIMAGE-SHA-256 crypto-condition pair for XRPL escrow.
    """
    preimage = os.urandom(32)
    sha256_hash = hashlib.sha256(preimage).digest()

    fulfillment_bytes = bytes([0xA0, 0x22, 0x80, 0x20]) + preimage
    condition_bytes = (
        bytes([0xA0, 0x25, 0x80, 0x20])
        + sha256_hash
        + bytes([0x81, 0x01, 0x20])
    )

    return {
        "fulfillment_hex": fulfillment_bytes.hex().upper(),
        "condition_hex": condition_bytes.hex().upper(),
    }


def get_funder_wallet() -> Wallet:
    return Wallet.from_seed(FUNDER_WALLET_SEED)


def get_clinic_wallet() -> Wallet:
    return Wallet.from_seed(CLINIC_WALLET_SEED)


def create_escrow(amount_drops: int, condition_hex: str, patient_hash: str) -> dict:
    funder = get_funder_wallet()

    memo_type_hex = "patient_hash".encode("utf-8").hex().upper()
    memo_data_hex = patient_hash.encode("utf-8").hex().upper()
    memo = Memo(memo_data=memo_data_hex, memo_type=memo_type_hex)

    cancel_after = to_ripple_time(datetime.now(timezone.utc) + timedelta(days=7))

    escrow_create = EscrowCreate(
        account=funder.address,
        amount=str(amount_drops),
        destination=CLINIC_WALLET_ADDRESS,
        condition=condition_hex,
        cancel_after=cancel_after,
        memos=[memo],
    )

    with WebsocketClient(XRPL_NODE_URL) as client:
        response = submit_and_wait(escrow_create, client, funder)

    tx_result = response.result.get("meta", {}).get("TransactionResult")
    if tx_result != "tesSUCCESS":
        raise Exception(f"EscrowCreate failed: {tx_result}")

    return {
        "tx_hash": response.result["hash"],
        "sequence": response.result["Sequence"],
    }


def finish_escrow(
    funder_address: str,
    escrow_sequence: int,
    fulfillment_hex: str,
    condition_hex: str,
) -> dict:
    """
    Submit EscrowFinish from clinic wallet.
    """
    clinic = get_clinic_wallet()

    escrow_finish = EscrowFinish(
        account=clinic.address,
        owner=funder_address,
        offer_sequence=escrow_sequence,
        fulfillment=fulfillment_hex,
        condition=condition_hex,
    )

    with WebsocketClient(XRPL_NODE_URL) as client:
        response = submit_and_wait(escrow_finish, client, clinic)

    tx_result = response.result.get("meta", {}).get("TransactionResult")
    if tx_result != "tesSUCCESS":
        raise Exception(f"EscrowFinish failed: {tx_result}")

    return {"tx_hash": response.result["hash"]}


def get_account_balance(address: str) -> float:
    with WebsocketClient(XRPL_NODE_URL) as client:
        response = client.request(AccountInfo(account=address))

    if response.result.get("error") == "actNotFound":
        return 0.0

    return float(drops_to_xrp(response.result["account_data"]["Balance"]))


from datetime import datetime, timezone, timedelta

RIPPLE_EPOCH = datetime(2000, 1, 1, tzinfo=timezone.utc)

def to_ripple_time(dt: datetime) -> int:
    return int((dt - RIPPLE_EPOCH).total_seconds())
