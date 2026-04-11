from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import engine, Base
from routers import fund, voucher, clinic, dashboard
from routers import clinics, clinic_admin, cases, appointments, proof

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Clinic Funding Redemption API",
    description="XRPL escrow-based voucher redemption for abortion clinic funding",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(fund.router)
app.include_router(voucher.router)
app.include_router(clinic.router)
app.include_router(dashboard.router)
app.include_router(clinics.router)
app.include_router(clinic_admin.router)
app.include_router(cases.router)
app.include_router(appointments.router)
app.include_router(proof.router)


@app.get("/health")
def health():
    return {"status": "ok"}