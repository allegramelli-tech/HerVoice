"use client";

const BRAND_COLOR = "#993556";

export default function AccessCodeForm({
  lookupCode,
  setLookupCode,
  onSubmit,
  isLoading,
  onBack,
}) {
  return (
    <section className="rounded-3xl border border-white/70 bg-white p-5 shadow-[0_24px_60px_rgba(148,163,184,0.14)] sm:p-8">
      <div className="mx-auto flex max-w-xl flex-col gap-6">
        <button
          type="button"
          onClick={onBack}
          className="w-fit text-sm font-medium text-slate-500 transition hover:text-slate-900"
        >
          Back
        </button>

        <div className="text-center">
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
            Already have an access code? Use it here to continue.
          </h1>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            Enter your code to load your case and continue with the next step.
          </p>
        </div>

        <form
          onSubmit={onSubmit}
          className="rounded-3xl border border-rose-100 bg-[linear-gradient(180deg,_#fff9fb_0%,_#ffffff_100%)] p-5 sm:p-6"
        >
          <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
            Enter your access code
            <input
              value={lookupCode}
              onChange={(event) => setLookupCode(event.target.value)}
              className="rounded-2xl border border-slate-200 px-4 py-3 font-mono text-sm text-slate-900 outline-none transition focus:border-rose-300 focus:ring-2 focus:ring-rose-100"
              placeholder="AB12CD34"
            />
          </label>

          <button
            type="submit"
            disabled={isLoading}
            className="mt-5 inline-flex w-full items-center justify-center rounded-full px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
            style={{ backgroundColor: BRAND_COLOR }}
          >
            Continue
          </button>
        </form>
      </div>
    </section>
  );
}
