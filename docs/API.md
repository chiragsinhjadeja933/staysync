# StaySync REST API Documentation

Base URL: `http://localhost:5005/api` (or configured `PORT`)

All authenticated endpoints require the header:
```text
Authorization: Bearer <token>
Content-Type: application/json
```

---

## 1. System Health

### `GET /api/health`
Checks server status and environment.
- **Access**: Public
- **Response `200 OK`**:
```json
{
  "success": true,
  "message": "Property Management Platform API is running smoothly",
  "timestamp": "2026-09-19T10:00:00.000Z",
  "environment": "development"
}
```

---

## 2. Authentication & User Profiles

### `POST /api/auth/demo-login`
Instant test credential generation across roles.
- **Body**: `{ "role": "tenant" | "manager" | "admin" }`
- **Response `200 OK`**:
```json
{
  "success": true,
  "message": "Logged in successfully as Demo tenant",
  "token": "demo-tenant-token",
  "user": {
    "id": "d1111111-1111-1111-1111-111111111111",
    "email": "tenant@staysync.com",
    "full_name": "Alex Johnson (Demo Tenant)",
    "role": "tenant"
  }
}
```

### `POST /api/auth/login`
Supabase Auth email/password login.
- **Body**: `{ "email": "user@example.com", "password": "password123" }`

### `POST /api/auth/register`
Creates new user account and provisions profile.
- **Body**: `{ "email": "user@example.com", "password": "password123", "full_name": "John Doe", "role": "tenant" }`

### `GET /api/auth/me`
Retrieves authenticated user session and role.
- **Auth Required**: Yes

---

## 3. Properties & Units

### `GET /api/properties`
Lists properties enriched with real-time unit counts and occupancy rates.
- **Auth Required**: Yes
- **Response `200 OK`**:
```json
{
  "success": true,
  "count": 2,
  "properties": [
    {
      "id": "a1111111-1111-1111-1111-111111111111",
      "name": "Skyline Luxury Towers",
      "address": "100 Ocean Boulevard",
      "city": "San Francisco",
      "state": "CA",
      "total_units": 4,
      "occupied_units": 2,
      "occupancy_rate": 50
    }
  ]
}
```

### `POST /api/properties`
Creates new property.
- **Auth Required**: `manager`, `admin`
- **Body**: `{ "name": "...", "address": "...", "city": "...", "state": "...", "postal_code": "..." }`

### `GET /api/units/my-unit`
Retrieves assigned apartment unit and building details for authenticated tenant.
- **Auth Required**: Tenant

### `POST /api/units/:id/assign`
Assigns or vacates a tenant in a unit.
- **Auth Required**: `manager`, `admin`
- **Body**: `{ "tenant_id": "...", "tenant_name": "...", "tenant_email": "..." }` (Pass `null` to vacate)

---

## 4. Maintenance Requests

### `GET /api/maintenance`
Lists maintenance requests. Tenants only receive their unit's tickets; Managers/Admins receive all managed tickets.
- **Query Params**: `?status=pending|in_progress|completed&priority=low|medium|high|urgent`

### `POST /api/maintenance`
Tenant submits a new issue (auto-attaches unit and building).
- **Body**:
```json
{
  "title": "HVAC Cooling Issue",
  "description": "Temperature in bedroom is high.",
  "priority": "high"
}
```

### `PATCH /api/maintenance/:id/status`
Manager updates ticket status and attaches resolution notes.
- **Auth Required**: `manager`, `admin`
- **Body**: `{ "status": "in_progress", "notes": "Technician dispatched." }`

### `GET /api/maintenance/stream`
Server-Sent Events (SSE) stream broadcasting real-time ticket events (`ticket_created`, `ticket_updated`).

---

## 5. Shared Amenities & Conflict-Free Booking

### `GET /api/amenities`
Catalog of all building amenities with operating hours.

### `GET /api/amenities/:id/availability?date=YYYY-MM-DD`
Returns all booked intervals for chosen date to prevent scheduling conflicts.

### `POST /api/bookings`
Reserves a time slot. Enforces strict overlap prevention.
- **Body**:
```json
{
  "amenity_id": "c1111111-1111-1111-1111-111111111111",
  "booking_date": "2026-09-19",
  "start_time": "18:00",
  "end_time": "19:00"
}
```
- **Overlap Conflict Response `409 Conflict`**:
```json
{
  "success": false,
  "message": "Booking conflict: Amenity is already booked from 18:00 to 19:00. Please select another time slot."
}
```

### `POST /api/bookings/:id/check-in`
Records arrival timestamp `check_in_at`.

### `POST /api/bookings/:id/check-out`
Records departure timestamp `check_out_at` and sets status `completed`.

---

## 6. Dashboards & Analytics

### `GET /api/dashboard/tenant`
Personalized resident metrics, open requests, upcoming booking, assigned unit.

### `GET /api/dashboard/manager`
Portfolio occupancy %, urgent triage queue, today's amenity schedule.

### `GET /api/dashboard/admin`
Platform-wide user directory, resolution rate, zero conflict engine status (0 conflicts).
