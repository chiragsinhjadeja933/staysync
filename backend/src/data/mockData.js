// In-memory persistent data store with pre-seeded demo data (syncs with Supabase if configured)
let properties = [
  {
    id: 'a1111111-1111-1111-1111-111111111111',
    name: 'Skyline Luxury Towers',
    address: '100 Ocean Boulevard',
    city: 'San Francisco',
    state: 'CA',
    postal_code: '94107',
    owner_id: 'd2222222-2222-2222-2222-222222222222', // Sarah Connor (Manager)
    image_url: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=800&q=80',
    created_at: new Date('2026-01-15T08:00:00Z').toISOString()
  },
  {
    id: 'a2222222-2222-2222-2222-222222222222',
    name: 'Grand View Residences',
    address: '450 Highland Avenue',
    city: 'Austin',
    state: 'TX',
    postal_code: '78701',
    owner_id: 'd2222222-2222-2222-2222-222222222222',
    image_url: 'https://images.unsplash.com/photo-1574362848149-11496d93a7c7?auto=format&fit=crop&w=800&q=80',
    created_at: new Date('2026-02-01T10:00:00Z').toISOString()
  }
];

let units = [
  {
    id: 'b1111111-1111-1111-1111-111111111111',
    property_id: 'a1111111-1111-1111-1111-111111111111',
    unit_number: 'Unit 101',
    floor: '1st Floor',
    status: 'occupied',
    tenant_id: 'd1111111-1111-1111-1111-111111111111', // Alex Johnson (Demo Tenant)
    tenant_name: 'Alex Johnson',
    tenant_email: 'tenant@staysync.com',
    rent_amount: 2200.00,
    created_at: new Date('2026-01-16T09:00:00Z').toISOString()
  },
  {
    id: 'b2222222-2222-2222-2222-222222222222',
    property_id: 'a1111111-1111-1111-1111-111111111111',
    unit_number: 'Penthouse 501',
    floor: '5th Floor',
    status: 'vacant',
    tenant_id: null,
    tenant_name: null,
    tenant_email: null,
    rent_amount: 4500.00,
    created_at: new Date('2026-01-16T09:00:00Z').toISOString()
  },
  {
    id: 'b3333333-3333-3333-3333-333333333333',
    property_id: 'a1111111-1111-1111-1111-111111111111',
    unit_number: 'Studio 204',
    floor: '2nd Floor',
    status: 'maintenance',
    tenant_id: null,
    tenant_name: null,
    tenant_email: null,
    rent_amount: 1800.00,
    created_at: new Date('2026-01-16T09:00:00Z').toISOString()
  },
  {
    id: 'b4444444-4444-4444-4444-444444444444',
    property_id: 'a2222222-2222-2222-2222-222222222222',
    unit_number: 'Suite A-12',
    floor: 'Ground Floor',
    status: 'vacant',
    tenant_id: null,
    tenant_name: null,
    tenant_email: null,
    rent_amount: 2600.00,
    created_at: new Date('2026-02-02T11:00:00Z').toISOString()
  }
];

