# Real-Time Property Rental, Maintenance & Amenity Management Platform

## Complete Phase-Wise Project Requirements

---

## 1. Project Overview

The **Real-Time Property Rental, Maintenance & Amenity Management Platform** is a web-based property management system for tenants, property owners/property managers, maintenance staff, and administrators.

The platform centralizes:

- Property and unit information
- Tenant information
- Maintenance requests
- Maintenance status tracking
- Shared amenity management
- Amenity availability
- Date/time-based amenity booking
- Check-in and check-out tracking
- Real-time dashboard updates
- Role-based access and administration

### Main Technology Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js |
| UI | React + CSS/Tailwind CSS |
| Backend | Node.js + Express.js |
| Database | Supabase PostgreSQL |
| Authentication | Supabase Auth |
| Real-time | Supabase Realtime |
| API Communication | REST API |
| Deployment | Vercel + Node.js hosting |
| Version Control | Git + GitHub |

### Important Architecture Decision

Supabase PostgreSQL is the project's primary database.

Node.js + Express.js handles backend business logic and REST APIs.

Next.js handles the frontend and user interface.

Supabase Auth handles authentication, while Supabase Realtime is used where real-time updates are required.

---

# 2. Problem Statement

Traditional rental/property management often depends on phone calls, WhatsApp messages, spreadsheets, and manual coordination. This creates several problems:

- Maintenance requests are difficult to track.
- Tenants cannot clearly see request status.
- Managers may miss or delay requests.
- Communication between tenants and management is fragmented.
- Shared amenities can be double-booked.
- Booking schedules are difficult to maintain manually.
- There is limited visibility into property operations.

The proposed platform solves these problems through one centralized web application.

---

# 3. Project Objectives

## 3.1 Primary Objectives

1. Centralize property, tenant, maintenance, and amenity information.
2. Allow tenants to create maintenance requests.
3. Provide real-time maintenance status tracking.
4. Allow managers to update maintenance requests.
5. Display amenity availability.
6. Provide date and time-based amenity booking.
7. Prevent overlapping amenity bookings.
8. Provide role-specific dashboards.
9. Improve communication and operational transparency.
10. Maintain secure and structured data.

## 3.2 Secondary Objectives

1. Provide a responsive desktop/mobile web interface.
2. Build a modular architecture.
3. Keep the application simple enough to maintain and extend.
4. Provide a foundation for future payment, notification, mobile, AI, and IoT features.

---

# 4. User Roles

## 4.1 Tenant

Tenant capabilities:

- Register/login
- View assigned property/unit
- View personal profile
- Create maintenance request
- Add issue title and description
- Set issue priority where permitted
- View maintenance request history
- Track maintenance status
- View amenities
- Check availability
- Book an amenity
- View upcoming bookings
- Cancel eligible bookings
- View check-in/check-out information
- Receive real-time status updates

## 4.2 Property Manager / Owner

Manager capabilities:

- Login
- View assigned properties
- View units and tenants
- View all maintenance requests for managed properties
- Change maintenance status
- Assign/track maintenance work
- View maintenance history
- Manage amenities
- View amenity bookings
- Approve/reject bookings if the business rule requires approval
- Monitor upcoming bookings
- View dashboard statistics

## 4.3 Admin

Admin capabilities:

- Manage users
- Manage roles
- Manage properties
- Manage units
- Manage amenities
- View all maintenance requests
- View all bookings
- Manage system configuration
- View overall analytics
- Deactivate inappropriate/inactive accounts where required

---

# 5. Project Scope

## 5.1 In Scope

- Web application
- Responsive UI
- Authentication
- Role-based access
- Property management
- Unit management
- Tenant management
- Maintenance request management
- Maintenance status tracking
- Amenity management
- Amenity availability
- Date/time booking
- Booking conflict prevention
- Check-in/check-out tracking
- Real-time updates
- Tenant dashboard
- Manager dashboard
- Admin dashboard
- Basic analytics
- Security and validation
- Deployment

