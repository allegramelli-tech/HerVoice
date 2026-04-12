"use client";

import { useEffect, useMemo, useState } from "react";
import FunderLogin from "../../components/funder/FunderLogin";
import FunderDashboard from "../../components/funder/FunderDashboard";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

function getUiStatus(caseItem) {
  const status = String(caseItem?.status || "").toLowerCase();

  if (status === "released") {
    return "released";
  }

  if (status === "active") {
    return "confirmed";
  }

  return "pending";
}

function getApiError(data, fallbackMessage) {
  if (typeof data?.detail === "string") return data.detail;
  if (typeof data?.detail?.detail === "string") return data.detail.detail;
  if (typeof data?.message === "string") return data.message;
  return fallbackMessage;
}

export default function FunderPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [credentials, setCredentials] = useState({ email: "", password: "" });
  const [loginError, setLoginError] = useState("");
  const [dashboard, setDashboard] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [dashboardError, setDashboardError] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedCaseId, setSelectedCaseId] = useState("");
  const [createError, setCreateError] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [createdCase, setCreatedCase] = useState(null);

  async function loadDashboard() {
    setIsLoading(true);
    setDashboardError("");

    try {
      const response = await fetch(`${API_BASE_URL}/api/dashboard`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(getApiError(data, "Unable to load the dashboard."));
      }

      setDashboard(data);
    } catch (error) {
      setDashboardError(
        error.message || "Unable to load funding cases right now."
      );
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    if (!isLoggedIn) {
      return;
    }

    loadDashboard();
  }, [isLoggedIn]);

  const cases = useMemo(() => dashboard?.cases || [], [dashboard]);

  const filteredCases = useMemo(() => {
    return cases.filter((caseItem) => {
      const uiStatus = getUiStatus(caseItem);
      return statusFilter === "all" ? true : uiStatus === statusFilter;
    });
  }, [cases, statusFilter]);

  const fundableCases = useMemo(() => {
    return cases.filter((caseItem) => getUiStatus(caseItem) === "pending");
  }, [cases]);

  const selectedCase = useMemo(() => {
    return cases.find((caseItem) => caseItem.case_id === selectedCaseId) || null;
  }, [cases, selectedCaseId]);

  const confirmedCount = useMemo(() => {
    return cases.filter((caseItem) => getUiStatus(caseItem) === "confirmed").length;
  }, [cases]);

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

    setIsLoggedIn(true);
  }

  async function handleCreateFundingCase(event) {
    event.preventDefault();
    setCreateError("");
    setCreatedCase(null);

    if (!selectedCaseId) {
      setCreateError("Select an upcoming reservation before locking funds.");
      return;
    }

    setIsCreating(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/fund`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ case_id: selectedCaseId }),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          getApiError(data, "Unable to create funding case.")
        );
      }

      setCreatedCase({
        ...data,
        patient_hash: selectedCase?.patient_hash || null,
        clinic_name: selectedCase?.clinic_name || null,
        slot_datetime: selectedCase?.slot_datetime || null,
      });
      await loadDashboard();
    } catch (error) {
      setCreateError(
        error.message || "Unable to create funding case right now."
      );
    } finally {
      setIsCreating(false);
    }
  }

  if (!isLoggedIn) {
    return (
      <FunderLogin
        credentials={credentials}
        loginError={loginError}
        onCredentialChange={handleCredentialChange}
        onSubmit={handleLogin}
      />
    );
  }

  return (
    <FunderDashboard
      onSignOut={() => {
        setIsLoggedIn(false);
        setCredentials({ email: "", password: "" });
      }}
      isLoading={isLoading}
      dashboardError={dashboardError}
      createError={createError}
      dashboard={dashboard}
      confirmedCount={confirmedCount}
      selectedCase={selectedCase}
      selectedCaseId={selectedCaseId}
      setSelectedCaseId={setSelectedCaseId}
      fundableCases={fundableCases}
      onCreateFundingCase={handleCreateFundingCase}
      isCreating={isCreating}
      createdCase={createdCase}
      statusFilter={statusFilter}
      setStatusFilter={setStatusFilter}
      filteredCases={filteredCases}
      getUiStatus={getUiStatus}
    />
  );
}
