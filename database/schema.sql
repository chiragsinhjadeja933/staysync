-- ====================================================================
-- Real-Time Property Rental, Maintenance & Amenity Management Platform
-- Database Schema (PostgreSQL for Supabase)
-- ====================================================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- --------------------------------------------------------------------
-- 1. PROFILES TABLE (Linked with Supabase Auth users)
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  role TEXT NOT NULL CHECK (role IN ('tenant', 'manager', 'admin')) DEFAULT 'tenant',
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- --------------------------------------------------------------------
-- 2. PROPERTIES TABLE
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.properties (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  postal_code TEXT NOT NULL,
  owner_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  image_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- --------------------------------------------------------------------
-- 3. UNITS TABLE
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.units (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  property_id UUID NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  unit_number TEXT NOT NULL,
  floor TEXT,
  tenant_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  status TEXT NOT NULL CHECK (status IN ('occupied', 'vacant', 'maintenance', 'inactive')) DEFAULT 'vacant',
  rent_amount NUMERIC(10, 2) DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT unique_property_unit UNIQUE (property_id, unit_number)
);

-- --------------------------------------------------------------------
-- 4. MAINTENANCE REQUESTS TABLE
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.maintenance_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  property_id UUID NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  unit_id UUID REFERENCES public.units(id) ON DELETE SET NULL,
  tenant_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  priority TEXT NOT NULL CHECK (priority IN ('low', 'medium', 'high', 'urgent')) DEFAULT 'medium',
  status TEXT NOT NULL CHECK (status IN ('pending', 'in_progress', 'completed')) DEFAULT 'pending',
  notes TEXT,
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- --------------------------------------------------------------------
-- 5. AMENITIES TABLE
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.amenities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  property_id UUID NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  available BOOLEAN NOT NULL DEFAULT TRUE,
  opening_time TIME NOT NULL DEFAULT '06:00:00',
  closing_time TIME NOT NULL DEFAULT '22:00:00',
  check_in_duration INTEGER NOT NULL DEFAULT 60, -- duration in minutes
  auto_confirm BOOLEAN NOT NULL DEFAULT TRUE,
  image_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- --------------------------------------------------------------------
-- 6. AMENITY BOOKINGS TABLE
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.amenity_bookings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  amenity_id UUID NOT NULL REFERENCES public.amenities(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  booking_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed', 'rejected')) DEFAULT 'confirmed',
  check_in_at TIMESTAMPTZ,
  check_out_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT valid_booking_time_range CHECK (start_time < end_time)
);

-- --------------------------------------------------------------------
-- 7. NOTIFICATIONS TABLE (In-app notifications)
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'system', -- 'maintenance', 'booking', 'announcement', 'system'
  is_read BOOLEAN NOT NULL DEFAULT FALSE,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- --------------------------------------------------------------------
-- INDEXES FOR MAXIMUM QUERY PERFORMANCE (Phase 20)
-- --------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_units_property ON public.units(property_id);
CREATE INDEX IF NOT EXISTS idx_units_tenant ON public.units(tenant_id);
CREATE INDEX IF NOT EXISTS idx_maintenance_tenant ON public.maintenance_requests(tenant_id);
CREATE INDEX IF NOT EXISTS idx_maintenance_property ON public.maintenance_requests(property_id);
CREATE INDEX IF NOT EXISTS idx_maintenance_status ON public.maintenance_requests(status);
CREATE INDEX IF NOT EXISTS idx_amenities_property ON public.amenities(property_id);
CREATE INDEX IF NOT EXISTS idx_bookings_amenity_date ON public.amenity_bookings(amenity_id, booking_date);
CREATE INDEX IF NOT EXISTS idx_bookings_user ON public.amenity_bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_unread ON public.notifications(user_id, is_read);

-- --------------------------------------------------------------------
-- TRIGGER FUNCTION: AUTO-UPDATE `updated_at`
-- --------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_profiles_updated_at ON public.profiles;
CREATE TRIGGER set_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_properties_updated_at ON public.properties;
CREATE TRIGGER set_properties_updated_at BEFORE UPDATE ON public.properties FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_units_updated_at ON public.units;
CREATE TRIGGER set_units_updated_at BEFORE UPDATE ON public.units FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_maintenance_updated_at ON public.maintenance_requests;
CREATE TRIGGER set_maintenance_updated_at BEFORE UPDATE ON public.maintenance_requests FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_amenities_updated_at ON public.amenities;
CREATE TRIGGER set_amenities_updated_at BEFORE UPDATE ON public.amenities FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_bookings_updated_at ON public.amenity_bookings;
CREATE TRIGGER set_bookings_updated_at BEFORE UPDATE ON public.amenity_bookings FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- --------------------------------------------------------------------
-- TRIGGER FUNCTION: PREVENT OVERLAPPING AMENITY BOOKINGS (Phase 8)
-- --------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.check_amenity_booking_overlap()
RETURNS TRIGGER AS $$
BEGIN
  -- Only validate active/confirmed/pending bookings
  IF NEW.status IN ('confirmed', 'pending') THEN
    IF EXISTS (
      SELECT 1 FROM public.amenity_bookings
      WHERE amenity_id = NEW.amenity_id
        AND booking_date = NEW.booking_date
        AND status IN ('confirmed', 'pending')
        AND id <> COALESCE(NEW.id, '00000000-0000-0000-0000-000000000000'::uuid)
        AND (NEW.start_time < end_time AND NEW.end_time > start_time)
    ) THEN
      RAISE EXCEPTION 'Booking conflict: Amenity is already booked during this time window.';
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS prevent_amenity_booking_overlap ON public.amenity_bookings;
CREATE TRIGGER prevent_amenity_booking_overlap
  BEFORE INSERT OR UPDATE ON public.amenity_bookings
  FOR EACH ROW
  EXECUTE FUNCTION public.check_amenity_booking_overlap();

-- --------------------------------------------------------------------
-- TRIGGER FUNCTION: AUTO CREATE PROFILE ON SUPABASE AUTH REGISTRATION
-- --------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'New User'),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'role', 'tenant')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- --------------------------------------------------------------------
-- SUPABASE REALTIME REPLICATION SETUP (Phase 13)
-- --------------------------------------------------------------------
ALTER PUBLICATION supabase_realtime ADD TABLE public.maintenance_requests;
ALTER PUBLICATION supabase_realtime ADD TABLE public.amenity_bookings;
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