## 5.2 Out of Scope for Phase 1

- Online rent payment
- Online maintenance payment
- Native Android application
- Native iOS application
- AI predictive maintenance
- IoT smart-property integration
- Advanced accounting
- Full property marketplace
- Automated legal/document processing

These can be added later.

---

# 6. System Architecture

```text
                    USER
                     |
                     v
              +--------------+
              |   Next.js    |
              |  Frontend    |
              +------+-------+
                     |
                REST API
                     |
                     v
              +--------------+
              | Node.js +    |
              | Express.js   |
              +------+-------+
                     |
          +----------+----------+
          |                     |
          v                     v
   +-------------+       +-------------+
   | Supabase    |       | Supabase    |
   | PostgreSQL  |       | Realtime    |
   +-------------+       +-------------+
          |
          v
   Supabase Auth
```

### Request Flow

```text
Next.js UI
   |
   | HTTP Request
   v
Express API
   |
   | Validation + Authorization
   v
Supabase PostgreSQL
   |
   | Database Change
   v
Supabase Realtime
   |
   v
Next.js Dashboard Update
```

---

# 7. Recommended Project Structure

```text
property-management-platform/
│
├── frontend/
│   ├── app/
│   │   ├── login/
│   │   ├── register/
│   │   ├── dashboard/
│   │   ├── maintenance/
│   │   ├── amenities/
│   │   ├── bookings/
│   │   ├── properties/
│   │   ├── profile/
│   │   └── admin/
│   │
│   ├── components/
│   ├── lib/
│   ├── services/
│   ├── hooks/
│   ├── styles/
│   └── public/
│
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── middleware/
│   │   ├── validators/
│   │   ├── config/
│   │   └── server.js
│   │
│   └── package.json
│
├── database/
│   ├── schema.sql
│   ├── seed.sql
│   └── policies.sql
│
├── docs/
│   ├── PRD.md
│   └── API.md
│
├── .env.example
├── README.md
└── .gitignore
```

---

# 8. Database Design

## 8.1 Core Tables

The initial database should contain:

1. profiles
2. properties
3. units
4. maintenance_requests
5. amenities
6. amenity_bookings

Optional supporting tables can be added later.

---

## 8.2 Profiles

Stores application-specific user information.

Suggested fields:

```text
id
full_name
email
phone
role
created_at
updated_at
```

Role values:

```text
tenant
manager
admin
```

Authentication credentials should be handled by Supabase Auth rather than stored manually in the profiles table.

---

## 8.3 Properties

Suggested fields:

```text
id
name
address
city
state
postal_code
owner_id
created_at
updated_at
```

Relationship:

```text
Manager/Owner
      |
      +---- Properties
```

---

## 8.4 Units

Suggested fields:

```text
id
property_id
unit_number
floor
tenant_id
status
created_at
updated_at
```

Example status:

```text
occupied
vacant
maintenance
inactive
```

---

## 8.5 Maintenance Requests

Suggested fields:

```text
id
property_id
unit_id
tenant_id
title
description
priority
status
created_at
updated_at
resolved_at
```

Status:

```text
pending
in_progress
completed
```

Priority:

```text
low
medium
high
urgent
```

---

## 8.6 Amenities

Suggested fields:

```text
id
property_id
name
description
available
opening_time
closing_time
check_in_duration
created_at
updated_at
```

Examples:

```text
Gym
Swimming Pool
Clubhouse
Parking Area
Conference Room
Garden
Sports Court
```

---

## 8.7 Amenity Bookings

Suggested fields:

```text
id
amenity_id
user_id
booking_date
start_time
end_time
status
check_in_at
check_out_at
created_at
updated_at
```

Status:

```text
pending
confirmed
cancelled
completed
rejected
```

---

# 9. Database Relationships

```text
PROFILES
   |
   | tenant_id / owner_id
   |
PROPERTIES
   |
   +---------- UNITS
   |
   +---------- AMENITIES
                   |
                   +---------- AMENITY_BOOKINGS

PROPERTIES
   |
   +---------- MAINTENANCE_REQUESTS
                   |
                   +---------- TENANT
                   +---------- UNIT
```

