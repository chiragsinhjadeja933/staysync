const { describe, it } = require('node:test');
const assert = require('node:assert');

const BASE_URL = 'http://localhost:5005/api';

describe('Real-Time Property Rental & Amenity Management API Tests', () => {

  // Test 1: Healthcheck
  it('GET /api/health - Server healthcheck returns 200 OK', async () => {
    const res = await fetch(`${BASE_URL}/health`);
    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.strictEqual(data.success, true);
    assert.strictEqual(data.environment, 'development');
  });

  // Test 2: Demo Authentication
  it('POST /api/auth/demo-login - Successfully returns token and role for Tenant', async () => {
    const res = await fetch(`${BASE_URL}/auth/demo-login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role: 'tenant' })
    });
    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.strictEqual(data.success, true);
    assert.strictEqual(data.user.role, 'tenant');
    assert.ok(data.token);
  });

  // Test 3: Role Authorization Guard (Tenants cannot create properties)
  it('POST /api/properties - Tenant token is rejected with 403 Forbidden', async () => {
    const res = await fetch(`${BASE_URL}/properties`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': 'Bearer demo-tenant-token'
      },
      body: JSON.stringify({
        name: 'Unauthorized Villa',
        address: '123 Fake St',
        city: 'Nowhere',
        state: 'CA'
      })
    });
    assert.strictEqual(res.status, 403);
    const data = await res.json();
    assert.strictEqual(data.success, false);
    assert.match(data.message, /Access forbidden/);
  });

  // Test 4: Conflict-Free Booking Engine (Overlap Detection)
  it('POST /api/bookings - Overlapping booking is rejected with 409 Conflict', async () => {
    const today = new Date().toISOString().split('T')[0];

    // Attempt overlapping slot on Rooftop Pool (conflicts with 18:00 - 19:00)
    const res = await fetch(`${BASE_URL}/bookings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer demo-tenant-token'
      },
      body: JSON.stringify({
        amenity_id: 'c1111111-1111-1111-1111-111111111111',
        booking_date: today,
        start_time: '18:15',
        end_time: '19:15'
      })
    });

    assert.strictEqual(res.status, 409);
    const data = await res.json();
    assert.strictEqual(data.success, false);
    assert.match(data.message, /Booking conflict: Amenity is already booked/);
  });

  // Test 5: Booking Lifecycle (Create -> Check-In -> Check-Out)
  it('POST /api/bookings - Creates valid booking, checks in, and checks out', async () => {
    // Use an isolated test date in the future so UI interactions never collide
    const testDate = new Date(Date.now() + 86400000 * 10).toISOString().split('T')[0];

    // 1. Create unique non-conflicting booking (e.g. 09:00 - 10:00)
    const createRes = await fetch(`${BASE_URL}/bookings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer demo-tenant-token'
      },
      body: JSON.stringify({
        amenity_id: 'c1111111-1111-1111-1111-111111111111',
        booking_date: testDate,
        start_time: '09:00',
        end_time: '10:00'
      })
    });

    assert.strictEqual(createRes.status, 201);
    const createData = await createRes.json();
    const bookingId = createData.booking.id;
    assert.ok(bookingId);

    // 2. Check-In
    const checkInRes = await fetch(`${BASE_URL}/bookings/${bookingId}/check-in`, {
      method: 'POST',
      headers: { 'Authorization': 'Bearer demo-tenant-token' }
    });
    assert.strictEqual(checkInRes.status, 200);
    const checkInData = await checkInRes.json();
    assert.ok(checkInData.booking.check_in_at);

    // 3. Check-Out
    const checkOutRes = await fetch(`${BASE_URL}/bookings/${bookingId}/check-out`, {
      method: 'POST',
      headers: { 'Authorization': 'Bearer demo-tenant-token' }
    });
    assert.strictEqual(checkOutRes.status, 200);
    const checkOutData = await checkOutRes.json();
    assert.strictEqual(checkOutData.booking.status, 'completed');
    assert.ok(checkOutData.booking.check_out_at);
  });

  // Test 6: Maintenance Request Lifecycle
  it('POST /api/maintenance & PATCH /api/maintenance/:id/status - Ticket submission and status transition', async () => {
    // 1. Tenant submits ticket
    const submitRes = await fetch(`${BASE_URL}/maintenance`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer demo-tenant-token'
      },
      body: JSON.stringify({
        title: 'Smoke Detector Battery Chirping',
        description: 'Battery low warning beeps every 45 seconds in hallway.',
        priority: 'medium'
      })
    });

    assert.strictEqual(submitRes.status, 201);
    const submitData = await submitRes.json();
    const ticketId = submitData.ticket.id;
    assert.strictEqual(submitData.ticket.status, 'pending');

    // 2. Manager updates status to in_progress
    const updateRes = await fetch(`${BASE_URL}/maintenance/${ticketId}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer demo-manager-token'
      },
      body: JSON.stringify({
        status: 'in_progress',
        notes: 'Maintenance tech assigned 9V battery replacement.'
      })
    });

    assert.strictEqual(updateRes.status, 200);
    const updateData = await updateRes.json();
    assert.strictEqual(updateData.ticket.status, 'in_progress');
    assert.strictEqual(updateData.ticket.notes, 'Maintenance tech assigned 9V battery replacement.');
  });

});
