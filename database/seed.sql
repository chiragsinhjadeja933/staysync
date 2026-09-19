-- ====================================================================
-- Real-Time Property Rental, Maintenance & Amenity Management Platform
-- Seed Data (Development & Demo Data)
-- ====================================================================

-- 1. Sample Properties
INSERT INTO public.properties (id, name, address, city, state, postal_code, image_url)
VALUES
  (
    'a1111111-1111-1111-1111-111111111111',
    'Skyline Luxury Towers',
    '100 Ocean Boulevard',
    'San Francisco',
    'CA',
    '94107',
    'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=800&q=80'
  ),
  (
    'a2222222-2222-2222-2222-222222222222',
    'Grand View Residences',
    '450 Highland Avenue',
    'Austin',
    'TX',
    '78701',
    'https://images.unsplash.com/photo-1574362848149-11496d93a7c7?auto=format&fit=crop&w=800&q=80'
  )
ON CONFLICT (id) DO NOTHING;

-- 2. Sample Units for Skyline Luxury Towers
INSERT INTO public.units (id, property_id, unit_number, floor, status, rent_amount)
VALUES
  ('b1111111-1111-1111-1111-111111111111', 'a1111111-1111-1111-1111-111111111111', 'Unit 101', '1st Floor', 'vacant', 2200.00),
  ('b2222222-2222-2222-2222-222222222222', 'a1111111-1111-1111-1111-111111111111', 'Penthouse 501', '5th Floor', 'vacant', 4500.00),
  ('b3333333-3333-3333-3333-333333333333', 'a1111111-1111-1111-1111-111111111111', 'Studio 204', '2nd Floor', 'maintenance', 1800.00),
  ('b4444444-4444-4444-4444-444444444444', 'a2222222-2222-2222-2222-222222222222', 'Suite A-12', 'Ground Floor', 'vacant', 2600.00)
ON CONFLICT (id) DO NOTHING;

-- 3. Sample Amenities
INSERT INTO public.amenities (id, property_id, name, description, available, opening_time, closing_time, check_in_duration, auto_confirm, image_url)
VALUES
  (
    'c1111111-1111-1111-1111-111111111111',
    'a1111111-1111-1111-1111-111111111111',
    'Rooftop Infinity Pool',
    'Heated panoramic infinity pool with sun loungers and skyline views.',
    TRUE,
    '07:00:00',
    '21:00:00',
    60,
    TRUE,
    'https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?auto=format&fit=crop&w=800&q=80'
  ),
  (
    'c2222222-2222-2222-2222-222222222222',
    'a1111111-1111-1111-1111-111111111111',
    'High-Tech Fitness Center',
    'State-of-the-art cardiovascular and strength training equipment with yoga studio.',
    TRUE,
    '05:00:00',
    '23:00:00',
    90,
    TRUE,
    'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=800&q=80'
  ),
  (
    'c3333333-3333-3333-3333-333333333333',
    'a1111111-1111-1111-1111-111111111111',
    'Executive Conference Lounge',
    'Equipped with 4K display, high-speed fiber WiFi, and presentation setup.',
    TRUE,
    '08:00:00',
    '20:00:00',
    60,
    FALSE, -- requires manager approval
    'https://images.unsplash.com/photo-1517502884422-41eaead166d4?auto=format&fit=crop&w=800&q=80'
  ),
  (
    'c4444444-4444-4444-4444-444444444444',
    'a1111111-1111-1111-1111-111111111111',
    'Barbecue & Garden Patio',
    'Outdoor dining area with natural gas grills and lounge seating.',
    TRUE,
    '11:00:00',
    '22:00:00',
    120,
    TRUE,
    'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80'
  )
ON CONFLICT (id) DO NOTHING;