Main relationships:

- One property can have many units.
- One property can have many amenities.
- One tenant can be assigned to a unit.
- One unit can have many maintenance requests over time.
- One amenity can have many bookings.
- One user can have many bookings.
- One property can have many maintenance requests.

---

# 10. Phase-Wise Development Plan

# Phase 0 — Planning and Requirement Finalization

### Objective

Convert the provided requirements into a clear implementation plan.

### Tasks

- Finalize user roles.
- Finalize database entities.
- Finalize maintenance workflow.
- Finalize amenity booking rules.
- Finalize dashboard requirements.
- Decide whether manager approval is required for bookings.
- Define booking cancellation rules.
- Define check-in/check-out rules.
- Define maintenance priorities.
- Define maintenance status transitions.

### Deliverables

- Final requirements document
- User-flow diagram
- ER diagram
- System architecture diagram
- Initial UI wireframes

### Completion Criteria

All major business rules are documented before development begins.

---

# Phase 1 — Environment and Project Setup

### Objective

Create the development environment and base projects.

### Tasks

1. Install Node.js.
2. Install Git.
3. Create GitHub repository.
4. Create Next.js application.
5. Create Node.js + Express backend.
6. Create Supabase project.
7. Create development and production environment variables.
8. Connect backend to Supabase.
9. Configure basic API structure.
10. Configure frontend-to-backend communication.

### Environment Variables

Example:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=

SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=

NEXT_PUBLIC_API_URL=
PORT=5000
```

Never expose the Supabase service-role key in the browser or commit it to GitHub.

### Deliverables

- Working Next.js application
- Working Express server
- Supabase project
- GitHub repository
- Environment configuration

### Completion Criteria

Next.js loads successfully, Express API responds successfully, and the backend can securely communicate with Supabase.

---

# Phase 2 — Database Implementation

### Objective

Create the complete PostgreSQL database structure.

### Tasks

- Create profiles table.
- Create properties table.
- Create units table.
- Create maintenance_requests table.
- Create amenities table.
- Create amenity_bookings table.
- Add primary keys.
- Add foreign keys.
- Add indexes where required.
- Add timestamps.
- Add constraints.
- Add appropriate status values.
- Insert sample/test data.

### Important Constraints

Examples:

```text
property_id must reference an existing property
unit_id must reference an existing unit
amenity_id must reference an existing amenity
tenant_id must reference a valid user
```

### Deliverables

- schema.sql
- seed.sql
- ER diagram
- Database documentation

### Completion Criteria

All tables and relationships work correctly with test data.

---

# Phase 3 — Authentication and Authorization

### Objective

Implement secure user authentication.

### Features

- Register
- Login
- Logout
- Session management
- Password reset
- User profile
- Role-based authorization

### Roles

```text
Tenant
Manager
Admin
```

### Access Rules

Tenant:

```text
Own requests
Own bookings
Assigned property/unit
```

Manager:

```text
Assigned properties
Their tenants
Maintenance requests
Amenities
Bookings
```

Admin:

```text
All platform data
```

### Security

Use:

- Supabase Auth
- Row Level Security
- Backend authorization middleware
- Input validation
- Protected routes

### Completion Criteria

A tenant cannot access manager/admin functionality, and users can only access data allowed by their role.

---

# Phase 4 — Application Layout and UI Foundation

### Objective

Build the reusable UI structure.

### Components

- Navbar
- Sidebar
- Header
- Footer
- Cards
- Tables
- Forms
- Modal
- Loading state
- Error state
- Empty state
- Toast/notification
- Confirmation dialog
- Status badges

### Responsive Design

The UI must work on:

- Desktop
- Tablet
- Mobile browser

### Design Requirements

- Simple
- Clean
- Consistent
- Responsive
- Easy to navigate
- Clear status indicators

### Completion Criteria

All authenticated users have a consistent application layout.

---

# Phase 5 — Property and Unit Management

### Objective

Implement property and unit information.

### Tenant Features

- View assigned property.
- View unit information.
- View property details.

### Manager Features

- Add property.
- Edit property.
- View property.
- Add units.
- Edit units.
- Assign tenant to unit.
- Change unit status.

### Admin Features

- Manage all properties.
- Manage all units.
- Manage ownership/manager relationships.

### Completion Criteria

Properties, units, and tenant assignments can be created, updated, displayed, and securely accessed.

---

# Phase 6 — Maintenance Management

### Objective

Create the complete maintenance workflow.

## Tenant Workflow

```text
Dashboard
   |
