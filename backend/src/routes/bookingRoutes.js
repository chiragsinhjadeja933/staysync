const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/roleMiddleware');
const dataStore = require('../data/mockData');

// 1. GET /api/bookings - List bookings
router.get('/', authenticate, (req, res) => {
  try {
    const { amenity_id, date, status } = req.query;
    const userRole = req.user.role;
    let bookings = dataStore.getBookings();

    // Tenant only views own bookings
    if (userRole === 'tenant') {
      bookings = bookings.filter(b => b.user_id === req.user.id || b.user_email === req.user.email);
    }

    if (amenity_id) {
      bookings = bookings.filter(b => b.amenity_id === amenity_id);
    }
    if (date) {
      bookings = bookings.filter(b => b.booking_date === date);
    }
    if (status) {
      bookings = bookings.filter(b => b.status === status);
    }

    res.status(200).json({
      success: true,
      count: bookings.length,
      bookings
    });
  } catch (err) {
    console.error('Error fetching bookings:', err);
    res.status(500).json({ success: false, message: 'Failed to retrieve bookings.' });
  }
});

// 2. POST /api/bookings - Create booking with STRICT OVERLAP CONFLICT PREVENTION (Phase 8)
router.post('/', authenticate, (req, res) => {
  try {
    const { amenity_id, booking_date, start_time, end_time, notes } = req.body;

    if (!amenity_id || !booking_date || !start_time || !end_time) {
      return res.status(400).json({
        success: false,
        message: 'Amenity, date, start time, and end time are required.'
      });
    }

    // 1. Verify Amenity exists and is active
    const amenity = dataStore.getAmenityById(amenity_id);
    if (!amenity) {
      return res.status(404).json({ success: false, message: 'Amenity not found.' });
    }

    if (!amenity.available) {
      return res.status(400).json({
        success: false,
        message: 'This amenity is currently closed for maintenance or unavailable.'
      });
    }

    // 2. Validate time interval: start_time < end_time
    if (start_time >= end_time) {
      return res.status(400).json({
        success: false,
        message: 'Invalid time selection: Start time must be before end time.'
      });
    }

    // 3. Validate operating hours
    if (start_time < amenity.opening_time || end_time > amenity.closing_time) {
      return res.status(400).json({
        success: false,
        message: `Booking must be within operating hours (${amenity.opening_time} - ${amenity.closing_time}).`
      });
    }

    // 4. Strict Overlap Rule (Phase 8):
    // A conflict exists when: new_start < existing_end AND new_end > existing_start
    const existingBookings = dataStore.getBookingsByAmenity(amenity_id, booking_date);
    const conflictingBooking = existingBookings.find(b => {
      return (start_time < b.end_time && end_time > b.start_time);
    });

    if (conflictingBooking) {
      return res.status(409).json({
        success: false,
        message: `Booking conflict: Amenity is already booked from ${conflictingBooking.start_time} to ${conflictingBooking.end_time}. Please select another time slot.`
      });
    }

    // 5. Determine booking status based on amenity's auto_confirm rule
    const initialStatus = amenity.auto_confirm ? 'confirmed' : 'pending';

    const newBooking = {
      id: `bk-${Date.now()}`,
      amenity_id,
      amenity_name: amenity.name,
      property_name: amenity.property_name,
      user_id: req.user.id,
      user_name: req.user.full_name || 'Resident',
      user_email: req.user.email,
      booking_date,
      start_time,
      end_time,
      status: initialStatus,
      check_in_at: null,
      check_out_at: null,
      notes: notes || '',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    dataStore.addBooking(newBooking);

    res.status(201).json({
      success: true,
      message: amenity.auto_confirm 
        ? 'Booking confirmed successfully!' 
        : 'Booking submitted for manager review.',
      booking: newBooking
    });
  } catch (err) {
    console.error('Error creating booking:', err);
    res.status(500).json({ success: false, message: 'Failed to create booking.' });
  }
});

// 3. POST /api/bookings/:id/check-in - Record actual check-in time (Phase 9)
router.post('/:id/check-in', authenticate, (req, res) => {
  try {
    const booking = dataStore.getBookingById(req.params.id);
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found.' });
    }

    if (booking.check_in_at) {
      return res.status(400).json({ success: false, message: 'Already checked in for this booking.' });
    }

    const updated = dataStore.checkInBooking(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Checked in successfully! Enjoy your amenity.',
      booking: updated
    });
  } catch (err) {
    console.error('Check-in error:', err);
    res.status(500).json({ success: false, message: 'Check-in processing failed.' });
  }
});

// 4. POST /api/bookings/:id/check-out - Record actual check-out time (Phase 9)
router.post('/:id/check-out', authenticate, (req, res) => {
  try {
    const booking = dataStore.getBookingById(req.params.id);
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found.' });
    }

    const updated = dataStore.checkOutBooking(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Checked out successfully. Session completed.',
      booking: updated
    });
  } catch (err) {
    console.error('Check-out error:', err);
    res.status(500).json({ success: false, message: 'Check-out processing failed.' });
  }
});

// 5. POST /api/bookings/:id/cancel - Cancel booking
router.post('/:id/cancel', authenticate, (req, res) => {
  try {
    const booking = dataStore.getBookingById(req.params.id);
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found.' });
    }

    const updated = dataStore.cancelBooking(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Booking cancelled successfully.',
      booking: updated
    });
  } catch (err) {
    console.error('Cancel booking error:', err);
    res.status(500).json({ success: false, message: 'Failed to cancel booking.' });
  }
});

// 6. PATCH /api/bookings/:id/status - Manager approval/rejection
router.patch('/:id/status', authenticate, requireRole(['manager', 'admin']), (req, res) => {
  try {
    const { status } = req.body;
    if (!['confirmed', 'rejected', 'cancelled'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status.' });
    }

    const updated = dataStore.updateBookingStatus(req.params.id, status);
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Booking not found.' });
    }

    res.status(200).json({
      success: true,
      message: `Booking status updated to ${status}.`,
      booking: updated
    });
  } catch (err) {
    console.error('Update booking status error:', err);
    res.status(500).json({ success: false, message: 'Failed to update booking status.' });
  }
});

module.exports = router;
