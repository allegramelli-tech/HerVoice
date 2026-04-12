"use client";

import Link from "next/link";
import BrandLogo from "../components/BrandLogo";

const PORTALS = [
  {
    href: "/patient",
    title: "I need support",
    description: "Request anonymous funding for cross-border care.",
    className: "text-white",
    style: { backgroundColor: "#993556" },
  },
  {
    href: "/funder",
    title: "I am a funder / NGO",
    description: "Manage funding cases and track payments.",
    className: "bg-slate-900 text-white",
  },
  {
    href: "/clinic",
    title: "I am a clinic",
    description: "Verify reservations and confirm services.",
    className: "bg-slate-900 text-white",
  },
];

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(153,53,86,0.12),_transparent_34%),linear-gradient(180deg,_#fff8fa_0%,_#f8fafc_52%,_#ffffff_100%)] px-4 py-10 pt-14 sm:px-6 sm:pt-10 lg:px-8">
      <div className="mx-auto flex max-w-6xl flex-col gap-8">
        <section className="overflow-hidden rounded-[2rem] border border-white/70 bg-white/85 px-5 py-8 shadow-[0_24px_60px_rgba(148,163,184,0.14)] backdrop-blur sm:px-10 sm:py-14">
          <div className="flex flex-col gap-8">
            <div className="flex flex-col gap-5">
              <BrandLogo size="lg" />
              <div>
                <h1 className="text-3xl font-semibold tracking-tight text-slate-900 sm:text-5xl">
                  Safe, confidential funding for women seeking care across borders.
                </h1>
                <p className="mt-4 text-base leading-7 text-slate-600 sm:text-lg">
                  HerVoice connects patients, trusted funding partners, and
                  verified clinics through a calm, privacy-first digital flow.
                </p>
              </div>
            </div>

            <div className="grid gap-4 lg:grid-cols-3">
              {PORTALS.map((portal) => (
                <Link
                  key={portal.href}
                  href={portal.href}
                  className={`group rounded-[1.75rem] p-6 shadow-[0_18px_40px_rgba(15,23,42,0.08)] transition duration-200 hover:-translate-y-1 ${portal.className}`}
                  style={portal.style}
                >
                  <div className="flex h-full flex-col justify-between gap-8">
                    <div className="space-y-3">
                      <div className="text-xs font-semibold uppercase tracking-[0.18em] text-white/70">
                        Portal
                      </div>
                      <h2 className="text-2xl font-semibold tracking-tight">
                        {portal.title}
                      </h2>
                      <p className="max-w-sm text-sm leading-6 text-white/80">
                        {portal.description}
                      </p>
                    </div>

                    <div className="inline-flex items-center gap-2 text-sm font-semibold text-white">
                      Enter portal
                      <span
                        aria-hidden="true"
                        className="text-base leading-none transition group-hover:translate-x-1"
                      >
                        →
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