Maintenance
   |
Create Request
   |
Enter Issue Details
   |
Submit
   |
Pending
```

### Maintenance Form

Fields:

```text
Title
Description
Priority
Property/Unit
```

The property/unit should normally be derived from the authenticated tenant instead of allowing arbitrary selection.

### Manager Workflow

```text
View Requests
      |
Open Request
      |
Review Problem
      |
Pending → In Progress → Completed
```

### Features

- Create request
- View request list
- View request details
- Filter by status
- Filter by priority
- Search requests
- Update status
- Record resolution time
- View maintenance history

### Real-Time Requirement

When a manager changes:

```text
Pending → In Progress
```

the tenant dashboard should update without requiring a manual page refresh.

### Completion Criteria

The complete maintenance lifecycle works from creation through completion.

---

# Phase 7 — Amenity Management

### Objective

Allow managers/admins to manage shared amenities.

### Manager/Admin Features

- Add amenity
- Edit amenity
- Enable/disable amenity
- Set opening time
- Set closing time
- Set booking rules
- View bookings

### Tenant Features

- View amenities
- View amenity details
- View availability
- Select date
- Select time
- Book amenity

### Completion Criteria

Amenities can be created and managed, and tenants can view valid available amenities.

---

# Phase 8 — Amenity Booking System

### Objective

Build reliable date/time-based booking.

### Booking Flow

```text
Select Amenity
      |
Select Date
      |
Select Time
      |
Check Availability
      |
Available?
   /       \
 Yes        No
 |           |
Book       Show unavailable
 |
Confirm
 |
Booking Created
```

### Booking Rules

The backend must validate:

1. Amenity exists.
2. Amenity is active.
3. Booking date is valid.
4. Start time is before end time.
5. Booking is within allowed amenity hours.
6. User is authorized to book.
7. Existing bookings do not overlap.
8. Booking rules are satisfied.

### Overlap Rule

A new booking conflicts when:

```text
new_start < existing_end
AND
new_end > existing_start
```

This logic must be enforced server-side.

### Example

Existing:

```text
10:00 → 11:00
```

New:

```text
10:30 → 11:30
```

Result:

```text
Rejected
```

Non-overlapping:

```text
11:00 → 12:00
```

Result:

```text
Allowed
```

### Completion Criteria

The same amenity cannot have overlapping confirmed bookings.

---

# Phase 9 — Check-In and Check-Out

### Objective

Track actual amenity usage.

### Features

- Show booking start time.
- Show booking end time.
- Check-in.
- Check-out.
- Record actual check-in time.
- Record actual check-out time.
- Mark booking completed.

### Example

```text
Booking:
10:00 → 11:00

Actual:
Check-in: 10:05
Check-out: 10:58
```

The system stores the actual timestamps.

### Completion Criteria

Authorized users can record check-in/check-out and the booking lifecycle is updated correctly.

---

# Phase 10 — Tenant Dashboard

### Objective

Provide tenants with a simple overview.

### Dashboard Sections

```text
Welcome / Profile
        |
Assigned Property
        |
Maintenance Summary
        |
Upcoming Bookings
        |
Recent Maintenance Requests
        |
