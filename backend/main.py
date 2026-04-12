from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from database import engine, Base
from routers import clinics, cases, appointments, fund, clinic, dashboard

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="HerVoice API",
    description="XRPL-based cross-border abortion access funding platform",
    version="3.5.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(clinics.router)
app.include_router(cases.router)
app.include_router(appointments.router)
app.include_router(fund.router)
app.include_router(clinic.router)
app.include_router(dashboard.router)


@app.get("/health")
def health():
    return {"status": "ok"}