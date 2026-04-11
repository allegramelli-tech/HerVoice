"use client";

import BrandLogo from "../BrandLogo";

const BRAND_COLOR = "#993556";

function getStatusClasses(status) {
  if (status === "released") {
    return "border-teal-200 bg-teal-50 text-teal-700";
  }

  if (status === "confirmed") {
    return "border-emerald-200 bg-emerald-50 text-emerald-700";
  }

  return "border-amber-200 bg-amber-50 text-amber-700";
}

function formatStatusLabel(status) {
  if (status === "released") return "Released";
  if (status === "confirmed") return "Confirmed";
  return "Pending";
}

function DashboardSpinner({ text = "Loading dashboard data..." }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600 shadow-sm">
      <span className="h-5 w-5 animate-spin rounded-full border-2 border-slate-200 border-t-slate-700" />
      <span>{text}</span>
    </div>
  );
}

function MetricCard({ label, value, subtle = false }) {
  return (
    <div
      className={`rounded-3xl border p-5 ${
        subtle
          ? "border-slate-100 bg-white/80"
          : "border-rose-100 bg-[linear-gradient(180deg,_#fff9fb_0%,_#ffffff_100%)]"
      }`}
    >
      <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
        {label}
      </div>
      <div className="mt-3 text-3xl font-semibold tracking-tight text-slate-900">
        {value}
      </div>
    </div>
  );
}

