const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/roleMiddleware');
const dataStore = require('../data/mockData');
const { supabaseClient, supabaseAdmin } = require('../config/supabase');

// 1. GET /api/units/my-unit - Tenant's assigned unit and property
router.get('/my-unit', authenticate, async (req, res) => {
  try {
    const tenantId = req.user.id;
    let unit = dataStore.getUnitByTenant(tenantId);

    // If demo tenant or not assigned yet, fallback to default assigned demo unit
    if (!unit && req.user.role === 'tenant') {
      unit = dataStore.getUnits().find(u => u.status === 'occupied') || dataStore.getUnits()[0];
    }

    if (!unit) {
      return res.status(404).json({
        success: false,
        message: 'No assigned unit found for this tenant.'
      });
    }

    const property = dataStore.getPropertyById(unit.property_id);

    res.status(200).json({
      success: true,
      unit,
      property
    });
  } catch (err) {
    console.error('Error fetching tenant unit:', err);
    res.status(500).json({ success: false, message: 'Failed to retrieve tenant unit.' });
  }
});

// 2. GET /api/units - List units
router.get('/', authenticate, async (req, res) => {
  try {
    const { property_id, status } = req.query;
    let units = dataStore.getUnits();

    if (property_id) {
      units = units.filter(u => u.property_id === property_id);
    }
    if (status) {
      units = units.filter(u => u.status === status);
    }

    res.status(200).json({
      success: true,
      count: units.length,
      units
    });
  } catch (err) {
    console.error('Error fetching units:', err);
    res.status(500).json({ success: false, message: 'Failed to retrieve units.' });
  }
});

// 3. GET /api/units/:id - Get unit details
router.get('/:id', authenticate, async (req, res) => {
  try {
    const unit = dataStore.getUnitById(req.params.id);
    if (!unit) {
      return res.status(404).json({ success: false, message: 'Unit not found.' });
    }

    const property = dataStore.getPropertyById(unit.property_id);

    res.status(200).json({
      success: true,
      unit: {
        ...unit,
        property
      }
    });
  } catch (err) {
    console.error('Error fetching unit:', err);
    res.status(500).json({ success: false, message: 'Failed to retrieve unit.' });
  }
});

// 4. POST /api/units - Create a new unit in a property
router.post('/', authenticate, requireRole(['manager', 'admin']), async (req, res) => {
  try {
    const { property_id, unit_number, floor, rent_amount, status = 'vacant' } = req.body;

    if (!property_id || !unit_number) {
      return res.status(400).json({
        success: false,
        message: 'property_id and unit_number are required.'
      });
    }

    const property = dataStore.getPropertyById(property_id);
    if (!property) {
      return res.status(404).json({ success: false, message: 'Property does not exist.' });
    }

    const newUnit = {
      id: `unit-${Date.now()}`,
      property_id,
      unit_number,
      floor: floor || '1st Floor',
      rent_amount: Number(rent_amount) || 0,
      status,
      tenant_id: null,
      tenant_name: null,
      tenant_email: null,
      created_at: new Date().toISOString()
    };

    dataStore.addUnit(newUnit);

    res.status(201).json({
      success: true,
      message: 'Unit created successfully.',
      unit: newUnit
    });
  } catch (err) {
    console.error('Error creating unit:', err);
    res.status(500).json({ success: false, message: 'Failed to create unit.' });
  }
});

// 5. POST /api/units/:id/assign - Assign or unassign a tenant
router.post('/:id/assign', authenticate, requireRole(['manager', 'admin']), async (req, res) => {
  try {
    const { tenant_id, tenant_name, tenant_email } = req.body;
    const unit = dataStore.getUnitById(req.params.id);

    if (!unit) {
      return res.status(404).json({ success: false, message: 'Unit not found.' });
    }

    // If tenant_id provided -> assign & set occupied; if null -> unassign & set vacant
    const updates = tenant_id ? {
      tenant_id,
      tenant_name: tenant_name || 'Assigned Tenant',
      tenant_email: tenant_email || '',
      status: 'occupied'
    } : {
      tenant_id: null,
      tenant_name: null,
      tenant_email: null,
      status: 'vacant'
    };

    const updated = dataStore.updateUnit(req.params.id, updates);

    res.status(200).json({
      success: true,
      message: tenant_id ? 'Tenant successfully assigned to unit.' : 'Unit successfully vacated.',
      unit: updated
    });
  } catch (err) {
    console.error('Error assigning tenant:', err);
    res.status(500).json({ success: false, message: 'Failed to assign tenant.' });
  }
});

// 6. PUT /api/units/:id - Update unit
router.put('/:id', authenticate, requireRole(['manager', 'admin']), async (req, res) => {
  try {
    const updated = dataStore.updateUnit(req.params.id, req.body);
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Unit not found.' });
    }

    res.status(200).json({
      success: true,
      message: 'Unit updated successfully.',
      unit: updated
    });
  } catch (err) {
    console.error('Error updating unit:', err);
    res.status(500).json({ success: false, message: 'Failed to update unit.' });
  }
});

// 7. DELETE /api/units/:id - Delete unit
router.delete('/:id', authenticate, requireRole(['manager', 'admin']), async (req, res) => {
  try {
    const deleted = dataStore.deleteUnit(req.params.id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Unit not found.' });
    }

    res.status(200).json({
      success: true,
      message: 'Unit deleted successfully.'
    });
  } catch (err) {
    console.error('Error deleting unit:', err);
    res.status(500).json({ success: false, message: 'Failed to delete unit.' });
  }
});

module.exports = router;
