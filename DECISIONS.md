# DECISIONS.md
**Digital Alpha Technology - Technical Decisions & Architectural Rationale**

This document outlines key technical decisions made during the architecture and development of the Transactions & Rewards Dashboard, along with the reasoning and trade-offs considered.

---

## 1. Frontend Architecture & Hand-Built UI Components

### Decision: Custom Design System & Zero Table Component Libraries
- **Context**: The brief explicitly required building the Table component from scratch without third-party libraries (no MUI, Ant Design, Chakra, or shadcn Table).
- **Implementation**:
  - Defined CSS custom properties in `globals.css` for typography, spacing, surface elevation, borders, shadows, and status colors.
  - Implemented `Table.tsx` using semantic HTML5 elements (`<table>`, `<thead>`, `<tbody>`, `<tr>`, `<th>`, `<td>`), with pure CSS sticky headers, backdrop blur, custom scrollbars, animated skeleton loading shimmers, and keyboard navigation.
  - Hand-crafted accessible `Modal.tsx` and slide-over `Drawer.tsx` components featuring focus traps, keyboard `Escape` dismissal, and backdrop click handlers.
- **Trade-off**: Requires writing more foundational CSS and keyboard listener logic compared to dropping in a pre-built library, but results in zero bundle bloat, 100% style control, and a distinct premium fintech feel.

---

## 2. Server-Side Filtering, Sorting & Pagination vs Browser Virtualization

### Decision: Server-Side Query Execution as the Primary Engine
- **Evaluation**:
  - *Browser-Only Virtualization*: Shipping all 10,000 JSON records to the browser and rendering virtualized DOM nodes (e.g. via `react-window` or `@tanstack/react-virtual`).
  - *Server-Side SQL Pushdown*: Pushing filtering, full-text searching, sorting, and pagination down to indexed PostgreSQL columns (`LIMIT 25 OFFSET ...`).
- **Rationale for Server-Side**:
  1. **Scalability**: While 10k rows can fit in modern browser memory, a real financial system grows to millions of rows where client-side memory and CPU fail. Server-side scales to any dataset size.
  2. **Network Bandwidth**: Client receives lightweight ~5 KB payloads per page instead of parsing 2.5+ MB JSON on initial page load, dramatically improving First Contentful Paint (FCP) on mobile networks.
  3. **Aggregations**: Summary statistics (filtered spend, success count, coins generated) and analytics queries execute in milliseconds in the database using optimized index scans.
- **Trade-off**: Requires network roundtrip per filter change. Mitigated by debouncing search inputs (280ms) and caching filter metadata.

---

## 3. Database Schema & Data Modeling

### Decision: Relational PostgreSQL Schema with Surrogate Primary Keys
- **Schema Design**:
  - `transactions`: Stores individual transactions with surrogate `UUID` primary keys (`id`), indexed `raw_id`, normalized `TIMESTAMPTZ`, numeric `DECIMAL(12, 2)`, normalized `category`, `status`, and pre-calculated `coins_earned`.
  - `rewards`: Stores active reward catalogue items with stock counters and coin costs.
  - `redemptions`: Audit ledger recording every redeemed voucher code, timestamp, reward reference, and coins spent.
- **Rationale**:
  - In `transactions.json`, 40 records share transaction IDs (e.g. `TXN2025000336` used for two distinct purchases). Using natural key `id` would cause database primary key collisions and data loss. Surrogate `UUID` ensures 100% record retention while retaining the original identifier.
  - Separate `redemptions` table provides an immutable ledger for balance reconciliation (`Available Balance = Total Earned Coins - Sum(Redeemed Coins)`).

---

## 4. Optimistic UI Updates with Clean Error Rollback

### Decision: Immediate UI Coin Balance Deduction with Revert on Failure
- **User Experience**:
  - When a user confirms a reward redemption, the UI immediately deducts the coin cost from the balance badge and displays the voucher code.
  - If the backend returns an error (e.g. HTTP 400 Insufficient Coins, 404 Reward Not Found, or network timeout), the state immediately **reverts back to the previous balance** and displays a descriptive error banner.
- **Rationale**: Financial consumer apps feel significantly snappier when non-critical actions provide instant feedback, as long as atomic database transactions and client rollbacks prevent phantom state drift.

---

## 5. Backend Architecture & Technology Stack

### Decision: Python with FastAPI, SQLAlchemy 2.0 & Pydantic v2
- **Rationale**:
  - FastAPI provides native async performance, automatic OpenAPI documentation at `/docs`, and strict type validation with Pydantic v2.
  - Layered architecture (`api/v1/` routes &rarr; `services/` business logic &rarr; `models/` data access) ensures clean separation of concerns and testability.
  - Pytest test suite validates all boundary conditions, filtering combinations, and coin redemption edge cases in under 2 seconds.
