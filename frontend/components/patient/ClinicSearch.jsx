"use client";

const BRAND_COLOR = "#993556";

export default function ClinicSearch({
  searchTerm,
  setSearchTerm,
  clinics,
  onSearch,
  isLoading,
  errorMessage,
  selectedClinic,
  onSelectClinic,
  onBack,
}) {
  return (
    <section className="rounded-3xl border border-white/70 bg-white p-8 shadow-[0_24px_60px_rgba(148,163,184,0.14)]">
      <div className="flex flex-col gap-6">
        <button
          type="button"
          onClick={onBack}
          className="w-fit text-sm font-medium text-slate-500 transition hover:text-slate-900"
        >
          Back
        </button>

        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-slate-900">
            Find a clinic near you
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
            Search by city and select the clinic that feels right for you.
          </p>
        </div>

        <form
          onSubmit={onSearch}
          className="grid gap-4 rounded-3xl border border-rose-100 bg-[linear-gradient(180deg,_#fff9fb_0%,_#ffffff_100%)] p-5 sm:grid-cols-[minmax(0,1fr)_auto]"
        >
          <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
            Location
            <input
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              className="rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-rose-300 focus:ring-2 focus:ring-rose-100"
              placeholder="Search by city"
            />
          </label>

          <button
            type="submit"
            disabled={isLoading}
            className="mt-auto inline-flex items-center justify-center rounded-full px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
            style={{ backgroundColor: BRAND_COLOR }}
          >
            Search clinics
          </button>
        </form>

        {isLoading ? (
          <div className="rounded-2xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm text-rose-900">
            Loading clinics...
          </div>
        ) : null}

        {errorMessage ? (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
            {errorMessage}
          </div>
        ) : null}

        <div className="grid gap-4 lg:grid-cols-2">
          {clinics.map((clinic) => {
            const isSelected = selectedClinic?.id === clinic.id;

            return (
              <article
                key={clinic.id}
                className={`rounded-3xl border p-6 transition ${
                  isSelected
                    ? "border-rose-200 bg-rose-50"
                    : "border-slate-200 bg-white hover:border-slate-300"
                }`}
              >
                <div className="flex flex-col gap-5">
                  <div>
                    <div className="text-lg font-semibold text-slate-900">
                      {clinic.name}
                    </div>
                    <div className="mt-2 text-sm text-slate-600">
                      {clinic.city}
                    </div>
                    <div className="mt-1 text-sm text-slate-500">
                      {clinic.address}
                    </div>
                    <div className="mt-1 text-sm text-slate-500">
                      Doctor: {clinic.doctor_name}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => onSelectClinic(clinic)}
                    className="inline-flex w-fit items-center justify-center rounded-full px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90"
                    style={{ backgroundColor: BRAND_COLOR }}
                  >
                    {isSelected ? "Selected clinic" : "Select this clinic"}
                  </button>
                </div>
              </article>
            );
          })}

          {!clinics.length && !isLoading ? (
            <div className="rounded-3xl border border-dashed border-slate-200 px-6 py-12 text-center text-sm text-slate-500 lg:col-span-2">
              Search for a city to load clinics from the backend.
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
