"use client";

import { useState } from "react";
import StepSelector from "../../components/patient/StepSelector";
import AccessCodeForm from "../../components/patient/AccessCodeForm";
import ClinicSearch from "../../components/patient/ClinicSearch";
import PatientForm from "../../components/patient/PatientForm";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
const INITIAL_FORM = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  country: "",
  insuranceProvider: "",
  insuranceNumber: "",
};

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

function getApiError(data, fallbackMessage) {
  if (typeof data?.detail === "string") return data.detail;
  if (typeof data?.detail?.detail === "string") return data.detail.detail;
  if (typeof data?.message === "string") return data.message;
  return fallbackMessage;
}

export default function PatientPage() {
  const [mode, setMode] = useState("selector");
  const [formData, setFormData] = useState(INITIAL_FORM);
  const [lookupCode, setLookupCode] = useState("");
  const [city, setCity] = useState("");
  const [selectedMockClinic, setSelectedMockClinic] = useState(null);
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

  function resetFlow() {
    setMode("selector");
    setFormData(INITIAL_FORM);
    setLookupCode("");
    setCity("");
    setSelectedMockClinic(null);
    setAccessCode("");
    setCaseInfo(null);
    setCaseStatus(null);
    setClinics([]);
    setSelectedClinic(null);
    setSelectedSlotId("");
    setErrorMessage("");
    setIsCreatingCase(false);
    setIsLookingUp(false);
    setIsLoadingClinics(false);
    setIsLoadingClinic(false);
    setIsBooking(false);
    setIsCancelling(false);
  }

  function handleChange(event) {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));
  }

  async function fetchCaseStatus(code) {
    const response = await fetch(
      `${API_BASE_URL}/api/cases/status?access_code=${encodeURIComponent(code)}`
    );
    const data = await response.json();
    if (!response.ok) throw new Error(getApiError(data, "Unable to load case status."));
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
        throw new Error(getApiError(data, "Unable to create case."));
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
      if (!response.ok) throw new Error(getApiError(data, "Unable to load clinics."));
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
        throw new Error(getApiError(data, "Unable to load clinic details."));
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
      if (!response.ok) throw new Error(getApiError(data, "Unable to book slot."));
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
      if (!response.ok) throw new Error(getApiError(data, "Unable to cancel."));
      await fetchCaseStatus(accessCode);
      if (selectedClinic?.id) await handleSelectClinic(selectedClinic.id);
    } catch (error) {
      setErrorMessage(error.message || "Unable to cancel appointment.");
    } finally {
      setIsCancelling(false);
    }
  }

  function handleSelectMode(nextMode) {
    setErrorMessage("");
    setMode(nextMode);
  }

  async function handleSelectMockClinic(clinic) {
    setSelectedMockClinic(clinic);
    setCity(clinic.city);
    await handleSelectClinic(clinic.id);
    setMode("support");
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(153,53,86,0.12),_transparent_35%),linear-gradient(180deg,_#fff8fa_0%,_#f8fafc_55%,_#ffffff_100%)] px-4 py-10 pt-14 sm:px-6 sm:pt-10 lg:px-8">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8">
        {mode === "selector" ? (
          <StepSelector onSelect={handleSelectMode} />
        ) : null}

        {mode === "accesscode" ? (
          <AccessCodeForm
            lookupCode={lookupCode}
            setLookupCode={setLookupCode}
            onSubmit={handleResumeCase}
            isLoading={isLookingUp}
            onBack={() => setMode("selector")}
          />
        ) : null}

        {mode === "support" && !selectedMockClinic ? (
          <ClinicSearch
            searchTerm={city}
            setSearchTerm={setCity}
            clinics={clinics}
            onSearch={handleSearchClinics}
            isLoading={isLoadingClinics}
            errorMessage={errorMessage}
            selectedClinic={selectedMockClinic}
            onSelectClinic={handleSelectMockClinic}
            onBack={() => setMode("selector")}
          />
        ) : null}

        {mode === "support" && selectedMockClinic ? (
          <PatientForm
            formData={formData}
            onChange={handleChange}
            onSubmit={handleCreateCase}
            isSubmitting={isCreatingCase}
            errorMessage={errorMessage}
            accessCode={accessCode}
            caseInfo={caseInfo}
            selectedClinic={selectedMockClinic}
            onBack={() => {
              setSelectedMockClinic(null);
              setAccessCode("");
              setCaseInfo(null);
              setCaseStatus(null);
            }}
          />
        ) : null}

        {mode !== "support" && errorMessage ? (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
            {errorMessage}
          </div>
        ) : null}

        {accessCode ? (
          <section className="rounded-3xl border border-white/70 bg-white p-5 shadow-[0_24px_60px_rgba(148,163,184,0.14)] sm:p-8">
            <div className="flex flex-col gap-6">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
                <div>
                  <h2 className="text-2xl font-semibold tracking-tight text-slate-900">
                    Continue your care journey
                  </h2>
                  <p className="mt-2 text-sm text-slate-500">
                    Use your access code to manage your case, search live clinic
                    availability, and book or cancel an appointment.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={resetFlow}
                  className="text-sm font-medium text-slate-500 transition hover:text-slate-900"
                >
                  Start over
                </button>
              </div>

              <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
                <section className="rounded-3xl border border-slate-100 bg-white p-6">
                  <div className="mb-5">
                    <h3 className="text-2xl font-semibold tracking-tight text-slate-900">
                      Resume your case
                    </h3>
                    <p className="mt-2 text-sm text-slate-500">
                      Enter your access code to reload your status on another device.
                    </p>
                  </div>

                  <form onSubmit={handleResumeCase} className="flex flex-col gap-4">
                    <input
                      value={lookupCode}
                      onChange={(event) => setLookupCode(event.target.value)}
                      className="rounded-2xl border border-slate-200 px-4 py-3 font-mono text-sm text-slate-900 outline-none transition focus:border-rose-300 focus:ring-2 focus:ring-rose-100"
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
                    <h3 className="text-2xl font-semibold tracking-tight text-slate-900">
                      Find a clinic
                    </h3>
                    <p className="mt-2 text-sm text-slate-500">
                      Search live clinic availability by city and choose a slot.
                    </p>
                  </div>

                  <form onSubmit={handleSearchClinics} className="flex flex-col gap-4">
                    <input
                      value={city}
                      onChange={(event) => setCity(event.target.value)}
                      className="rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-rose-300 focus:ring-2 focus:ring-rose-100"
                      placeholder="Search by city"
                    />
                    <button
                      type="submit"
                      disabled={isLoadingClinics}
                      className="inline-flex items-center justify-center rounded-full px-6 py-3 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                      style={{ backgroundColor: "#993556" }}
                    >
                      Search clinics
                    </button>
                  </form>
                </section>
              </div>

              {caseStatus?.appointment ? (
                <div className="rounded-3xl border border-emerald-200 bg-emerald-50 p-5">
                  <h3 className="text-lg font-semibold text-emerald-900">
                    Appointment booked
                  </h3>
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

              {isLookingUp ? <Spinner text="Loading case..." /> : null}
              {isLoadingClinics ? <Spinner text="Loading clinics..." /> : null}
              {isLoadingClinic ? <Spinner text="Loading slots..." /> : null}
              {isBooking ? <Spinner text="Booking appointment..." /> : null}
              {errorMessage ? (
                <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
                  {errorMessage}
                </div>
              ) : null}

              {clinics.length ? (
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
                        <div className="break-words text-lg font-semibold text-slate-900">
                          {clinic.name}
                        </div>
                        <div className="mt-2 break-words text-sm text-slate-600">
                          {clinic.doctor_name}
                        </div>
                        <div className="mt-3 break-words text-sm text-slate-500">
                          {clinic.address}
                        </div>
                        <div className="mt-1 text-sm text-slate-500">
                          {clinic.city}
                        </div>
                      </button>
                    ))}
                  </div>

                  <div className="rounded-3xl border border-slate-100 bg-slate-50 p-5">
                    <h3 className="text-lg font-semibold text-slate-900">
                      Available slots
                    </h3>
                    <p className="mt-2 text-sm text-slate-500">
                      Select a clinic to see and book open appointments.
                    </p>

                    {selectedClinic ? (
                      <div className="mt-5 flex flex-col gap-4">
                        <div className="rounded-2xl border border-slate-200 bg-white p-4">
                          <div className="break-words text-base font-semibold text-slate-900">
                            {selectedClinic.name}
                          </div>
                          <div className="mt-1 break-words text-sm text-slate-600">
                            {selectedClinic.doctor_name}
                          </div>
                          <div className="mt-2 break-words text-sm text-slate-500">
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
                          style={{ backgroundColor: "#993556" }}
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
              ) : null}
            </div>
          </section>
        ) : null}
      </div>
    </main>
  );
}
