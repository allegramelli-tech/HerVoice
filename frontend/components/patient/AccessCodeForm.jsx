"use client";

import Link from "next/link";

const BRAND_COLOR = "#993556";

export default function AccessCodeForm({ onBack, onRequestSupport }) {
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
            The current backend release supports new reservation requests only.
            If you need help with an existing case, please contact the HerVoice
            team or start a new request below.
          </p>
        </div>

        <div className="rounded-3xl border border-rose-100 bg-[linear-gradient(180deg,_#fff9fb_0%,_#ffffff_100%)] p-5 sm:p-6">
          <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
            Direct case resume is temporarily unavailable in this beta.
          </div>

          <div className="mt-5 flex flex-col gap-3">
            <button
              type="button"
              onClick={onRequestSupport}
              className="inline-flex w-full items-center justify-center rounded-full px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90"
              style={{ backgroundColor: BRAND_COLOR }}
            >
              Find a clinic near you
            </button>

            <Link
              href="/contact"
              target="_blank"
              rel="noreferrer"
              className="inline-flex w-full items-center justify-center rounded-full border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:text-slate-900"
            >
              Contact us
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
