<p align="center">
  <svg width="44" height="44" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M12 20.2s-6.95-4.32-8.97-8.44C1.6 8.84 3.12 5.5 6.3 4.63c2.04-.56 4.14.18 5.7 1.98 1.56-1.8 3.66-2.54 5.7-1.98 3.18.87 4.7 4.21 3.27 7.13C18.95 15.88 12 20.2 12 20.2Z"
      fill="#993556"
      fill-opacity="0.15"
      stroke="#993556"
      stroke-width="1.5"
    />
    <path
      d="M12 8.2v4.1M9.95 10.25h4.1"
      stroke="#993556"
      stroke-linecap="round"
      stroke-width="1.6"
    />
  </svg>
</p>

<h1 align="center">
  <span style="color:#993556;">Her</span><span style="color:#2C2C2A;">Voice</span>
</h1>

<p align="center">
  Privacy-first cross-border funding and settlement prototype for abortion access in Europe.
</p>

<p align="center">
  Built with <strong>Next.js</strong>, <strong>FastAPI</strong>, <strong>SQLite</strong>, and <strong>XRPL Testnet</strong>.
</p>

## Overview

HerVoice is a cross-border platform prototype designed to reduce friction around abortion access for people in Europe who face domestic restrictions.

The platform helps patients request support, find partner clinics, and book appointments. On the other side, funders can create and track funding cases, and clinics can verify reservations and confirm care. The settlement layer runs on XRPL Testnet, while sensitive medical and personal data stays off-chain.

This MVP focuses on a practical end-to-end flow:

1. A funder locks support funds in an XRPL escrow.
2. The platform generates an anonymous reservation.
3. A patient uses the platform to continue their case and book care.
4. A clinic verifies the reservation and confirms service delivery.
5. The escrow is released to the clinic under predefined rules.

The goal is not to put healthcare data on-chain. The goal is to turn a funding promise into a transparent, auditable payment flow without exposing patient identity or medical records.

## Why This Matters

- Patients need a calm and low-friction path to cross-border care.
- Clinics need more certainty that pledged support will actually settle.
- Funders need transparent, auditable payment flows.
- All parties need privacy-sensitive coordination that does not leak medical information onto a public ledger.

## What Is Live In The Current MVP

### Patient portal

- Start without login
- Request support
- Receive an access code
- Resume a case later with that code
- Search clinics by city, clinic name, or doctor
- View available slots
- Book or cancel an appointment

### Funder portal

- Create funding cases
- Generate reservations through the backend
- View funding and operations metrics
- Link a funding case to a booked clinic appointment
- Review case status in the dashboard

### Clinic portal

- Verify reservation validity
- Confirm service delivery
- Trigger XRPL escrow release
- Review incoming requests from the dashboard

### Backend-only flows already implemented

- Clinic registration
- Clinic slot creation
- Appointment listing for clinic admins
- Proof submission with optional PDF upload
- Retry payout for proof records if release needs to be retried

## Product Flow

### 1. Patient support request

The patient enters personal and insurance details in the frontend. The backend stores only the minimum currently used by the MVP for the case creation request: `email`, `phone`, and `country_of_origin`.

The backend returns:

- `case_id`
- `access_code`
- `care_status`

### 2. Clinic discovery and booking

The patient can:

- load clinics from the backend
- search them in the frontend
- open clinic details
- select a slot
- book an appointment using the access code

### 3. Funding case creation

A funder creates a funding case through `POST /api/fund`.

The backend then:

- creates a `FundingCase`
- creates a reservation record in the backend
- generates a crypto-condition pair
- submits `EscrowCreate` on XRPL Testnet
- stores the resulting transaction hash and escrow sequence

### 4. Linking funding to an appointment

Once an appointment exists, the funder can link a funding case to it through:

- `PATCH /api/clinic-admin/appointments/{appointment_id}/link-funding`

This is already wired in the frontend.

### 5. Reservation verification and payout

The clinic verifies a reservation through:

- `POST /api/clinic/verify`

If valid, the clinic confirms service through:

- `POST /api/clinic/confirm`

The backend then:

- checks reservation validity
- prevents duplicate redemption
- submits `EscrowFinish` on XRPL Testnet
- marks the reservation as redeemed
- marks the funding case as released

## Privacy Model

HerVoice is explicitly designed so that sensitive healthcare data is not written on-chain.

### Off-chain

- patient email
- patient phone
- country of origin
- clinic data
- appointment data
- proof metadata and uploaded PDFs

### On-chain / XRPL settlement layer

- escrow creation
- escrow release
- transaction hashes
- wallet-based settlement records

### Important note

The app currently displays anonymized IDs such as `DID-XXXXXX` in the UI, but these are display aliases derived from internal case IDs, not real decentralized identifiers yet.

## XRPL Usage

The current MVP uses XRPL Testnet for settlement, not for patient identity storage.

### Actively used today

