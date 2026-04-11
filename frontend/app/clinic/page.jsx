"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
const BRAND_COLOR = "#993556";

function HerVoiceLogo() {
  return (
    <div className="flex items-center gap-3">
      <svg
        aria-hidden="true"
        viewBox="0 0 24 24"
        className="h-5 w-5"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
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
      <span className="text-lg font-semibold tracking-tight text-slate-900">
        HerVoice
      </span>
    </div>
  );
}

function Spinner({ text }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600 shadow-sm">
      <span className="h-5 w-5 animate-spin rounded-full border-2 border-slate-200 border-t-slate-700" />
      <span>{text}</span>
    </div>
  );
}

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
      setActionError("Enter a voucher ID to verify.");
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
          verifyData.detail || verifyData.message || "Unable to verify voucher."
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
        error.message || "Unable to verify this voucher right now."
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
      <main className="flex min-h-screen items-center justify-center bg-[linear-gradient(180deg,_#fff7fa_0%,_#f8fafc_100%)] px-4 py-10">
        <div className="w-full max-w-md rounded-3xl border border-white/70 bg-white p-8 shadow-[0_24px_60px_rgba(148,163,184,0.16)]">
          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-4">
              <HerVoiceLogo />
              <div className="inline-flex w-fit rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-slate-700">
                Clinic portal
              </div>
            </div>

            <form onSubmit={handleLogin} className="flex flex-col gap-4">
              <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
                Email
                <input
                  type="email"
                  name="email"
                  value={credentials.email}
                  onChange={handleCredentialChange}
                  className="rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
                  placeholder="clinic@example.org"
                />
              </label>

              <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
                Password
                <input
                  type="password"
                  name="password"
                  value={credentials.password}
                  onChange={handleCredentialChange}
                  className="rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
                  placeholder="Enter password"
                />
              </label>

              {loginError ? (
                <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
                  {loginError}
                </div>
              ) : null}

              <button
                type="submit"
                className="inline-flex items-center justify-center rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                Sign in
              </button>
            </form>

            <Link
              href="/funder"
              className="text-sm font-medium text-slate-600 underline-offset-4 transition hover:text-slate-900 hover:underline"
            >
              Sign in as a funder instead
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,_#fff8fa_0%,_#f8fafc_48%,_#ffffff_100%)]">
      <header className="border-b border-white/70 bg-white/85 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-5 sm:px-6 lg:px-8">
          <HerVoiceLogo />
          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="text-sm font-semibold text-slate-900">
                Berlin Partner Clinic
              </div>
              <div className="text-xs text-slate-500">Verified clinic access</div>
            </div>
            <button
              type="button"
              onClick={() => {
                setIsLoggedIn(false);
                setCredentials({ email: "", password: "" });
              }}
              className="rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition hover:border-slate-300 hover:text-slate-900"
            >
              Sign out
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-7xl gap-6 px-4 py-8 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:px-8">
        <section className="rounded-3xl border border-white/70 bg-white p-6 shadow-[0_20px_50px_rgba(148,163,184,0.12)]">
          <div className="flex flex-col gap-6">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
                Voucher verification
              </h1>
              <p className="mt-2 text-sm text-slate-500">
                Verify the voucher before confirming that care has been provided.
              </p>
            </div>

            <form onSubmit={handleVerify} className="flex flex-col gap-4">
              <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
                Voucher ID
                <input
                  value={voucherId}
                  onChange={(event) => setVoucherId(event.target.value)}
                  className="rounded-2xl border border-slate-200 px-4 py-3 font-mono text-sm text-slate-900 outline-none transition focus:border-rose-300 focus:ring-2 focus:ring-rose-100"
                  placeholder="Paste voucher ID"
                />
              </label>

              <div className="flex flex-col gap-3 sm:flex-row">
                <button
                  type="submit"
                  disabled={isVerifying || isConfirming}
                  className="inline-flex items-center justify-center rounded-full px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                  style={{ backgroundColor: BRAND_COLOR }}
                >
                  Verify
                </button>
                <button
                  type="button"
                  onClick={handleConfirm}
                  disabled={
                    isVerifying ||
                    isConfirming ||
                    !verification?.valid ||
                    verification?.status === "redeemed"
                  }
                  className="inline-flex items-center justify-center rounded-full bg-emerald-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:bg-emerald-300"
                >
                  Confirm service
                </button>
              </div>
            </form>

            {isVerifying ? <Spinner text="Checking voucher..." /> : null}
            {isConfirming ? (
              <Spinner text="Waiting for XRPL confirmation..." />
            ) : null}

            {actionError ? (
              <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
                {actionError}
              </div>
            ) : null}

            {verification ? (
              <div className="rounded-3xl border border-slate-100 bg-slate-50 p-5">
                <div className="mb-4 flex items-center justify-between gap-3">
                  <h2 className="text-lg font-semibold text-slate-900">
                    Verification result
                  </h2>
                  <span
                    className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${
                      verification.valid
                        ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                        : "border-rose-200 bg-rose-50 text-rose-700"
                    }`}
                  >
                    {verification.valid ? "Valid" : "Invalid"}
                  </span>
                </div>

                <div className="grid gap-4 text-sm sm:grid-cols-2">
                  <div>
                    <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                      Voucher ID
                    </div>
                    <div className="mt-2 font-mono text-slate-900">
                      {verification.voucher_id}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                      Amount
                    </div>
                    <div className="mt-2 font-medium text-slate-900">
                      {verification.amount_xrp ?? "-"} XRP
                    </div>
                  </div>
                  <div>
                    <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                      Status
                    </div>
                    <div className="mt-2 font-medium text-slate-900">
                      {verification.status || "Unavailable"}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                      Case ID
                    </div>
                    <div className="mt-2 font-mono text-slate-900">
                      {verification.case_id || "Unavailable"}
                    </div>
                  </div>
                </div>

                <p className="mt-4 text-sm text-slate-600">
                  {verification.message}
                </p>
              </div>
            ) : null}

            {confirmResult ? (
              <div className="rounded-3xl border border-emerald-200 bg-emerald-50 p-5">
                <h2 className="text-lg font-semibold text-emerald-900">
                  Payment released
                </h2>
                <p className="mt-2 text-sm text-emerald-800">
                  Payment has been released successfully.
                </p>
                <div className="mt-4 grid gap-4 text-sm sm:grid-cols-2">
                  <div>
                    <div className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700">
                      Voucher ID
                    </div>
                    <div className="mt-2 font-mono text-emerald-900">
                      {confirmResult.voucher_id}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700">
                      Amount
                    </div>
                    <div className="mt-2 font-medium text-emerald-900">
                      {confirmResult.amount_xrp} XRP
                    </div>
                  </div>
                  <div className="sm:col-span-2">
                    <div className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700">
                      Payment tx hash
                    </div>
                    <div className="mt-2 break-all font-mono text-emerald-900">
                      {confirmResult.tx_hash}
                    </div>
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        </section>

        <section className="rounded-3xl border border-white/70 bg-white p-6 shadow-[0_20px_50px_rgba(148,163,184,0.12)]">
          <div className="flex flex-col gap-4">
            <div>
              <h2 className="text-2xl font-semibold tracking-tight text-slate-900">
                Incoming requests
              </h2>
              <p className="mt-2 text-sm text-slate-500">
                The current backend uses a single configured clinic wallet, so the
                dashboard cases are treated as requests for this clinic.
              </p>
            </div>

            {isLoadingRequests ? <Spinner text="Loading incoming requests..." /> : null}

            {requestsError ? (
              <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
                {requestsError}
              </div>
            ) : null}

            <div className="overflow-hidden rounded-3xl border border-slate-100">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-100 text-left">
                  <thead className="bg-slate-50">
                    <tr className="text-xs uppercase tracking-[0.18em] text-slate-400">
                      <th className="px-4 py-4 font-semibold">Anonymous ID</th>
                      <th className="px-4 py-4 font-semibold">Voucher</th>
                      <th className="px-4 py-4 font-semibold">Amount</th>
                      <th className="px-4 py-4 font-semibold">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white text-sm text-slate-700">
                    {incomingRequests.length ? (
                      incomingRequests.map((caseItem) => (
                        <tr
                          key={caseItem.case_id}
                          onClick={() => {
                            setVoucherId(caseItem.voucher_id || "");
                            setVerification(null);
                            setConfirmResult(null);
                            setActionError("");
                          }}
                          className="cursor-pointer transition hover:bg-rose-50/70"
                        >
                          <td className="px-4 py-4 font-mono text-slate-900">
                            {formatAnonymousId(caseItem.case_id)}
                          </td>
                          <td className="px-4 py-4 font-mono text-xs text-slate-600">
                            {caseItem.voucher_id}
                          </td>
                          <td className="px-4 py-4 font-medium text-slate-900">
                            {caseItem.amount_xrp} XRP
                          </td>
                          <td className="px-4 py-4">
                            <span className="inline-flex rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-700">
                              {getUiStatus(caseItem)}
                            </span>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan="4"
                          className="px-4 py-10 text-center text-sm text-slate-500"
                        >
                          No incoming requests available yet.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
