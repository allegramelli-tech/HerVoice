"use client";

import BrandLogo from "../BrandLogo";

const BRAND_COLOR = "#993556";

function Spinner({ text }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600 shadow-sm">
      <span className="h-5 w-5 animate-spin rounded-full border-2 border-slate-200 border-t-slate-700" />
      <span>{text}</span>
    </div>
  );
}

export default function ClinicInterface({
  onSignOut,
  voucherId,
  setVoucherId,
  onVerify,
  onConfirm,
  isVerifying,
  isConfirming,
  actionError,
  verification,
  confirmResult,
  isLoadingRequests,
  requestsError,
  incomingRequests,
  setVerification,
  setConfirmResult,
  setActionError,
  setVoucherFromCase,
  getUiStatus,
  formatAnonymousId,
}) {
  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,_#fff8fa_0%,_#f8fafc_48%,_#ffffff_100%)]">
      <header className="border-b border-white/70 bg-white/85 backdrop-blur">
        <div className="mx-auto flex max-w-7xl flex-col items-start gap-4 px-4 py-5 pr-14 sm:px-6 sm:pr-16 lg:px-8 lg:pr-8 min-[480px]:flex-row min-[480px]:items-center min-[480px]:justify-between">
          <BrandLogo />
          <div className="flex w-full flex-col items-start gap-3 min-[480px]:w-auto min-[480px]:flex-row min-[480px]:items-center min-[480px]:gap-4">
            <div className="text-left min-[480px]:text-right">
              <div className="text-sm font-semibold text-slate-900">
                Berlin Partner Clinic
              </div>
              <div className="text-xs text-slate-500">Verified clinic access</div>
            </div>
            <button
              type="button"
              onClick={onSignOut}
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

            <form onSubmit={onVerify} className="flex flex-col gap-4">
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
                  onClick={onConfirm}
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
            {isConfirming ? <Spinner text="Waiting for XRPL confirmation..." /> : null}

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
                    <div className="mt-2 break-all font-mono text-slate-900">
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
                    <div className="mt-2 break-all font-mono text-slate-900">
                      {verification.case_id || "Unavailable"}
                    </div>
                  </div>
                </div>

                <p className="mt-4 text-sm text-slate-600">{verification.message}</p>
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
                    <div className="mt-2 break-all font-mono text-emerald-900">
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
              <div className="space-y-3 px-4 py-4 md:hidden">
                {incomingRequests.length ? (
                  incomingRequests.map((caseItem) => (
                    <button
                      key={caseItem.case_id}
                      type="button"
                      onClick={() => {
                        setVoucherFromCase(caseItem.voucher_id || "");
                        setVerification(null);
                        setConfirmResult(null);
                        setActionError("");
                      }}
                      className="w-full rounded-2xl border border-slate-100 bg-white p-4 text-left transition hover:bg-rose-50/70"
                    >
                      <div className="flex flex-col gap-3">
                        <div>
                          <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                            Anonymous ID
                          </div>
                          <div className="mt-1 break-all font-mono text-sm text-slate-900">
                            {formatAnonymousId(caseItem.case_id)}
                          </div>
                        </div>
                        <div className="grid gap-3 sm:grid-cols-2">
                          <div>
                            <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                              Voucher
                            </div>
                            <div className="mt-1 break-all font-mono text-xs text-slate-600">
                              {caseItem.voucher_id}
                            </div>
                          </div>
                          <div>
                            <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                              Amount
                            </div>
                            <div className="mt-1 text-sm font-medium text-slate-900">
                              {caseItem.amount_xrp} XRP
                            </div>
                          </div>
                        </div>
                        <div>
                          <span className="inline-flex rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-700">
                            {getUiStatus(caseItem)}
                          </span>
                        </div>
                      </div>
                    </button>
                  ))
                ) : (
                  <div className="px-2 py-6 text-center text-sm text-slate-500">
                    No incoming requests available yet.
                  </div>
                )}
              </div>

              <div className="hidden overflow-x-auto md:block">
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
                            setVoucherFromCase(caseItem.voucher_id || "");
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
