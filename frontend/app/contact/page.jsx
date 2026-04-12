import Link from "next/link";
import BrandLogo from "../../components/BrandLogo";

export default function ContactPage() {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(153,53,86,0.12),_transparent_34%),linear-gradient(180deg,_#fff8fa_0%,_#f8fafc_52%,_#ffffff_100%)] px-4 py-10 pt-14 sm:px-6 sm:pt-10 lg:px-8">
      <div className="mx-auto flex max-w-4xl flex-col gap-8">
        <section className="rounded-[2rem] border border-white/70 bg-white/90 p-6 shadow-[0_24px_60px_rgba(148,163,184,0.14)] backdrop-blur sm:p-10">
          <div className="flex flex-col gap-6">
            <BrandLogo size="lg" />

            <div className="space-y-4">
              <div className="inline-flex w-fit rounded-full border border-rose-100 bg-rose-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-[#993556]">
                Contact us
              </div>
              <h1 className="text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
                Verified access for clinics and funding partners
              </h1>
              <p className="text-base leading-7 text-slate-600">
                HerVoice is a privacy-first cross-border platform that helps
                patients, trusted funding organizations, and verified clinics
                coordinate care and settlement without putting sensitive medical
                information on-chain.
              </p>
              <p className="text-base leading-7 text-slate-600">
                Before a clinic or funding organization receives access, an
                official confirmation step must take place. This review is used
                to verify legitimacy, protect patients, and keep the network
                trusted.
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-3xl border border-slate-100 bg-slate-50 p-6">
                <div className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-400">
                  Funding organizations
                </div>
                <p className="mt-3 text-sm leading-6 text-slate-600">
                  Funding access is limited to reviewed NGOs and trusted support
                  partners that are approved before joining the platform.
                </p>
              </div>

              <div className="rounded-3xl border border-slate-100 bg-slate-50 p-6">
                <div className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-400">
                  Clinics
                </div>
                <p className="mt-3 text-sm leading-6 text-slate-600">
                  Clinic access is granted only after official confirmation so
                  that patients and funders interact with verified providers.
                </p>
              </div>
            </div>

            <div className="rounded-3xl border border-dashed border-slate-200 px-6 py-5 text-sm leading-6 text-slate-600">
              For onboarding, partnership questions, or verification requests,
              please contact our team at{" "}
              <span className="font-semibold text-slate-900">
                access@hervoice-demo.org
              </span>
              .
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <Link
                href="/"
                className="inline-flex w-full items-center justify-center rounded-full bg-[#993556] px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90 sm:w-auto"
              >
                Back to home
              </Link>
              <Link
                href="/help"
                className="inline-flex w-full items-center justify-center rounded-full border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:text-slate-900 sm:w-auto"
              >
                Open support page
              </Link>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