function formatAppointmentStatus(status) {
  if (!status) return "Unknown";

  return status
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function formatDateTime(value) {
  if (!value) return "Date unavailable";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("en-GB", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function formatCompactId(value) {
  if (!value) return "Unavailable";

  if (value.length <= 18) {
    return value;
  }

  return `${value.slice(0, 8)}...${value.slice(-6)}`;
}

export default function FunderDashboard({
  onSignOut,
  isLoading,
  dashboardError,
  createError,
  dashboard,
  confirmedCount,
  clinics,
  clinicsError,
  isLoadingClinics,
  selectedClinicId,
  selectedClinic,
  appointments,
  appointmentsError,
  isLoadingAppointments,
  selectedAppointmentId,
  setSelectedAppointmentId,
  selectedFundingCaseId,
  setSelectedFundingCaseId,
  linkableFundingCases,
  linkError,
  linkSuccess,
  isLinking,
  amountInput,
  setAmountInput,
  onCreateFundingCase,
  onClinicChange,
  onLinkFunding,
  isCreating,
  createdCase,
  statusFilter,
  setStatusFilter,
  groupedCases,
  formatAnonymousId,
  getUiStatus,
}) {
  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,_#fff8fa_0%,_#f8fafc_48%,_#ffffff_100%)]">
      <header className="border-b border-white/70 bg-white/85 backdrop-blur">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-5 pr-14 sm:px-6 sm:pr-16 lg:px-8 lg:pr-8">
          <BrandLogo />

          <div className="flex w-full flex-col gap-3 rounded-3xl border border-slate-100 bg-slate-50/90 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                Funder workspace
              </div>
              <div className="mt-1 text-sm font-semibold text-slate-900">
                HerVoice Funding Network
              </div>
              <div className="mt-1 text-xs text-slate-500">
                Verified NGO account
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

      <div className="mx-auto flex max-w-7xl flex-col gap-8 px-4 py-8 sm:px-6 lg:px-8">
        {isLoading ? <DashboardSpinner /> : null}

        {dashboardError ? (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
            {dashboardError}
          </div>
        ) : null}

        {createError ? (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
            {createError}
          </div>
        ) : null}

        <section className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
          <div className="rounded-3xl border border-white/70 bg-white p-6 shadow-[0_20px_50px_rgba(148,163,184,0.12)]">
            <div className="flex flex-col gap-4">
              <div>
                <div className="inline-flex rounded-full border border-rose-100 bg-rose-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-[#993556]">
                  Funding overview
                </div>
                <p className="mt-3 text-sm text-slate-500">
                  Funding and voucher activity across the network.
                </p>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <MetricCard
                  label="Total cases"
                  value={dashboard?.total_cases ?? 0}
                />
                <MetricCard label="Confirmed" value={confirmedCount} />
                <MetricCard
                  label="EUR committed"
                  value={`${dashboard?.total_xrp_locked ?? 0} EUR`}
                  subtle
                />
                <MetricCard
                  label="EUR released"
                  value={`${dashboard?.total_xrp_released ?? 0} EUR`}
                  subtle
                />
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-white/70 bg-white p-6 shadow-[0_20px_50px_rgba(148,163,184,0.12)]">
            <div className="flex flex-col gap-4">
              <div>
                <div className="inline-flex rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-slate-700">
                  Care operations
                </div>
                <p className="mt-3 text-sm text-slate-500">
                  Live counts from clinics, patient cases, appointments, and proofs.
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <MetricCard label="Clinics" value={dashboard?.total_clinics ?? 0} subtle />
                <MetricCard
                  label="Patient cases"
                  value={dashboard?.total_patient_cases ?? 0}
                  subtle
                />
                <MetricCard
                  label="Appointments"
                  value={dashboard?.total_appointments ?? 0}
                  subtle
                />
                <MetricCard
                  label="Completed appointments"
                  value={dashboard?.total_completed_appointments ?? 0}
                  subtle
                />
                <div className="sm:col-span-2">
                  <MetricCard
                    label="Proofs submitted"
                    value={dashboard?.total_proofs_submitted ?? 0}
                    subtle
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-3xl border border-white/70 bg-white p-6 shadow-[0_20px_50px_rgba(148,163,184,0.12)]">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
                Funding cases
              </h1>
              <p className="text-sm text-slate-500">
                Create new funding, link it to booked appointments, and then
                review the active case list below.
              </p>
            </div>

            <form
              onSubmit={onCreateFundingCase}
              className="grid gap-3 rounded-3xl border border-slate-100 bg-slate-50 p-4 md:grid-cols-[1fr_auto]"
            >
              <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto]">
                <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
                  Amount in EUR
                  <input
                    type="number"
                    min="1"
                    max="1000"
                    step="1"
                    value={amountInput}
                    onChange={(event) => setAmountInput(event.target.value)}
                    className="rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-rose-300 focus:ring-2 focus:ring-rose-100"
                    placeholder="5"
                  />
                </label>
                <button
                  type="submit"
                  disabled={isCreating}
                  className="mt-auto inline-flex items-center justify-center rounded-full px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                  style={{ backgroundColor: BRAND_COLOR }}
                >
                  Create funding case
                </button>
              </div>

              {isCreating ? (
                <div className="md:col-span-2">
                  <DashboardSpinner text="Creating funding case..." />
                </div>
              ) : null}

              {createdCase ? (
                <div className="grid gap-4 rounded-3xl border border-emerald-200 bg-emerald-50 p-5 text-sm md:col-span-2 md:grid-cols-2">
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
                      Voucher ID
                    </div>
                    <div className="mt-2 break-all font-mono text-emerald-950">
                      {createdCase.voucher_id}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700">
                      Amount
                    </div>
                    <div className="mt-2 font-semibold text-emerald-950">
                      {createdCase.amount_xrp} EUR
                    </div>
                  </div>
                  <div>
                    <div className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700">
                      Status
                    </div>
                    <div className="mt-2 font-semibold text-emerald-950">
                      {createdCase.status}
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
            </form>

          </div>

          <div className="mt-6 flex flex-col gap-6">
            <section className="rounded-3xl border border-slate-100 bg-slate-50 p-5">
              <div className="flex flex-col gap-2">
                <h2 className="text-lg font-semibold tracking-tight text-slate-900">
                  Link funding to a clinic appointment
                </h2>
                <p className="text-sm text-slate-500">
                  Attach an existing funding case to a booked appointment
                  before the clinic confirms care.
                </p>
              </div>

              <form
                onSubmit={onLinkFunding}
                className="mt-5 grid gap-5 xl:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]"
              >
                <div className="space-y-4 rounded-3xl border border-white bg-white p-5">
                  <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
                    Choose clinic
                    <select
                      value={selectedClinicId}
                      onChange={onClinicChange}
                      className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-rose-300 focus:ring-2 focus:ring-rose-100"
                    >
                      <option value="">Select a clinic</option>
                      {clinics.map((clinic) => (
                        <option key={clinic.id} value={clinic.id}>
                          {clinic.name} - {clinic.city}
                        </option>
                      ))}
                    </select>
                  </label>

                  {selectedClinic ? (
                    <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4 text-sm text-slate-600">
                      <div className="font-semibold text-slate-900">
                        {selectedClinic.name}
                      </div>
                      <div className="mt-1">{selectedClinic.doctor_name}</div>
                      <div className="mt-1">
                        {selectedClinic.address}, {selectedClinic.city}
                      </div>
                    </div>
                  ) : null}

                  {isLoadingClinics ? (
                    <DashboardSpinner text="Loading clinics..." />
                  ) : null}

                  {clinicsError ? (
                    <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
                      {clinicsError}
                    </div>
                  ) : null}

                  <div className="space-y-3">
                    <div className="text-sm font-medium text-slate-700">
                      Appointments
                    </div>

                    {isLoadingAppointments ? (
                      <DashboardSpinner text="Loading clinic appointments..." />
                    ) : null}

                    {!isLoadingAppointments && appointmentsError ? (
                      <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
                        {appointmentsError}
                      </div>
                    ) : null}

                    {!isLoadingAppointments &&
                    !appointmentsError &&
                    selectedClinicId &&
                    !appointments.length ? (
                      <div className="rounded-2xl border border-dashed border-slate-200 px-4 py-6 text-sm text-slate-500">
                        No appointments found for this clinic yet.
                      </div>
                    ) : null}

                    {!isLoadingAppointments && appointments.length ? (
                      <div className="space-y-3">
                        {appointments.map((appointment) => {
                          const isSelected =
                            selectedAppointmentId === appointment.appointment_id;
                          const isLinked = Boolean(appointment.funding_case_id);
                          const wasJustLinked =
                            Boolean(linkSuccess) &&
                            appointment.funding_case_id === selectedFundingCaseId;

                          return (
                            <button
                              key={appointment.appointment_id}
                              type="button"
                              onClick={() =>
                                setSelectedAppointmentId(
                                  appointment.appointment_id
                                )
                              }
                              className={`w-full rounded-3xl border px-4 py-4 text-left transition ${
                                wasJustLinked
                                  ? "border-emerald-300 bg-emerald-50/70 shadow-[0_12px_30px_rgba(16,185,129,0.10)]"
                                  : isSelected
                                    ? "border-rose-300 bg-rose-50"
                                    : "border-slate-200 bg-white hover:border-slate-300"
                              }`}
                            >
                              <div className="flex flex-wrap items-start justify-between gap-3">
                                <div>
                                  <div className="text-sm font-semibold text-slate-900">
                                    {formatDateTime(appointment.slot_datetime)}
                                  </div>
                                  <div className="mt-1 font-mono text-xs text-slate-500">
                                    Appointment ID: {appointment.appointment_id}
                                  </div>
                                  <div className="mt-1 font-mono text-xs text-slate-500">
                                    Patient case: {appointment.patient_case_id}
                                  </div>
                                </div>

                                <div className="flex flex-col items-end gap-2">
                                  <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-700">
                                    {formatAppointmentStatus(appointment.status)}
                                  </span>
                                  <span
                                    className={`rounded-full border px-3 py-1 text-xs font-semibold ${
                                      isLinked
                                        ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                                        : "border-amber-200 bg-amber-50 text-amber-700"
                                    }`}
                                  >
                                    {isLinked ? "Funding linked" : "Funding missing"}
                                  </span>
                                </div>
                              </div>

                              {isLinked ? (
                                <div className="mt-3 rounded-2xl border border-emerald-100 bg-white/80 px-4 py-3">
                                  {wasJustLinked ? (
                                    <div className="mb-3 inline-flex rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-emerald-700">
                                      Funding linked successfully
                                    </div>
                                  ) : null}

                                  <div className="flex flex-wrap items-start justify-between gap-3">
                                    <div>
                                      <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                                        Linked funding case
                                      </div>
                                      <div className="mt-2 inline-flex rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                                        {formatAnonymousId(appointment.funding_case_id)}
                                      </div>
                                    </div>

                                    <div className="min-w-0 flex-1 text-left sm:text-right">
                                      <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                                        Case reference
                                      </div>
                                      <div
                                        className="mt-2 break-all font-mono text-xs text-slate-600"
                                        title={appointment.funding_case_id}
                                      >
                                        {formatCompactId(appointment.funding_case_id)}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              ) : (
                                <div className="mt-3 text-xs text-slate-500">
                                  This appointment still needs a funding case.
                                </div>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    ) : null}
                  </div>
                </div>

                <div className="space-y-4 rounded-3xl border border-white bg-white p-5">
                  <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
                    Choose funding case
                    <select
                      value={selectedFundingCaseId}
                      onChange={(event) =>
                        setSelectedFundingCaseId(event.target.value)
                      }
                      className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-rose-300 focus:ring-2 focus:ring-rose-100"
                    >
                      <option value="">Select a funding case</option>
                      {linkableFundingCases.map((caseItem) => (
                        <option key={caseItem.case_id} value={caseItem.case_id}>
                          {caseItem.amount_xrp} EUR - {formatStatusLabel(
                            getUiStatus(caseItem)
                          )} - {formatAnonymousId(caseItem.case_id)}
                        </option>
                      ))}
                    </select>
                  </label>

                  {linkableFundingCases.length ? null : (
                    <div className="rounded-2xl border border-dashed border-slate-200 px-4 py-6 text-sm text-slate-500">
                      Create a funding case first to link it to an appointment.
                    </div>
                  )}

                  {linkError ? (
                    <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
                      {linkError}
                    </div>
                  ) : null}

                  {linkSuccess ? (
                    <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
                      {linkSuccess}
                    </div>
                  ) : null}

                  <button
                    type="submit"
                    disabled={
                      isLinking ||
                      !selectedClinicId ||
                      !selectedAppointmentId ||
                      !selectedFundingCaseId
                    }
                    className="inline-flex w-full items-center justify-center rounded-full px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                    style={{ backgroundColor: BRAND_COLOR }}
                  >
                    {isLinking ? "Linking funding..." : "Link funding case"}
                  </button>
                </div>
              </form>
            </section>

            <section className="rounded-3xl border border-slate-100 bg-slate-50 p-5">
              <div className="flex flex-col gap-4 border-b border-slate-200 pb-5 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-lg font-semibold tracking-tight text-slate-900">
                    Case list
                  </h2>
                  <p className="mt-1 text-sm text-slate-500">
                    Filter and review funding cases across the network.
                  </p>
                </div>

                <div className="flex flex-wrap gap-3">
                  {[
                    ["all", "All"],
                    ["pending", "Pending"],
                    ["confirmed", "Confirmed"],
                    ["released", "Released"],
                  ].map(([value, label]) => {
                    const isActive = statusFilter === value;
                    return (
                      <button
                        key={value}
                        type="button"
                        onClick={() => setStatusFilter(value)}
                        className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                          isActive
                            ? "text-white"
                            : "border border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:text-slate-900"
                        }`}
                        style={isActive ? { backgroundColor: BRAND_COLOR } : {}}
                      >
                        {label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="mt-5 flex flex-col gap-6">
            {groupedCases.length ? (
              groupedCases.map(([country, cases]) => (
                <div key={country} className="rounded-3xl border border-slate-100">
                  <div className="border-b border-slate-100 bg-slate-50 px-5 py-4">
                    <div className="text-sm font-semibold text-slate-900">
                      {country}
                    </div>
                  </div>

                  <div className="space-y-3 px-4 py-4 md:hidden">
                    {cases.map((caseItem) => {
                      const status = getUiStatus(caseItem);
                      const clinicConfirmed =
                        caseItem.case_status === "released" ||
                        caseItem.voucher_status === "redeemed";

                      return (
                        <div
                          key={caseItem.case_id}
                          className="rounded-2xl border border-slate-100 bg-white p-4"
                        >
                          <div className="flex flex-col gap-3">
                            <div>
                              <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                                Anonymous ID
                              </div>
                              <div className="mt-1 break-all font-mono text-sm text-slate-900">
                                {formatAnonymousId(caseItem.case_id)}
                              </div>
                            </div>

                            <div className="grid gap-3 sm:grid-cols-2">
                              <div>
                                <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                                  Voucher
                                </div>
                                <div className="mt-1 break-all font-mono text-xs text-slate-600">
                                  {caseItem.voucher_id || "Not issued"}
                                </div>
                              </div>
                              <div>
                                <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                                  Amount
                                </div>
                                <div className="mt-1 text-sm font-medium text-slate-900">
                                  {caseItem.amount_xrp} EUR
                                </div>
                              </div>
                            </div>

                            <div className="flex flex-wrap gap-2">
                              <span
                                className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${getStatusClasses(
                                  status
                                )}`}
                              >
                                {formatStatusLabel(status)}
                              </span>
                              <span
                                className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${
                                  clinicConfirmed
                                    ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                                    : "border-slate-200 bg-slate-50 text-slate-600"
                                }`}
                              >
                                {clinicConfirmed ? "Clinic confirmed" : "Clinic pending"}
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="hidden overflow-x-auto md:block">
                    <table className="min-w-full divide-y divide-slate-100 text-left">
                      <thead className="bg-white">
                        <tr className="text-xs uppercase tracking-[0.18em] text-slate-400">
                          <th className="px-5 py-4 font-semibold">Anonymous ID</th>
                          <th className="px-5 py-4 font-semibold">Voucher</th>
                          <th className="px-5 py-4 font-semibold">Amount</th>
                          <th className="px-5 py-4 font-semibold">Status</th>
                          <th className="px-5 py-4 font-semibold">Clinic confirmed</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 bg-white text-sm text-slate-700">
                        {cases.map((caseItem) => {
                          const status = getUiStatus(caseItem);
                          const clinicConfirmed =
                            caseItem.case_status === "released" ||
                            caseItem.voucher_status === "redeemed";

                          return (
                            <tr key={caseItem.case_id}>
                              <td className="px-5 py-4 font-mono text-slate-900">
                                {formatAnonymousId(caseItem.case_id)}
                              </td>
                              <td className="px-5 py-4 font-mono text-xs text-slate-600">
                                {caseItem.voucher_id || "Not issued"}
                              </td>
                              <td className="px-5 py-4 font-medium text-slate-900">
                                {caseItem.amount_xrp} EUR
                              </td>
                              <td className="px-5 py-4">
                                <span
                                  className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${getStatusClasses(
                                    status
                                  )}`}
                                >
                                  {formatStatusLabel(status)}
                                </span>
                              </td>
                              <td className="px-5 py-4">
                                <span
                                  className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${
                                    clinicConfirmed
                                      ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                                      : "border-slate-200 bg-slate-50 text-slate-600"
                                  }`}
                                >
                                  {clinicConfirmed ? "Yes" : "No"}
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))
            ) : (
              <div className="rounded-2xl border border-dashed border-slate-200 px-4 py-10 text-center text-sm text-slate-500">
                No funding cases match this filter yet.
              </div>
            )}
              </div>
            </section>
          </div>
        </section>
      </div>
    </main>
  );
}
