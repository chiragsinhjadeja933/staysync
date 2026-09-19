# StaySync: Real-Time Property Rental, Maintenance & Amenity Management Platform
## Comprehensive Project Report & Internship Documentation

**Author:** Chiragsinh Jadeja  
**Project Repository:** [https://github.com/chiragsinhjadeja933/staysync](https://github.com/chiragsinhjadeja933/staysync)  
**Live Application URL:** [https://staysync-frontend-j4qg.onrender.com](https://staysync-frontend-j4qg.onrender.com)  
**API Documentation:** [https://github.com/chiragsinhjadeja933/staysync/blob/main/docs/API.md](https://github.com/chiragsinhjadeja933/staysync/blob/main/docs/API.md)  
**Platform Track:** Full Stack Web Development / Internship Project  

---

## Executive Summary

**StaySync** is an enterprise-grade, real-time property management web platform built to unify residential communications, unit inventory, maintenance workflows, and shared facility reservations into a single responsive digital ecosystem.

Addressing key operational challenges in modern multi-family residential complexes—such as delayed maintenance resolution, double-booked community amenities, lack of real-time transparency, and administrative overhead—StaySync introduces strict role-based access control, real-time event streaming, mathematical booking conflict prevention, and high-density executive analytics dashboards.

The application is deployed live on **Render Cloud Infrastructure** utilizing a modern decoupled architecture: a **Next.js 15 App Router** frontend styled with a custom **Vanilla CSS Design Token System** and a robust **Node.js / Express.js REST API** connected to **Supabase PostgreSQL** with Row-Level Security (RLS).

---

## 1. Problem Statement & Objectives

### 1.1 The Problem
Traditional residential and multi-tenant property management suffers from significant inefficiencies:
1. **Fragmented Communication:** Tenants submit maintenance requests via email, text, or paper forms, leading to lost tickets and lack of status tracking.
2. **Amenity Scheduling Conflicts:** Shared spaces (gyms, pools, conference rooms, rooftop terraces) experience double-bookings and schedule collisions when managed through static calendars or physical sign-up sheets.
3. **Information Asymmetry:** Property managers lack consolidated real-time metrics on unit occupancy, revenue velocity, and open tickets, while tenants lack visibility into their lease details and facility rules.
4. **Security & Data Privacy:** Absence of strict role separation exposes sensitive resident data to unauthorized parties.

### 1.2 Project Objectives
- **Role-Based Architecture:** Implement tailored interfaces for three distinct personas: **Tenant**, **Property Manager**, and **System Administrator**.
- **Real-Time Synchronous Updates:** Implement Server-Sent Events (SSE) and Supabase Realtime streams to provide zero-refresh UI updates for maintenance requests and facility availability.
- **Zero-Conflict Reservation Engine:** Implement strict interval overlap detection algorithm (`start_A < end_B AND end_A > start_B`) at the server and database level to prevent double-booking.
- **Modern, Accessible UI/UX:** Engineer a responsive interface using pure Vanilla CSS tokens (glassmorphism, dark slate aesthetic, micro-animations) without reliance on heavy utility frameworks.
- **Production-Grade Cloud Deployment:** Orchestrate infrastructure-as-code deployment on Render using Blueprints (`render.yaml`) and an automated keep-alive daemon.

---

## 2. Technology Stack & Architecture

### 2.1 Architectural Overview
StaySync uses a decoupled client-server micro-architecture:

```text
               CLIENT CLIENTS
    (Tenants, Property Managers, Admins)
                   │
                   ▼
       Next.js 15 Frontend (App Router)
       ├── Custom Vanilla CSS Design System
       ├── Context-Driven Authentication & State
       └── Dynamic Route Interceptors
              /                    \
    RESTful HTTP Requests       Real-Time SSE Streams
            /                        \
           ▼                          ▲
   Node.js / Express API Backend      │
   ├── JWT Auth & Role Middleware     │
   ├── Overlap Conflict Engine        │
   ├── Automated 5-Min Keep-Alive     │
   └── In-Memory & Cloud Fallbacks    │
           │                          │
           ▼                          │
   Supabase PostgreSQL (Database) ────┘
   ├── Row Level Security (RLS)
   ├── Zero-Conflict Database Triggers
   └── Foreign Key Integrity Constraints
```

### 2.2 Technology Justification

| Layer | Technology | Justification |
|---|---|---|
| **Frontend Framework** | **Next.js 15 (React 19)** | Server/Client hydration, fast App Router navigation, automatic route prefetching, and optimal SEO. |
| **Styling & Design** | **Pure Vanilla CSS** | Maximum performance, zero runtime overhead, custom CSS variables for light/dark design tokens, glassmorphism, and responsive grid layouts. |
| **Backend Runtime** | **Node.js (v24) + Express.js** | Non-blocking I/O, lightweight REST API scaffolding, extensible middleware pipeline for CORS, Helmet security, and SSE streaming. |
| **Database & Auth** | **Supabase PostgreSQL & Supabase Auth** | Enterprise-grade relational integrity, foreign keys, row-level security (RLS) policies, and JWT token signing. |
| **Testing** | **Node.js Native Test Runner (`node:test`)** | Zero-dependency, ultra-fast test execution validating healthchecks, demo auth, role guards, conflict prevention, and ticket lifecycles. |
| **Deployment** | **Render Cloud Platform** | Infrastructure-as-Code (`render.yaml`), continuous deployment from GitHub `main`, and integrated environment orchestration. |

---

## 3. Core Modules & Key Features

### 3.1 Authentication & Role-Based Authorization
- **Dual Authentication Modes:**
  1. *Supabase Auth*: JWT-based secure email and password registration with encrypted password hashing.
  2. *Instant 1-Click Demo Profiles*: Embedded rapid-evaluation credentials for **Alex Johnson (Tenant)**, **Sarah Jenkins (Property Manager)**, and **Admin User (Administrator)** allowing evaluators to immediately test role-specific screens.
- **Role Guards:**
  - `roleMiddleware.js` verifies permissions at the API level (e.g., Tenants are strictly blocked with `HTTP 403 Forbidden` if attempting to create properties or edit units).
  - `ProtectedRoute.js` client wrapper protects routes and redirects unauthorized users.

### 3.2 Property & Unit Inventory Management
- **Property Directory:** Real-time catalog of residential assets displaying address, unit count, and live occupancy rates.
- **Unit Hierarchy:** Nested unit inventory tracking unit number, floor plan, monthly rental rate, and lease status (`occupied`, `vacant`, `maintenance`).
- **Tenant Assignment Engine:** Property managers can assign unassigned tenants to vacant units with 1-click modal forms, automatically transitioning unit status to `occupied`.
- **Tenant "My Home" Residence View:** Personalized portal for residents displaying lease summary, unit specifications, property manager emergency contacts, and direct maintenance reporting shortcuts.

### 3.3 Real-Time Maintenance Request Pipeline
- **Ticket Submission:** Tenants submit maintenance requests with title, description, category (Plumbing, Electrical, HVAC, Structural, Appliance), and priority level (`low`, `medium`, `high`, `urgent`).
- **Visual Status Progression Stepper:** Interactive 3-step timeline:
  $$\text{Pending Review} \longrightarrow \text{In Progress} \longrightarrow \text{Resolved}$$
- **Manager Triage & Resolution Workflow:** Property managers filter requests by priority or status, dispatch internal staff or external contractors, update work statuses, and input official resolution notes.
- **Server-Sent Events (SSE) Real-Time Synchronization:** Updates made by managers immediately flash notifications and update ticket states on the tenant's screen without requiring manual browser reloads.

### 3.4 Amenity Booking & Zero-Conflict Engine
- **Amenity Catalog:** Directory of shared property amenities (Rooftop Infinity Pool, High-Tech Fitness Center, Executive Coworking Lounge, Garden Patio & BBQ) with operating hours and rules.
- **Dynamic Slot Generator:** Generates 60-minute time slots between opening and closing hours, computing availability status in real-time.
- **Mathematical Overlap Prevention:**
  A conflict exists and is rejected with `HTTP 409 Conflict` if:
  $$\text{Requested Start} < \text{Existing End} \quad \text{AND} \quad \text{Requested End} > \text{Existing Start}$$
- **Check-In & Check-Out Tracking:** Actual physical attendance tracking with one-click timestamp recording (`check_in_at` and `check_out_at`).

### 3.5 Role-Tailored Executive Dashboards
- **Tenant Dashboard:** Upcoming amenity reservations, active maintenance progress tracker, lease snapshot, and quick action buttons.
- **Property Manager Dashboard:** Portfolio-wide occupancy gauge, open maintenance dispatch queue, today's master amenity schedule, and unit inventory distribution.
- **System Administrator Dashboard:** Platform health metrics, active user distribution, database integrity metrics, and 0-conflict audit indicators.

---

## 4. Database Design & Security Architecture

### 4.1 Relational Schema Overview
The database schema is documented in [`database/schema.sql`](https://github.com/chiragsinhjadeja933/staysync/blob/main/database/schema.sql):
- `profiles`: Extends Supabase auth users with full names, phone numbers, avatars, and role enums (`tenant`, `manager`, `admin`).
- `properties`: Real estate assets with address, city, state, postal code, and media URLs.
- `units`: Individual residences with foreign key reference to `properties.id`, unit number, floor, rent amount, and occupancy status.
- `maintenance_requests`: Issue tickets linked to `units.id` and `profiles.id` with status steppers and triage notes.
- `amenities`: Shared complex facilities with operating hours, auto-confirm flags, and capacity rules.
- `amenity_bookings`: Reservation records with timestamp ranges, check-in timestamps, and foreign keys.

### 4.2 Row-Level Security (RLS) & Triggers
Documented in [`database/policies.sql`](https://github.com/chiragsinhjadeja933/staysync/blob/main/database/policies.sql):
- Strict isolation: Tenants can only select and query their own maintenance tickets and bookings.
- Manager override: Managers and Admins possess full read/write visibility across their assigned property portfolios.
- Database Overlap Trigger: PostgreSQL function enforcing strict interval validation at the database constraint level.

---

## 5. Verification, Testing & Quality Assurance

### 5.1 Automated Test Suite
A comprehensive test suite was engineered in [`backend/test/api.test.js`](https://github.com/chiragsinhjadeja933/staysync/blob/main/backend/test/api.test.js) using the native Node.js test runner:

```bash
npm test
```
**Test Execution Results:**
```text
✔ GET /api/health - Server healthcheck returns 200 OK (92.4ms)
✔ POST /api/auth/demo-login - Successfully returns token and role for Tenant (17.2ms)
✔ POST /api/properties - Tenant token is rejected with 403 Forbidden (8.9ms)
✔ POST /api/bookings - Overlapping booking is rejected with 409 Conflict (9.5ms)
✔ POST /api/bookings - Creates valid booking, checks in, and checks out (14.2ms)
✔ POST /api/maintenance & PATCH /api/maintenance/:id/status - Ticket submission and status transition (10.9ms)

✔ Real-Time Property Rental & Amenity Management API Tests
ℹ tests 6 | suites 1 | pass 6 | fail 0 | cancelled 0
ℹ duration_ms: 350.5ms
```

### 5.2 Build & Bundle Optimization
- Next.js Turbopack build executed with zero errors across all 10 application routes (`npm run build`).
- Clean separation of client components (`'use client'`) and secure server utilities.

---

## 6. Cloud Deployment & DevOps

### 6.1 Infrastructure as Code (`render.yaml`)
Both frontend and backend services are orchestrated via Render Blueprint:
- **`staysync-backend`**: Node.js web service running `node src/server.js` with automated healthcheck probe at `/api/health`.
- **`staysync-frontend`**: Next.js web service compiling optimized production bundles with `npm run build && npm start`.

### 6.2 5-Minute Keep-Alive Daemon
To mitigate Render free-tier cold starts (where instances sleep after 15 minutes of inactivity), an automated internal keep-alive timer was implemented in `server.js`:
```javascript
const pingUrl = process.env.RENDER_EXTERNAL_URL || process.env.PING_URL;
if (pingUrl) {
  const targetUrl = `${pingUrl.replace(/\/+$/, '')}/api/health`;
  setInterval(async () => {
    try {
      const response = await fetch(targetUrl);
      console.log(`[Keep-Alive] 5-min ping to ${targetUrl} (Status: ${response.status})`);
    } catch (err) {
      console.warn(`[Keep-Alive] Ping warning: ${err.message}`);
    }
  }, 5 * 60 * 1000);
}
```

---

## 7. Key Learnings & Challenges Overcome

1. **Next.js 15 Dynamic Route Resolution:** Next.js 15 treats route `params` as asynchronous Promises. Adapted `params` handling using React's `use(params)` hook across all dynamic routes (such as `/properties/[id]`).
2. **Server-Sent Events on Cloud Ingress:** Handled cloud proxy buffering by ensuring appropriate HTTP response headers (`Cache-Control: no-cache`, `Connection: keep-alive`, `Content-Type: text/event-stream`).
3. **Graceful Degradation:** Designed a hybrid architecture where the application operates seamlessly with both live Supabase PostgreSQL and an in-memory repository fallback, ensuring evaluators can experience the full platform with zero credential setup.

---

## 8. Conclusion & Future Roadmap

The StaySync platform satisfies all functional and architectural specifications outlined in the requirements. It demonstrates mastery of modern full-stack development, database security, real-time event streaming, and cloud deployment.

### Future Roadmap:
- Integration with Stripe Connect for automated tenant rent processing.
- Push notifications via WebSockets and Progressive Web App (PWA) offline support.
- IoT integration for smart lock amenity access upon booking check-in.
