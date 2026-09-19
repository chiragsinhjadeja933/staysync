const express = require('express');
const router = express.Router();
const { authenticate, DEMO_USERS } = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/roleMiddleware');
const dataStore = require('../data/mockData');

// 1. GET /api/dashboard/tenant - Tenant personalized dashboard data
router.get('/tenant', authenticate, (req, res) => {
  try {
    const tenantId = req.user.id;
    let unit = dataStore.getUnitByTenant(tenantId);
    if (!unit) {
      unit = dataStore.getUnits()[0]; // Demo fallback
    }
    const property = dataStore.getPropertyById(unit?.property_id);

    const requests = dataStore.getMaintenanceByTenant(tenantId);
    const openRequests = requests.filter(r => r.status !== 'completed').length;
    const completedRequests = requests.filter(r => r.status === 'completed').length;

    const userBookings = dataStore.getBookingsByUser(tenantId);
    const upcomingBookings = userBookings.filter(b => ['confirmed', 'pending'].includes(b.status));
    const nextBooking = upcomingBookings[0] || null;

    const availableAmenities = dataStore.getAmenities().filter(a => a.available).length;

    res.status(200).json({
      success: true,
      data: {
        unit,
        property,
        kpis: {
          open_requests: openRequests,
          completed_requests: completedRequests,
          upcoming_bookings: upcomingBookings.length,
          available_amenities: availableAmenities
        },
        recent_requests: requests.slice(0, 3),
        next_booking: nextBooking
      }
    });
  } catch (err) {
    console.error('Tenant dashboard error:', err);
    res.status(500).json({ success: false, message: 'Failed to load tenant dashboard metrics.' });
  }
});

// 2. GET /api/dashboard/manager - Manager operational dashboard data
router.get('/manager', authenticate, requireRole(['manager', 'admin']), (req, res) => {
  try {
    const properties = dataStore.getProperties();
    const units = dataStore.getUnits();
    const requests = dataStore.getMaintenanceRequests();
    const bookings = dataStore.getBookings();

    const totalProperties = properties.length;
    const totalUnits = units.length;
    const occupiedUnits = units.filter(u => u.status === 'occupied').length;
    const occupancyRate = totalUnits > 0 ? Math.round((occupiedUnits / totalUnits) * 100) : 0;
    const totalTenants = units.filter(u => u.tenant_id).length;

    const pendingRequests = requests.filter(r => r.status === 'pending').length;
    const inProgressRequests = requests.filter(r => r.status === 'in_progress').length;
    const completedRequests = requests.filter(r => r.status === 'completed').length;
    const urgentRequests = requests.filter(r => r.priority === 'urgent' && r.status !== 'completed').length;

    // Today's bookings
    const todayStr = new Date().toISOString().split('T')[0];
    const todayBookings = bookings.filter(b => b.booking_date === todayStr);

    res.status(200).json({
      success: true,
      data: {
        kpis: {
          total_properties: totalProperties,
          total_units: totalUnits,
          occupied_units: occupiedUnits,
          occupancy_rate: occupancyRate,
          total_tenants: totalTenants,
          pending_requests: pendingRequests,
          in_progress_requests: inProgressRequests,
          completed_requests: completedRequests,
          urgent_requests: urgentRequests,
          today_bookings_count: todayBookings.length
        },
        urgent_queue: requests.filter(r => r.status !== 'completed').slice(0, 5),
        today_schedule: todayBookings,
        portfolio_summary: properties.map(p => {
          const pUnits = units.filter(u => u.property_id === p.id);
          const pOccupied = pUnits.filter(u => u.status === 'occupied').length;
          return {
            id: p.id,
            name: p.name,
            total_units: pUnits.length,
            occupied_units: pOccupied,
            occupancy_rate: pUnits.length > 0 ? Math.round((pOccupied / pUnits.length) * 100) : 0
          };
        })
      }
    });
  } catch (err) {
    console.error('Manager dashboard error:', err);
    res.status(500).json({ success: false, message: 'Failed to load manager dashboard metrics.' });
  }
});

// 3. GET /api/dashboard/admin - Admin platform-wide metrics & user management
router.get('/admin', authenticate, requireRole(['admin']), (req, res) => {
  try {
    const properties = dataStore.getProperties();
    const units = dataStore.getUnits();
    const requests = dataStore.getMaintenanceRequests();
    const bookings = dataStore.getBookings();
    const amenities = dataStore.getAmenities();

    const usersList = Object.values(DEMO_USERS);

    const completedRequests = requests.filter(r => r.status === 'completed').length;
    const resolutionRate = requests.length > 0 ? Math.round((completedRequests / requests.length) * 100) : 100;

    res.status(200).json({
      success: true,
      data: {
        kpis: {
          total_users: usersList.length,
          total_properties: properties.length,
          total_units: units.length,
          total_amenities: amenities.length,
          total_maintenance: requests.length,
          resolution_rate: `${resolutionRate}%`,
          total_bookings: bookings.length,
          booking_conflicts: '0 (Zero Conflict Engine Active)',
          system_status: 'Healthy • 100% Uptime'
        },
        users: usersList,
        recent_activity: [
          { id: '1', event: 'New maintenance ticket created', time: '10 mins ago', type: 'maintenance' },
          { id: '2', event: 'Rooftop Pool reservation completed', time: '25 mins ago', type: 'booking' },
          { id: '3', event: 'Tenant assigned to Penthouse 501', time: '1 hour ago', type: 'unit' }
        ]
      }
    });
  } catch (err) {
    console.error('Admin dashboard error:', err);
    res.status(500).json({ success: false, message: 'Failed to load admin dashboard metrics.' });
  }
});

module.exports = router;