Amenity Availability
```

### KPI Cards

Example:

```text
Open Requests
Upcoming Bookings
Completed Requests
Available Amenities
```

### Real-Time Updates

Maintenance status changes should appear automatically.

### Completion Criteria

A tenant can understand their current property, maintenance, and amenity activity from one screen.

---

# Phase 11 — Manager Dashboard

### Objective

Give property managers operational visibility.

### Dashboard Sections

```text
Total Properties
Total Units
Total Tenants
Pending Requests
In Progress
Completed
Upcoming Bookings
```

### Maintenance Table

Columns:

```text
Request ID
Tenant
Unit
Issue
Priority
Status
Created Date
Actions
```

### Amenity Booking Table

Columns:

```text
Booking ID
Amenity
User
Date
Start Time
End Time
Status
```

### Filters

- Property
- Status
- Priority
- Date
- Amenity

### Completion Criteria

A manager can monitor and manage the operational activity of assigned properties.

---

# Phase 12 — Admin Dashboard

### Objective

Provide system-wide administration.

### Admin Features

- User management
- Property management
- Unit management
- Amenity management
- Maintenance monitoring
- Booking monitoring
- System statistics

### Analytics

Basic metrics:

```text
Total Users
Total Properties
Total Units
Total Maintenance Requests
Pending Requests
Completed Requests
Total Bookings
Cancelled Bookings
```

### Completion Criteria

Admin can manage and monitor the complete system.

---

# Phase 13 — Real-Time Functionality

### Objective

Implement real-time updates where they provide actual value.

### Real-Time Events

At minimum:

1. Maintenance status changes.
2. New maintenance request.
3. Booking status changes.
4. Important booking updates.

### Example

```text
Manager updates request
        |
Supabase Database
        |
Realtime event
        |
Tenant receives update
        |
