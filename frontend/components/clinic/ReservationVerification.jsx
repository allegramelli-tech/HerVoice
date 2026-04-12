"use client";

const BRAND_COLOR = "#993556";

function Spinner({ text }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm text-rose-900">
      <span className="h-5 w-5 animate-spin rounded-full border-2 border-rose-200 border-t-rose-700" />
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

const inputClassName =
  "rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-rose-300 focus:ring-2 focus:ring-rose-100";

export default function ReservationVerification({
  selectedRequest,
  formData,
  onChange,
  onSubmit,
  isVerifying,
  actionError,
  verification,
}) {
  if (!selectedRequest) {
    return null;
  }

  return (
    <section className="rounded-3xl border border-white/70 bg-white p-6 shadow-[0_20px_50px_rgba(148,163,184,0.12)]">
      <div className="flex flex-col gap-6">
        <div className="rounded-3xl border border-rose-100 bg-rose-50/70 p-5">
          <div className="inline-flex rounded-full border border-rose-100 bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-[#993556]">
            Reservation verification
          </div>

          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <div>
              <div className="text-xs font-semibold uppercase tracking-[0.18em] text-rose-700">
                Reservation ID
              </div>
              <div className="mt-2 break-all font-mono text-sm text-slate-900">
                {selectedRequest.patient_hash || selectedRequest.case_id}
              </div>
            </div>

            <div>
              <div className="text-xs font-semibold uppercase tracking-[0.18em] text-rose-700">
                Reservation date
              </div>
              <div className="mt-2 text-sm font-medium text-slate-900">
                {formatDateTime(selectedRequest.created_at)}
              </div>
            </div>

            <div>
              <div className="text-xs font-semibold uppercase tracking-[0.18em] text-rose-700">
                Appointment time
              </div>
              <div className="mt-2 text-sm font-medium text-slate-900">
                {formatDateTime(selectedRequest.slot_datetime)}
              </div>
            </div>

            <div>
              <div className="text-xs font-semibold uppercase tracking-[0.18em] text-rose-700">
                Clinic
              </div>
              <div className="mt-2 text-sm font-medium text-slate-900">
                {selectedRequest.clinic_name || "Clinic unavailable"}
              </div>
            </div>
          </div>
        </div>

        <form onSubmit={onSubmit} className="grid gap-4">
          <div className="grid gap-4 md:grid-cols-2">
            <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
              Last name
              <input
                name="lastName"
                value={formData.lastName}
                onChange={onChange}
                className={inputClassName}
                placeholder="Enter last name"
              />
            </label>

            <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
              First name
              <input
                name="firstName"
                value={formData.firstName}
                onChange={onChange}
                className={inputClassName}
                placeholder="Enter first name"
              />
            </label>

            <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
              Insurance number
              <input
                name="insuranceNumber"
                value={formData.insuranceNumber}
                onChange={onChange}
                className={inputClassName}
                placeholder="Enter insurance number"
              />
            </label>

            <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
              Date of birth
              <input
                type="date"
                name="birthDate"
                value={formData.birthDate}
                onChange={onChange}
                className={inputClassName}
              />
            </label>
          </div>

          <button
            type="submit"
            disabled={isVerifying}
            className="inline-flex w-full items-center justify-center rounded-full px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
            style={{ backgroundColor: BRAND_COLOR }}
          >
            Verify
          </button>
        </form>

        {isVerifying ? <Spinner text="Checking reservation..." /> : null}

        {actionError ? (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
            {actionError}
          </div>
        ) : null}

        {verification ? (
          <div className="rounded-3xl border border-slate-100 bg-slate-50 p-5">
            <div className="mb-4 flex items-center justify-between gap-3">
              <h2 className="text-lg font-semibold text-slate-900">
                Verification result
              </h2>
              <span
                className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${
                  verification.matched
                    ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                    : "border-rose-200 bg-rose-50 text-rose-700"
                }`}
              >
                {verification.matched ? "Matched" : "No match"}
              </span>
            </div>

            <div className="grid gap-4 text-sm sm:grid-cols-2">
              <div>
                <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                  Reservation ID
                </div>
                <div className="mt-2 break-all font-mono text-slate-900">
                  {selectedRequest.patient_hash || selectedRequest.case_id}
                </div>
              </div>
              <div>
                <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                  Case ID
                </div>
                <div className="mt-2 break-all font-mono text-slate-900">
                  {verification.case_id || "Unavailable"}
                </div>
              </div>
              <div>
                <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                  Appointment ID
                </div>
                <div className="mt-2 break-all font-mono text-slate-900">
                  {verification.appointment_id || "Unavailable"}
                </div>
              </div>
              <div>
                <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                  Amount
                </div>
                <div className="mt-2 font-medium text-slate-900">
                  {verification.amount_xrp ?? "-"} EUR
                </div>
              </div>
              <div className="sm:col-span-2">
                <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                  Release transaction
                </div>
                <div className="mt-2 break-all font-mono text-slate-900">
                  {verification.tx_hash || "Not released"}
                </div>
              </div>
            </div>

            <p className="mt-4 text-sm text-slate-600">{verification.message}</p>
          </div>
        ) : null}
      </div>
    </section>
  );
}
