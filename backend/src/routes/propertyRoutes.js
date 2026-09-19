const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/roleMiddleware');
const dataStore = require('../data/mockData');
const { supabaseClient, supabaseAdmin } = require('../config/supabase');

// 1. GET /api/properties - List properties accessible to user
router.get('/', authenticate, async (req, res) => {
  try {
    const userRole = req.user.role;
    let properties = dataStore.getProperties();
    const units = dataStore.getUnits();

    // If Supabase live configured, query Supabase
    if (process.env.SUPABASE_URL && !process.env.SUPABASE_URL.includes('your-project-id')) {
      const dbClient = supabaseAdmin || supabaseClient;
      let query = dbClient.from('properties').select('*');

      if (userRole === 'manager') {
        query = query.eq('owner_id', req.user.id);
      }

      const { data, error } = await query;
      if (!error && data?.length) {
        properties = data;
      }
    }

    // Enhance properties with live unit count & occupancy metrics
    const enhanced = properties.map(prop => {
      const propUnits = units.filter(u => u.property_id === prop.id);
      const totalUnits = propUnits.length;
      const occupiedUnits = propUnits.filter(u => u.status === 'occupied').length;
      const vacantUnits = propUnits.filter(u => u.status === 'vacant').length;
      const maintenanceUnits = propUnits.filter(u => u.status === 'maintenance').length;
      const occupancyRate = totalUnits > 0 ? Math.round((occupiedUnits / totalUnits) * 100) : 0;

      return {
        ...prop,
        total_units: totalUnits,
        occupied_units: occupiedUnits,
        vacant_units: vacantUnits,
        maintenance_units: maintenanceUnits,
        occupancy_rate: occupancyRate
      };
    });

    res.status(200).json({
      success: true,
      count: enhanced.length,
      properties: enhanced
    });
  } catch (err) {
    console.error('Error fetching properties:', err);
    res.status(500).json({ success: false, message: 'Failed to retrieve properties.' });
  }
});

// 2. GET /api/properties/:id - Get property with its units
router.get('/:id', authenticate, async (req, res) => {
  try {
    const property = dataStore.getPropertyById(req.params.id);
    if (!property) {
      return res.status(404).json({ success: false, message: 'Property not found.' });
    }

    const propUnits = dataStore.getUnitsByProperty(req.params.id);
    const occupiedUnits = propUnits.filter(u => u.status === 'occupied').length;
    const occupancyRate = propUnits.length > 0 ? Math.round((occupiedUnits / propUnits.length) * 100) : 0;

    res.status(200).json({
      success: true,
      property: {
        ...property,
        units: propUnits,
        total_units: propUnits.length,
        occupancy_rate: occupancyRate
      }
    });
  } catch (err) {
    console.error('Error fetching property details:', err);
    res.status(500).json({ success: false, message: 'Failed to retrieve property details.' });
  }
});

// 3. POST /api/properties - Create a new property
router.post('/', authenticate, requireRole(['manager', 'admin']), async (req, res) => {
  try {
    const { name, address, city, state, postal_code, image_url } = req.body;

    if (!name || !address || !city || !state) {
      return res.status(400).json({
        success: false,
        message: 'Name, address, city, and state are required.'
      });
    }

    const newProperty = {
      id: `prop-${Date.now()}`,
      name,
      address,
      city,
      state,
      postal_code: postal_code || '00000',
      owner_id: req.user.id,
      image_url: image_url || 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=800&q=80',
      created_at: new Date().toISOString()
    };

    // Save to dataStore
    dataStore.addProperty(newProperty);

    // Save to Supabase if live
    if (process.env.SUPABASE_URL && !process.env.SUPABASE_URL.includes('your-project-id')) {
      const dbClient = supabaseAdmin || supabaseClient;
      await dbClient.from('properties').insert([newProperty]);
    }

    res.status(201).json({
      success: true,
      message: 'Property created successfully.',
      property: newProperty
    });
  } catch (err) {
    console.error('Error creating property:', err);
    res.status(500).json({ success: false, message: 'Failed to create property.' });
  }
});

// 4. PUT /api/properties/:id - Update property
router.put('/:id', authenticate, requireRole(['manager', 'admin']), async (req, res) => {
  try {
    const updated = dataStore.updateProperty(req.params.id, req.body);
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Property not found.' });
    }

    res.status(200).json({
      success: true,
      message: 'Property updated successfully.',
      property: updated
    });
  } catch (err) {
    console.error('Error updating property:', err);
    res.status(500).json({ success: false, message: 'Failed to update property.' });
  }
});

// 5. DELETE /api/properties/:id - Delete property
router.delete('/:id', authenticate, requireRole(['manager', 'admin']), async (req, res) => {
  try {
    const deleted = dataStore.deleteProperty(req.params.id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Property not found.' });
    }

    res.status(200).json({
      success: true,
      message: 'Property and associated units deleted successfully.'
    });
  } catch (err) {
    console.error('Error deleting property:', err);
    res.status(500).json({ success: false, message: 'Failed to delete property.' });
  }
});

module.exports = router;
