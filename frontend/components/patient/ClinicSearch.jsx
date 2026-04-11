"use client";

const BRAND_COLOR = "#993556";

const MOCK_CLINICS = [
  {
    id: "clinic-berlin",
    name: "Berlin Women’s Care Centre",
    city: "Berlin",
    country: "Germany",
    distance: "4.2 km",
  },
  {
    id: "clinic-amsterdam",
    name: "Canal Health Clinic",
    city: "Amsterdam",
    country: "Netherlands",
    distance: "7.8 km",
  },
  {
    id: "clinic-brussels",
    name: "Brussels Reproductive Care",
    city: "Brussels",
    country: "Belgium",
    distance: "5.1 km",
  },
  {
    id: "clinic-vienna",
    name: "Vienna Care Studio",
    city: "Vienna",
    country: "Austria",
    distance: "6.4 km",
  },
  {
    id: "clinic-barcelona",
    name: "Barcelona Safe Access Clinic",
    city: "Barcelona",
    country: "Spain",
    distance: "3.9 km",
  },
  {
    id: "clinic-copenhagen",
    name: "Nordic Women’s Clinic",
    city: "Copenhagen",
    country: "Denmark",
    distance: "8.7 km",
  },
];

export default function ClinicSearch({
  searchTerm,
  setSearchTerm,
  selectedClinic,
  onSelectClinic,
  onBack,
}) {
  const normalizedTerm = searchTerm.trim().toLowerCase();
  const visibleClinics = MOCK_CLINICS.filter((clinic) => {
    if (!normalizedTerm) return true;
    return `${clinic.city} ${clinic.country} ${clinic.name}`
      .toLowerCase()
      .includes(normalizedTerm);
  });

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
            Search by city or country, choose a preferred date and time, and
            select the clinic that feels right for you.
          </p>
        </div>

        <div className="grid gap-4 rounded-3xl border border-rose-100 bg-[linear-gradient(180deg,_#fff9fb_0%,_#ffffff_100%)] p-5">
          <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
            Location
            <input
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              className="rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-rose-300 focus:ring-2 focus:ring-rose-100"
              placeholder="City or country"
            />
          </label>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          {visibleClinics.map((clinic) => {
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
                      {clinic.city}, {clinic.country}
                    </div>
                    <div className="mt-1 text-sm text-slate-500">
                      Estimated distance: {clinic.distance}
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
        </div>
      </div>
    </section>
  );
}