let maintenanceRequests = [
  {
    id: 'm1111111-1111-1111-1111-111111111111',
    property_id: 'a1111111-1111-1111-1111-111111111111',
    property_name: 'Skyline Luxury Towers',
    unit_id: 'b1111111-1111-1111-1111-111111111111',
    unit_number: 'Unit 101',
    tenant_id: 'd1111111-1111-1111-1111-111111111111',
    tenant_name: 'Alex Johnson',
    title: 'HVAC Air Conditioning Not Cooling',
    description: 'The AC unit in the master bedroom is blowing ambient air and making a vibrating noise. Temperature in unit is 82F.',
    priority: 'urgent',
    status: 'in_progress',
    notes: 'Technician dispatched from CoolAir Services. Scheduled arrival at 2:30 PM.',
    resolved_at: null,
    created_at: new Date(Date.now() - 3600000 * 4).toISOString(), // 4 hours ago
    updated_at: new Date(Date.now() - 3600000 * 2).toISOString()
  },
  {
    id: 'm2222222-2222-2222-2222-222222222222',
    property_id: 'a1111111-1111-1111-1111-111111111111',
    property_name: 'Skyline Luxury Towers',
    unit_id: 'b1111111-1111-1111-1111-111111111111',
    unit_number: 'Unit 101',
    tenant_id: 'd1111111-1111-1111-1111-111111111111',
    tenant_name: 'Alex Johnson',
    title: 'Bathroom Sink Drain Draining Slowly',
    description: 'The main bathroom basin water is backing up during morning use.',
    priority: 'medium',
    status: 'pending',
    notes: null,
    resolved_at: null,
    created_at: new Date(Date.now() - 3600000 * 8).toISOString(),
    updated_at: new Date(Date.now() - 3600000 * 8).toISOString()
  },
  {
    id: 'm3333333-3333-3333-3333-333333333333',
    property_id: 'a1111111-1111-1111-1111-111111111111',
    property_name: 'Skyline Luxury Towers',
    unit_id: 'b1111111-1111-1111-1111-111111111111',
    unit_number: 'Unit 101',
    tenant_id: 'd1111111-1111-1111-1111-111111111111',
    tenant_name: 'Alex Johnson',
    title: 'Balcony Sliding Door Latch Loose',
    description: 'Sliding lock mechanism required re-alignment and screw tightening.',
    priority: 'low',
    status: 'completed',
    notes: 'Replaced strike plate and lubricated tracks. Working smoothly.',
    resolved_at: new Date(Date.now() - 3600000 * 24).toISOString(),
    created_at: new Date(Date.now() - 3600000 * 48).toISOString(),
    updated_at: new Date(Date.now() - 3600000 * 24).toISOString()
  }
];

// Helper to get formatted today date YYYY-MM-DD
const todayDateStr = new Date().toISOString().split('T')[0];

let amenities = [
  {
    id: 'c1111111-1111-1111-1111-111111111111',
    property_id: 'a1111111-1111-1111-1111-111111111111',
    property_name: 'Skyline Luxury Towers',
    name: 'Rooftop Infinity Pool',
    description: 'Panoramic heated infinity pool on the 25th floor with sun loungers and skyline views.',
    available: true,
    opening_time: '07:00',
    closing_time: '21:00',
    check_in_duration: 60, // minutes
    auto_confirm: true,
    image_url: 'https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?auto=format&fit=crop&w=800&q=80',
    created_at: new Date('2026-01-15T08:00:00Z').toISOString()
  },
  {
    id: 'c2222222-2222-2222-2222-222222222222',
    property_id: 'a1111111-1111-1111-1111-111111111111',
    property_name: 'Skyline Luxury Towers',
    name: 'High-Tech Fitness Center',
    description: 'Equipped with Peloton bikes, free weights, Olympic lifting racks, and yoga studio.',
    available: true,
    opening_time: '05:00',
    closing_time: '23:00',
    check_in_duration: 90,
    auto_confirm: true,
    image_url: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=800&q=80',
    created_at: new Date('2026-01-15T08:00:00Z').toISOString()
  },
  {
    id: 'c3333333-3333-3333-3333-333333333333',
    property_id: 'a1111111-1111-1111-1111-111111111111',
    property_name: 'Skyline Luxury Towers',
    name: 'Executive Conference Lounge',
    description: 'Private 12-seat boardroom with 4K conference video display, whiteboard, and high-speed Wi-Fi.',
    available: true,
    opening_time: '08:00',
    closing_time: '20:00',
    check_in_duration: 60,
    auto_confirm: false, // Requires manager review
    image_url: 'https://images.unsplash.com/photo-1517502884422-41eaead166d4?auto=format&fit=crop&w=800&q=80',
    created_at: new Date('2026-01-15T08:00:00Z').toISOString()
  },
  {
    id: 'c4444444-4444-4444-4444-444444444444',
    property_id: 'a1111111-1111-1111-1111-111111111111',
    property_name: 'Skyline Luxury Towers',
    name: 'Barbecue & Garden Patio',
    description: 'Outdoor culinary courtyard with natural gas barbecue stations, dining cabanas, and fire pits.',
    available: true,
    opening_time: '11:00',
    closing_time: '22:00',
    check_in_duration: 120,
    auto_confirm: true,
    image_url: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80',
    created_at: new Date('2026-01-15T08:00:00Z').toISOString()
  }
];

