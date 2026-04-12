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
![Python](https://img.shields.io/badge/Python_3.9-2C2C2A?style=flat-square&logo=python&logoColor=fff8fa)
![SQLAlchemy](https://img.shields.io/badge/SQLAlchemy-993556?style=flat-square&logo=sqlalchemy&logoColor=fff8fa)
![SQLite](https://img.shields.io/badge/SQLite-2C2C2A?style=flat-square&logo=sqlite&logoColor=fff8fa)
![XRPL](https://img.shields.io/badge/XRPL_Testnet-993556?style=flat-square&logo=ripple&logoColor=fff8fa)
![QuickNode](https://img.shields.io/badge/QuickNode-2C2C2A?style=flat-square&logo=quicknode&logoColor=fff8fa)

<br/>

> _"Turning a funding promise into a transparent, auditable payment flow —_
> _without exposing patient identity or medical records."_

<br/>

**[Live Demo](https://hervoicehackthon.vercel.app)** · **[Backend API](https://hervoice-cul5.onrender.com/docs)** · **[Health Check](https://hervoice-cul5.onrender.com/health)**

<svg width="100%" height="4" xmlns="http://www.w3.org/2000/svg">
  <rect width="100%" height="4" fill="#fff8fa"/>
  <rect width="20%" height="4" fill="#993556" opacity="0.6">
    <animate attributeName="x" from="-20%" to="100%" dur="2.2s" repeatCount="indefinite"/>
  </rect>
</svg>

</div>

---

## The Problem

Every year, thousands of people in Europe travel to France for abortion care because their home country restricts or prohibits it. The medical barrier is only part of the challenge. The funding gap is often what stops them first — not because support doesn't exist, but because funding promises are informal, unverifiable, and impossible for a clinic to trust before providing care.

HerVoice solves the trust problem between funders and clinics, without creating a surveillance problem for patients.

---

## How It Works

HerVoice connects three roles — patient, funder, clinic — through a single verifiable payment flow on XRPL:

```
Clinic publishes available slots
        ↓
Patient books a slot and submits identity
        ↓
Backend computes SHA-256 hash — raw identity discarded immediately
        ↓
Funder reviews pending cases on dashboard and locks XRP in XRPL escrow
        ↓
Patient arrives at clinic and re-enters the same three identity fields
        ↓
Backend recomputes hash — if it matches an active funded case, escrow releases
        ↓
Payment confirmed on XRPL Testnet, transaction hash on-chain
```

No manual approval. No PDF upload. No staff verification. The patient's own re-entry of their identity is the key that unlocks the payment.

---

## Why This Matters

|              | The Problem                                    | HerVoice's Answer                                                           |
| ------------ | ---------------------------------------------- | --------------------------------------------------------------------------- |
| **Patients** | Cross-border care is hard to coordinate safely | Slot-based booking with no stored raw identity — only a hash               |
| **Clinics**  | Funding promises are unverifiable              | XRPL escrow released only after identity match — not on promise alone       |
| **Funders**  | No way to audit where support actually went    | Transparent on-chain settlement with transaction hash and patient hash memo |
| **Everyone** | Sensitive data risks exposure                  | Raw identity never stored, never on-chain — discarded after hashing         |

---

## Judging Criteria

### What's Different

Most privacy-preserving health funding systems either expose patient identity or require complex DID infrastructure. HerVoice takes a different approach: instead of storing identity and protecting it, it **never stores it at all**. The patient hash model means the database contains nothing that could identify a patient, even under compulsion. The XRPL Memo field carries an immutable, auditable anchor without leaking anything.

### What's Working

The full end-to-end flow is live and testable:

- `POST /api/cases` — patient creates a funding case, identity hashed and discarded
- `POST /api/fund` — funder locks XRP in XRPL escrow via `EscrowCreate` with PREIMAGE-SHA-256 condition and patient hash in Memo
- `POST /api/clinic/verify-and-release` — patient re-enters identity at clinic, hash matched, `EscrowFinish` triggered automatically
- All transactions verifiable on [XRPL Testnet Explorer](https://testnet.xrpl.org)

Blockchain connectivity is provided by [QuickNode](https://www.quicknode.com), giving us a reliable WebSocket endpoint to XRPL Testnet for stable transaction submission throughout the demo.

### Why It Matters

Cross-border abortion access is a documented, growing challenge in Europe. Poland, Malta, Hungary, and others have near-total restrictions. France has become a destination country. The financial coordination layer for this movement is currently informal and fragile. HerVoice builds the infrastructure that makes it trustworthy — on a public, auditable ledger, without creating a database of patient identities that could be subpoenaed, hacked, or misused.

The same funding rail generalises to any cross-border healthcare scenario where identity-verified, privacy-preserving payout is needed.

### What We Claim and What We Don't

The core claim is narrow and defensible: **funds are released only when this specific person arrives at this specific clinic**. We do not claim to verify that surgery was completed — that requires RPPS API integration and is on the v2 roadmap. We claim what the system actually does, and the on-chain record proves it.

---

## Privacy Model

**Raw identity is never stored. Not in the database. Not on-chain.**

| Layer | What Is Stored |
| ----- | -------------- |
| In-memory only (per request) | Name, date of birth, insurance number |
| Database | `patient_hash` (SHA-256), clinic/slot/case metadata, XRPL tx hashes |
| On-chain (XRPL) | `EscrowCreate`, `EscrowFinish`, transaction hashes, Memo with `patient_hash` |

The three identity fields are used to compute a SHA-256 hash and then discarded. They exist in memory for the duration of a single HTTP request. No logs, no persistence.

The same hash is recomputed at clinic arrival and matched against the database. If it matches an active funded case, the escrow releases. The patient is the only person who can trigger this — only they know their own identity fields.

> The current MVP does not use DID. A DID/VC layer for clinic and funder identity is on the roadmap.

---

## XRPL Integration

| Feature | Status |
| ------- | ------ |
| XRPL Testnet via QuickNode WebSocket | Active |
| `EscrowCreate` with crypto-condition | Active |
| `EscrowFinish` triggered by identity match | Active |
| PREIMAGE-SHA-256 condition (manual ASN.1 DER encoding, no third-party library) | Active |
| Patient hash written to transaction Memo field | Active |
| Duplicate funding prevention via hash lookup | Active |
| DID / Verifiable Credentials for clinic identity | Roadmap |
| RLUSD settlement | Roadmap |
| Frontend wallet signing | Roadmap |

The escrow condition is condition-based, not time-based. This means the funds **cannot be released by anyone other than our backend**, which holds the fulfillment secret. Payment is genuinely gated on identity verification — not on a timer that anyone could wait out.

---

## What's Live

### Patient Flow
- Browse clinics by city
- Select an available slot
- Submit identity to create a funding case (identity hashed and discarded)
- Duplicate active funding for the same identity is rejected

### Clinic Flow
- Register and manage clinic profile
- Create and publish available time slots
- Verify patient identity on arrival — no staff action required beyond providing the terminal
- Escrow releases automatically on successful match

### Funder Flow
- View all pending cases on the dashboard
- Lock XRP in escrow for a selected case
- Track status: `pending` → `active` → `released`
- View on-chain transaction hashes for each settled case

---

## Tech Stack

```
Frontend          Backend                      Settlement
─────────         ──────────────────────       ──────────────────
Next.js 14        FastAPI                      XRPL Testnet
React 18          Python 3.9                   xrpl-py
Tailwind CSS      SQLAlchemy + SQLite          QuickNode WebSocket
                  PREIMAGE-SHA-256 (manual)
                  Hash-based identity engine
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
| `POST`  | `/api/cases`              | Create funding case — identity hashed and discarded |
| `PATCH` | `/api/appointments/{id}`  | Cancel or reschedule an appointment |
| `GET`   | `/api/clinics`            | List clinics with available slots   |

### Clinic

| Method | Endpoint                         | Description                                      |
| ------ | -------------------------------- | ------------------------------------------------ |
| `POST` | `/api/clinics`                   | Register a clinic                                |
| `POST` | `/api/clinics/{id}/slots`        | Publish an available slot                        |
| `POST` | `/api/clinic/verify-and-release` | Match patient identity and release escrow        |

### Funder / Operations

| Method | Endpoint         | Description                               |
| ------ | ---------------- | ----------------------------------------- |
| `POST` | `/api/fund`      | Lock XRP in escrow for a pending case     |
| `GET`  | `/api/dashboard` | Overview of all cases, status, tx hashes  |
| `GET`  | `/health`        | Health check                              |

---

## Local Development

### 1. Backend

Create `backend/.env`:

```env
XRPL_NODE_URL=wss://your-quicknode-xrpl-endpoint
FUNDER_WALLET_SEED=your_funder_seed
CLINIC_WALLET_SEED=your_clinic_seed
CLINIC_WALLET_ADDRESS=your_clinic_address
DATABASE_URL=sqlite:///./hervoice.db
```

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

### 2. Frontend

Create `frontend/.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

```bash
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
1. Register a clinic at `/clinic`
2. Create one or more available slots

### As a Patient
1. Open `/patient`
2. Browse clinics and select a slot
3. Submit name, date of birth, and insurance number to create a funding case
4. Save your case ID

### As a Funder
1. Open `/funder`
2. View pending cases on the dashboard
3. Lock XRP in escrow for a selected case

### At Arrival
1. Open `/clinic`
2. Patient re-enters name, date of birth, insurance number
3. Backend recomputes hash, matches against active case
4. If matched: escrow releases, transaction hash returned
5. Verify the transaction at [testnet.xrpl.org](https://testnet.xrpl.org)

---

## Roadmap

- [ ] RPPS invoice verification for surgery completion proof (v2)
- [ ] DID / Verifiable Credentials for clinic and funder identity
- [ ] RLUSD settlement support
- [ ] Frontend wallet signing
- [ ] Realtime XRPL transaction updates via QuickNode
- [ ] Multi-clinic routing with clinic-specific wallet addresses
- [ ] Production-grade auth and role management

---

## Implementation Notes

- The backend stores only `patient_hash` — never name, date of birth, or insurance number
- Raw identity exists in memory for one request only; no logging of input fields
- The current MVP verifies **patient arrival and identity match**, not surgery completion — this is a deliberate scope decision, not a gap
- The escrow condition is cryptographic (PREIMAGE-SHA-256), not time-based — only our backend can release funds
- Same-hash duplicate prevention means one patient cannot hold two active funded cases simultaneously
- Multiple historical cases per patient are permitted — a patient may need care more than once

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

_Built with care at Hack the Block · Paris Blockchain Week 2026_

<br/>

<svg width="100%" height="8" xmlns="http://www.w3.org/2000/svg">
  <rect width="100%" height="8" fill="#993556"/>
  <rect width="30%" height="8" fill="#f4c0d1" opacity="0.5">
    <animate attributeName="x" from="-30%" to="100%" dur="2.8s" repeatCount="indefinite"/>
  </rect>
</svg>

<br/>

<h2 style="margin: 18px 0 10px; color: #2C2C2A;">Team</h2>

<p align="center" style="margin: 0;">
  <a href="https://www.linkedin.com/in/allegra-melli-roma/" style="display: inline-block; margin: 0 14px; font-size: 28px; font-weight: 700; color: #993556; text-decoration: none;">Allegra</a>
  <a href="https://www.linkedin.com/in/huilin-guo-782922286/" style="display: inline-block; margin: 0 14px; font-size: 28px; font-weight: 700; color: #2C2C2A; text-decoration: none;">Huilin</a>
  <a href="https://www.linkedin.com/in/rebecca-thinnes-ba1304389/?locale=de" style="display: inline-block; margin: 0 14px; font-size: 28px; font-weight: 700; color: #993556; text-decoration: none;">Rebecca</a>
</p>

</div>
