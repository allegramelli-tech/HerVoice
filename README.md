<div align="center">

<svg width="100%" height="8" xmlns="http://www.w3.org/2000/svg">
  <rect width="100%" height="8" fill="#993556"/>
  <rect width="30%" height="8" fill="#f4c0d1" opacity="0.5">
    <animate attributeName="x" from="-30%" to="100%" dur="2.8s" repeatCount="indefinite"/>
  </rect>
</svg>

<br/>
<br/>

<svg width="56" height="56" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M12 20.2s-6.95-4.32-8.97-8.44C1.6 8.84 3.12 5.5 6.3 4.63c2.04-.56 4.14.18 5.7 1.98 1.56-1.8 3.66-2.54 5.7-1.98 3.18.87 4.7 4.21 3.27 7.13C18.95 15.88 12 20.2 12 20.2Z" fill="#993556" fill-opacity="0.18" stroke="#993556" stroke-width="1.5"/>
  <path d="M12 8.2v4.1M9.95 10.25h4.1" stroke="#993556" stroke-linecap="round" stroke-width="1.6"/>
</svg>

<br/>

<img src="https://readme-typing-svg.demolab.com?font=Georgia&size=42&duration=3000&pause=1200&color=993556&center=true&vCenter=true&width=600&height=70&lines=HerVoice" alt="HerVoice"/>

<img src="https://readme-typing-svg.demolab.com?font=Georgia&size=16&duration=4000&pause=2000&color=2C2C2A&center=true&vCenter=true&width=700&height=40&lines=Privacy-first+cross-border+funding+for+abortion+access+in+Europe" alt="tagline"/>

<br/>

<svg width="200" height="16" xmlns="http://www.w3.org/2000/svg">
  <circle cx="20" cy="8" r="3" fill="#993556"><animate attributeName="opacity" values="1;0.2;1" dur="1.8s" begin="0s" repeatCount="indefinite"/></circle>
  <circle cx="40" cy="8" r="3" fill="#f4c0d1"><animate attributeName="opacity" values="1;0.2;1" dur="1.8s" begin="0.3s" repeatCount="indefinite"/></circle>
  <circle cx="60" cy="8" r="3" fill="#993556"><animate attributeName="opacity" values="1;0.2;1" dur="1.8s" begin="0.6s" repeatCount="indefinite"/></circle>
  <circle cx="80" cy="8" r="3" fill="#f4c0d1"><animate attributeName="opacity" values="1;0.2;1" dur="1.8s" begin="0.9s" repeatCount="indefinite"/></circle>
  <circle cx="100" cy="8" r="3" fill="#993556"><animate attributeName="opacity" values="1;0.2;1" dur="1.8s" begin="1.2s" repeatCount="indefinite"/></circle>
  <circle cx="120" cy="8" r="3" fill="#f4c0d1"><animate attributeName="opacity" values="1;0.2;1" dur="1.8s" begin="1.5s" repeatCount="indefinite"/></circle>
  <circle cx="140" cy="8" r="3" fill="#993556"><animate attributeName="opacity" values="1;0.2;1" dur="1.8s" begin="1.8s" repeatCount="indefinite"/></circle>
  <circle cx="160" cy="8" r="3" fill="#f4c0d1"><animate attributeName="opacity" values="1;0.2;1" dur="1.8s" begin="2.1s" repeatCount="indefinite"/></circle>
  <circle cx="180" cy="8" r="3" fill="#993556"><animate attributeName="opacity" values="1;0.2;1" dur="1.8s" begin="2.4s" repeatCount="indefinite"/></circle>
</svg>

<br/>

