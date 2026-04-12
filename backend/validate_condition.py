from datetime import datetime, timezone, timedelta

from services.xrpl_service import generate_condition, get_funder_wallet, get_clinic_wallet
from xrpl.clients import WebsocketClient
from xrpl.models.transactions import EscrowCreate, EscrowFinish
from xrpl.transaction import submit_and_wait
from config import XRPL_NODE_URL, CLINIC_WALLET_ADDRESS

RIPPLE_EPOCH = datetime(2000, 1, 1, tzinfo=timezone.utc)

def to_ripple_time(dt: datetime) -> int:
    return int((dt - RIPPLE_EPOCH).total_seconds())

pair = generate_condition()
assert len(pair["fulfillment_hex"]) == 72, "fulfillment must be 72 hex chars (36 bytes)"
assert len(pair["condition_hex"]) == 78, "condition must be 78 hex chars (39 bytes)"
print("Byte lengths: OK")

funder = get_funder_wallet()
clinic = get_clinic_wallet()

cancel_after = to_ripple_time(datetime.now(timezone.utc) + timedelta(days=7))

print("Submitting EscrowCreate...")
with WebsocketClient(XRPL_NODE_URL) as client:
    tx = EscrowCreate(
        account=funder.address,
        amount="1000000",
        destination=CLINIC_WALLET_ADDRESS,
        condition=pair["condition_hex"],
        cancel_after=cancel_after,
    )
    r = submit_and_wait(tx, client, funder)
    assert r.result["meta"]["TransactionResult"] == "tesSUCCESS", r.result
    sequence = r.result["Sequence"]
    print(f"EscrowCreate OK: {r.result['hash']}")

print("Submitting EscrowFinish...")
with WebsocketClient(XRPL_NODE_URL) as client:
    tx = EscrowFinish(
        account=clinic.address,
        owner=funder.address,
        offer_sequence=sequence,
        fulfillment=pair["fulfillment_hex"],
        condition=pair["condition_hex"],
    )
    r = submit_and_wait(tx, client, clinic)
    assert r.result["meta"]["TransactionResult"] == "tesSUCCESS", r.result
    print(f"EscrowFinish OK: {r.result['hash']}")

print("=== PASSED. Safe to proceed. ===")
