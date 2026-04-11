"use client";

import { useMemo, useState } from "react";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
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
const INITIAL_FORM = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  country: "",
  insuranceProvider: "",
  insuranceNumber: "",
};

function HerVoiceLogo() {
  return (
    <div className="flex items-center gap-3">
      <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5" fill="none">
        <path
          d="M12 20.2s-6.95-4.32-8.97-8.44C1.6 8.84 3.12 5.5 6.3 4.63c2.04-.56 4.14.18 5.7 1.98 1.56-1.8 3.66-2.54 5.7-1.98 3.18.87 4.7 4.21 3.27 7.13C18.95 15.88 12 20.2 12 20.2Z"
          fill={BRAND_COLOR}
          fillOpacity="0.15"
          stroke={BRAND_COLOR}
          strokeWidth="1.5"
        />
        <path
          d="M12 8.2v4.1M9.95 10.25h4.1"
          stroke={BRAND_COLOR}
          strokeLinecap="round"
          strokeWidth="1.6"
        />
      </svg>
      <div>
        <div className="text-lg font-semibold tracking-tight">HerVoice</div>
        <div className="text-sm text-slate-500">
          Safe, confidential support for women seeking care across borders.
        </div>
      </div>
    </div>
  );
}

function StepIndicator({ activeStep }) {
  const steps = ["Your details", "Confirmation", "Appointment"];
  return (
    <div className="grid gap-3 rounded-2xl border border-rose-100 bg-white/80 p-4 shadow-sm sm:grid-cols-3">
      {steps.map((step, index) => {
        const active = index === activeStep || index < activeStep;
        return (
          <div
            key={step}
            className={`rounded-xl border px-4 py-3 ${
              active ? "border-rose-200 bg-rose-50" : "border-slate-200 bg-white"
            }`}
          >
            <div
              className={`text-xs font-semibold uppercase tracking-[0.18em] ${
                active ? "text-rose-700" : "text-slate-400"
              }`}
            >
              Step {index + 1}
            </div>
            <div className="mt-1 text-sm font-medium text-slate-700">{step}</div>
          </div>
        );
      })}
    </div>
  );
}

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
    <label className={`flex flex-col gap-2 text-sm font-medium text-slate-700 ${className}`}>
      {label}
      {children}
    </label>
  );
}

function inputClass() {
  return "rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-rose-300 focus:ring-2 focus:ring-rose-100";
}

