<div align="center">

<!-- Animated SVG background bar -->
<svg width="100%" height="8" xmlns="http://www.w3.org/2000/svg">
  <rect width="100%" height="8" fill="#993556"/>
  <rect width="30%" height="8" fill="#f4c0d1" opacity="0.5">
    <animate attributeName="x" from="-30%" to="100%" dur="2.8s" repeatCount="indefinite"/>
  </rect>
</svg>

<br/>
<br/>

<!-- Logo -->
<svg width="56" height="56" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M12 20.2s-6.95-4.32-8.97-8.44C1.6 8.84 3.12 5.5 6.3 4.63c2.04-.56 4.14.18 5.7 1.98 1.56-1.8 3.66-2.54 5.7-1.98 3.18.87 4.7 4.21 3.27 7.13C18.95 15.88 12 20.2 12 20.2Z" fill="#993556" fill-opacity="0.18" stroke="#993556" stroke-width="1.5"/>
  <path d="M12 8.2v4.1M9.95 10.25h4.1" stroke="#993556" stroke-linecap="round" stroke-width="1.6"/>
</svg>

<br/>

<!-- Typing animation -->
<img src="https://readme-typing-svg.demolab.com?font=Georgia&size=42&duration=3000&pause=1200&color=993556&center=true&vCenter=true&width=600&height=70&lines=HerVoice" alt="HerVoice"/>

<img src="https://readme-typing-svg.demolab.com?font=Georgia&size=16&duration=4000&pause=2000&color=2C2C2A&center=true&vCenter=true&width=700&height=40&lines=Privacy-first+cross-border+funding+for+abortion+access+in+Europe" alt="tagline"/>

<br/>

<!-- Animated dot divider -->
<svg width="200" height="16" xmlns="http://www.w3.org/2000/svg">
  <circle cx="20" cy="8" r="3" fill="#993556">
    <animate attributeName="opacity" values="1;0.2;1" dur="1.8s" begin="0s" repeatCount="indefinite"/>
  </circle>
  <circle cx="40" cy="8" r="3" fill="#f4c0d1">
    <animate attributeName="opacity" values="1;0.2;1" dur="1.8s" begin="0.3s" repeatCount="indefinite"/>
  </circle>
  <circle cx="60" cy="8" r="3" fill="#993556">
    <animate attributeName="opacity" values="1;0.2;1" dur="1.8s" begin="0.6s" repeatCount="indefinite"/>
  </circle>
  <circle cx="80" cy="8" r="3" fill="#f4c0d1">
    <animate attributeName="opacity" values="1;0.2;1" dur="1.8s" begin="0.9s" repeatCount="indefinite"/>
  </circle>
  <circle cx="100" cy="8" r="3" fill="#993556">
    <animate attributeName="opacity" values="1;0.2;1" dur="1.8s" begin="1.2s" repeatCount="indefinite"/>
  </circle>
  <circle cx="120" cy="8" r="3" fill="#f4c0d1">
    <animate attributeName="opacity" values="1;0.2;1" dur="1.8s" begin="1.5s" repeatCount="indefinite"/>
  </circle>
  <circle cx="140" cy="8" r="3" fill="#993556">
    <animate attributeName="opacity" values="1;0.2;1" dur="1.8s" begin="1.8s" repeatCount="indefinite"/>
  </circle>
  <circle cx="160" cy="8" r="3" fill="#f4c0d1">
    <animate attributeName="opacity" values="1;0.2;1" dur="1.8s" begin="2.1s" repeatCount="indefinite"/>
  </circle>
  <circle cx="180" cy="8" r="3" fill="#993556">
    <animate attributeName="opacity" values="1;0.2;1" dur="1.8s" begin="2.4s" repeatCount="indefinite"/>
  </circle>
</svg>

<br/>

