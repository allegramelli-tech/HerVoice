"use client";

import BrandLogo from "../BrandLogo";
import ReservationVerification from "./ReservationVerification";

function Spinner({ text }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600 shadow-sm">
      <span className="h-5 w-5 animate-spin rounded-full border-2 border-slate-200 border-t-slate-700" />
      <span>{text}</span>
    </div>
  );
}

function getStatusClasses(status, isActive) {
  if (isActive) {
    return "border-rose-300 bg-rose-50 shadow-[0_16px_36px_rgba(153,53,86,0.14)] ring-2 ring-rose-100";
  }

  if (status === "Released") {
    return "border-emerald-100 bg-white hover:border-emerald-200 hover:bg-emerald-50/40";
  }

  if (status === "Confirmed") {
    return "border-sky-100 bg-white hover:border-sky-200 hover:bg-sky-50/40";
  }

  return "border-slate-100 bg-white hover:border-slate-300 hover:bg-slate-50";
}

function getBadgeClasses(status) {
  if (status === "Released") {
    return "border-emerald-200 bg-emerald-50 text-emerald-700";
  }

  if (status === "Confirmed") {
    return "border-sky-200 bg-sky-50 text-sky-700";
  }

  return "border-amber-200 bg-amber-50 text-amber-700";
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

export default function ClinicInterface({
  onSignOut,
  isLoadingRequests,
  requestsError,
  clinicsError,
  isLoadingClinics,
  activeClinicAccount,
  selectedClinic,
  slotDateTime,
  onSlotDateTimeChange,
  onCreateSlot,
  isCreatingSlot,
  slotError,
  slotSuccess,
  incomingRequests,
  filteredRequests,
  requestFilter,
  setRequestFilter,
  selectedRequest,
  onSelectRequest,
  verificationFields,
  onVerificationFieldChange,
  onVerify,
  isVerifying,
  actionError,
  verification,
  getUiStatus,
}) {
  const totalRequests = incomingRequests.length;
  const pendingRequests = incomingRequests.filter(
    (caseItem) => getUiStatus(caseItem) === "Pending"
  ).length;
  const confirmedRequests = incomingRequests.filter(
    (caseItem) => getUiStatus(caseItem) === "Confirmed"
  ).length;
  const releasedRequests = incomingRequests.filter(
    (caseItem) => getUiStatus(caseItem) === "Released"
  ).length;

  const filters = [
    { value: "all", label: "Total requests", count: totalRequests, status: "All" },
    { value: "pending", label: "Pending", count: pendingRequests, status: "Pending" },
    {
      value: "confirmed",
      label: "Confirmed",
      count: confirmedRequests,
      status: "Confirmed",
    },
    { value: "released", label: "Released", count: releasedRequests, status: "Released" },
  ];

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,_#fff8fa_0%,_#f8fafc_48%,_#ffffff_100%)]">
      <header className="border-b border-white/70 bg-white/85 backdrop-blur">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-5 pr-14 sm:px-6 sm:pr-16 lg:px-8 lg:pr-8">
          <BrandLogo />

          <div className="flex w-full flex-col gap-3 rounded-3xl border border-slate-100 bg-slate-50/90 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                Clinic workspace
              </div>
              <div className="mt-1 text-sm font-semibold text-slate-900">
                {selectedClinic?.name || activeClinicAccount?.label || "Clinic workspace"}
              </div>
              <div className="mt-1 text-xs text-slate-500">
                {activeClinicAccount?.email || "Verified clinic access"}
              </div>
            </div>

            <button
              type="button"
              onClick={onSignOut}
              className="inline-flex items-center justify-center rounded-full border border-rose-200 bg-white px-4 py-2 text-sm font-medium text-[#993556] transition hover:border-rose-300 hover:bg-rose-50"
            >
              Sign out
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-8 sm:px-6 lg:px-8">
          <section className="rounded-3xl border border-white/70 bg-white p-6 shadow-[0_20px_50px_rgba(148,163,184,0.12)]">
            <div className="flex flex-col gap-5">
              <form
                onSubmit={onCreateSlot}
                className="grid gap-4 rounded-3xl border border-slate-100 bg-[linear-gradient(180deg,_#fff9fb_0%,_#ffffff_100%)] p-5 xl:grid-cols-[minmax(0,1fr)_auto]"
              >
                <div className="rounded-3xl border border-white bg-white p-4 shadow-[0_12px_30px_rgba(15,23,42,0.04)]">
                  <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
                    <div className="min-w-0 xl:max-w-sm">
                      <div className="inline-flex w-fit rounded-full border border-rose-100 bg-rose-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-[#993556]">
                        Time slots
                      </div>
                      <h2 className="mt-3 text-2xl font-semibold tracking-tight text-slate-900">
                        Add clinic availability
                      </h2>
                      <p className="mt-2 text-sm text-slate-500">
                        Create new appointment times so patients can reserve care with this clinic.
                      </p>
                    </div>

                    <div className="flex flex-col gap-3 sm:flex-row sm:items-end xl:justify-end">
                      <label className="flex flex-1 flex-col gap-2 text-sm font-medium text-slate-700">
                        New time slot
                        <input
                          type="datetime-local"
                          value={slotDateTime}
                          onChange={(event) => onSlotDateTimeChange(event.target.value)}
                          className="w-full max-w-xs rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-rose-300 focus:bg-white focus:ring-2 focus:ring-rose-100"
                        />
                      </label>

                      <button
                        type="submit"
                        disabled={isCreatingSlot}
                        className="inline-flex min-h-[44px] items-center justify-center rounded-full px-5 py-2.5 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                        style={{ backgroundColor: "#993556" }}
                      >
                        {isCreatingSlot ? "Creating..." : "Add time slot"}
                      </button>
                    </div>
                  </div>
                </div>

                {isLoadingClinics ? <Spinner text="Loading clinic profile..." /> : null}

              {clinicsError ? (
                <div className="xl:col-span-2 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
                  {clinicsError}
                </div>
              ) : null}

              {slotError ? (
                <div className="xl:col-span-2 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
                  {slotError}
                </div>
              ) : null}

              {slotSuccess ? (
                <div className="xl:col-span-2 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
                  {slotSuccess}
                </div>
              ) : null}
            </form>

            {selectedClinic ? (
              <div className="rounded-3xl border border-slate-100 bg-slate-50 p-5">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                      Selected clinic
                    </div>
                    <div className="mt-2 text-lg font-semibold text-slate-900">
                      {selectedClinic.name}
                    </div>
                    <div className="mt-1 text-sm text-slate-600">
                      {selectedClinic.city}
                    </div>
                    <div className="mt-1 text-sm text-slate-500">
                      {selectedClinic.address}
                    </div>
                  </div>

                  <div className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-700">
                    {selectedClinic.available_slots?.length || 0} open slots
                  </div>
                </div>

                {selectedClinic.available_slots?.length ? (
                  <div className="mt-4 grid gap-3">
                    {selectedClinic.available_slots.map((slot) => (
                      <div
                        key={slot.id}
                        className="rounded-2xl border border-slate-200 bg-white px-4 py-4"
                      >
                        <div className="text-sm font-semibold text-slate-900">
                          {formatDateTime(slot.slot_datetime)}
                        </div>
                        <div className="mt-1 text-xs uppercase tracking-[0.18em] text-slate-400">
                          {slot.status}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="mt-4 rounded-2xl border border-dashed border-slate-200 px-4 py-8 text-center text-sm text-slate-500">
                    This clinic does not have any open time slots yet.
                  </div>
                )}
              </div>
            ) : null}
          </div>
        </section>

        <section className="rounded-3xl border border-white/70 bg-white p-6 shadow-[0_20px_50px_rgba(148,163,184,0.12)]">
          <div className="flex flex-col gap-5">
            <div>
              <div className="inline-flex w-fit rounded-full border border-rose-100 bg-rose-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-[#993556]">
                Clinic operations
              </div>
              <h1 className="mt-3 text-2xl font-semibold tracking-tight text-slate-900">
                Review and verify incoming reservations
              </h1>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {filters.map((filter) => {
                const isActive = requestFilter === filter.value;
                return (
                  <button
                    key={filter.value}
                    type="button"
                    onClick={() => setRequestFilter(filter.value)}
                    className={`rounded-3xl border p-5 text-left transition duration-200 hover:-translate-y-0.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-200 ${getStatusClasses(
                      filter.status,
                      isActive
                    )}`}
                    aria-pressed={isActive}
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                        {filter.label}
                      </div>
                      <div
                        className={`inline-flex h-8 min-w-[2rem] items-center justify-center rounded-full px-2 text-xs font-semibold ${
                          isActive
                            ? "bg-[#993556] text-white"
                            : "border border-slate-200 bg-slate-50 text-slate-600"
                        }`}
                      >
                        {filter.count}
                      </div>
                    </div>
                    <div className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-slate-700">
                      <span>{isActive ? "Selected filter" : "View requests"}</span>
                      <span aria-hidden="true">→</span>
                    </div>
                  </button>
                );
              })}
            </div>

              <div>
                <h2 className="text-2xl font-semibold tracking-tight text-slate-900">
                  Incoming requests
                </h2>
                <p className="mt-2 text-sm text-slate-500">
                  Select a request below to open the reservation verification step.
                </p>
              </div>

            {isLoadingRequests ? <Spinner text="Loading incoming requests..." /> : null}

            {requestsError ? (
              <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
                {requestsError}
              </div>
            ) : null}

            {filteredRequests.length ? (
              <div className="grid gap-4">
                {filteredRequests.map((request) => {
                  const isSelected = selectedRequest?.case_id === request.case_id;
                  const status = getUiStatus(request);

                  return (
                    <button
                      key={request.case_id}
                      type="button"
                      onClick={() => onSelectRequest(request)}
                      className={`rounded-3xl border p-5 text-left transition ${
                        isSelected
                          ? "border-rose-300 bg-rose-50 shadow-[0_12px_30px_rgba(153,53,86,0.10)]"
                          : "border-slate-100 bg-white hover:border-slate-200 hover:bg-slate-50/80"
                      }`}
                    >
                      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                        <div className="grid flex-1 gap-4 md:grid-cols-2">
                          <div>
                            <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                              Reservation ID
                            </div>
                            <div className="mt-2 break-all font-mono text-sm text-slate-900">
                              {request.patient_hash || request.case_id}
                            </div>
                          </div>

                          <div>
                            <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                              Reservation date
                            </div>
                            <div className="mt-2 text-sm font-medium text-slate-900">
                              {formatDateTime(request.created_at)}
                            </div>
                          </div>

                          <div>
                            <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                              Appointment time
                            </div>
                            <div className="mt-2 text-sm font-medium text-slate-900">
                              {formatDateTime(request.slot_datetime)}
                            </div>
                          </div>

                          <div>
                            <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                              Clinic
                            </div>
                            <div className="mt-2 text-sm font-medium text-slate-900">
                              {request.clinic_name || "Clinic unavailable"}
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-3">
                          <div className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-700">
                            {request.amount_xrp} EUR
                          </div>
                          <span
                            className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${getBadgeClasses(
                              status
                            )}`}
                          >
                            {status}
                          </span>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-slate-200 px-4 py-10 text-center text-sm text-slate-500">
                No requests available for this filter yet.
              </div>
            )}
          </div>
        </section>

        <ReservationVerification
          selectedRequest={selectedRequest}
          formData={verificationFields}
          onChange={onVerificationFieldChange}
          onSubmit={onVerify}
          isVerifying={isVerifying}
          actionError={actionError}
          verification={verification}
        />
      </div>
    </main>
  );
}
