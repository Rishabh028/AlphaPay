# AlphaPay - Financial Transactions & Rewards Dashboard
**Take-Home Assignment for Digital Alpha Technology**

A high-performance consumer financial dashboard for managing credit card transactions, analyzing spend patterns across categories and billing cycles, and earning/redeeming reward coins.

---

## 🌟 Architecture & Key Features

```
┌────────────────────────────────────────────────────────────────────────┐
│               AlphaPay Dashboard (Next.js 15 + React 19)               │
│  ┌─────────────────────────┐  ┌─────────────────────────────────────┐  │
│  │ Spend Analytics Charts  │  │   Reward Coins & Redeem Shop        │  │
│  │ Category Donut & Trends │  │   Optimistic Update + Rollback      │  │
│  └────────────┬────────────┘  └──────────────────┬──────────────────┘  │
│               │ (Two-Way Cross-Filtering)        │                     │
│  ┌────────────▼──────────────────────────────────▼──────────────────┐  │
│  │ Hand-Built Data Table (Sticky Header, Responsive to 360px)       │  │
│  │ Live Debounced Search, Multi-Filter Combination, Server Sorting  │  │
│  └─────────────────────────────────┬────────────────────────────────┘  │
└────────────────────────────────────┼───────────────────────────────────┘
                                     │ JSON API (FastAPI)
┌────────────────────────────────────▼───────────────────────────────────┐
│                    Python FastAPI Backend Engine                       │
│  • Transaction Service (Server-side Filter/Sort/Page/Stats)            │
│  • Spend Analytics Service (Aggregations & Cross-Filter Slices)        │
│  • Rewards & Ledger Engine (Atomic Balance Checks & Voucher Codes)     │
└────────────────────────────────────┬───────────────────────────────────┘
                                     │ SQL Queries & Indexes
┌────────────────────────────────────▼───────────────────────────────────┐
│                    PostgreSQL 16+ / 18 Database                        │
│  • transactions table (10,000 sanitized rows, surrogate UUIDs, idx)   │
│  • rewards table (6 curated catalogue items, stock management)         │
│  • redemptions table (audit ledger of all redeemed vouchers)           │
└────────────────────────────────────────────────────────────────────────┘
```

### 1. Hand-Built Table (Zero Component Libraries)
- Built completely from scratch using semantic HTML and custom CSS design tokens (no MUI, Ant, Chakra, TanStack, or shadcn).
- **Sticky Header**: `<thead>` with backdrop blur and bottom elevation stays pinned during scrolling.
- **Sorting**: Interactive sorting by Timestamp, Amount, Merchant, and Category with direction chevrons.
- **Interactive States**: Animated skeleton shimmer loading, empty state with filter reset, and row hover/focus rings.
- **Mobile Responsive**: Holds together gracefully down to 360px viewport width with smooth horizontal container scroll.

### 2. Spend Analytics with Two-Way Cross-Filtering
- **Category Donut Chart**: Interactive category breakdown with spend totals, transaction counts, and percentages.
- **Monthly Trend Chart**: Monthly billing trajectory with spend, success counts, and reward coin accumulation.
- **Two-Way Interaction**: Clicking a slice in the category chart filters the transaction table; clicking a month bar filters by date range.

### 3. Rewards & Optimistic Redemption Flow
- **Coin Earning Engine**: 1 coin earned per ₹100 spent on `SUCCESS` transactions (capped at 100 coins/txn).
- **Curated Catalogue**: 6 lifestyle rewards (Amazon ₹500, Swiggy ₹250, MakeMyTrip ₹1,000, Spotify 3-Month, BPCL Fuel ₹150, Apple Store ₹2,000).
- **Optimistic UI with Rollback**: Balance updates immediately on confirmation. If the backend rejects (unaffordable / out of stock / server error), balance rolls back cleanly with an alert.
- **Accessible Modal & Drawer**: Hand-built with native focus trapping, keyboard `Escape` dismissal, and backdrop click handlers.

---

## 🚀 Quick Setup (Under 5 Minutes)

### Prerequisites
- Python 3.10+ (tested on Python 3.12, 3.13, 3.14)
- Node.js 18+ (tested on v22)
- Docker (optional, for local PostgreSQL) or any cloud PostgreSQL instance (Neon / Supabase)

---

### Step 1: Start PostgreSQL (or use SQLite/Cloud Postgres)
If you have Docker running:
```bash
docker compose up -d
```
*Alternatively, you can provide any cloud PostgreSQL URL in `DATABASE_URL`.*

---

### Step 2: Setup Backend & Seed Database (One Command)
```bash
# Navigate to backend and create virtualenv
cd backend
python -m venv venv

# Activate virtual environment:
# On Windows:
.\venv\Scripts\activate
# On Linux/macOS:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run the 1-Command Database Seeder (Sanitizes and ingests 10k rows)
python db/seed.py

# Start Backend Server
uvicorn app.main:app --reload --port 8000
```
Backend API will be live at: `http://localhost:8000` (Swagger docs at `http://localhost:8000/docs`).

---

### Step 3: Start Frontend
In a new terminal:
```bash
cd frontend
npm install
npm run dev
```
Open `http://localhost:3000` in your browser.

---

## 🧪 Automated Test Suite

To run the automated backend test suite (covering server-side filtering, sorting, pagination, coin calculations, balance rejection, and redemption ledger):

```bash
cd backend
pytest tests -v
```

---

## 📋 Honest Done / Not-Done / Known Issues

### ✅ What is Done:
- [x] **Full 10k Dataset Support**: Server-side filtering, searching, sorting, and pagination.
- [x] **Hand-Built Table**: Built without component libraries, sticky header, skeleton shimmer, responsive down to 360px.
- [x] **Two-Way Cross-Filtering**: Donut chart slice &rarr; table filter, monthly bar &rarr; date range filter.
- [x] **Reward Coins Engine**: Dynamic balance calculation, 6-item catalogue, redeem flow with unique voucher generation.
- [x] **Optimistic UI with Rollback**: Instant balance updates with revert on error.
- [x] **Hand-Built Accessible Modal & Drawer**: Focus trap, keyboard Escape, backdrop click.
- [x] **PostgreSQL Schema & One-Command Seed**: Ingestion script handling all 5 timestamp formats, string amounts, negative reversals, duplicate ID surrogate keys, and category imputation.
- [x] **100% Test Coverage on Core Flows**: Pytest suite passing with 18 automated tests.

### ⏳ Not Done / Future Enhancements:
- Multi-currency conversion (dataset is 100% INR).
- Push notification webhooks for background payment status changes.

---

## 📁 Repository Documentation Links
- [ASSUMPTIONS.md](file:///ASSUMPTIONS.md): Product calls and data anomaly handling.
- [DECISIONS.md](file:///DECISIONS.md): Architectural decisions and trade-offs.
- [AI-USAGE.md](file:///AI-USAGE.md): AI tools disclosure with real examples of fixed/discarded output.
- [schema.sql](file:///backend/db/schema.sql): PostgreSQL relational DDL schema.
- [seed.py](file:///backend/db/seed.py): High-performance database seeder.