- XRPL Testnet node via QuickNode WebSocket endpoint
- `EscrowCreate`
- `EscrowFinish`
- wallet seeds loaded from backend environment variables
- PREIMAGE-SHA-256 crypto-conditions for escrow fulfillment

### Not yet part of the active MVP flow

- DID
- Verifiable Credentials
- frontend wallet signing in the main user journey
- AMM / DEX / NFTs / issued currencies

## Tech Stack

### Frontend

- Next.js 14
- React 18
- Tailwind CSS

### Backend

- FastAPI
- SQLAlchemy
- SQLite
- xrpl-py
- python-dotenv
- python-multipart

## Repository Structure

```text
HerVoice/
├── backend/
│   ├── main.py
│   ├── config.py
│   ├── database.py
│   ├── models.py
│   ├── schemas.py
│   ├── requirements.txt
│   ├── routers/
│   │   ├── appointments.py
│   │   ├── cases.py
│   │   ├── clinic.py
│   │   ├── clinic_admin.py
│   │   ├── clinics.py
│   │   ├── dashboard.py
│   │   ├── fund.py
│   │   ├── proof.py
│   │   └── voucher.py
│   └── services/
│       ├── appointment_service.py
│       ├── voucher_service.py
│       └── xrpl_service.py
├── frontend/
│   ├── app/
│   │   ├── page.js
│   │   ├── patient/page.jsx
│   │   ├── funder/page.jsx
│   │   ├── clinic/page.jsx
│   │   └── help/page.jsx
│   └── components/
│       ├── BrandLogo.jsx
│       ├── HelpButton.jsx
│       ├── patient/
│       ├── funder/
│       └── clinic/
└── README.md
```

## Main API Surface

### Public / patient-facing

- `POST /api/cases`
- `GET /api/cases/status`
- `GET /api/clinics`
- `GET /api/clinics/{clinic_id}`
- `POST /api/appointments`
- `PATCH /api/appointments/{appointment_id}`

### Funder-facing

- `POST /api/fund`
- `GET /api/dashboard`
- `PATCH /api/clinic-admin/appointments/{appointment_id}/link-funding`

### Clinic-facing

- `POST /api/clinic/verify`
- `POST /api/clinic/confirm`

### Clinic admin / operations

- `POST /api/clinic-admin/register`
- `POST /api/clinic-admin/{clinic_id}/slots`
- `GET /api/clinic-admin/{clinic_id}/appointments`
- `POST /api/proof`
- `POST /api/proof/{proof_id}/retry-payout`

### Health check

- `GET /health`

## Local Development

## 1. Backend setup

Create `backend/.env`:

```env
XRPL_NODE_URL=wss://your-xrpl-testnet-endpoint
FUNDER_WALLET_SEED=your_funder_seed
CLINIC_WALLET_SEED=your_clinic_seed
CLINIC_WALLET_ADDRESS=your_clinic_address
DATABASE_URL=sqlite:///./hackathon.db
```

Install and run the backend from the `backend/` directory:

```powershell
cd backend
py -m venv .venv
.venv\Scripts\Activate.ps1
py -m pip install -r requirements.txt
py -m uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

## 2. Frontend setup

Create `frontend/.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

Install and run the frontend:

```powershell
cd frontend
npm install
npm run dev
```

## 3. Open the app

- Frontend: `http://localhost:3000`
- Backend health check: `http://localhost:8000/health`

## Current Frontend Routes

- `/` landing page
- `/patient` patient support and booking flow
- `/funder` funder dashboard
- `/clinic` clinic dashboard
- `/help` mock support/contact page

## Testing The MVP Manually

### Patient

1. Open `/patient`
2. Search and select a clinic
3. Submit a support request
4. Keep the returned access code
5. Resume the case and book a slot

### Funder

1. Open `/funder`
2. Create a funding case
3. Select a clinic
4. Select a booked appointment
5. Link the funding case to that appointment

### Clinic

1. Open `/clinic`
2. Select an incoming request or paste the reservation ID
3. Verify the reservation
4. Confirm service
5. Check that payout is released

## Important Implementation Notes

- The frontend currently presents monetary values as `EUR` in the UI, but some backend field names still use `amount_xrp` for historical reasons.
- The current login screens are frontend-only and do not implement real authentication.
- Clinic search in the patient flow currently loads clinics from the backend and filters by city, clinic name, or doctor in the frontend.
- Proof submission is implemented in the backend, but not yet surfaced as a full primary flow in the frontend UI.

## Roadmap Ideas

- Real DID support
- Verifiable Credentials for clinics and approved funding organizations
- frontend wallet integration for funders
- clinic-specific dashboards with stronger data partitioning
- better realtime transaction status updates
- production-grade auth and role management

## Team / Hackathon Context

HerVoice was built as a Hack the Block prototype to explore how XRPL can support transparent, privacy-sensitive healthcare settlement flows in a cross-border setting.

The project is intentionally opinionated:

- privacy first
- sensitive data off-chain
- auditable settlement on-chain
- calm UX for patients
