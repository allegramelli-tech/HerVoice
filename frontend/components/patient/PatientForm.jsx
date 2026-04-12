"use client";

const BRAND_COLOR = "#993556";
const EU_COUNTRIES = [
  "Austria",
  "Belgium",
  "Bulgaria",
  "Croatia",
  "Cyprus",
  "Czech Republic",
  "Denmark",
  "Estonia",
  "Finland",
  "France",
  "Germany",
  "Greece",
  "Hungary",
  "Ireland",
  "Italy",
  "Latvia",
  "Lithuania",
  "Luxembourg",
  "Malta",
  "Netherlands",
  "Poland",
  "Portugal",
  "Romania",
  "Slovakia",
  "Slovenia",
  "Spain",
  "Sweden",
];

function Spinner({ text }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm text-rose-900">
      <span className="h-5 w-5 animate-spin rounded-full border-2 border-rose-200 border-t-rose-700" />
      <span>{text}</span>
    </div>
  );
}

function Field({ label, children, className = "" }) {
  return (
    <label
      className={`flex flex-col gap-2 text-sm font-medium text-slate-700 ${className}`}
    >
      <span>
        {label}
        <span className="ml-1 text-rose-700">*</span>
      </span>
      {children}
    </label>
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

function formatStatus(value) {
  if (!value) return "Pending";

  return String(value)
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(" ");
}

const inputClassName =
  "rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-rose-300 focus:ring-2 focus:ring-rose-100";

export default function PatientForm({
  formData,
  onChange,
  onSubmit,
  isSubmitting,
  errorMessage,
  submittedCase,
  selectedClinic,
  selectedSlot,
  selectedSlotId,
  onSelectSlot,
  onBack,
}) {
  function handleExportPdf() {
    if (typeof window !== "undefined") {
      window.print();
    }
  }

  if (submittedCase) {
    return (
      <section className="rounded-3xl border border-rose-100 bg-white p-5 shadow-[0_24px_60px_rgba(148,163,184,0.14)] print:border-slate-200 print:shadow-none sm:p-8">
        <div className="flex flex-col gap-6">
          <div className="inline-flex w-fit items-center rounded-full border border-rose-100 bg-rose-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-rose-700">
            Request received
          </div>

          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
              Your request was submitted successfully.
            </h1>
            <p className="mt-3 text-base text-slate-600">
              Your clinic appointment is now reserved and the case is waiting for
              funding review.
            </p>
          </div>

          <div className="rounded-3xl border border-rose-100 bg-rose-50/70 p-5 sm:p-6">
            <div className="grid gap-5 md:grid-cols-2">
              <div>
                <div className="text-xs font-semibold uppercase tracking-[0.18em] text-rose-700">
                  Reservation ID
                </div>
                <div className="mt-3 break-all font-mono text-lg text-slate-900 sm:text-xl">
                  {submittedCase.case_id}
                </div>
              </div>

              <div>
                <div className="text-xs font-semibold uppercase tracking-[0.18em] text-rose-700">
                  Appointment ID
                </div>
                <div className="mt-3 break-all font-mono text-lg text-slate-900 sm:text-xl">
                  {submittedCase.appointment_id}
                </div>
              </div>
            </div>

            <div className="mt-5 grid gap-5 border-t border-rose-100 pt-5 md:grid-cols-2">
              <div>
                <div className="text-xs font-semibold uppercase tracking-[0.18em] text-rose-700">
                  Care status
                </div>
                <div className="mt-2 text-lg font-semibold text-slate-900">
                  {formatStatus(submittedCase.status)}
                </div>
              </div>

              <div>
                <div className="text-xs font-semibold uppercase tracking-[0.18em] text-rose-700">
                  Support amount
                </div>
                <div className="mt-2 text-lg font-semibold text-slate-900">
                  {submittedCase.amount_xrp} EUR
                </div>
              </div>

              {selectedSlot ? (
                <div>
                  <div className="text-xs font-semibold uppercase tracking-[0.18em] text-rose-700">
                    Reserved appointment
                  </div>
                  <div className="mt-2 text-sm font-medium text-slate-900">
                    {formatDateTime(selectedSlot.slot_datetime)}
                  </div>
                </div>
              ) : null}

              {selectedClinic ? (
                <div>
                  <div className="text-xs font-semibold uppercase tracking-[0.18em] text-rose-700">
                    Preferred clinic
                  </div>
                  <div className="mt-2 text-base font-semibold text-slate-900">
                    {selectedClinic.name}
                  </div>
                  <div className="mt-1 text-sm text-slate-600">
                    {selectedClinic.city}
                  </div>
                  <div className="mt-2 break-words text-sm text-slate-500">
                    {selectedClinic.address}
                  </div>
                </div>
              ) : null}
            </div>
          </div>

          <div className="flex flex-col gap-3 print:hidden sm:flex-row">
            <button
              type="button"
              onClick={handleExportPdf}
              className="inline-flex items-center justify-center rounded-full bg-[#993556] px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90"
            >
              Export as PDF
            </button>
            <div className="text-sm text-slate-500 sm:self-center">
              Opens your browser&apos;s print dialog so you can save this confirmation as a PDF.
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <form
      onSubmit={onSubmit}
      className="grid gap-6 rounded-3xl border border-white/70 bg-white p-5 shadow-[0_24px_60px_rgba(148,163,184,0.14)] sm:p-8"
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
            Complete your support request
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Fill in your details and we will prepare the next step confidentially. No login required. You can request support in just a few steps.
          </p>
        </div>
        <button
          type="button"
          onClick={onBack}
          className="text-sm font-medium text-slate-500 transition hover:text-slate-900"
        >
          Back
        </button>
      </div>

      {selectedClinic ? (
        <section className="rounded-3xl border border-rose-100 bg-rose-50/70 p-5">
          <div className="text-xs font-semibold uppercase tracking-[0.18em] text-rose-700">
            Selected clinic
          </div>
          <div className="mt-2 break-words text-lg font-semibold text-slate-900">
            {selectedClinic.name}
          </div>
          <div className="mt-1 text-sm text-slate-600">{selectedClinic.city}</div>
          <div className="mt-1 break-words text-sm text-slate-500">
            {selectedClinic.address}
          </div>
          <div className="mt-1 break-words text-sm text-slate-500">
            Doctor: {selectedClinic.doctor_name}
          </div>
        </section>
      ) : null}

      {selectedClinic?.available_slots?.length ? (
        <section className="rounded-3xl border border-slate-100 bg-white p-5 sm:p-6">
          <div className="mb-5">
            <h2 className="text-2xl font-semibold tracking-tight text-slate-900">
              Choose a time slot
            </h2>
            <p className="mt-2 text-sm text-slate-500">
              Select the reservation time you would like to request with this clinic.
            </p>
          </div>

          <div className="grid gap-3">
            {selectedClinic.available_slots.map((slot) => {
              const isSelected = selectedSlotId === slot.id;

              return (
                <button
                  key={slot.id}
                  type="button"
                  onClick={() =>
                    onSelectSlot(isSelected ? "" : slot.id)
                  }
                  className={`rounded-2xl border px-4 py-4 text-left transition ${
                    isSelected
                      ? "border-rose-200 bg-rose-50"
                      : "border-slate-200 bg-white hover:border-slate-300"
                  }`}
                >
                  <div className="text-sm font-semibold text-slate-900">
                    {formatDateTime(slot.slot_datetime)}
                  </div>
                  <div className="mt-1 text-xs uppercase tracking-[0.18em] text-slate-400">
                    {slot.status}
                  </div>
                </button>
              );
            })}
          </div>
        </section>
      ) : null}

      <section className="rounded-3xl border border-slate-100 bg-white p-5 sm:p-6">
        <div className="mb-5">
          <h2 className="text-2xl font-semibold tracking-tight text-slate-900">
            Personal information
          </h2>
          <p className="mt-2 text-sm text-slate-500">
            Tell us how to identify and support your reservation safely.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Field label="First name">
            <input
              name="firstName"
              value={formData.firstName}
              onChange={onChange}
              className={inputClassName}
              placeholder="First name"
            />
          </Field>
          <Field label="Last name">
            <input
              name="lastName"
              value={formData.lastName}
              onChange={onChange}
              className={inputClassName}
              placeholder="Last name"
            />
          </Field>
          <Field label="Email">
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={onChange}
              className={inputClassName}
              placeholder="name@example.com"
            />
          </Field>
          <Field label="Country">
            <select
              name="country"
              value={formData.country}
              onChange={onChange}
              className={inputClassName}
            >
              <option value="">Select your country</option>
              {EU_COUNTRIES.map((country) => (
                <option key={country} value={country}>
                  {country}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Date of birth" className="md:col-span-2">
            <input
              type="date"
              name="birthDate"
              value={formData.birthDate}
              onChange={onChange}
              className={inputClassName}
            />
          </Field>
        </div>
      </section>

      <section className="rounded-3xl border border-slate-100 bg-white p-5 sm:p-6">
        <div className="mb-5">
          <h2 className="text-2xl font-semibold tracking-tight text-slate-900">
            Health insurance
          </h2>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Insurance type">
            <select
              name="insuranceType"
              value={formData.insuranceType}
              onChange={onChange}
              className={inputClassName}
            >
              <option value="">Select insurance type</option>
              <option value="public">Public insurance</option>
              <option value="private">Private insurance</option>
            </select>
          </Field>
          <Field label="Insurance provider">
            <input
              name="insuranceProvider"
              value={formData.insuranceProvider}
              onChange={onChange}
              className={inputClassName}
              placeholder="Insurance provider"
            />
          </Field>
          <Field label="Insurance number">
            <input
              name="insuranceNumber"
              value={formData.insuranceNumber}
              onChange={onChange}
              className={inputClassName}
              placeholder="Insurance number"
            />
          </Field>
        </div>
      </section>

      {isSubmitting ? <Spinner text="Please wait, your request is being processed..." /> : null}

      {errorMessage ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
          {errorMessage}
        </div>
      ) : null}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex items-center justify-center rounded-full px-6 py-3 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
          style={{ backgroundColor: BRAND_COLOR }}
        >
          Request support
        </button>
      </div>
    </form>
  );
}
