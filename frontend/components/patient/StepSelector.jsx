"use client";

const BRAND_COLOR = "#993556";

const OPTIONS = [
  {
    id: "accesscode",
    title: "I already have an access code",
    description:
      "Open your existing case, check your status, and continue where you left off.",
  },
  {
    id: "support",
    title: "I need to request support",
    description:
      "Search for a clinic first, then continue with your confidential request.",
  },
];

export default function StepSelector({ onSelect }) {
  return (
    <section className="rounded-3xl border border-white/70 bg-white p-5 shadow-[0_24px_60px_rgba(148,163,184,0.14)] sm:p-8">
      <div className="mx-auto flex max-w-4xl flex-col items-center gap-8 text-center">
        <div className="max-w-2xl">
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
            How would you like to continue?
          </h1>
          <p className="mt-3 text-sm leading-7 text-slate-600 sm:text-base">
            Choose the path that matches your situation.
            <br />
            You can continue with an existing access code or start a new support
            request.
          </p>
        </div>

        <div className="grid w-full gap-5 md:grid-cols-2">
          {OPTIONS.map((option) => (
            <button
              key={option.id}
              type="button"
              onClick={() => onSelect(option.id)}
              className="group rounded-[1.75rem] border border-rose-100 bg-[linear-gradient(180deg,_#fff9fb_0%,_#ffffff_100%)] p-5 text-left shadow-[0_18px_40px_rgba(15,23,42,0.06)] transition duration-200 hover:-translate-y-1 hover:border-rose-200 sm:p-6"
            >
              <div className="flex h-full flex-col justify-between gap-8">
                <div>
                  <div className="h-[30px]" aria-hidden="true" />
                  <h2 className="mt-4 text-xl font-semibold tracking-tight text-slate-900 sm:text-2xl">
                    {option.title}
                  </h2>
                  <p className="mt-3 text-sm leading-6 text-slate-600">
                    {option.description}
                  </p>
                </div>

                <div
                  className="inline-flex items-center gap-2 text-sm font-semibold"
                  style={{ color: BRAND_COLOR }}
                >
                  Choose this option
                  <span className="transition group-hover:translate-x-1">-&gt;</span>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