![Next.js](https://img.shields.io/badge/Next.js_14-2C2C2A?style=flat-square&logo=nextdotjs&logoColor=fff8fa)
![React](https://img.shields.io/badge/React_18-993556?style=flat-square&logo=react&logoColor=fff8fa)
![Tailwind](https://img.shields.io/badge/Tailwind_CSS-2C2C2A?style=flat-square&logo=tailwind-css&logoColor=fff8fa)
![FastAPI](https://img.shields.io/badge/FastAPI-993556?style=flat-square&logo=fastapi&logoColor=fff8fa)
![Python](https://img.shields.io/badge/Python_3.11-2C2C2A?style=flat-square&logo=python&logoColor=fff8fa)
![SQLAlchemy](https://img.shields.io/badge/SQLAlchemy-993556?style=flat-square&logo=sqlalchemy&logoColor=fff8fa)
![SQLite](https://img.shields.io/badge/SQLite-2C2C2A?style=flat-square&logo=sqlite&logoColor=fff8fa)
![XRPL](https://img.shields.io/badge/XRPL_Testnet-993556?style=flat-square&logo=ripple&logoColor=fff8fa)
![QuickNode](https://img.shields.io/badge/QuickNode-2C2C2A?style=flat-square&logo=quicknode&logoColor=fff8fa)

<br/>

> _"Turning a funding promise into a transparent, auditable payment flow —_
> _without exposing patient identity or medical records."_

<svg width="100%" height="4" xmlns="http://www.w3.org/2000/svg">
  <rect width="100%" height="4" fill="#fff8fa"/>
  <rect width="20%" height="4" fill="#993556" opacity="0.6">
    <animate attributeName="x" from="-20%" to="100%" dur="2.2s" repeatCount="indefinite"/>
  </rect>
</svg>

</div>

---

## What Is HerVoice?

HerVoice is a cross-border platform prototype that reduces friction around abortion access for people in Europe who face domestic restrictions.

Patients can select a clinic slot, create a funding case, and later verify their identity at the clinic — without their raw personal information ever being stored in the database. Clinics manage slots and receive payout only after patient identity is re-entered and matched on arrival. Funders lock support in **XRPL escrow**, and settlement is released on **XRPL Testnet** once verification succeeds.

The current MVP uses a **privacy-first hash-based identity model**:
- raw patient identity is used only in-memory during a request
- the database stores only a `patient_hash`
- XRPL stores escrow and settlement records, plus a hashed identity anchor in the transaction memo

---

## Why This Matters

|              | The Problem                                    | HerVoice's Answer                                                           |
| ------------ | ---------------------------------------------- | --------------------------------------------------------------------------- |
| **Patients** | Cross-border care is hard to coordinate safely | Slot-based booking flow with no stored raw identity in the backend          |
| **Clinics**  | Time and payment are both uncertain            | Managed clinic slots + XRPL escrow released only after identity match       |
| **Funders**  | Support promises are hard to audit             | Transparent XRPL escrow creation and release with on-chain transaction logs |
| **Everyone** | Sensitive medical and personal data risk       | Only hashed patient identity is stored; raw identity stays off-chain        |

---

## Live MVP Flow

```
Clinic creates available slots
        ↓
Patient selects a slot and creates a funding case
        ↓
Platform computes patient_hash (raw identity is not stored)
        ↓
Funder locks XRP in XRPL escrow
        ↓
Patient arrives at clinic and re-enters identity
        ↓
Hash matches active case + booked appointment
        ↓
Escrow released to clinic on XRPL Testnet
```

---

## What's Live

### Patient / Case Flow

- Select a clinic slot
- Create a funding case tied to that slot
- Identity is hashed in-memory; raw identity is not stored
- Duplicate active funding for the same patient hash is rejected

### Clinic Flow

- Register clinics
- Create and manage available slots
- Verify patient identity at arrival
- Trigger XRPL escrow release after successful match

### Funder Flow

- View funding cases in the dashboard
- Lock XRP in escrow for a pending case
- Track case status from `pending` → `active` → `released`

### Backend (Already Implemented)

- Hash-based patient identity matching
- Clinic slot creation
- Appointment creation linked to funding cases
- Appointment cancel / reschedule support
- XRPL `EscrowCreate` and `EscrowFinish`
- PREIMAGE-SHA-256 crypto-conditions
- On-chain patient hash anchor via XRPL Memo

---

## Privacy Model

HerVoice is designed so that **raw patient identity is not stored in the backend database and never written on-chain.**

**In-memory only (per request)**
- Patient name
- Date of birth
- Insurance number

These fields are used only to compute a SHA-256 hash and are then discarded.

**Off-chain (database only)**
- `patient_hash`
- Clinic data
- Slot data
- Appointment data
- Funding case state
- XRPL transaction hashes and escrow metadata

**On-chain (XRPL Testnet)**
- `EscrowCreate` and `EscrowFinish` transactions
- Transaction hashes
- Memo containing a hashed patient identity anchor
- Wallet-based settlement records

> The current MVP does **not** use DID. Identity verification is handled by recomputing the same patient hash at clinic arrival and matching it to an active funding case.

---

## XRPL Usage

| Feature                              | Status   |
| ------------------------------------ | -------- |
| XRPL Testnet via QuickNode WebSocket | Active   |
| `EscrowCreate`                       | Active   |
| `EscrowFinish`                       | Active   |
| PREIMAGE-SHA-256 crypto-conditions   | Active   |
| Memo-based patient hash anchor       | Active   |
| Slot-linked conditional payout       | Active   |
| DID / Verifiable Credentials         | Roadmap  |
| Frontend wallet signing              | Roadmap  |
| AMM / DEX / NFTs                     | Roadmap  |

---

## Tech Stack

```
Frontend          Backend                      Settlement
─────────         ──────────────────────       ──────────
Next.js 14        FastAPI                      XRPL Testnet
React 18          SQLAlchemy                   xrpl-py
Tailwind CSS      SQLite                       QuickNode WSS
                  python-dotenv
                  Hash-based identity model
                  Slot / appointment engine
```

---

## Repository Structure

```
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
│   │   ├── clinics.py
│   │   ├── dashboard.py
│   │   └── fund.py
│   └── services/
│       ├── case_service.py
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

---

## API Surface

### Patient / Public

| Method  | Endpoint                  | Description                         |
| ------- | ------------------------- | ----------------------------------- |
| `POST`  | `/api/cases`              | Create funding case and bind a slot |
| `PATCH` | `/api/appointments/{id}`  | Cancel or reschedule an appointment |
| `GET`   | `/api/clinics`            | List clinics with available slots   |

### Clinic

| Method | Endpoint                         | Description                        |
| ------ | -------------------------------- | ---------------------------------- |
| `POST` | `/api/clinics`                   | Register a clinic                  |
| `POST` | `/api/clinics/{id}/slots`        | Create a slot                      |
| `POST` | `/api/clinic/verify-and-release` | Verify identity and release escrow |

### Funder / Operations

| Method | Endpoint         | Description                        |
| ------ | ---------------- | ---------------------------------- |
| `POST` | `/api/fund`      | Lock XRP in escrow for a case      |
| `GET`  | `/api/dashboard` | Funding / clinic / appointment view|
| `GET`  | `/health`        | Health check                       |

---

## Local Development

### 1. Backend

Create `backend/.env`:

```env
XRPL_NODE_URL=wss://your-xrpl-testnet-endpoint
FUNDER_WALLET_SEED=your_funder_seed
CLINIC_WALLET_SEED=your_clinic_seed
CLINIC_WALLET_ADDRESS=your_clinic_address
DATABASE_URL=sqlite:///./hervoice.db
```

```powershell
cd backend
py -m venv .venv
.venv\Scripts\Activate.ps1
py -m pip install -r requirements.txt
py -m uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### 2. Frontend

Create `frontend/.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

```powershell
cd frontend
npm install
npm run dev
```

### 3. Open

| Service        | URL                          |
| -------------- | ---------------------------- |
| Frontend       | http://localhost:3000        |
| Backend health | http://localhost:8000/health |
| API docs       | http://localhost:8000/docs   |

---

## Testing The MVP

### As a Clinic

1. Register a clinic
2. Create one or more available slots

### As a Patient

1. Open `/patient`
2. Select a clinic slot
3. Submit identity details and create a funding case
4. Wait for funding to be locked

### As a Funder

1. Open `/funder`
2. View pending cases in the dashboard
3. Lock XRP in escrow for a selected case

### At Arrival

1. Open `/clinic`
2. Re-enter the patient's identity
3. Check whether the identity hash matches the active booked case
4. If matched, release escrow on XRPL

---

## Implementation Notes

- The backend stores only `patient_hash`, never raw patient identity
- Raw identity is used only in-memory to compute SHA-256
- The current MVP verifies **patient arrival and identity match**, not surgery completion
- Slot booking is required before funding and release
- The clinic verification endpoint will not release escrow if the identity does not match an active booked case

---

## Roadmap

- [ ] Clinic-side slot cancellation flow
- [ ] Stronger clinic-specific wallet routing
- [ ] Frontend support for reschedule / cancel flows
- [ ] Better dashboard filtering and monitoring views
- [ ] Realtime XRPL transaction updates via QuickNode
- [ ] Production-grade auth and role management
- [ ] Optional DID / VC exploration for future identity portability

---

## Hackathon Context

The current MVP is intentionally opinionated:

- **Privacy first** — raw patient identity is not stored
- **Structured booking** — clinic-managed slots and appointment binding
- **Auditable settlement** — on-chain XRPL escrow without exposing raw identity
- **Calm UX** — designed for patients in a stressful moment

---

<div align="center">

<svg width="200" height="16" xmlns="http://www.w3.org/2000/svg">
  <circle cx="20" cy="8" r="3" fill="#f4c0d1"><animate attributeName="opacity" values="1;0.2;1" dur="1.8s" begin="0s" repeatCount="indefinite"/></circle>
  <circle cx="40" cy="8" r="3" fill="#993556"><animate attributeName="opacity" values="1;0.2;1" dur="1.8s" begin="0.3s" repeatCount="indefinite"/></circle>
  <circle cx="60" cy="8" r="3" fill="#f4c0d1"><animate attributeName="opacity" values="1;0.2;1" dur="1.8s" begin="0.6s" repeatCount="indefinite"/></circle>
  <circle cx="80" cy="8" r="3" fill="#993556"><animate attributeName="opacity" values="1;0.2;1" dur="1.8s" begin="0.9s" repeatCount="indefinite"/></circle>
  <circle cx="100" cy="8" r="3" fill="#f4c0d1"><animate attributeName="opacity" values="1;0.2;1" dur="1.8s" begin="1.2s" repeatCount="indefinite"/></circle>
  <circle cx="120" cy="8" r="3" fill="#993556"><animate attributeName="opacity" values="1;0.2;1" dur="1.8s" begin="1.5s" repeatCount="indefinite"/></circle>
  <circle cx="140" cy="8" r="3" fill="#f4c0d1"><animate attributeName="opacity" values="1;0.2;1" dur="1.8s" begin="1.8s" repeatCount="indefinite"/></circle>
  <circle cx="160" cy="8" r="3" fill="#993556"><animate attributeName="opacity" values="1;0.2;1" dur="1.8s" begin="2.1s" repeatCount="indefinite"/></circle>
  <circle cx="180" cy="8" r="3" fill="#f4c0d1"><animate attributeName="opacity" values="1;0.2;1" dur="1.8s" begin="2.4s" repeatCount="indefinite"/></circle>
</svg>

<br/>

_Built with care at Hack the Block · Paris 2026_

<br/>

<svg width="100%" height="8" xmlns="http://www.w3.org/2000/svg">
  <rect width="100%" height="8" fill="#993556"/>
  <rect width="30%" height="8" fill="#f4c0d1" opacity="0.5">
    <animate attributeName="x" from="-30%" to="100%" dur="2.8s" repeatCount="indefinite"/>
  </rect>
</svg>

</div>
