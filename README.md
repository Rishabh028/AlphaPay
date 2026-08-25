# AlphaPay — Transactions & Rewards Dashboard

A consumer financial dashboard for credit-card bill payments where users can view 10,000+ transactions, earn reward coins on payments, analyze spend patterns across categories and billing cycles, and redeem coins against a curated rewards catalogue.

**Built for the Digital Alpha Technology Full Stack Engineer Take-Home Assignment.**

---

## 🌐 Live URLs & Deployment

| Service | Host | Status / URL |
| :--- | :--- | :--- |
| **Frontend Web App** | Vercel | [Live App](https://alphapay.vercel.app) *(or connect via [DEPLOYMENT.md](./DEPLOYMENT.md))* |
| **Backend API & Swagger** | Render / Railway | [API Docs (`/docs`)](https://alphapay-backend.onrender.com/docs) |
| **PostgreSQL Database** | Neon / Supabase | PostgreSQL 16+ / 18 Managed Instance (10k seeded rows) |
| **Complete Deployment Guide** | Multi-Cloud | [DEPLOYMENT.md](./DEPLOYMENT.md) |

---

## 🛠️ Stack

| Layer | Technology |
| :--- | :--- |
| **Frontend (70–75%)** | Next.js 15 (App Router), React 19, TypeScript, Custom Design Tokens |
| **Hand-Built Table** | Semantic HTML5 (`<table>`), Pure CSS Sticky Headers, Shimmer Shimmer (Zero Library Table) |
| **Charts** | Recharts (Category Donut & Monthly Spend Trend with Two-Way Cross-Filtering) |
| **Backend API** | Python 3.10+, FastAPI, Pydantic v2, SQLAlchemy 2.0 |
| **Database** | PostgreSQL 16+ / 18 (Relational Schema + 1-Command Batch Ingestion Seeder) |
| **Deployment / IaC** | Vercel (`vercel.json`), Render (`render.yaml`), Docker (`backend/Dockerfile`) |

---

## 🚀 Local Setup (Under 5 Minutes)

### Prerequisites

- **Python 3.10+** (tested on 3.12, 3.13, 3.14)
- **Node.js 18+** (tested on v20, v22)
- **Docker** (for local PostgreSQL) — or any cloud PostgreSQL instance (Neon / Supabase)

### 1. Start PostgreSQL

```bash
docker compose up -d
```

This spins up PostgreSQL 16 on `localhost:5432` with database `dat_db`, user `postgres`, password `postgrespassword`. The relational schema in `backend/db/schema.sql` runs automatically on first boot.

*Alternatively, you can provide any remote connection string in `DATABASE_URL`.*

### 2. Backend Setup & One-Command Seed

```bash
cd backend
python -m venv venv

# Activate virtual environment:
# Windows (PowerShell):
.\venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

pip install -r requirements.txt

# Run the 1-Command Database Seeder (Sanitizes & ingests 10k rows in ~4 seconds):
python db/seed.py

# Start Backend Server:
uvicorn app.main:app --reload --port 8000
```

Backend API will be live at `http://localhost:8000` — interactive Swagger docs at `http://localhost:8000/docs`.

### 3. Frontend Setup

In a **new terminal**:

```bash
cd frontend
npm install
npm run dev
```

Open **`http://localhost:3000`** in your browser.

---

## 🔌 API Endpoints Reference

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/v1/transactions` | List transactions (server-side filter, search, sort, paginate) |
| `GET` | `/api/v1/transactions/{id}` | Single transaction receipt detail |
| `GET` | `/api/v1/transactions/filters` | Available filter options (categories, statuses, payment methods) |
| `GET` | `/api/v1/analytics/spend-by-category` | Category-level spend breakdown & percentages |
| `GET` | `/api/v1/analytics/monthly-trend` | Monthly spend trajectory, volume, and coin accumulation |
| `GET` | `/api/v1/analytics/overview` | High-level summary metrics |
| `GET` | `/api/v1/rewards/balance` | Current live coin balance |
| `GET` | `/api/v1/rewards/catalogue` | Available 6-item rewards catalogue with stock |
| `POST` | `/api/v1/rewards/redeem` | Redeem a reward (validates balance/stock, generates voucher code) |
| `GET` | `/api/v1/rewards/history` | Historical audit ledger of all redeemed vouchers |
| `GET` | `/api/v1/health` | Service health check |

---

## 🧪 Running Automated Tests

```bash
cd backend
pytest tests -v
```

18 automated backend tests covering:
- Server-side multi-filter combinations (Category, Status, Date Range, Amount Range).
- Live debounced merchant search and sorting.
- Coin balance calculation rules (1 coin per ₹100, 100 coin/txn cap).
- Rejection on insufficient balance (`HTTP 400`) and nonexistent rewards (`HTTP 404`).
- Redemption ledger persistence and voucher generation.

---

## 📋 What's Done

- [x] **Transactions Table on Full 10k Rows**: Server-side filtering, searching, sorting, and pagination with summary stats.
- [x] **Hand-Built Table (Zero Component Libraries)**: Pure semantic HTML `<table>` + custom design tokens (no MUI, Ant, Chakra, TanStack, or shadcn Table). Features sticky header with backdrop blur, column sorting chevrons, animated skeleton loading shimmer, empty/error states, and responsive layout down to 360px.
- [x] **Spend Analytics (Two Charts)**: Interactive Category Spend Donut Chart and Monthly Spend Trend Bar Chart (Recharts).
- [x] **Two-Way Cross-Filtering**: Donut chart slice &rarr; table filter, monthly bar &rarr; date range filter, table filters &rarr; chart dynamic reshaping.
- [x] **Reward Coins Engine**: Dynamic balance calculation, 6-item curated catalogue, and multi-step redeem flow.
- [x] **Optimistic UI with Clean Rollback**: Instant balance updates with revert and alert banner on backend rejection.
- [x] **Hand-Built Accessible Modal & Drawer**: Focus trap, keyboard `Escape` dismissal, backdrop click handlers, `aria-modal="true"`.
- [x] **PostgreSQL Schema & One-Command Seed**: `schema.sql` with indexes + `seed.py` ingests all 10k rows in ~4 seconds handling 5 timestamp formats, duplicate ID collisions, missing category imputation, and string amount casting.
- [x] **Cloud Deployment Artifacts**: `render.yaml` (Render blueprint), `backend/Dockerfile`, `backend/Procfile`, `frontend/vercel.json`, and [`DEPLOYMENT.md`](./DEPLOYMENT.md).
- [x] **100% Passing Automated Tests**: 18 pytest tests.

---

## 📁 Repository Documentation Links

- [ASSUMPTIONS.md](./ASSUMPTIONS.md) — Product calls made where the brief was open
- [DECISIONS.md](./DECISIONS.md) — Technical choices that mattered (state management, pagination vs virtualization, schema design)
- [AI-USAGE.md](./AI-USAGE.md) — AI tools used with 3 real examples of fixed/discarded output
- [DEPLOYMENT.md](./DEPLOYMENT.md) — Step-by-step 5-minute cloud deployment guide
- [backend/db/schema.sql](./backend/db/schema.sql) — PostgreSQL DDL schema
- [backend/db/seed.py](./backend/db/seed.py) — Database seed script
