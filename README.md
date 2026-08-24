# AlphaPay — Transactions & Rewards Dashboard

A credit-card bill payment dashboard where users can view 10,000+ transactions, earn reward coins on successful payments, analyze spending patterns, and redeem coins against a curated rewards catalogue.

**Built for the Digital Alpha Technology Full Stack Engineer Take-Home Assignment.**

---

## Stack

| Layer | Technology |
| :--- | :--- |
| **Frontend** | Next.js 15 (App Router), React 19, TypeScript |
| **Backend** | Python 3.10+, FastAPI, SQLAlchemy 2.0, Pydantic v2 |
| **Database** | PostgreSQL 16+ (tested on 16 and 18) |
| **Charts** | Recharts |
| **Styling** | Custom CSS design tokens (no component-library Table) |

---

## Local Setup (Under 5 Minutes)

### Prerequisites

- **Python 3.10+** (tested on 3.12, 3.13, 3.14)
- **Node.js 18+** (tested on v22)
- **Docker** (for local PostgreSQL) — or any hosted PostgreSQL (Neon, Supabase, Railway)

### 1. Start PostgreSQL

```bash
docker compose up -d
```

This spins up PostgreSQL 16 on `localhost:5432` with database `dat_db`, user `postgres`, password `postgrespassword`. The `schema.sql` runs automatically on first boot via Docker's init scripts.

If you already have a PostgreSQL instance, set `DATABASE_URL` before step 2:

```bash
export DATABASE_URL="postgresql://user:pass@host:5432/dbname"
```

### 2. Backend Setup & One-Command Seed

```bash
cd backend
python -m venv venv

# Activate:
# Windows:  .\venv\Scripts\activate
# macOS/Linux:  source venv/bin/activate

pip install -r requirements.txt

# Seed the database (creates schema + loads all 10,000 transactions + rewards catalogue):
python db/seed.py

# Start the API server:
uvicorn app.main:app --reload --port 8000
```

Backend will be live at `http://localhost:8000` — Swagger docs at `http://localhost:8000/docs`.

### 3. Frontend Setup

In a **new terminal**:

```bash
cd frontend
npm install
npm run dev
```

Open **http://localhost:3000** in your browser.

---

## API Endpoints

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/v1/transactions` | List transactions (server-side filter, search, sort, paginate) |
| `GET` | `/api/v1/transactions/{id}` | Single transaction detail |
| `GET` | `/api/v1/transactions/filters` | Available filter options (categories, statuses, merchants) |
| `GET` | `/api/v1/analytics/spend-by-category` | Category-level spend breakdown |
| `GET` | `/api/v1/analytics/monthly-trend` | Monthly spend and coin trajectory |
| `GET` | `/api/v1/analytics/overview` | High-level summary stats |
| `GET` | `/api/v1/rewards/balance` | Current coin balance |
| `GET` | `/api/v1/rewards/catalogue` | Available rewards catalogue |
| `POST` | `/api/v1/rewards/redeem` | Redeem a reward (validates balance, returns voucher) |
| `GET` | `/api/v1/rewards/history` | Redemption audit ledger |
| `GET` | `/api/v1/health` | Service health check |

---

## Running Tests

```bash
cd backend
pytest tests -v
```

18 automated tests covering transaction filtering, sorting, pagination, coin balance calculation, insufficient-balance rejection, nonexistent-reward 404s, and redemption ledger persistence.

---

## What's Done

- [x] **Transactions table on full 10k rows** — server-side filtering (category, date range, amount range, status — all combinable), live debounced merchant search, sortable by date and amount. Stays smooth.
- [x] **Hand-built Table** — no MUI, Ant, Chakra, shadcn, or TanStack. Semantic HTML `<table>`, CSS sticky header with backdrop blur, hover/focus states, animated skeleton loading, empty and error states, responsive down to 360px.
- [x] **Category spend chart** — Recharts donut with interactive slice selection.
- [x] **Monthly trend chart** — Recharts bar chart with monthly spend trajectory.
- [x] **One-way chart → table filtering** — clicking a category slice or month bar filters the transaction table.
- [x] **Two-way cross-filtering** — table category filter reshapes the monthly trend chart; date filters reshape both charts.
- [x] **Visible coin balance** — always-visible glowing badge in the navbar showing available coins.
- [x] **Rewards catalogue** — 6 curated rewards (Amazon, Swiggy, MakeMyTrip, Spotify, BPCL, Apple Store).
- [x] **Redeem flow** — select → confirm modal → done. Backend validates balance and reward existence with proper HTTP 400/404 status codes.
- [x] **Optimistic balance update with rollback** — balance deducts immediately in the UI; if the API call fails, balance reverts cleanly.
- [x] **Hand-built Modal and Drawer** — focus trap, Escape to close, backdrop click dismiss, `aria-modal="true"`.
- [x] **PostgreSQL schema and one-command seed** — `schema.sql` with indexes + `seed.py` ingests all 10k rows in ~4 seconds.
- [x] **Backend tests** — 18 pytest tests with 100% pass rate.
- [x] **Row click → detail drawer** — slide-over with full receipt details and copyable transaction ID.
- [x] **Design tokens** — CSS custom properties for color, spacing, typography, and surface elevation.
- [x] **Reusable UI components** — Button, Card, Badge, Input, Select, Modal, Drawer, Table.
- [x] **Data quality handling** — 5 timestamp formats normalized, 40 duplicate IDs resolved with surrogate UUIDs, 200 missing categories imputed, string amounts cast, status casing normalized.

## What's Not Done

- Deployment to a live URL (would use Vercel + Render + Neon for frontend/backend/Postgres).
- Formal end-to-end Cypress or Playwright tests.
- Rate limiting or authentication on API endpoints.

## Known Issues

- First load of Next.js dev server can be slow (~30-40s) due to JIT compilation of 1,700+ modules; subsequent navigations are instant.
- The `docker-compose.yml` uses `postgres:16-alpine`; upgrade to `postgres:18-alpine` when the image is available on Docker Hub.

---

## Repository Documentation

- [ASSUMPTIONS.md](./ASSUMPTIONS.md) — Product calls made where the brief was vague
- [DECISIONS.md](./DECISIONS.md) — Technical choices that mattered, with rationale
- [AI-USAGE.md](./AI-USAGE.md) — AI tools used, with real examples of output fixed/discarded
- [backend/db/schema.sql](./backend/db/schema.sql) — PostgreSQL DDL schema
- [backend/db/seed.py](./backend/db/seed.py) — Database seed script
