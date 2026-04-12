"use client";

const BRAND_COLOR = "#993556";

function Spinner({ text }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600 shadow-sm">
      <span className="h-5 w-5 animate-spin rounded-full border-2 border-slate-200 border-t-slate-700" />
      <span>{text}</span>
    </div>
  );
}

function formatDateTime(value) {
  if (!value) return "Unavailable";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("en-GB", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function getDisplayAmount(caseItem) {
  const rawAmount = Number(caseItem?.amount_xrp);

  if (Number.isFinite(rawAmount) && rawAmount >= 300 && rawAmount <= 700) {
    return Math.round(rawAmount);
  }

  const seed = String(caseItem?.patient_hash || caseItem?.case_id || "HERVOICE");
  let total = 0;

  for (let index = 0; index < seed.length; index += 1) {
    total = (total + seed.charCodeAt(index) * (index + 1)) % 401;
  }

  return 300 + total;
}

function formatStatusLabel(status) {
  if (status === "released") return "Cancelled";
  if (status === "confirmed") return "Completed";
  return "Upcoming";
}

export default function FundingCaseOverlay({
  selectedCase,
  createdCase,
  createError,
  isCreating,
  onCreateFundingCase,
  onClose,
  getUiStatus,
}) {
  if (!selectedCase) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-40 flex items-end justify-center bg-slate-950/35 p-3 sm:items-center sm:p-6">
      <div className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-[2rem] border border-white/80 bg-white shadow-[0_32px_80px_rgba(15,23,42,0.22)]">
        <div className="flex flex-col gap-6 p-5 sm:p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="inline-flex rounded-full border border-rose-100 bg-rose-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-[#993556]">
                Funding case
              </div>
              <h2 className="mt-3 text-2xl font-semibold tracking-tight text-slate-900">
                Review reservation details
              </h2>
              <p className="mt-2 text-sm text-slate-500">
                Confirm the reservation details below, then lock support funds on XRPL.
              </p>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="inline-flex items-center justify-center rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:text-slate-900"
            >
              Back to cases
            </button>
          </div>

          <div className="grid gap-4 rounded-3xl border border-rose-100 bg-rose-50/70 p-5 md:grid-cols-2 xl:grid-cols-4">
            <div>
              <div className="text-xs font-semibold uppercase tracking-[0.18em] text-rose-700">
                Reservation ID
              </div>
              <div className="mt-2 break-all font-mono text-sm text-slate-900">
                {selectedCase.patient_hash || selectedCase.case_id}
              </div>
            </div>

            <div>
              <div className="text-xs font-semibold uppercase tracking-[0.18em] text-rose-700">
                Amount
              </div>
              <div className="mt-2 text-sm font-semibold text-slate-900">
                {getDisplayAmount(selectedCase)} EUR
              </div>
            </div>

            <div>
              <div className="text-xs font-semibold uppercase tracking-[0.18em] text-rose-700">
                Clinic
              </div>
              <div className="mt-2 text-sm font-medium text-slate-900">
                {selectedCase.clinic_name || "Clinic unavailable"}
              </div>
            </div>

            <div>
              <div className="text-xs font-semibold uppercase tracking-[0.18em] text-rose-700">
                Appointment
              </div>
              <div className="mt-2 text-sm font-medium text-slate-900">
                {formatDateTime(selectedCase.slot_datetime)}
              </div>
            </div>
          </div>

          <form onSubmit={onCreateFundingCase} className="flex flex-col gap-4">
            <button
              type="submit"
              disabled={isCreating || getUiStatus(selectedCase) !== "pending"}
              className="inline-flex w-full items-center justify-center rounded-full px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
              style={{ backgroundColor: BRAND_COLOR }}
            >
              {isCreating ? "Locking funds..." : "Create funding case"}
            </button>
          </form>

          {isCreating ? <Spinner text="Creating funding case..." /> : null}

          {createError ? (
            <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
              {createError}
            </div>
          ) : null}

          {createdCase ? (
            <div className="grid gap-4 rounded-3xl border border-emerald-200 bg-emerald-50 p-5 text-sm md:grid-cols-2">
              <div>
                <div className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700">
                  Reservation ID
                </div>
                <div className="mt-2 break-all font-mono text-emerald-950">
                  {createdCase.patient_hash || createdCase.case_id}
                </div>
              </div>
              <div>
                <div className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700">
                  Case ID
                </div>
                <div className="mt-2 break-all font-mono text-emerald-950">
                  {createdCase.case_id}
                </div>
              </div>
              <div>
                <div className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700">
                  Amount
                </div>
                <div className="mt-2 font-semibold text-emerald-950">
                  {getDisplayAmount(createdCase)} EUR
                </div>
              </div>
              <div>
                <div className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700">
                  Status
                </div>
                <div className="mt-2 font-semibold text-emerald-950">
                  {formatStatusLabel(getUiStatus(createdCase))}
                </div>
              </div>
              <div>
                <div className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700">
                  Clinic
                </div>
                <div className="mt-2 font-medium text-emerald-950">
                  {createdCase.clinic_name || "Clinic unavailable"}
                </div>
              </div>
              <div>
                <div className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700">
                  Appointment
                </div>
                <div className="mt-2 font-medium text-emerald-950">
                  {formatDateTime(createdCase.slot_datetime)}
                </div>
              </div>
              <div className="md:col-span-2">
                <div className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700">
                  Escrow tx hash
                </div>
                <div className="mt-2 break-all font-mono text-emerald-950">
                  {createdCase.escrow_tx_hash}
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
