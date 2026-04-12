"use client";

import { useMemo, useState } from "react";
import StepSelector from "../../components/patient/StepSelector";
import AccessCodeForm from "../../components/patient/AccessCodeForm";
import ClinicSearch from "../../components/patient/ClinicSearch";
import PatientForm from "../../components/patient/PatientForm";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
const DEFAULT_SUPPORT_AMOUNT_EUR = 5;

const INITIAL_FORM = {
  firstName: "",
  lastName: "",
  birthDate: "",
  email: "",
  country: "",
  insuranceType: "",
  insuranceProvider: "",
  insuranceNumber: "",
};

function getApiError(data, fallbackMessage) {
  if (typeof data?.detail === "string") return data.detail;
  if (Array.isArray(data?.detail) && data.detail.length) {
    return data.detail
      .map((item) => item?.msg || item?.message || String(item))
      .join(" ");
  }
  if (typeof data?.detail?.detail === "string") return data.detail.detail;
  if (typeof data?.message === "string") return data.message;
  return fallbackMessage;
}

function matchesClinicSearch(clinic, term) {
  const query = term.trim().toLowerCase();

  if (!query) {
    return true;
  }

  return [clinic.city, clinic.name, clinic.doctor_name].some((value) =>
    String(value || "").toLowerCase().includes(query)
  );
}

function isAtLeastFourteen(dateString) {
  if (!dateString) {
    return false;
  }

  const birthDate = new Date(dateString);

  if (Number.isNaN(birthDate.getTime())) {
    return false;
  }

  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const hasHadBirthdayThisYear =
    today.getMonth() > birthDate.getMonth() ||
    (today.getMonth() === birthDate.getMonth() &&
      today.getDate() >= birthDate.getDate());

  if (!hasHadBirthdayThisYear) {
    age -= 1;
  }

  return age >= 14;
}

export default function PatientPage() {
  const [mode, setMode] = useState("selector");
  const [formData, setFormData] = useState(INITIAL_FORM);
  const [searchTerm, setSearchTerm] = useState("");
  const [clinics, setClinics] = useState([]);
  const [selectedClinic, setSelectedClinic] = useState(null);
  const [selectedSlotId, setSelectedSlotId] = useState("");
  const [submittedCase, setSubmittedCase] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoadingClinics, setIsLoadingClinics] = useState(false);
  const [isCreatingCase, setIsCreatingCase] = useState(false);

  const selectedSlot = useMemo(() => {
    return (
      selectedClinic?.available_slots?.find((slot) => slot.id === selectedSlotId) ||
      null
    );
  }, [selectedClinic, selectedSlotId]);

  function resetFlow() {
    setMode("selector");
    setFormData(INITIAL_FORM);
    setSearchTerm("");
    setClinics([]);
    setSelectedClinic(null);
    setSelectedSlotId("");
    setSubmittedCase(null);
    setErrorMessage("");
    setIsLoadingClinics(false);
    setIsCreatingCase(false);
  }

  function handleChange(event) {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));
  }

  async function handleSearchClinics(event) {
    event.preventDefault();
    setErrorMessage("");
    setIsLoadingClinics(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/clinics`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(getApiError(data, "Unable to load clinics."));
      }

      setClinics(data.filter((clinic) => matchesClinicSearch(clinic, searchTerm)));
    } catch (error) {
      setErrorMessage(error.message || "Unable to load clinics right now.");
    } finally {
      setIsLoadingClinics(false);
    }
  }

  function handleSelectClinic(clinic) {
    setErrorMessage("");
    setSelectedClinic(clinic);
    setSelectedSlotId("");
    setSubmittedCase(null);
    setMode("support");
  }

  async function handleCreateCase(event) {
    event.preventDefault();
    setErrorMessage("");

    const required = [
      formData.firstName,
      formData.lastName,
      formData.birthDate,
      formData.email,
      formData.country,
      formData.insuranceType,
      formData.insuranceProvider,
      formData.insuranceNumber,
      selectedSlotId,
    ];

    if (required.some((value) => !String(value || "").trim())) {
      setErrorMessage("Please complete all fields and choose a time slot.");
      return;
    }

    if (!isAtLeastFourteen(formData.birthDate)) {
      setErrorMessage("The patient must be at least 14 years old.");
      return;
    }

    setIsCreatingCase(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/cases`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patient_identity: {
            name: `${formData.firstName.trim()} ${formData.lastName.trim()}`.trim(),
            date_of_birth: formData.birthDate,
            insurance_number: formData.insuranceNumber.trim(),
          },
          email: formData.email.trim(),
          country: formData.country,
          slot_id: selectedSlotId,
          amount_xrp: DEFAULT_SUPPORT_AMOUNT_EUR,
        }),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(getApiError(data, "Unable to create your reservation."));
      }

      setSubmittedCase(data);
      setErrorMessage("");
    } catch (error) {
      setErrorMessage(error.message || "Unable to create your reservation.");
    } finally {
      setIsCreatingCase(false);
    }
  }

  function handleSelectMode(nextMode) {
    setErrorMessage("");
    setMode(nextMode);
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(153,53,86,0.12),_transparent_35%),linear-gradient(180deg,_#fff8fa_0%,_#f8fafc_55%,_#ffffff_100%)] px-4 py-10 pt-14 sm:px-6 sm:pt-10 lg:px-8">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8">
        {mode === "selector" ? <StepSelector onSelect={handleSelectMode} /> : null}

        {mode === "accesscode" ? (
          <AccessCodeForm
            onRequestSupport={() => {
              setErrorMessage("");
              setMode("support");
            }}
            onBack={() => setMode("selector")}
          />
        ) : null}

        {mode === "support" && !selectedClinic ? (
          <ClinicSearch
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            clinics={clinics}
            onSearch={handleSearchClinics}
            isLoading={isLoadingClinics}
            errorMessage={errorMessage}
            selectedClinic={selectedClinic}
            onSelectClinic={handleSelectClinic}
            onBack={() => setMode("selector")}
          />
        ) : null}

        {mode === "support" && selectedClinic ? (
          <PatientForm
            formData={formData}
            onChange={handleChange}
            onSubmit={handleCreateCase}
            isSubmitting={isCreatingCase}
            errorMessage={errorMessage}
            submittedCase={submittedCase}
            selectedClinic={selectedClinic}
            selectedSlot={selectedSlot}
            selectedSlotId={selectedSlotId}
            onSelectSlot={setSelectedSlotId}
            onBack={() => {
              setSubmittedCase(null);
              setSelectedClinic(null);
              setSelectedSlotId("");
              setErrorMessage("");
            }}
          />
        ) : null}

      </div>
    </main>
  );
}