UI updates
```

### Important Rule

Real-time functionality is for synchronization and user experience. Critical authorization and booking validation must still happen on the backend/database.

### Completion Criteria

Connected dashboards update without requiring manual refresh.

---

# Phase 14 — Notifications

### Phase 1 Approach

Use in-app notifications where needed.

Examples:

```text
Maintenance request created
Maintenance status changed
Booking confirmed
Booking cancelled
Booking rejected
```

### Future

Push notifications/email/SMS can be added later.

### Completion Criteria

Users can see important system events inside the application.

---

# Phase 15 — Search, Filter and Sorting

### Objective

Make operational data easy to find.

### Maintenance

- Search by request ID
- Search by tenant
- Filter by status
- Filter by priority
- Filter by property
- Sort by date

### Bookings

- Search by booking ID
- Filter by amenity
- Filter by date
- Filter by status
- Sort by booking time

### Users

- Search by name/email
- Filter by role
- Filter by status

### Completion Criteria

Large lists remain usable and easy to navigate.

---

# Phase 16 — Security

### Objective

Protect user and property data.

### Requirements

- Supabase Auth
- Row Level Security
- Role-based authorization
- Backend authentication middleware
- Server-side validation
- Input sanitization
- Secure environment variables
- No service-role key in frontend
- Secure API endpoints
- Proper error handling
- Avoid exposing sensitive database details
- HTTPS in production

### RLS Examples

Tenant should only access:

```text
Own profile
Own maintenance requests
Own bookings
Assigned unit/property information
```

Manager should only access:

```text
Assigned property data
```

Admin can access:

```text
Platform-wide administrative data
```

### Completion Criteria

Unauthorized users cannot read or modify protected data.

---

# Phase 17 — Error Handling

### Frontend States

Every major page should handle:

```text
Loading
Success
Empty
Error
Unauthorized
Not Found
```

### Backend

Use consistent API responses.

Example:

```json
{
  "success": false,
  "message": "Amenity is already booked for this time."
}
```

### Completion Criteria

The application does not crash when API/database operations fail.

---

# Phase 18 — Validation

### Frontend Validation

Check:

- Required fields
- Valid email
- Valid date
- Valid time
- Description length
- Valid booking duration

### Backend Validation

Repeat critical validation on the server.

Never rely only on frontend validation.

### Completion Criteria

Invalid requests are rejected with clear messages.

---

# Phase 19 — Testing

## Functional Testing

Test:

- Registration
- Login
- Logout
- Role access
- Property creation
- Unit assignment
- Maintenance creation
- Maintenance status changes
- Amenity creation
- Booking creation
- Booking cancellation
- Check-in
- Check-out

## Booking Conflict Testing

Test:

```text
Same amenity
Same date
Same time
```

Expected:

```text
Second conflicting booking rejected
```

Test:

```text
Different amenity
```

Expected:

```text
Booking allowed
```

## Security Testing

Test:

- Tenant accessing another tenant's request
- Tenant accessing manager dashboard
- Manager accessing another property's private data
- Invalid API requests
- Missing authentication
- Invalid IDs

Expected:

```text
Request denied
```

---

# Phase 20 — Performance

### Target

Normal API/system response:

```text
≤ 2 seconds
```

### Performance Tasks

- Use database indexes.
- Avoid unnecessary queries.
- Paginate large tables.
- Fetch only required fields.
- Optimize dashboard queries.
- Avoid excessive real-time subscriptions.
- Compress/optimize assets.
- Use appropriate caching where useful.

### Completion Criteria

Main pages and API operations meet the project performance target under normal expected load.

---

# Phase 21 — Deployment

## Frontend

Deploy Next.js using Vercel or another suitable hosting platform.

## Backend

Deploy Node.js + Express using a suitable Node.js hosting provider.

## Database

Use Supabase hosted PostgreSQL.

### Production Environment

Configure:

```text
Production frontend URL
Production backend URL
Supabase URL
Supabase public key
Supabase server key
```

### Deployment Checklist

- Environment variables configured
- HTTPS enabled
- Database policies enabled
- Authentication configured
- CORS configured
- Production database tested
- API tested
- Realtime tested
- Error handling tested

---

# Phase 22 — Documentation

Create:

## README.md

Include:

- Project overview
- Features
- Technology stack
- Architecture
- Installation
- Environment variables
- Database setup
- Running frontend
- Running backend
- Deployment
- Screenshots

## API.md

Document:

- Authentication
- Endpoints
- Request body
- Response format
- Error responses
- Authorization

## Database Documentation

Include:

- ER diagram
- Table descriptions
- Relationships
- RLS policies

## User Documentation

Explain:

- Tenant workflow
- Manager workflow
- Admin workflow

---

# 11. REST API Plan

Base URL:

```text
/api
```

## Authentication

```text
GET    /api/auth/me
```

Authentication itself can be handled by Supabase Auth.

## Properties

```text
GET    /api/properties
GET    /api/properties/:id
POST   /api/properties
PUT    /api/properties/:id
DELETE /api/properties/:id
```

## Units

```text
GET    /api/units
GET    /api/units/:id
POST   /api/units
PUT    /api/units/:id
DELETE /api/units/:id
```

## Maintenance

```text
GET    /api/maintenance
GET    /api/maintenance/:id
POST   /api/maintenance
PUT    /api/maintenance/:id
DELETE /api/maintenance/:id
```

## Amenities

```text
GET    /api/amenities
GET    /api/amenities/:id
POST   /api/amenities
PUT    /api/amenities/:id
DELETE /api/amenities/:id
```

## Bookings

```text
GET    /api/bookings
GET    /api/bookings/:id
POST   /api/bookings
PUT    /api/bookings/:id
DELETE /api/bookings/:id
```

## Dashboard

```text
GET /api/dashboard/tenant
GET /api/dashboard/manager
GET /api/dashboard/admin
```

The exact endpoint structure can be adjusted during implementation.

---

# 12. High-Level User Flows

## Tenant Maintenance

```text
Login
  ↓
Tenant Dashboard
  ↓
Maintenance
  ↓
Create Request
  ↓
Submit
  ↓
Pending
  ↓
Manager Reviews
  ↓
In Progress
  ↓
Issue Resolved
  ↓
Completed
```

## Tenant Amenity Booking

```text
Login
  ↓
Amenities
  ↓
Select Amenity
  ↓
