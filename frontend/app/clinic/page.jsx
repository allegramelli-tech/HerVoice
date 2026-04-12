"use client";

import { useEffect, useMemo, useState } from "react";
import ClinicLogin from "../../components/clinic/ClinicLogin";
import ClinicInterface from "../../components/clinic/ClinicInterface";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

const INITIAL_VERIFICATION_FIELDS = {
  lastName: "",
  firstName: "",
  insuranceNumber: "",
  birthDate: "",
};

function getUiStatus(caseItem) {
  if (caseItem.case_status === "released") {
    return "Released";
  }

  if (caseItem.case_status === "active") {
    return "Confirmed";
  }

  return "Pending";
}

export default function ClinicPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [credentials, setCredentials] = useState({ email: "", password: "" });
  const [loginError, setLoginError] = useState("");
  const [voucherId, setVoucherId] = useState("");
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

  useEffect(() => {
    if (!isLoggedIn) {
      return;
    }

    async function loadRequests() {
      setIsLoadingRequests(true);
      setRequestsError("");

      try {
        const response = await fetch(`${API_BASE_URL}/api/dashboard`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.detail || "Unable to load clinic requests.");
        }

        setDashboard(data);
      } catch (error) {
        setRequestsError(
          error.message || "Unable to load incoming requests right now."
        );
      } finally {
        setIsLoadingRequests(false);
      }
    }

    loadRequests();
  }, [isLoggedIn]);

  const incomingRequests = useMemo(() => {
    return (dashboard?.cases || []).filter((caseItem) => caseItem.voucher_id);
  }, [dashboard]);

  const filteredRequests = useMemo(() => {
    if (requestFilter === "all") {
      return incomingRequests;
    }

    return incomingRequests.filter(
      (caseItem) => getUiStatus(caseItem).toLowerCase() === requestFilter
    );
  }, [incomingRequests, requestFilter]);

  const selectedRequest = useMemo(() => {
    return incomingRequests.find((caseItem) => caseItem.case_id === selectedRequestId) || null;
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
      setVoucherId("");
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

    setIsLoggedIn(true);
  }

  function handleVerificationFieldChange(event) {
    const { name, value } = event.target;
    setVerificationFields((current) => ({ ...current, [name]: value }));
  }

  function handleSelectRequest(request) {
    setSelectedRequestId(request.case_id);
    setVoucherId(request.voucher_id || "");
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

    if (!voucherId.trim()) {
      setActionError("This reservation is missing a verification key.");
      return;
    }

    setIsVerifying(true);

    try {
      const verifyResponse = await fetch(`${API_BASE_URL}/api/clinic/verify`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ voucher_id: voucherId.trim() }),
      });

      const verifyData = await verifyResponse.json();

      if (!verifyResponse.ok) {
        throw new Error(
          verifyData.detail || verifyData.message || "Unable to verify reservation."
        );
      }

      let caseId = null;

      const voucherResponse = await fetch(
        `${API_BASE_URL}/api/voucher/${encodeURIComponent(voucherId.trim())}`
      );

      if (voucherResponse.ok) {
        const voucherData = await voucherResponse.json();
        caseId = voucherData.funding_case_id;
      }

      setVerification({
        ...verifyData,
        case_id: caseId,
      });
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
        setVoucherId("");
        setVerification(null);
        setActionError("");
        setRequestFilter("all");
        setSelectedRequestId("");
        setVerificationFields(INITIAL_VERIFICATION_FIELDS);
      }}
      isLoadingRequests={isLoadingRequests}
      requestsError={requestsError}
      incomingRequests={incomingRequests}
      filteredRequests={filteredRequests}
      requestFilter={requestFilter}
      setRequestFilter={setRequestFilter}
      selectedRequest={selectedRequest}
      onSelectRequest={handleSelectRequest}
      verificationFields={verificationFields}
      onVerificationFieldChange={handleVerificationFieldChange}
      onVerify={handleVerify}
      isVerifying={isVerifying}
      actionError={actionError}
      verification={verification}
      getUiStatus={getUiStatus}
    />
  );
}