function formatDateTime(value) {
  if (!value) return "Unavailable";
  return new Intl.DateTimeFormat("en-GB", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function formatStatus(value) {
  if (!value) return "Unknown";
  return value
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export default function PatientPage() {
  const [formData, setFormData] = useState(INITIAL_FORM);
  const [lookupCode, setLookupCode] = useState("");
  const [city, setCity] = useState("");
  const [accessCode, setAccessCode] = useState("");
  const [caseInfo, setCaseInfo] = useState(null);
  const [caseStatus, setCaseStatus] = useState(null);
  const [clinics, setClinics] = useState([]);
  const [selectedClinic, setSelectedClinic] = useState(null);
  const [selectedSlotId, setSelectedSlotId] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isCreatingCase, setIsCreatingCase] = useState(false);
  const [isLookingUp, setIsLookingUp] = useState(false);
  const [isLoadingClinics, setIsLoadingClinics] = useState(false);
  const [isLoadingClinic, setIsLoadingClinic] = useState(false);
  const [isBooking, setIsBooking] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);

  const activeStep = useMemo(() => {
    if (caseStatus?.appointment) return 2;
    if (accessCode) return 1;
    return 0;
  }, [accessCode, caseStatus]);

  function handleChange(event) {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));
  }

  async function fetchCaseStatus(code) {
    const response = await fetch(
      `${API_BASE_URL}/api/cases/status?access_code=${encodeURIComponent(code)}`
    );
    const data = await response.json();
    if (!response.ok) throw new Error(data.detail || "Unable to load case status.");
    setCaseStatus(data);
    return data;
  }

  async function handleCreateCase(event) {
    event.preventDefault();
    setErrorMessage("");
    const required = [
      formData.firstName,
      formData.lastName,
      formData.email,
      formData.phone,
      formData.country,
      formData.insuranceProvider,
      formData.insuranceNumber,
    ];
    if (required.some((value) => !value.trim())) {
      setErrorMessage("Please complete all fields before requesting support.");
      return;
    }
    setIsCreatingCase(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/cases`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formData.email.trim(),
          phone: formData.phone.trim() || null,
          country_of_origin: formData.country,
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.detail || data.message || "Unable to create case.");
      }
      setCaseInfo(data);
      setAccessCode(data.access_code);
      setLookupCode(data.access_code);
      await fetchCaseStatus(data.access_code);
      setFormData(INITIAL_FORM);
      setClinics([]);
      setSelectedClinic(null);
      setSelectedSlotId("");
    } catch (error) {
      setErrorMessage(error.message || "Unable to create case right now.");
    } finally {
      setIsCreatingCase(false);
    }
  }

  async function handleResumeCase(event) {
    event.preventDefault();
    setErrorMessage("");
    if (!lookupCode.trim()) {
      setErrorMessage("Enter your access code to resume your case.");
      return;
    }
    const code = lookupCode.trim().toUpperCase();
    setIsLookingUp(true);
    try {
      setAccessCode(code);
      setCaseInfo(null);
      await fetchCaseStatus(code);
    } catch (error) {
      setErrorMessage(error.message || "Unable to resume the case.");
    } finally {
      setIsLookingUp(false);
    }
  }

  async function handleSearchClinics(event) {
    event.preventDefault();
    setErrorMessage("");
    setSelectedClinic(null);
    setSelectedSlotId("");
    setIsLoadingClinics(true);
    try {
      const query = city.trim() ? `?city=${encodeURIComponent(city.trim())}` : "";
      const response = await fetch(`${API_BASE_URL}/api/clinics${query}`);
      const data = await response.json();
      if (!response.ok) throw new Error(data.detail || "Unable to load clinics.");
      setClinics(data);
    } catch (error) {
      setErrorMessage(error.message || "Unable to load clinics right now.");
    } finally {
      setIsLoadingClinics(false);
    }
  }

  async function handleSelectClinic(clinicId) {
    setErrorMessage("");
    setSelectedSlotId("");
    setIsLoadingClinic(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/clinics/${clinicId}`);
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.detail || "Unable to load clinic details.");
      }
      setSelectedClinic(data);
    } catch (error) {
      setErrorMessage(error.message || "Unable to load clinic details.");
    } finally {
      setIsLoadingClinic(false);
    }
  }

  async function handleBookAppointment() {
    setErrorMessage("");
    if (!accessCode.trim()) {
      setErrorMessage("Create or resume a case before booking.");
      return;
    }
    if (!selectedSlotId) {
      setErrorMessage("Select an appointment slot first.");
      return;
    }
    setIsBooking(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/appointments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ access_code: accessCode, slot_id: selectedSlotId }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.detail || data.message || "Unable to book slot.");
      await fetchCaseStatus(accessCode);
      if (selectedClinic?.id) await handleSelectClinic(selectedClinic.id);
    } catch (error) {
      setErrorMessage(error.message || "Unable to book appointment.");
    } finally {
      setIsBooking(false);
    }
  }

  async function handleCancelAppointment() {
    if (!caseStatus?.appointment?.appointment_id) return;
    setErrorMessage("");
    setIsCancelling(true);
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/appointments/${caseStatus.appointment.appointment_id}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ access_code: accessCode, action: "cancel" }),
        }
      );
      const data = await response.json();
      if (!response.ok) throw new Error(data.detail || data.message || "Unable to cancel.");
      await fetchCaseStatus(accessCode);
      if (selectedClinic?.id) await handleSelectClinic(selectedClinic.id);
    } catch (error) {
      setErrorMessage(error.message || "Unable to cancel appointment.");
    } finally {
      setIsCancelling(false);
    }
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(153,53,86,0.12),_transparent_35%),linear-gradient(180deg,_#fff8fa_0%,_#f8fafc_55%,_#ffffff_100%)] px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8">
        <div className="rounded-3xl border border-white/70 bg-white/85 p-6 shadow-[0_24px_60px_rgba(148,163,184,0.14)] backdrop-blur">
          <div className="flex flex-col gap-6">
            <HerVoiceLogo />
            <p className="max-w-3xl rounded-2xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm text-slate-700">
              Your information is never shared publicly. We use it only to help
              match you with care and guide you through the next steps safely and
              confidentially.
            </p>
            <StepIndicator activeStep={activeStep} />
          </div>
        </div>

        {accessCode ? (
          <section className="rounded-3xl border border-rose-100 bg-white p-8 shadow-[0_24px_60px_rgba(148,163,184,0.14)]">
            <div className="flex flex-col gap-6">
              <div className="inline-flex w-fit items-center rounded-full border border-rose-100 bg-rose-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-rose-700">
                Access code ready
              </div>
              <div>
                <h1 className="text-3xl font-semibold tracking-tight text-slate-900">
                  Your case is ready.
                </h1>
                <p className="mt-3 text-base text-slate-600">
                  Save your access code and use it to resume your case, check your
                  status, and manage your appointment later.
                </p>
              </div>
              <div className="grid gap-4 rounded-3xl border border-rose-100 bg-rose-50/70 p-6 sm:grid-cols-2">
                <div>
                  <div className="text-xs font-semibold uppercase tracking-[0.18em] text-rose-700">
                    Access code
                  </div>
                  <div className="mt-2 font-mono text-xl text-slate-900">{accessCode}</div>
                </div>
                <div>
                  <div className="text-xs font-semibold uppercase tracking-[0.18em] text-rose-700">
                    Care status
                  </div>
                  <div className="mt-2 text-xl font-semibold text-slate-900">
                    {formatStatus(caseStatus?.care_status || caseInfo?.care_status)}
                  </div>
                </div>
                <div className="sm:col-span-2">
                  <div className="text-xs font-semibold uppercase tracking-[0.18em] text-rose-700">
                    Case ID
                  </div>
                  <div className="mt-2 break-all font-mono text-sm text-slate-900">
                    {caseStatus?.case_id || caseInfo?.case_id || "Pending"}
                  </div>
                </div>
              </div>

              {caseStatus?.appointment ? (
                <div className="rounded-3xl border border-emerald-200 bg-emerald-50 p-5">
                  <h2 className="text-lg font-semibold text-emerald-900">
                    Appointment booked
                  </h2>
                  <div className="mt-4 grid gap-4 text-sm sm:grid-cols-2">
                    <div>
                      <div className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700">
                        Clinic
                      </div>
                      <div className="mt-2 font-medium text-emerald-950">
                        {caseStatus.appointment.clinic_name}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700">
                        Status
                      </div>
                      <div className="mt-2 font-medium text-emerald-950">
                        {formatStatus(caseStatus.appointment.status)}
                      </div>
                    </div>
                    <div className="sm:col-span-2">
                      <div className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700">
                        Appointment time
                      </div>
                      <div className="mt-2 font-medium text-emerald-950">
                        {formatDateTime(caseStatus.appointment.slot_datetime)}
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleCancelAppointment}
                    disabled={isCancelling}
                    className="mt-5 inline-flex items-center justify-center rounded-full border border-emerald-300 px-5 py-3 text-sm font-semibold text-emerald-900 transition hover:border-emerald-400 hover:bg-emerald-100 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    Cancel appointment
                  </button>
                </div>
              ) : null}

              <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
                <section className="rounded-3xl border border-slate-100 bg-white p-6">
                  <div className="mb-5">
                    <h2 className="text-2xl font-semibold tracking-tight text-slate-900">
                      Resume your case
                    </h2>
                    <p className="mt-2 text-sm text-slate-500">
                      Enter your access code to reload your status on another device.
                    </p>
                  </div>
                  <form onSubmit={handleResumeCase} className="flex flex-col gap-4">
                    <input
                      value={lookupCode}
                      onChange={(event) => setLookupCode(event.target.value)}
                      className={inputClass()}
                      placeholder="Access code"
                    />
                    <button
                      type="submit"
                      disabled={isLookingUp}
                      className="inline-flex items-center justify-center rounded-full border border-slate-200 px-6 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      Resume case
                    </button>
                  </form>
                </section>

                <section className="rounded-3xl border border-slate-100 bg-white p-6">
                  <div className="mb-5">
                    <h2 className="text-2xl font-semibold tracking-tight text-slate-900">
                      Find a clinic
                    </h2>
                    <p className="mt-2 text-sm text-slate-500">
                      Search available clinics by city and choose a slot.
                    </p>
                  </div>
                  <form onSubmit={handleSearchClinics} className="flex flex-col gap-4">
                    <input
                      value={city}
                      onChange={(event) => setCity(event.target.value)}
                      className={inputClass()}
                      placeholder="Search by city"
                    />
                    <button
                      type="submit"
                      disabled={isLoadingClinics}
                      className="inline-flex items-center justify-center rounded-full px-6 py-3 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                      style={{ backgroundColor: BRAND_COLOR }}
                    >
                      Search clinics
                    </button>
                  </form>
                </section>
              </div>

              {isLookingUp ? <Spinner text="Loading case..." /> : null}
              {isLoadingClinics ? <Spinner text="Loading clinics..." /> : null}
              {isLoadingClinic ? <Spinner text="Loading slots..." /> : null}
              {isBooking ? <Spinner text="Booking appointment..." /> : null}
            </div>
          </section>
        ) : (
          <form
            onSubmit={handleCreateCase}
            className="grid gap-6 rounded-3xl border border-white/70 bg-white p-6 shadow-[0_24px_60px_rgba(148,163,184,0.14)] sm:p-8"
          >
            <section className="rounded-3xl border border-slate-100 bg-white p-6">
              <div className="mb-5">
                <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
                  Personal information
                </h1>
                <p className="mt-2 text-sm text-slate-500">
                  Tell us how to reach you so we can support your care request.
                </p>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <Field label="First name">
                  <input name="firstName" value={formData.firstName} onChange={handleChange} className={inputClass()} placeholder="First name" />
                </Field>
                <Field label="Last name">
                  <input name="lastName" value={formData.lastName} onChange={handleChange} className={inputClass()} placeholder="Last name" />
                </Field>
                <Field label="Email">
                  <input type="email" name="email" value={formData.email} onChange={handleChange} className={inputClass()} placeholder="name@example.com" />
                </Field>
                <Field label="Phone number">
                  <input type="tel" name="phone" value={formData.phone} onChange={handleChange} className={inputClass()} placeholder="+49 123 456 789" />
                </Field>
                <Field label="Country" className="md:col-span-2">
                  <select name="country" value={formData.country} onChange={handleChange} className={inputClass()}>
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
                <p className="mt-2 text-sm text-slate-500">
                  We use these details only to support your request and coordinate
                  care confidentially.
                </p>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <Field label="Insurance provider">
                  <input name="insuranceProvider" value={formData.insuranceProvider} onChange={handleChange} className={inputClass()} placeholder="Insurance provider" />
                </Field>
                <Field label="Insurance number / Krankenversichertennummer">
                  <input name="insuranceNumber" value={formData.insuranceNumber} onChange={handleChange} className={inputClass()} placeholder="Insurance number" />
                </Field>
              </div>
              <p className="mt-4 text-sm text-slate-500">
                This number is never sent on-chain.
              </p>
            </section>

            {isCreatingCase ? (
              <Spinner text="Please wait, your request is being processed..." />
            ) : null}
            {isLookingUp ? <Spinner text="Loading case..." /> : null}
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
                disabled={isCreatingCase}
                className="inline-flex items-center justify-center rounded-full px-6 py-3 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                style={{ backgroundColor: BRAND_COLOR }}
              >
                Request support
              </button>
            </div>

            <section className="rounded-3xl border border-slate-100 bg-slate-50 p-6">
              <div className="mb-5">
                <h2 className="text-2xl font-semibold tracking-tight text-slate-900">
                  Resume an existing case
                </h2>
                <p className="mt-2 text-sm text-slate-500">
                  Already have an access code? Use it here to continue.
                </p>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row">
                <input
                  value={lookupCode}
                  onChange={(event) => setLookupCode(event.target.value)}
                  className={`w-full font-mono ${inputClass()}`}
                  placeholder="Enter access code"
                />
                <button
                  type="button"
                  onClick={(event) => {
                    event.preventDefault();
                    handleResumeCase(event);
                  }}
                  disabled={isLookingUp}
                  className="inline-flex items-center justify-center rounded-full border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Resume case
                </button>
              </div>
            </section>
          </form>
        )}

        {clinics.length ? (
          <section className="rounded-3xl border border-white/70 bg-white p-6 shadow-[0_24px_60px_rgba(148,163,184,0.14)] sm:p-8">
            <div className="flex flex-col gap-6">
              <div>
                <h2 className="text-2xl font-semibold tracking-tight text-slate-900">
                  Available clinics
                </h2>
                <p className="mt-2 text-sm text-slate-500">
                  Choose a clinic to load its currently available appointment slots.
                </p>
              </div>
              <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
                <div className="grid gap-4">
                  {clinics.map((clinic) => (
                    <button
                      key={clinic.id}
                      type="button"
                      onClick={() => handleSelectClinic(clinic.id)}
                      className={`rounded-3xl border p-5 text-left transition ${
                        selectedClinic?.id === clinic.id
                          ? "border-rose-200 bg-rose-50"
                          : "border-slate-200 bg-white hover:border-slate-300"
                      }`}
                    >
                      <div className="text-lg font-semibold text-slate-900">{clinic.name}</div>
                      <div className="mt-2 text-sm text-slate-600">{clinic.doctor_name}</div>
                      <div className="mt-3 text-sm text-slate-500">{clinic.address}</div>
                      <div className="mt-1 text-sm text-slate-500">{clinic.city}</div>
                    </button>
                  ))}
                </div>

                <div className="rounded-3xl border border-slate-100 bg-slate-50 p-5">
                  <h3 className="text-lg font-semibold text-slate-900">Available slots</h3>
                  <p className="mt-2 text-sm text-slate-500">
                    Select a clinic to see and book open appointments.
                  </p>
                  {selectedClinic ? (
                    <div className="mt-5 flex flex-col gap-4">
                      <div className="rounded-2xl border border-slate-200 bg-white p-4">
                        <div className="text-base font-semibold text-slate-900">{selectedClinic.name}</div>
                        <div className="mt-1 text-sm text-slate-600">{selectedClinic.doctor_name}</div>
                        <div className="mt-2 text-sm text-slate-500">
                          {selectedClinic.address}, {selectedClinic.city}
                        </div>
                      </div>
                      {selectedClinic.available_slots.length ? (
                        <div className="grid gap-3">
                          {selectedClinic.available_slots.map((slot) => (
                            <button
                              key={slot.id}
                              type="button"
                              onClick={() => setSelectedSlotId(slot.id)}
                              className={`rounded-2xl border px-4 py-4 text-left transition ${
                                selectedSlotId === slot.id
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
                          ))}
                        </div>
                      ) : (
                        <div className="rounded-2xl border border-dashed border-slate-200 px-4 py-8 text-center text-sm text-slate-500">
                          No available slots for this clinic right now.
                        </div>
                      )}
                      <button
                        type="button"
                        onClick={handleBookAppointment}
                        disabled={!selectedSlotId || isBooking}
                        className="inline-flex items-center justify-center rounded-full px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                        style={{ backgroundColor: BRAND_COLOR }}
                      >
                        Book selected slot
                      </button>
                    </div>
                  ) : (
                    <div className="mt-5 rounded-2xl border border-dashed border-slate-200 px-4 py-10 text-center text-sm text-slate-500">
                      No clinic selected yet.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </section>
        ) : null}
      </div>
    </main>
  );
}