Select Date
  ↓
Select Time
  ↓
Check Availability
  ↓
Available
  ↓
Create Booking
  ↓
Confirmed
  ↓
Check-in
  ↓
Use Amenity
  ↓
Check-out
  ↓
Completed
```

## Manager Maintenance

```text
Manager Login
     ↓
Dashboard
     ↓
Maintenance Requests
     ↓
Open Request
     ↓
Review
     ↓
Change Status
     ↓
Tenant Receives Real-Time Update
```

---

# 13. KPIs

Initial project targets:

| KPI | Target |
|---|---|
| Maintenance Resolution Time | ≤ 48 hours |
| Request Completion Rate | ≥ 90% |
| Amenity Booking Conflicts | 0 |
| Normal System Response Time | ≤ 2 seconds |
| User Satisfaction | ≥ 4/5 |

These are project targets rather than guaranteed production results. They should be measured during testing or after deployment.

---

# 14. Non-Functional Requirements

## Performance

- Normal API response target ≤ 2 seconds.
- Dashboard should load efficiently.
- Large tables should use pagination.

## Security

- Secure authentication.
- Role-based access.
- RLS policies.
- Server-side validation.
- Secure environment variables.

## Usability

- Simple UI.
- Responsive design.
- Clear navigation.
- Clear status indicators.
- Useful error messages.

## Reliability

- Accurate booking validation.
- Consistent database operations.
- Real-time updates should recover gracefully from connection issues.

## Scalability

The architecture should allow future addition of:

- Multiple properties
- More users
- More amenities
- More managers
- Notifications
- Payments
- Mobile applications

---

# 15. Assumptions

- Users have internet access.
- Property managers are responsible for maintenance operations.
- Amenities have predefined schedules.
- Users follow property rules.
- Maintenance completion is managed by authorized staff.
- Phase 1 is web-only.
- Payments are not part of the first version.

---

# 16. Constraints

- Limited project development time.
- Limited project budget.
- Web-only Phase 1.
- Manual maintenance handling.
- No IoT integration in Phase 1.
- No native mobile application in Phase 1.
- No payment gateway in Phase 1.

---

# 17. Future Enhancements

## Phase 2+

### Online Payments

- Rent payments
- Maintenance charges
- Payment history
- Receipts

### Notifications

- Email notifications
- Push notifications
- SMS alerts

### Mobile Application

- Android
- iOS

### AI

- Predictive maintenance
- Issue classification
- Maintenance priority recommendation
- Maintenance analytics

### IoT

- Smart locks
- Smart energy monitoring
- Smart sensors
- Occupancy monitoring

### Advanced Analytics

- Property performance
- Maintenance trends
- Amenity utilization
- Tenant activity
- Resolution-time analytics

---

# 18. Final Deliverables

The completed project should contain:

## Software

- Fully functional Next.js frontend
- Node.js + Express backend
- Supabase PostgreSQL database
- Supabase Auth
- Supabase Realtime
- Responsive UI
- Tenant dashboard
- Manager dashboard
- Admin dashboard
- Maintenance module
- Amenity module
- Booking module
- Check-in/check-out

## Documentation

- Project report
- PRD
- Technical documentation
- ER diagram
- System architecture
- API documentation
- Database schema
- Installation instructions
- Testing report
- Deployment instructions
- README

## Deployment

- Live frontend
- Live backend/API
- Production Supabase database

---

# 19. Final Development Checklist

## Setup

- [ ] GitHub repository created
- [ ] Next.js project created
- [ ] Express backend created
- [ ] Supabase project created
- [ ] Environment variables configured

## Database

- [ ] Profiles table
- [ ] Properties table
- [ ] Units table
- [ ] Maintenance requests table
- [ ] Amenities table
- [ ] Amenity bookings table
- [ ] Foreign keys
- [ ] Indexes
- [ ] RLS policies
- [ ] Seed data

## Authentication

- [ ] Register
- [ ] Login
- [ ] Logout
- [ ] Password reset
- [ ] Session handling
- [ ] Tenant role
- [ ] Manager role
- [ ] Admin role
- [ ] Protected routes

## Property

- [ ] Property CRUD
- [ ] Unit CRUD
- [ ] Tenant assignment
- [ ] Property access control

## Maintenance

- [ ] Create request
- [ ] Request list
- [ ] Request details
- [ ] Status update
- [ ] Priority
- [ ] Search
- [ ] Filter
- [ ] Real-time updates

## Amenities

- [ ] Amenity CRUD
- [ ] Availability
- [ ] Operating hours
- [ ] Booking form
- [ ] Booking validation

## Booking

- [ ] Date selection
- [ ] Time selection
- [ ] Availability check
- [ ] Overlap prevention
- [ ] Booking confirmation
- [ ] Cancellation
- [ ] Check-in
- [ ] Check-out
- [ ] Booking history

## Dashboards

- [ ] Tenant dashboard
- [ ] Manager dashboard
- [ ] Admin dashboard
- [ ] KPI cards
- [ ] Maintenance overview
- [ ] Booking overview

## Security

- [ ] RLS
- [ ] Authorization middleware
- [ ] Input validation
- [ ] API security
- [ ] Environment security
- [ ] CORS configuration

## Testing

- [ ] Authentication tests
- [ ] Role tests
- [ ] Maintenance tests
- [ ] Booking tests
- [ ] Conflict tests
- [ ] Security tests
- [ ] Responsive tests
- [ ] Real-time tests

## Deployment

- [ ] Frontend deployed
- [ ] Backend deployed
- [ ] Supabase production configuration
- [ ] Environment variables
- [ ] HTTPS
- [ ] CORS
- [ ] Production testing

---

# 20. Recommended Implementation Order

For actual development, follow this exact sequence:

```text
1. Planning
      ↓
