const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/roleMiddleware');
const dataStore = require('../data/mockData');

// 1. GET /api/amenities - List amenities
router.get('/', authenticate, (req, res) => {
  try {
    const { property_id } = req.query;
    let amenities = dataStore.getAmenities();

    if (property_id) {
      amenities = amenities.filter(a => a.property_id === property_id);
    }

    res.status(200).json({
      success: true,
      count: amenities.length,
      amenities
    });
  } catch (err) {
    console.error('Error fetching amenities:', err);
    res.status(500).json({ success: false, message: 'Failed to retrieve amenities.' });
  }
});

// 2. GET /api/amenities/:id/availability - Get booked slots for a specific date
router.get('/:id/availability', authenticate, (req, res) => {
  try {
    const { date } = req.query;
    const amenity = dataStore.getAmenityById(req.params.id);

    if (!amenity) {
      return res.status(404).json({ success: false, message: 'Amenity not found.' });
    }

    const bookingDate = date || new Date().toISOString().split('T')[0];
    const existingBookings = dataStore.getBookingsByAmenity(req.params.id, bookingDate);

    res.status(200).json({
      success: true,
      amenity_id: req.params.id,
      date: bookingDate,
      opening_time: amenity.opening_time,
      closing_time: amenity.closing_time,
      slot_duration_minutes: amenity.check_in_duration,
      booked_slots: existingBookings.map(b => ({
        id: b.id,
        start_time: b.start_time,
        end_time: b.end_time,
        status: b.status,
        user_name: b.user_name
      }))
    });
  } catch (err) {
    console.error('Error fetching amenity availability:', err);
    res.status(500).json({ success: false, message: 'Failed to retrieve amenity availability.' });
  }
});

// 3. GET /api/amenities/:id - Get amenity details
router.get('/:id', authenticate, (req, res) => {
  try {
    const amenity = dataStore.getAmenityById(req.params.id);
    if (!amenity) {
      return res.status(404).json({ success: false, message: 'Amenity not found.' });
    }

    res.status(200).json({
      success: true,
      amenity
    });
  } catch (err) {
    console.error('Error fetching amenity:', err);
    res.status(500).json({ success: false, message: 'Failed to retrieve amenity.' });
  }
});

// 4. POST /api/amenities - Create amenity
router.post('/', authenticate, requireRole(['manager', 'admin']), (req, res) => {
  try {
    const { 
      property_id, 
      name, 
      description, 
      opening_time = '08:00', 
      closing_time = '21:00', 
      check_in_duration = 60, 
      auto_confirm = true, 
      image_url 
    } = req.body;

    if (!name || !property_id) {
      return res.status(400).json({
        success: false,
        message: 'Amenity name and property_id are required.'
      });
    }

    const property = dataStore.getPropertyById(property_id);

    const newAmenity = {
      id: `amenity-${Date.now()}`,
      property_id,
      property_name: property?.name || 'Assigned Property',
      name,
      description: description || '',
      available: true,
      opening_time,
      closing_time,
      check_in_duration: Number(check_in_duration),
      auto_confirm: Boolean(auto_confirm),
      image_url: image_url || 'https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?auto=format&fit=crop&w=800&q=80',
      created_at: new Date().toISOString()
    };

    dataStore.addAmenity(newAmenity);

    res.status(201).json({
      success: true,
      message: 'Amenity created successfully.',
      amenity: newAmenity
    });
  } catch (err) {
    console.error('Error creating amenity:', err);
    res.status(500).json({ success: false, message: 'Failed to create amenity.' });
  }
});

// 5. PUT /api/amenities/:id - Update amenity
router.put('/:id', authenticate, requireRole(['manager', 'admin']), (req, res) => {
  try {
    const updated = dataStore.updateAmenity(req.params.id, req.body);
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Amenity not found.' });
    }

    res.status(200).json({
      success: true,
      message: 'Amenity updated successfully.',
      amenity: updated
    });
  } catch (err) {
    console.error('Error updating amenity:', err);
    res.status(500).json({ success: false, message: 'Failed to update amenity.' });
  }
});

// 6. DELETE /api/amenities/:id - Delete amenity
router.delete('/:id', authenticate, requireRole(['manager', 'admin']), (req, res) => {
  try {
    const deleted = dataStore.deleteAmenity(req.params.id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Amenity not found.' });
    }

    res.status(200).json({
      success: true,
      message: 'Amenity deleted successfully.'
    });
  } catch (err) {
    console.error('Error deleting amenity:', err);
    res.status(500).json({ success: false, message: 'Failed to delete amenity.' });
  }
});

module.exports = router;