![Next.js](https://img.shields.io/badge/Next.js_14-2C2C2A?style=flat-square&logo=nextdotjs&logoColor=fff8fa)
![FastAPI](https://img.shields.io/badge/FastAPI-993556?style=flat-square&logo=fastapi&logoColor=fff8fa)
![XRPL](https://img.shields.io/badge/XRPL_Testnet-2C2C2A?style=flat-square&logo=ripple&logoColor=fff8fa)
![SQLite](https://img.shields.io/badge/SQLite-993556?style=flat-square&logo=sqlite&logoColor=fff8fa)
![Tailwind](https://img.shields.io/badge/Tailwind_CSS-2C2C2A?style=flat-square&logo=tailwind-css&logoColor=fff8fa)

<br/>

> _"Turning a funding promise into a transparent, auditable payment flow —_
> _without exposing patient identity or medical records."_

<!-- Animated bottom bar -->
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

Patients can request support, find partner clinics, and book appointments — anonymously. Funders create and track funding cases with full on-chain auditability. Clinics verify vouchers and confirm care. Settlement runs on **XRPL Testnet**, while all sensitive medical and personal data stays **off-chain**.

---

## Why This Matters

|              | The Problem                                       | HerVoice's Answer                                        |
| ------------ | ------------------------------------------------- | -------------------------------------------------------- |
| **Patients** | No low-friction path to cross-border care         | Calm, anonymous booking flow — no login required         |
| **Clinics**  | Uncertainty about whether pledged support settles | Verified on-chain escrow, released on confirmation       |
| **Funders**  | No transparent audit trail                        | Immutable XRPL settlement records                        |
| **Everyone** | Medical data leaking onto public ledgers          | Strict off-chain data model — nothing sensitive on-chain |

---

## Live MVP Flow

```
Funder locks XRP in escrow
        ↓
Platform generates anonymous voucher
        ↓
Patient uses access code to search clinics & book
        ↓
Clinic verifies voucher + confirms care
        ↓
Escrow released to clinic on XRPL Testnet
```

---

## What's Live

### Patient Portal

- Start without login
- Submit a support request
- Receive a private **access code**
- Resume a case on any device
- Search clinics by city, name, or doctor
- View available slots and book or cancel

### Funder Portal

- Create funding cases and generate vouchers
- View funding and operations metrics
- Link a funding case to a booked appointment
- Track case status in the dashboard

### Clinic Portal

- Verify voucher validity
- Confirm service delivery
- Trigger XRPL escrow release
- Review incoming requests

### Backend-Only (Already Implemented)

- Clinic registration and slot creation
- Appointment listing for clinic admins
- Proof submission with optional PDF upload
- Retry payout for failed escrow releases

---

## Privacy Model

HerVoice is designed so that **no sensitive healthcare data is written on-chain.**

**Off-chain (database only)**

- Patient email, phone, country of origin
- Clinic and appointment data
- Proof metadata and uploaded PDFs

**On-chain (XRPL Testnet)**

- Escrow creation and release
- Transaction hashes
- Wallet-based settlement records

> The app displays anonymized IDs like `DID-XXXXXX` in the UI — these are display aliases from internal case IDs, not real DIDs yet.

---

## XRPL Usage

| Feature                              | Status  |
| ------------------------------------ | ------- |
| XRPL Testnet via QuickNode WebSocket | Active  |
| `EscrowCreate`                       | Active  |
| `EscrowFinish`                       | Active  |
| PREIMAGE-SHA-256 crypto-conditions   | Active  |
| DID / Verifiable Credentials         | Roadmap |
| Frontend wallet signing              | Roadmap |
| AMM / DEX / NFTs                     | Roadmap |

---

## Tech Stack

```
Frontend          Backend           Settlement
─────────         ─────────         ──────────
Next.js 14        FastAPI           XRPL Testnet
React 18          SQLAlchemy        xrpl-py
Tailwind CSS      SQLite            QuickNode WSS
                  python-dotenv
                  python-multipart
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

---

## API Surface

### Public / Patient-facing

| Method  | Endpoint                 | Description            |
| ------- | ------------------------ | ---------------------- |
| `POST`  | `/api/cases`             | Create support request |
| `GET`   | `/api/cases/status`      | Resume a case          |
| `GET`   | `/api/clinics`           | List clinics           |
| `GET`   | `/api/clinics/{id}`      | Clinic details         |
| `POST`  | `/api/appointments`      | Book a slot            |
| `PATCH` | `/api/appointments/{id}` | Update appointment     |

### Funder-facing

| Method  | Endpoint                                           | Description                  |
| ------- | -------------------------------------------------- | ---------------------------- |
| `POST`  | `/api/fund`                                        | Create funding case + escrow |
| `GET`   | `/api/dashboard`                                   | Funding dashboard            |
| `PATCH` | `/api/clinic-admin/appointments/{id}/link-funding` | Link funding to appointment  |

### Clinic-facing

| Method | Endpoint              | Description                   |
| ------ | --------------------- | ----------------------------- |
| `POST` | `/api/clinic/verify`  | Verify voucher                |
| `POST` | `/api/clinic/confirm` | Confirm care + release escrow |

### Operations

| Method | Endpoint                       | Description         |
| ------ | ------------------------------ | ------------------- |
| `POST` | `/api/clinic-admin/register`   | Register clinic     |
| `POST` | `/api/clinic-admin/{id}/slots` | Create slots        |
| `POST` | `/api/proof`                   | Submit proof        |
| `POST` | `/api/proof/{id}/retry-payout` | Retry failed payout |
| `GET`  | `/health`                      | Health check        |

---

## Local Development

### 1. Backend

Create `backend/.env`:

```env
XRPL_NODE_URL=wss://your-xrpl-testnet-endpoint
FUNDER_WALLET_SEED=your_funder_seed
CLINIC_WALLET_SEED=your_clinic_seed
CLINIC_WALLET_ADDRESS=your_clinic_address
DATABASE_URL=sqlite:///./hackathon.db
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

### As a Patient

1. Open `/patient`
2. Search and select a clinic
3. Submit a support request
4. Save your access code
5. Resume and book a slot

### As a Funder

1. Open `/funder` and sign in
2. Create a funding case
3. Select a clinic and a booked appointment
4. Link the funding case

### As a Clinic

1. Open `/clinic` and sign in
2. Select an incoming request or paste a voucher ID
3. Verify — Confirm — Check payout released

---

## Implementation Notes

- Monetary values display as `EUR` in the UI; some backend fields still use `amount_xrp` for historical reasons
- Login screens are frontend-only — no real authentication in this MVP
- Clinic search loads from the backend and filters client-side by city, name, or doctor
- Proof submission is implemented in the backend but not yet fully surfaced in the frontend UI

---

## Roadmap

- [ ] Real DID support per patient case
- [ ] Verifiable Credentials for clinics and approved funding organizations
- [ ] Frontend wallet integration for funders
- [ ] Clinic-specific dashboards with stronger data partitioning
- [ ] Realtime transaction status via QuickNode Webhooks
- [ ] Production-grade auth and role management

---

## Hackathon Context

HerVoice was built at **Hack the Block** to explore how XRPL can support transparent, privacy-sensitive healthcare settlement flows in a cross-border setting.

The project is intentionally opinionated:

- **Privacy first** — sensitive data stays off-chain
- **Auditable settlement** — on-chain transparency without identity exposure
- **Calm UX** — designed for patients in a stressful moment

---

<div align="center">

<!-- Animated footer dots -->
<svg width="200" height="16" xmlns="http://www.w3.org/2000/svg">
  <circle cx="20" cy="8" r="3" fill="#f4c0d1">
    <animate attributeName="opacity" values="1;0.2;1" dur="1.8s" begin="0s" repeatCount="indefinite"/>
  </circle>
  <circle cx="40" cy="8" r="3" fill="#993556">
    <animate attributeName="opacity" values="1;0.2;1" dur="1.8s" begin="0.3s" repeatCount="indefinite"/>
  </circle>
  <circle cx="60" cy="8" r="3" fill="#f4c0d1">
    <animate attributeName="opacity" values="1;0.2;1" dur="1.8s" begin="0.6s" repeatCount="indefinite"/>
  </circle>
  <circle cx="80" cy="8" r="3" fill="#993556">
    <animate attributeName="opacity" values="1;0.2;1" dur="1.8s" begin="0.9s" repeatCount="indefinite"/>
  </circle>
  <circle cx="100" cy="8" r="3" fill="#f4c0d1">
    <animate attributeName="opacity" values="1;0.2;1" dur="1.8s" begin="1.2s" repeatCount="indefinite"/>
  </circle>
  <circle cx="120" cy="8" r="3" fill="#993556">
    <animate attributeName="opacity" values="1;0.2;1" dur="1.8s" begin="1.5s" repeatCount="indefinite"/>
  </circle>
  <circle cx="140" cy="8" r="3" fill="#f4c0d1">
    <animate attributeName="opacity" values="1;0.2;1" dur="1.8s" begin="1.8s" repeatCount="indefinite"/>
  </circle>
  <circle cx="160" cy="8" r="3" fill="#993556">
    <animate attributeName="opacity" values="1;0.2;1" dur="1.8s" begin="2.1s" repeatCount="indefinite"/>
  </circle>
  <circle cx="180" cy="8" r="3" fill="#f4c0d1">
    <animate attributeName="opacity" values="1;0.2;1" dur="1.8s" begin="2.4s" repeatCount="indefinite"/>
  </circle>
</svg>

<br/>

_Built with care at Hack the Block · Paris 2026_

<br/>

<!-- Animated footer bar -->
<svg width="100%" height="8" xmlns="http://www.w3.org/2000/svg">
  <rect width="100%" height="8" fill="#993556"/>
  <rect width="30%" height="8" fill="#f4c0d1" opacity="0.5">
    <animate attributeName="x" from="-30%" to="100%" dur="2.8s" repeatCount="indefinite"/>
  </rect>
</svg>

</div>
