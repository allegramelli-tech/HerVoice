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

const inputClassName =
  "rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-rose-300 focus:ring-2 focus:ring-rose-100";

export default function PatientForm({
  formData,
  onChange,
  onSubmit,
  isSubmitting,
  errorMessage,
  accessCode,
  caseInfo,
  selectedClinic,
  onBack,
}) {
  if (accessCode) {
    return (
      <section className="rounded-3xl border border-rose-100 bg-white p-8 shadow-[0_24px_60px_rgba(148,163,184,0.14)]">
        <div className="flex flex-col gap-6">
          <div className="inline-flex w-fit items-center rounded-full border border-rose-100 bg-rose-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-rose-700">
            Request received
          </div>

          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-slate-900">
              Your request was submitted successfully.
            </h1>
            <p className="mt-3 text-base text-slate-600">
              Keep this access code safe. You can use it to continue later and
              review the next steps for your request.
            </p>
          </div>

          <div className="grid gap-4 rounded-3xl border border-rose-100 bg-rose-50/70 p-6 sm:grid-cols-2">
            <div>
              <div className="text-xs font-semibold uppercase tracking-[0.18em] text-rose-700">
                Access code
              </div>
              <div className="mt-2 font-mono text-xl text-slate-900">
                {accessCode}
              </div>
            </div>
            <div>
              <div className="text-xs font-semibold uppercase tracking-[0.18em] text-rose-700">
                Care status
              </div>
              <div className="mt-2 text-xl font-semibold text-slate-900">
                {caseInfo?.care_status || "Created"}
              </div>
            </div>
            {selectedClinic ? (
              <div className="sm:col-span-2">
                <div className="text-xs font-semibold uppercase tracking-[0.18em] text-rose-700">
                  Preferred clinic
                </div>
                <div className="mt-2 text-sm font-medium text-slate-900">
                  {selectedClinic.name}, {selectedClinic.city}, {selectedClinic.country}
                </div>
              </div>
            ) : null}
          </div>

          <button
            type="button"
            onClick={onBack}
            className="inline-flex w-fit items-center justify-center rounded-full border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:text-slate-900"
          >
            Start over
          </button>
        </div>
      </section>
    );
  }

  return (
    <form
      onSubmit={onSubmit}
      className="grid gap-6 rounded-3xl border border-white/70 bg-white p-6 shadow-[0_24px_60px_rgba(148,163,184,0.14)] sm:p-8"
    >
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
            Complete your support request
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Fill in your details and we will prepare the next step confidentially.
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
          <div className="mt-2 text-lg font-semibold text-slate-900">
            {selectedClinic.name}
          </div>
          <div className="mt-1 text-sm text-slate-600">
            {selectedClinic.city}, {selectedClinic.country}
          </div>
          <div className="mt-1 text-sm text-slate-500">
            Estimated distance: {selectedClinic.distance}
          </div>
        </section>
      ) : null}

      <section className="rounded-3xl border border-slate-100 bg-white p-6">
        <div className="mb-5">
          <h2 className="text-2xl font-semibold tracking-tight text-slate-900">
            Personal information
          </h2>
          <p className="mt-2 text-sm text-slate-500">
            Tell us how to reach you so we can support your care request.
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
          <Field label="Phone number">
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={onChange}
              className={inputClassName}
              placeholder="+49 123 456 789"
            />
          </Field>
          <Field label="Country" className="md:col-span-2">
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
        </div>
      </section>

      <section className="rounded-3xl border border-slate-100 bg-white p-6">
        <div className="mb-5">
          <h2 className="text-2xl font-semibold tracking-tight text-slate-900">
            Health insurance
          </h2>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
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

        <p className="mt-4 text-sm text-slate-500">
          This number is never sent on-chain.
        </p>
      </section>

      {isSubmitting ? <Spinner text="Please wait, your request is being processed..." /> : null}

      {errorMessage ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
          {errorMessage}
        </div>
      ) : null}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-slate-500">
          No login required. You can request support in just a few steps.
        </p>
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