let amenityBookings = [
  {
    id: 'bk111111-1111-1111-1111-111111111111',
    amenity_id: 'c1111111-1111-1111-1111-111111111111',
    amenity_name: 'Rooftop Infinity Pool',
    property_name: 'Skyline Luxury Towers',
    user_id: 'd1111111-1111-1111-1111-111111111111',
    user_name: 'Alex Johnson',
    user_email: 'tenant@staysync.com',
    booking_date: todayDateStr,
    start_time: '18:00',
    end_time: '19:00',
    status: 'confirmed',
    check_in_at: null,
    check_out_at: null,
    notes: 'Evening swim reservation',
    created_at: new Date(Date.now() - 3600000 * 5).toISOString()
  },
  {
    id: 'bk222222-2222-2222-2222-222222222222',
    amenity_id: 'c2222222-2222-2222-2222-222222222222',
    amenity_name: 'High-Tech Fitness Center',
    property_name: 'Skyline Luxury Towers',
    user_id: 'd1111111-1111-1111-1111-111111111111',
    user_name: 'Alex Johnson',
    user_email: 'tenant@staysync.com',
    booking_date: todayDateStr,
    start_time: '08:00',
    end_time: '09:30',
    status: 'completed',
    check_in_at: new Date(new Date().setHours(8, 2, 0, 0)).toISOString(),
    check_out_at: new Date(new Date().setHours(9, 28, 0, 0)).toISOString(),
    notes: 'Morning workout session',
    created_at: new Date(Date.now() - 3600000 * 12).toISOString()
  }
];