2. GitHub + Project Setup
      ↓
3. Supabase Setup
      ↓
4. Database Schema
      ↓
5. Authentication
      ↓
6. Role-Based Access
      ↓
7. Base UI/Layout
      ↓
8. Property + Unit Management
      ↓
9. Maintenance Module
      ↓
10. Amenity Module
      ↓
11. Booking System
      ↓
12. Check-in / Check-out
      ↓
13. Tenant Dashboard
      ↓
14. Manager Dashboard
      ↓
15. Admin Dashboard
      ↓
16. Supabase Realtime
      ↓
17. Notifications
      ↓
18. Security Hardening
      ↓
19. Testing
      ↓
20. Deployment
      ↓
21. Documentation
```

---

# 21. Minimum Viable Product (MVP)

If development time becomes limited, the minimum working version should contain:

```text
Authentication
      +
Role Management
      +
Property/Unit
      +
Maintenance Requests
      +
Maintenance Status
      +
Amenities
      +
Amenity Booking
      +
Booking Conflict Prevention
      +
Tenant Dashboard
      +
Manager Dashboard
      +
Supabase Database
      +
Basic Realtime
```

Do not start with AI, payments, IoT, mobile apps, or advanced analytics. Build the core workflow first and make it reliable.

---

# 22. Definition of Done

The project can be considered complete when:

1. Users can securely log in.
2. Each role sees the correct dashboard.
3. Tenants can create maintenance requests.
4. Managers can update maintenance status.
5. Status changes are visible in real time.
6. Managers/admins can manage amenities.
7. Tenants can view amenity availability.
8. Tenants can create date/time bookings.
9. Overlapping bookings are rejected server-side/database-side.
10. Check-in/check-out can be recorded.
11. Unauthorized users cannot access protected data.
12. The application is responsive.
13. Main operations meet the response-time target under normal testing.
14. The system is deployed.
15. Technical and project documentation is complete.

---

# 23. Project Goal in One Sentence

> Build a secure, responsive, real-time web platform using **Next.js + Node.js/Express + Supabase** that allows tenants to manage maintenance requests and amenity bookings while enabling property managers and administrators to monitor and manage property operations from centralized dashboards.
