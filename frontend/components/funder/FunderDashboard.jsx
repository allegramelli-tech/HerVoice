"use client";

import BrandLogo from "../BrandLogo";

const BRAND_COLOR = "#993556";

function DashboardSpinner({ text = "Loading dashboard data..." }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600 shadow-sm">
      <span className="h-5 w-5 animate-spin rounded-full border-2 border-slate-200 border-t-slate-700" />
      <span>{text}</span>
    </div>
  );
}

function MetricCard({ label, value, hint }) {
  return (
    <div className="rounded-3xl border border-slate-100 bg-[linear-gradient(180deg,_#ffffff_0%,_#f8fafc_100%)] p-5">
      <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
        {label}
      </div>
      <div className="mt-3 text-[2rem] font-semibold leading-none tracking-tight text-slate-900 sm:text-3xl">
        {value}
      </div>
      <div className="mt-3 text-sm text-slate-500">{hint}</div>
    </div>
  );
}

function DonutChartCard({ title, value, total, segments, highlightLabel }) {
  const safeTotal = Math.max(total || 0, 0);
  const safeValue = Math.max(value || 0, 0);
  const percentage =
    safeTotal > 0 ? Math.min((safeValue / safeTotal) * 100, 100) : 0;

  const gradientStops = [];
  let currentOffset = 0;

  segments.forEach((segment) => {
    const portion =
      safeTotal > 0 ? (Math.max(segment.value, 0) / safeTotal) * 100 : 0;
    const nextOffset = currentOffset + portion;
    gradientStops.push(`${segment.color} ${currentOffset}% ${nextOffset}%`);
    currentOffset = nextOffset;
  });

  if (currentOffset < 100) {
    gradientStops.push(`#f1f5f9 ${currentOffset}% 100%`);
  }

  return (
    <div className="rounded-3xl border border-slate-100 bg-[linear-gradient(180deg,_#ffffff_0%,_#fff9fb_100%)] p-5 shadow-[0_12px_30px_rgba(15,23,42,0.04)]">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
            {title}
          </div>
          <div className="mt-3 text-3xl font-semibold tracking-tight text-slate-900">
            {Math.round(percentage)}%
          </div>
          <div className="mt-1 text-sm leading-6 text-slate-500">
            {highlightLabel}
          </div>
        </div>

        <div className="rounded-full border border-rose-100 bg-rose-50 px-3 py-1 text-xs font-semibold text-[#993556]">
          {safeValue} of {safeTotal}
        </div>
      </div>

      <div className="mt-6 flex flex-col items-center gap-6">
        <div
          className="relative h-40 w-40 shrink-0 rounded-full"
          style={{
            background: `conic-gradient(${gradientStops.join(", ")})`,
          }}
        >
          <div className="absolute inset-[14px] rounded-full bg-white" />
        </div>

        <div className="grid w-full gap-3 text-sm sm:grid-cols-2">
          {segments.map((segment) => (
            <div
              key={segment.key}
              className="flex items-center justify-between gap-4 rounded-2xl border border-slate-100 bg-white/80 px-4 py-3"
            >
              <div className="flex items-center gap-3 text-slate-600">
                <span
                  className="h-3 w-3 rounded-full"
                  style={{ backgroundColor: segment.color }}
                />
                <span>{segment.label}</span>
              </div>
              <div className="text-right">
                <div className="font-semibold text-slate-900">{segment.value}</div>
                <div className="text-xs text-slate-400">
                  {safeTotal > 0
                    ? `${Math.round((segment.value / safeTotal) * 100)}%`
                    : "0%"}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function formatStatusLabel(status) {
  if (status === "released") return "Released";
  if (status === "confirmed") return "Confirmed";
  return "Pending";
}

function getStatusClasses(status) {
  if (status === "released") {
    return "border-teal-200 bg-teal-50 text-teal-700";
  }

  if (status === "confirmed") {
    return "border-emerald-200 bg-emerald-50 text-emerald-700";
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

export default function FunderDashboard({
  onSignOut,
  isLoading,
  dashboardError,
  createError,
  dashboard,
  confirmedCount,
  selectedCase,
  selectedCaseId,
  setSelectedCaseId,
  fundableCases,
  onCreateFundingCase,
  isCreating,
  createdCase,
  statusFilter,
  setStatusFilter,
  filteredCases,
  getUiStatus,
}) {
  const totalReservations = dashboard?.total_cases ?? 0;
  const confirmedReservations = confirmedCount ?? 0;
  const pendingReservations = Math.max(
    totalReservations - confirmedReservations,
    0
  );
  const totalBookedAppointments = dashboard?.total_booked_appointments ?? 0;
  const completedAppointments = dashboard?.total_completed_appointments ?? 0;
  const openAppointments = Math.max(
    totalBookedAppointments - completedAppointments,
    0
  );

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
                Verified government account
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
                  A quick view of current funding volume and reservation confirmation progress.
                </p>
              </div>

              <DonutChartCard
                title="Confirmation share"
                value={confirmedReservations}
                total={totalReservations}
                highlightLabel="already funded"
                segments={[
                  {
                    key: "confirmed",
                    label: "Confirmed",
                    value: confirmedReservations,
                    color: "#993556",
                  },
                  {
                    key: "remaining",
                    label: "Pending",
                    value: pendingReservations,
                    color: "#f2d6e1",
                  },
                ]}
              />

              <div className="grid gap-4 sm:grid-cols-2">
                <MetricCard
                  label="EUR committed"
                  value={`${dashboard?.total_xrp_locked ?? 0} EUR`}
                  hint="Locked in active cases."
                />
                <MetricCard
                  label="EUR released"
                  value={`${dashboard?.total_xrp_released ?? 0} EUR`}
                  hint="Already paid out to clinics."
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
                  Live counts across clinics, slots, and appointment activity.
                </p>
              </div>

              <DonutChartCard
                title="Completion share"
                value={completedAppointments}
                total={totalBookedAppointments}
                highlightLabel="already completed"
                segments={[
                  {
                    key: "completed",
                    label: "Completed",
                    value: completedAppointments,
                    color: "#2C2C2A",
                  },
                  {
                    key: "open",
                    label: "Open",
                    value: openAppointments,
                    color: "#e2e8f0",
                  },
                ]}
              />

              <div className="grid gap-4 sm:grid-cols-2">
                <MetricCard
                  label="Clinics"
                  value={dashboard?.total_clinics ?? 0}
                  hint="Verified care providers in the network."
                />
                <MetricCard
                  label="Clinic slots"
                  value={dashboard?.total_slots ?? 0}
                  hint="Open and booked times across partner clinics."
                />
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-3xl border border-white/70 bg-white p-6 shadow-[0_20px_50px_rgba(148,163,184,0.12)]">
          <div className="flex flex-col gap-5">
            <div className="flex flex-col gap-2">
              <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
                Funding cases
              </h1>
              <p className="text-sm text-slate-500">
                Select a pending reservation, then lock support funds for that case on XRPL.
              </p>
            </div>

            <form
              onSubmit={onCreateFundingCase}
              className="grid gap-4 rounded-3xl border border-slate-100 bg-slate-50 p-5 xl:grid-cols-[minmax(0,1fr)_auto]"
            >
              <div className="rounded-3xl border border-white bg-white p-5">
                <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                  Selected reservation
                </div>

                {selectedCase ? (
                  <div className="mt-4 grid gap-4 sm:grid-cols-2">
                    <div>
                      <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                        Reservation ID
                      </div>
                      <div className="mt-2 break-all font-mono text-sm text-slate-900">
                        {selectedCase.patient_hash || selectedCase.case_id}
                      </div>
                    </div>

                    <div>
                      <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                        Amount
                      </div>
                      <div className="mt-2 text-sm font-semibold text-slate-900">
                        {selectedCase.amount_xrp} EUR
                      </div>
                    </div>

                    <div>
                      <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                        Clinic
                      </div>
                      <div className="mt-2 text-sm text-slate-900">
                        {selectedCase.clinic_name || "Clinic unavailable"}
                      </div>
                    </div>

                    <div>
                      <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                        Appointment
                      </div>
                      <div className="mt-2 text-sm text-slate-900">
                        {formatDateTime(selectedCase.slot_datetime)}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="mt-4 rounded-2xl border border-dashed border-slate-200 px-4 py-6 text-sm text-slate-500">
                    Choose a pending reservation from the case list below.
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={
                  isCreating ||
                  !selectedCase ||
                  getUiStatus(selectedCase) !== "pending"
                }
                className="inline-flex items-center justify-center rounded-full px-6 py-3 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60 xl:self-center"
                style={{ backgroundColor: BRAND_COLOR }}
              >
                {isCreating ? "Locking funds..." : "Create funding case"}
              </button>

              {isCreating ? (
                <div className="xl:col-span-2">
                  <DashboardSpinner text="Creating funding case..." />
                </div>
              ) : null}

              {createdCase ? (
                <div className="grid gap-4 rounded-3xl border border-emerald-200 bg-emerald-50 p-5 text-sm xl:col-span-2 md:grid-cols-2">
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
                      {createdCase.amount_xrp} EUR
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
            </form>
          </div>

          <div className="mt-6 rounded-3xl border border-slate-100 bg-slate-50 p-5">
            <div className="flex flex-col gap-4 border-b border-slate-200 pb-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-lg font-semibold tracking-tight text-slate-900">
                  Case list
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Review all reservations and select one to fund.
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

            <div className="mt-5 grid gap-4">
              {filteredCases.length ? (
                filteredCases.map((caseItem) => {
                  const status = getUiStatus(caseItem);
                  const isSelected = selectedCaseId === caseItem.case_id;
                  const isFundable = fundableCases.some(
                    (fundableCase) => fundableCase.case_id === caseItem.case_id
                  );

                  return (
                    <button
                      key={caseItem.case_id}
                      type="button"
                      onClick={() => setSelectedCaseId(caseItem.case_id)}
                      className={`rounded-3xl border p-5 text-left transition ${
                        isSelected
                          ? "border-rose-300 bg-rose-50 shadow-[0_12px_30px_rgba(153,53,86,0.10)]"
                          : "border-slate-100 bg-white hover:border-slate-200 hover:bg-slate-50/80"
                      }`}
                    >
                      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                        <div className="grid flex-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                          <div>
                            <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                              Reservation ID
                            </div>
                            <div className="mt-2 break-all font-mono text-sm text-slate-900">
                              {caseItem.patient_hash || caseItem.case_id}
                            </div>
                          </div>

                          <div>
                            <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                              Reservation date
                            </div>
                            <div className="mt-2 text-sm font-medium text-slate-900">
                              {formatDateTime(caseItem.created_at)}
                            </div>
                          </div>

                          <div>
                            <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                              Appointment
                            </div>
                            <div className="mt-2 text-sm font-medium text-slate-900">
                              {formatDateTime(caseItem.slot_datetime)}
                            </div>
                          </div>

                          <div>
                            <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                              Clinic
                            </div>
                            <div className="mt-2 text-sm font-medium text-slate-900">
                              {caseItem.clinic_name || "Clinic unavailable"}
                            </div>
                          </div>

                          <div>
                            <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                              Amount
                            </div>
                            <div className="mt-2 text-sm font-semibold text-slate-900">
                              {caseItem.amount_xrp} EUR
                            </div>
                          </div>

                          <div>
                            <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                              Case reference
                            </div>
                            <div className="mt-2 break-all font-mono text-xs text-slate-500">
                              {caseItem.case_id}
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-3">
                          <span
                            className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${getStatusClasses(
                              status
                            )}`}
                          >
                            {formatStatusLabel(status)}
                          </span>
                          <span
                            className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${
                              isFundable
                                ? "border-rose-200 bg-rose-50 text-rose-700"
                                : "border-slate-200 bg-slate-50 text-slate-600"
                            }`}
                          >
                            {isFundable ? "Ready to fund" : "Already processed"}
                          </span>
                        </div>
                      </div>
                    </button>
                  );
                })
              ) : (
                <div className="rounded-2xl border border-dashed border-slate-200 px-4 py-10 text-center text-sm text-slate-500">
                  No funding cases match this filter yet.
                </div>
              )}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