module.exports = {
  getProperties: () => properties,
  getPropertyById: (id) => properties.find(p => p.id === id),
  addProperty: (prop) => {
    properties.unshift(prop);
    return prop;
  },
  updateProperty: (id, updates) => {
    const idx = properties.findIndex(p => p.id === id);
    if (idx !== -1) {
      properties[idx] = { ...properties[idx], ...updates, updated_at: new Date().toISOString() };
      return properties[idx];
    }
    return null;
  },
  deleteProperty: (id) => {
    const idx = properties.findIndex(p => p.id === id);
    if (idx !== -1) {
      const removed = properties.splice(idx, 1)[0];
      // Also delete associated units
      units = units.filter(u => u.property_id !== id);
      return removed;
    }
    return null;
  },

  getUnits: () => units,
  getUnitsByProperty: (propId) => units.filter(u => u.property_id === propId),
  getUnitById: (id) => units.find(u => u.id === id),
  getUnitByTenant: (tenantId) => units.find(u => u.tenant_id === tenantId),
  addUnit: (unit) => {
    units.push(unit);
    return unit;
  },
  updateUnit: (id, updates) => {
    const idx = units.findIndex(u => u.id === id);
    if (idx !== -1) {
      units[idx] = { ...units[idx], ...updates, updated_at: new Date().toISOString() };
      return units[idx];
    }
    return null;
  },
  deleteUnit: (id) => {
    const idx = units.findIndex(u => u.id === id);
    if (idx !== -1) {
      return units.splice(idx, 1)[0];
    }
    return null;
  },

  getMaintenanceRequests: () => maintenanceRequests,
  getMaintenanceById: (id) => maintenanceRequests.find(m => m.id === id),
  getMaintenanceByTenant: (tenantId) => maintenanceRequests.filter(m => m.tenant_id === tenantId),
  getMaintenanceByProperty: (propId) => maintenanceRequests.filter(m => m.property_id === propId),
  addMaintenanceRequest: (req) => {
    maintenanceRequests.unshift(req);
    return req;
  },
  updateMaintenanceStatus: (id, { status, notes, resolved_at }) => {
    const idx = maintenanceRequests.findIndex(m => m.id === id);
    if (idx !== -1) {
      maintenanceRequests[idx] = {
        ...maintenanceRequests[idx],
        status,
        ...(notes !== undefined ? { notes } : {}),
        resolved_at: status === 'completed' ? (resolved_at || new Date().toISOString()) : null,
        updated_at: new Date().toISOString()
      };
      return maintenanceRequests[idx];
    }
    return null;
  },
  deleteMaintenanceRequest: (id) => {
    const idx = maintenanceRequests.findIndex(m => m.id === id);
    if (idx !== -1) {
      return maintenanceRequests.splice(idx, 1)[0];
    }
    return null;
  },

  // Amenity methods
  getAmenities: () => amenities,
  getAmenityById: (id) => amenities.find(a => a.id === id),
  getAmenitiesByProperty: (propId) => amenities.filter(a => a.property_id === propId),
  addAmenity: (amenity) => {
    amenities.push(amenity);
    return amenity;
  },
  updateAmenity: (id, updates) => {
    const idx = amenities.findIndex(a => a.id === id);
    if (idx !== -1) {
      amenities[idx] = { ...amenities[idx], ...updates, updated_at: new Date().toISOString() };
      return amenities[idx];
    }
    return null;
  },
  deleteAmenity: (id) => {
    const idx = amenities.findIndex(a => a.id === id);
    if (idx !== -1) {
      const removed = amenities.splice(idx, 1)[0];
      // Also remove associated bookings
      amenityBookings = amenityBookings.filter(b => b.amenity_id !== id);
      return removed;
    }
    return null;
  },

  // Booking methods
  getBookings: () => amenityBookings,
  getBookingById: (id) => amenityBookings.find(b => b.id === id),
  getBookingsByAmenity: (amenityId, date) => {
    return amenityBookings.filter(b => 
      b.amenity_id === amenityId && 
      (!date || b.booking_date === date) &&
      ['confirmed', 'pending'].includes(b.status)
    );
  },
  getBookingsByUser: (userId) => amenityBookings.filter(b => b.user_id === userId),
  addBooking: (booking) => {
    amenityBookings.unshift(booking);
    return booking;
  },
  updateBookingStatus: (id, status) => {
    const idx = amenityBookings.findIndex(b => b.id === id);
    if (idx !== -1) {
      amenityBookings[idx] = { ...amenityBookings[idx], status, updated_at: new Date().toISOString() };
      return amenityBookings[idx];
    }
    return null;
  },
  checkInBooking: (id) => {
    const idx = amenityBookings.findIndex(b => b.id === id);
    if (idx !== -1) {
      amenityBookings[idx] = { 
        ...amenityBookings[idx], 
        check_in_at: new Date().toISOString(),
        updated_at: new Date().toISOString() 
      };
      return amenityBookings[idx];
    }
    return null;
  },
  checkOutBooking: (id) => {
    const idx = amenityBookings.findIndex(b => b.id === id);
    if (idx !== -1) {
      amenityBookings[idx] = { 
        ...amenityBookings[idx], 
        status: 'completed',
        check_out_at: new Date().toISOString(),
        updated_at: new Date().toISOString() 
      };
      return amenityBookings[idx];
    }
    return null;
  },
  cancelBooking: (id) => {
    const idx = amenityBookings.findIndex(b => b.id === id);
    if (idx !== -1) {
      amenityBookings[idx] = { 
        ...amenityBookings[idx], 
        status: 'cancelled',
        updated_at: new Date().toISOString() 
      };
      return amenityBookings[idx];
    }
    return null;
  }
};
