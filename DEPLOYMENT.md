# Production Cloud Deployment Guide

This guide explains how to deploy the **AlphaPay** full-stack application (Next.js Frontend, FastAPI Backend, and PostgreSQL Database) to cloud providers (Vercel + Render / Railway + Neon / Supabase) within 5 minutes.

---

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│              Frontend (Next.js 15 App Router)               │
│                   Hosted on: Vercel                         │
│             Environment: NEXT_PUBLIC_API_URL                │
└──────────────────────────────┬──────────────────────────────┘
                               │ HTTPS API Calls
┌──────────────────────────────▼──────────────────────────────┐
│                  Backend (Python FastAPI)                   │
│             Hosted on: Render / Railway / Fly.io            │
│                  Environment: DATABASE_URL                  │
└──────────────────────────────┬──────────────────────────────┘
                               │ PostgreSQL Wire Protocol
┌──────────────────────────────▼──────────────────────────────┐
│                    PostgreSQL 16+ / 18                      │
│            Hosted on: Neon.tech / Supabase / Render         │
│               10,000 Transactions Seeded                    │
└─────────────────────────────────────────────────────────────┘
```

---

## ⚡ 5-Minute Zero-Friction Deployment

### Step 1: Deploy Hosted PostgreSQL (Neon.tech or Supabase)

1. Go to **[Neon.tech](https://neon.tech)** (free serverless PostgreSQL 16/18).
2. Click **Create Project** &rarr; name it `alphapay-db`.
3. Copy your connection string:
   ```
   postgresql://username:password@ep-cool-fog-123456.us-east-2.aws.neon.tech/alphapay-db?sslmode=require
   ```

---

### Step 2: Seed the Remote PostgreSQL Database

Run the database seeder from your local terminal targeting the cloud PostgreSQL instance:

```bash
# On Windows (PowerShell):
$env:DATABASE_URL="your-neon-or-supabase-connection-string"
python backend/db/seed.py

# On macOS/Linux:
DATABASE_URL="your-neon-or-supabase-connection-string" python backend/db/seed.py
```

*Output:*
```
============================================================
>> Digital Alpha Technology Database Seeder
============================================================
[1/4] Ensuring database schema and tables exist...
  [OK] Schema initialized successfully.
[2/4] Seeding Rewards Catalogue...
  [OK] 6 rewards seeded/updated.
[3/4] Loading and sanitizing transactions...
  [OK] Read 10,000 records from JSON.
[4/4] Inserting sanitized records into Database...
  -> Ingested 10,000/10,000 rows...
============================================================
SEED COMPLETED SUCCESSFULLY in 4.3 seconds
============================================================
```

---

### Step 3: Deploy Backend on Render (or Railway)

#### Option A: Using Render Blueprint (`render.yaml`)
1. Push this repository to your GitHub account.
2. Log in to **[Render.com](https://render.com)**.
3. Click **New** &rarr; **Blueprint** &rarr; select the `AlphaPay` repository.
4. Render will automatically detect `render.yaml`, configure the Python environment, connect the database, run the seeder, and launch the service.

#### Option B: Manual Web Service on Render
1. Click **New Web Service** &rarr; connect `https://github.com/Rishabh028/AlphaPay`.
2. Configure settings:
   - **Root Directory**: `backend` (or leave empty if using root commands)
   - **Runtime**: `Python 3`
   - **Build Command**: `pip install -r backend/requirements.txt && python backend/db/seed.py`
   - **Start Command**: `cd backend && uvicorn app.main:app --host 0.0.0.0 --port $PORT`
3. Add Environment Variable:
   - `DATABASE_URL`: `your-neon-or-supabase-connection-string`
4. Click **Deploy Web Service**.
5. Once deployed, note your backend URL (e.g. `https://alphapay-backend.onrender.com`). Verify docs at `/docs`.

---

### Step 4: Deploy Frontend on Vercel

1. Go to **[Vercel.com](https://vercel.com)** &rarr; **Add New** &rarr; **Project**.
2. Select your `AlphaPay` GitHub repository.
3. In the project setup screen:
   - **Framework Preset**: `Next.js`
   - **Root Directory**: Click *Edit* and select **`frontend`**.
4. Expand **Environment Variables** and add:
   - **`NEXT_PUBLIC_API_URL`**: `https://alphapay-backend.onrender.com/api/v1` (replace with your actual backend URL).
5. Click **Deploy**.
6. In ~60 seconds, your live frontend URL will be active (e.g., `https://alphapay-dashboard.vercel.app`).

---

## 🔒 Environment Variables Reference

| Variable | Scope | Description | Example |
| :--- | :--- | :--- | :--- |
| `DATABASE_URL` | Backend | PostgreSQL connection string | `postgresql://user:pass@ep-cool.neon.tech/neondb?sslmode=require` |
| `NEXT_PUBLIC_API_URL` | Frontend | Base URL of the FastAPI backend API | `https://alphapay-backend.onrender.com/api/v1` |
| `PORT` | Backend | Port injected by cloud hosts (Render/Railway) | `8000` or `10000` |

---

## 🩺 Verification Checklist

Once deployed, verify all live links:

1. **Backend Health Check**: `GET https://your-backend.onrender.com/api/v1/health` &rarr; `{"status":"online","database":"healthy"}`
2. **Interactive API Docs**: `GET https://your-backend.onrender.com/docs`
3. **Frontend Dashboard**: Open `https://your-app.vercel.app` &rarr; verify table renders 10,000 transactions, charts display categories/trends, and rewards redeem flow succeeds.
