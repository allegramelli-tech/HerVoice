"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import ClinicLogin from "../../components/clinic/ClinicLogin";
import ClinicInterface from "../../components/clinic/ClinicInterface";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

const CLINIC_DEMO_ACCOUNTS = {
  "paris@hervoice.org": {
    password: "123",
    city: "Paris",
    label: "Clinique Santé Paris",
  },
  "lyon@hervoice.org": {
    password: "123",
    city: "Lyon",
    label: "Clinique Horizon Lyon",
  },
  "marseille@hervoice.org": {
    password: "123",
    city: "Marseille",
    label: "Clinique Marseille",
  },
};

const INITIAL_VERIFICATION_FIELDS = {
  lastName: "",
  firstName: "",
  insuranceNumber: "",
  birthDate: "",
};

function getUiStatus(caseItem) {
  const status = String(caseItem?.status || "").toLowerCase();

  if (status === "released") {
    return "Released";
  }

  if (status === "active") {
    return "Confirmed";
  }

  return "Pending";
}

function getApiError(data, fallbackMessage) {
  if (typeof data?.detail === "string") return data.detail;
  if (typeof data?.detail?.detail === "string") return data.detail.detail;
  if (typeof data?.message === "string") return data.message;
  return fallbackMessage;
}

export default function ClinicPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [credentials, setCredentials] = useState({ email: "", password: "" });
  const [loginError, setLoginError] = useState("");
  const [activeClinicAccount, setActiveClinicAccount] = useState(null);
  const [clinics, setClinics] = useState([]);
  const [clinicsError, setClinicsError] = useState("");
  const [isLoadingClinics, setIsLoadingClinics] = useState(false);
  const [selectedClinicId, setSelectedClinicId] = useState("");
  const [slotDateTime, setSlotDateTime] = useState("");
  const [slotError, setSlotError] = useState("");
  const [slotSuccess, setSlotSuccess] = useState("");
  const [isCreatingSlot, setIsCreatingSlot] = useState(false);
  const [deletingSlotId, setDeletingSlotId] = useState("");
  const [verification, setVerification] = useState(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [actionError, setActionError] = useState("");
  const [dashboard, setDashboard] = useState(null);
  const [isLoadingRequests, setIsLoadingRequests] = useState(false);
  const [requestsError, setRequestsError] = useState("");
  const [requestFilter, setRequestFilter] = useState("all");
  const [selectedRequestId, setSelectedRequestId] = useState("");
  const [verificationFields, setVerificationFields] = useState(
    INITIAL_VERIFICATION_FIELDS
  );

  const loadRequests = useCallback(async () => {
    setIsLoadingRequests(true);
    setRequestsError("");

    try {
      const response = await fetch(`${API_BASE_URL}/api/dashboard`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(getApiError(data, "Unable to load clinic requests."));
      }

      setDashboard(data);
    } catch (error) {
      setRequestsError(
        error.message || "Unable to load incoming requests right now."
      );
    } finally {
      setIsLoadingRequests(false);
    }
  }, []);

  const loadClinics = useCallback(async () => {
    setIsLoadingClinics(true);
    setClinicsError("");

    try {
      const response = await fetch(`${API_BASE_URL}/api/clinics`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(getApiError(data, "Unable to load clinics."));
      }

      setClinics(data);
      setSelectedClinicId((current) => {
        const targetClinic = activeClinicAccount
          ? data.find((clinic) => clinic.city === activeClinicAccount.city)
          : null;

        if (targetClinic) {
          return targetClinic.id;
        }

        if (current && data.some((clinic) => clinic.id === current)) {
          return current;
        }

        return "";
      });
    } catch (error) {
      setClinicsError(error.message || "Unable to load clinics right now.");
    } finally {
      setIsLoadingClinics(false);
    }
  }, [activeClinicAccount]);

  useEffect(() => {
    if (!isLoggedIn) {
      return;
    }

    loadRequests();
    loadClinics();
  }, [isLoggedIn, loadClinics, loadRequests]);

  const selectedClinic = useMemo(() => {
    return clinics.find((clinic) => clinic.id === selectedClinicId) || null;
  }, [clinics, selectedClinicId]);

  const incomingRequests = useMemo(() => {
    const requests = (dashboard?.cases || []).filter((caseItem) => caseItem.appointment_id);

    if (!selectedClinic) {
      return requests;
    }

    return requests.filter(
      (caseItem) => caseItem.clinic_name === selectedClinic.name
    );
  }, [dashboard, selectedClinic]);

  const filteredRequests = useMemo(() => {
    if (requestFilter === "all") {
      return incomingRequests;
    }

    return incomingRequests.filter(
      (caseItem) => getUiStatus(caseItem).toLowerCase() === requestFilter
    );
  }, [incomingRequests, requestFilter]);

  const selectedRequest = useMemo(() => {
    return (
      incomingRequests.find((caseItem) => caseItem.case_id === selectedRequestId) ||
      null
    );
  }, [incomingRequests, selectedRequestId]);

  useEffect(() => {
    if (!selectedRequestId) {
      return;
    }

    const isVisible = filteredRequests.some(
      (caseItem) => caseItem.case_id === selectedRequestId
    );

    if (!isVisible) {
      setSelectedRequestId("");
      setVerification(null);
      setActionError("");
      setVerificationFields(INITIAL_VERIFICATION_FIELDS);
    }
  }, [filteredRequests, selectedRequestId]);

  function handleCredentialChange(event) {
    const { name, value } = event.target;
    setCredentials((current) => ({ ...current, [name]: value }));
  }

  function handleLogin(event) {
    event.preventDefault();
    setLoginError("");

    if (!credentials.email.trim() || !credentials.password.trim()) {
      setLoginError("Please enter an email and password to continue.");
      return;
    }

    const normalizedEmail = credentials.email.trim().toLowerCase();
    const account = CLINIC_DEMO_ACCOUNTS[normalizedEmail];

    if (!account || credentials.password.trim() !== account.password) {
      setLoginError("This clinic account is not recognized.");
      return;
    }

    setActiveClinicAccount({
      email: normalizedEmail,
      ...account,
    });
    setIsLoggedIn(true);
  }

  function handleVerificationFieldChange(event) {
    const { name, value } = event.target;
    setVerificationFields((current) => ({ ...current, [name]: value }));
  }

  async function handleCreateSlot(event) {
    event.preventDefault();
    setSlotError("");
    setSlotSuccess("");

    if (!selectedClinicId) {
      setSlotError("Choose a clinic before creating a time slot.");
      return;
    }

    if (!slotDateTime) {
      setSlotError("Choose a date and time for the new slot.");
      return;
    }

    setIsCreatingSlot(true);

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/clinics/${selectedClinicId}/slots`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ slot_datetime: slotDateTime }),
        }
      );
      const data = await response.json();

      if (!response.ok) {
        throw new Error(getApiError(data, "Unable to create a new time slot."));
      }

      setSlotSuccess("Time slot created successfully.");
      setSlotDateTime("");
      await Promise.all([loadClinics(), loadRequests()]);
    } catch (error) {
      setSlotError(error.message || "Unable to create a new time slot.");
    } finally {
      setIsCreatingSlot(false);
    }
  }

  async function handleDeleteSlot(slotId) {
    setSlotError("");
    setSlotSuccess("");

    if (!selectedClinicId || !slotId) {
      setSlotError("Choose a valid slot before deleting it.");
      return;
    }

    setDeletingSlotId(slotId);

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/clinics/${selectedClinicId}/slots/${slotId}`,
        {
          method: "DELETE",
        }
      );
      const data = await response.json();

      if (!response.ok) {
        throw new Error(getApiError(data, "Unable to delete this time slot."));
      }

      setSlotSuccess(data.message || "Time slot deleted successfully.");
      await Promise.all([loadClinics(), loadRequests()]);
    } catch (error) {
      setSlotError(error.message || "Unable to delete this time slot.");
    } finally {
      setDeletingSlotId("");
    }
  }

  function handleSelectRequest(request) {
    setSelectedRequestId(request.case_id);
    setVerification(null);
    setActionError("");
    setVerificationFields(INITIAL_VERIFICATION_FIELDS);
  }

  function handleCloseVerification() {
    setSelectedRequestId("");
    setVerification(null);
    setActionError("");
    setVerificationFields(INITIAL_VERIFICATION_FIELDS);
  }

  async function handleVerify(event) {
    event.preventDefault();
    setActionError("");
    setVerification(null);

    if (!selectedRequest) {
      setActionError("Select a reservation before you verify.");
      return;
    }

    if (
      !verificationFields.lastName.trim() ||
      !verificationFields.firstName.trim() ||
      !verificationFields.insuranceNumber.trim() ||
      !verificationFields.birthDate.trim()
    ) {
      setActionError("Complete all verification fields before continuing.");
      return;
    }

    setIsVerifying(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/clinic/verify-and-release`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          patient_identity: {
            name: `${verificationFields.firstName.trim()} ${verificationFields.lastName.trim()}`.trim(),
            date_of_birth: verificationFields.birthDate,
            insurance_number: verificationFields.insuranceNumber.trim(),
          },
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          getApiError(data, "Unable to verify and release this reservation.")
        );
      }

      setVerification(data);
      await loadRequests();

      if (data.case_id) {
        setSelectedRequestId(data.case_id);
      }
    } catch (error) {
      setActionError(
        error.message || "Unable to verify this reservation right now."
      );
    } finally {
      setIsVerifying(false);
    }
  }

  if (!isLoggedIn) {
    return (
      <ClinicLogin
        credentials={credentials}
        loginError={loginError}
        onCredentialChange={handleCredentialChange}
        onSubmit={handleLogin}
      />
    );
  }

  return (
    <ClinicInterface
      onSignOut={() => {
        setIsLoggedIn(false);
        setCredentials({ email: "", password: "" });
        setActiveClinicAccount(null);
        setClinics([]);
        setClinicsError("");
        setSelectedClinicId("");
        setSlotDateTime("");
        setSlotError("");
        setSlotSuccess("");
        setDeletingSlotId("");
        setVerification(null);
        setActionError("");
        setRequestFilter("all");
        setSelectedRequestId("");
        setVerificationFields(INITIAL_VERIFICATION_FIELDS);
      }}
      isLoadingRequests={isLoadingRequests}
      requestsError={requestsError}
      clinics={clinics}
      clinicsError={clinicsError}
      isLoadingClinics={isLoadingClinics}
      activeClinicAccount={activeClinicAccount}
      selectedClinic={selectedClinic}
      slotDateTime={slotDateTime}
      onSlotDateTimeChange={setSlotDateTime}
      onCreateSlot={handleCreateSlot}
      isCreatingSlot={isCreatingSlot}
      onDeleteSlot={handleDeleteSlot}
      deletingSlotId={deletingSlotId}
      slotError={slotError}
      slotSuccess={slotSuccess}
      incomingRequests={incomingRequests}
      filteredRequests={filteredRequests}
      requestFilter={requestFilter}
      setRequestFilter={setRequestFilter}
      selectedRequest={selectedRequest}
      onSelectRequest={handleSelectRequest}
      verificationFields={verificationFields}
      onVerificationFieldChange={handleVerificationFieldChange}
      onVerify={handleVerify}
      onCloseVerification={handleCloseVerification}
      isVerifying={isVerifying}
      actionError={actionError}
      verification={verification}
      getUiStatus={getUiStatus}
    />
  );
}
