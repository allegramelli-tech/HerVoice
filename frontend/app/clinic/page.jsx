"use client";

import { useEffect, useMemo, useState } from "react";
import ClinicLogin from "../../components/clinic/ClinicLogin";
import ClinicInterface from "../../components/clinic/ClinicInterface";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

function getUiStatus(caseItem) {
  if (caseItem.case_status === "released") {
    return "Released";
  }

  if (caseItem.case_status === "active") {
    return "Confirmed";
  }

  return "Pending";
}

function formatAnonymousId(caseId) {
  const compact = (caseId || "").replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
  return `DID-${compact.slice(-6).padStart(6, "0")}`;
}

export default function ClinicPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [credentials, setCredentials] = useState({ email: "", password: "" });
  const [loginError, setLoginError] = useState("");
  const [voucherId, setVoucherId] = useState("");
  const [verification, setVerification] = useState(null);
  const [confirmResult, setConfirmResult] = useState(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);
  const [actionError, setActionError] = useState("");
  const [dashboard, setDashboard] = useState(null);
  const [isLoadingRequests, setIsLoadingRequests] = useState(false);
  const [requestsError, setRequestsError] = useState("");

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

  async function handleVerify(event) {
    event.preventDefault();
    setActionError("");
    setConfirmResult(null);
    setVerification(null);

    if (!voucherId.trim()) {
      setActionError("Enter a reservation ID to verify.");
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

  async function handleConfirm() {
    setActionError("");
    setConfirmResult(null);

    if (!verification?.valid || verification.status === "redeemed") {
      return;
    }

    setIsConfirming(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/clinic/confirm`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ voucher_id: voucherId.trim() }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || data.message || "Unable to confirm service.");
      }

      setConfirmResult(data);
      setVerification((current) =>
        current
          ? {
              ...current,
              status: "redeemed",
              case_id: data.case_id,
              amount_xrp: data.amount_xrp,
            }
          : current
      );

      const dashboardResponse = await fetch(`${API_BASE_URL}/api/dashboard`);
      if (dashboardResponse.ok) {
        const dashboardData = await dashboardResponse.json();
        setDashboard(dashboardData);
      }
    } catch (error) {
      setActionError(
        error.message || "Unable to confirm this service right now."
      );
    } finally {
      setIsConfirming(false);
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
      }}
      voucherId={voucherId}
      setVoucherId={setVoucherId}
      onVerify={handleVerify}
      onConfirm={handleConfirm}
      isVerifying={isVerifying}
      isConfirming={isConfirming}
      actionError={actionError}
      verification={verification}
      confirmResult={confirmResult}
      isLoadingRequests={isLoadingRequests}
      requestsError={requestsError}
      incomingRequests={incomingRequests}
      setVerification={setVerification}
      setConfirmResult={setConfirmResult}
      setActionError={setActionError}
      setVoucherFromCase={setVoucherId}
      getUiStatus={getUiStatus}
      formatAnonymousId={formatAnonymousId}
    />
  );
}
