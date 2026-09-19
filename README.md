# StaySync — Real-Time Property Rental, Maintenance & Amenity Management Platform

> A comprehensive, modern property management web application for **Tenants**, **Property Managers**, and **Administrators** built with **Next.js 15**, custom **Vanilla CSS**, **Node.js/Express**, and **Supabase PostgreSQL & Realtime**.

---

## 1. Key Features by Role

### 🏠 Tenant Portal
- **My Home Residence**: View assigned property details, apartment unit number, floor level, monthly rent, and emergency management contacts.
- **Maintenance Requests**: Report unit issues with automated unit-binding, priority levels (`low`, `medium`, `high`, `urgent`), and real-time status progression stepper (`Pending Review` ➔ `In Progress` ➔ `Resolved`).
- **Amenity Booking**: Interactive slot generator with live availability badges (`🟢 Available` vs `🔴 Booked`).
- **Check-In & Check-Out**: One-click check-in and check-out recording actual arrival and departure timestamps.

### 🏢 Property Manager Operations
- **Portfolio Management**: Real-time property inventory, floor plans, occupancy percentage progress bars, and vacant unit tracking.
- **Tenant Assignment**: 1-click tenant assignment modal to link tenants to empty apartments.
- **Maintenance Dispatch Queue**: Filter tickets by status or priority, assign contractors, record resolution notes, and trigger instant real-time updates on tenant screens.
- **Amenity Schedule**: Today's master timeline for all shared facilities (pool, gym, conference rooms).

### 🛡️ System Administration
- **Global Governance**: Portfolio-wide statistics, user role administration, security policies, and 0-conflict engine monitoring.
- **Row Level Security**: Complete PostgreSQL RLS policies ensuring strict data isolation between tenants and managers.

---

## 2. Technology Stack

| Layer | Technology | Purpose |
|---|---|---|
| **Frontend** | Next.js 15 (App Router) | Responsive UI, client hydration, route protection |
| **Styling** | Vanilla CSS (Design Tokens) | Glassmorphism, dark slate aesthetic, fluid micro-animations |
| **Icons** | Lucide React | Clean, scalable iconography |
| **Backend API** | Node.js + Express.js | REST APIs, conflict validation, role guards |
| **Database** | Supabase PostgreSQL | Primary relational database with triggers & constraints |
| **Security** | Supabase Auth + RLS | JWT authentication, role-based authorization |
| **Real-time** | Supabase Realtime + SSE | Instant dashboard synchronization without manual page refreshes |

---

## 3. Architecture & Request Flow

```text
               CLIENT BROWSER
    (Tenants, Property Managers, Admins)
                   │
                   ▼
         Next.js Frontend (Port 3000)
             /                   \
   REST API / HTTP            Real-Time Events
          /                       (SSE / Supabase)
         ▼                               ▲
 Express API (Port 5005)                  │
         │                                │
  Validation & Business Logic             │
         │                                │
         ▼                                │
   Supabase PostgreSQL ──(Change Triggers)─┘
   (Schema, Constraints, RLS)
```

---

## 4. Quick Start Guide

### Prerequisites
- **Node.js**: v18+ (Tested on v24.12)
- **npm**: v9+

### 1. Clone & Setup Directory
```bash
cd "d:/internship project/RTPR-T2"
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env` in `backend/` and `frontend/`:
```bash
# Backend configuration (backend/.env)
PORT=5005
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Frontend configuration (frontend/.env.local)
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_API_URL=http://localhost:5005/api
```

*(Note: Pre-configured with built-in instant demo login roles so you can test all features immediately without waiting for Supabase credentials).*

### 3. Install Dependencies & Run

**Start Backend Server:**
```bash
cd backend
npm install
npm start
# Server runs at http://localhost:5005
# Healthcheck at http://localhost:5005/api/health
```

**Start Frontend Application:**
```bash
cd frontend
npm install
npm run dev
# Frontend runs at http://localhost:3000
```

---

## 5. Database Setup (Supabase)

To initialize your database tables, constraints, and Row Level Security:
1. Open your **Supabase Project Dashboard**.
2. Go to the **SQL Editor**.
3. Run the SQL scripts in this exact order:
   - [database/schema.sql](file:///d:/internship%20project/RTPR-T2/database/schema.sql): Tables, foreign keys, overlap trigger, realtime publication.
   - [database/policies.sql](file:///d:/internship%20project/RTPR-T2/database/policies.sql): Row Level Security policies.
   - [database/seed.sql](file:///d:/internship%20project/RTPR-T2/database/seed.sql): Demo properties, units, and luxury amenities.

---

## 6. Automated Testing

Run the built-in automated test suite:
```bash
cd backend
npm test
```

### Verified Test Cases:
- ✔ Healthcheck (`GET /api/health` returns 200 OK)
- ✔ Demo Authentication (`POST /api/auth/demo-login` returns valid token)
- ✔ Role Authorization Guard (Tenant blocked from manager endpoints with `HTTP 403 Forbidden`)
- ✔ Conflict-Free Booking Engine (Overlapping bookings rejected with `HTTP 409 Conflict`)
- ✔ Booking Lifecycle (Creates booking, checks in, and checks out with status `completed`)
- ✔ Maintenance Lifecycle (Submits ticket and updates status to `in_progress` with notes)

---

## 7. Project Documentation

- **[REST API Reference](file:///d:/internship%20project/RTPR-T2/docs/API.md)**: Full endpoint payloads, status codes, and headers.
- **[Phase-by-Phase Requirements](file:///d:/internship%20project/RTPR-T2/Property_Management_Platform_Phase_Wise_Requirements.md)**: Original project specification.
- **[Walkthrough & Verification](file:///C:/Users/chira/.gemini/antigravity-ide/brain/39dcd7f1-3a63-4f65-9f54-82f111183d79/walkthrough.md)**: Visual evidence, screenshots, and test logs.
