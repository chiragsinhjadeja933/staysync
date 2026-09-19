const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/roleMiddleware');
const dataStore = require('../data/mockData');
const { supabaseClient, supabaseAdmin } = require('../config/supabase');

// Active Server-Sent Events (SSE) client connections for real-time broadcasts
let sseClients = [];

function broadcastRealtimeEvent(eventType, payload) {
  const data = JSON.stringify({ type: eventType, data: payload, timestamp: new Date().toISOString() });
  sseClients.forEach(client => {
    try {
      client.res.write(`data: ${data}\n\n`);
    } catch (e) {
      // Ignore dead connections
    }
  });
}

// 1. GET /api/maintenance/stream - Real-time SSE stream
router.get('/stream', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  const clientId = `client-${Date.now()}`;
  const newClient = { id: clientId, res };
  sseClients.push(newClient);

  // Send initial ping
  res.write(`data: ${JSON.stringify({ type: 'connected', clientId })}\n\n`);

  req.on('close', () => {
    sseClients = sseClients.filter(c => c.id !== clientId);
  });
});

// 2. GET /api/maintenance - List maintenance requests
router.get('/', authenticate, async (req, res) => {
  try {
    const { status, priority } = req.query;
    const userRole = req.user.role;
    let requests = dataStore.getMaintenanceRequests();

    // Role-based filtering
    if (userRole === 'tenant') {
      requests = requests.filter(r => r.tenant_id === req.user.id || r.tenant_email === req.user.email);
    }

    // Status filter
    if (status && status !== 'all') {
      requests = requests.filter(r => r.status === status);
    }

    // Priority filter
    if (priority && priority !== 'all') {
      requests = requests.filter(r => r.priority === priority);
    }

    res.status(200).json({
      success: true,
      count: requests.length,
      requests
    });
  } catch (err) {
    console.error('Error fetching maintenance requests:', err);
    res.status(500).json({ success: false, message: 'Failed to retrieve maintenance requests.' });
  }
});

// 3. GET /api/maintenance/:id - Ticket details
router.get('/:id', authenticate, async (req, res) => {
  try {
    const request = dataStore.getMaintenanceById(req.params.id);
    if (!request) {
      return res.status(404).json({ success: false, message: 'Maintenance request not found.' });
    }

    res.status(200).json({
      success: true,
      request
    });
  } catch (err) {
    console.error('Error fetching maintenance ticket:', err);
    res.status(500).json({ success: false, message: 'Failed to retrieve maintenance ticket.' });
  }
});

// 4. POST /api/maintenance - Create new ticket (Tenant workflow)
router.post('/', authenticate, async (req, res) => {
  try {
    const { title, description, priority = 'medium' } = req.body;

    if (!title || !description) {
      return res.status(400).json({
        success: false,
        message: 'Title and description are required.'
      });
    }

    // Derive tenant's assigned unit and property automatically
    let unit = dataStore.getUnitByTenant(req.user.id);
    if (!unit) {
      // Fallback to demo assigned unit if not explicitly assigned
      unit = dataStore.getUnits()[0];
    }
    const property = dataStore.getPropertyById(unit.property_id);

    const newTicket = {
      id: `m-${Date.now()}`,
      property_id: unit.property_id,
      property_name: property?.name || 'Assigned Property',
      unit_id: unit.id,
      unit_number: unit.unit_number,
      tenant_id: req.user.id,
      tenant_name: req.user.full_name || 'Tenant',
      tenant_email: req.user.email,
      title,
      description,
      priority,
      status: 'pending',
      notes: null,
      resolved_at: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    dataStore.addMaintenanceRequest(newTicket);

    // Broadcast real-time creation event
    broadcastRealtimeEvent('ticket_created', newTicket);

    res.status(201).json({
      success: true,
      message: 'Maintenance request submitted successfully.',
      ticket: newTicket
    });
  } catch (err) {
    console.error('Error creating maintenance ticket:', err);
    res.status(500).json({ success: false, message: 'Failed to submit maintenance request.' });
  }
});

// 5. PATCH /api/maintenance/:id/status - Update status & notes (Manager workflow)
router.patch('/:id/status', authenticate, requireRole(['manager', 'admin']), async (req, res) => {
  try {
    const { status, notes } = req.body;

    if (!['pending', 'in_progress', 'completed'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Allowed values: pending, in_progress, completed.'
      });
    }

    const updated = dataStore.updateMaintenanceStatus(req.params.id, {
      status,
      notes
    });

    if (!updated) {
      return res.status(404).json({ success: false, message: 'Maintenance ticket not found.' });
    }

    // Broadcast real-time update event so tenant's UI updates instantaneously without refresh!
    broadcastRealtimeEvent('ticket_updated', updated);

    res.status(200).json({
      success: true,
      message: `Ticket status updated to ${status}.`,
      ticket: updated
    });
  } catch (err) {
    console.error('Error updating maintenance status:', err);
    res.status(500).json({ success: false, message: 'Failed to update maintenance status.' });
  }
});

module.exports = router;
