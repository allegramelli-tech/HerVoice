import Link from "next/link";
import BrandLogo from "../../components/BrandLogo";

export default function HelpPage() {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(153,53,86,0.12),_transparent_34%),linear-gradient(180deg,_#fff8fa_0%,_#f8fafc_52%,_#ffffff_100%)] px-4 py-10 pt-14 sm:px-6 sm:pt-10 lg:px-8">
      <div className="mx-auto flex max-w-4xl flex-col gap-8">
        <section className="rounded-[2rem] border border-white/70 bg-white/90 p-6 shadow-[0_24px_60px_rgba(148,163,184,0.14)] backdrop-blur sm:p-10">
          <div className="flex flex-col gap-6">
            <BrandLogo size="lg" />

            <div className="space-y-4">
              <div className="inline-flex w-fit rounded-full border border-rose-100 bg-rose-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-[#993556]">
                Contact
              </div>
              <h1 className="text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
                Need help with HerVoice?
              </h1>
              <p className="text-base leading-7 text-slate-600">
                We&apos;re here to support you - confidentially and without judgment.
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-3xl border border-slate-100 bg-slate-50 p-6">
                <div className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-400">
                  Email
                </div>
                <div className="mt-3 break-words text-lg font-semibold text-slate-900">
                  support@hervoice-demo.org
                </div>
                <p className="mt-3 text-sm leading-6 text-slate-600">
                  For login questions, reservation issues, clinic matching, or funding support.
                </p>
              </div>

              <div className="rounded-3xl border border-slate-100 bg-slate-50 p-6">
                <div className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-400">
                  Phone
                </div>
                <div className="mt-3 text-lg font-semibold text-slate-900">+33 30 0000 1234</div>
                <p className="mt-3 text-sm leading-6 text-slate-600">
                  Available Monday to Friday, 9:00 to 17:00 CET.
                </p>
              </div>
            </div>

            <div className="rounded-3xl border border-dashed border-slate-200 px-6 py-5 text-sm leading-6 text-slate-600">
              Your privacy matters. We will never share your personal information. All communication
              is handled with full confidentiality.
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <Link
                href="/"
                className="inline-flex w-full items-center justify-center rounded-full bg-[#993556] px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90 sm:w-auto"
              >
                Back to home
              </Link>
              <Link
                href="/patient"
                className="inline-flex w-full items-center justify-center rounded-full border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:text-slate-900 sm:w-auto"
              >
                Go to patient portal
              </Link>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
