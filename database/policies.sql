-- ====================================================================
-- Real-Time Property Rental, Maintenance & Amenity Management Platform
-- Row Level Security (RLS) Policies
-- ====================================================================

-- 1. Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.units ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.maintenance_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.amenities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.amenity_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Helper function to get current user role
CREATE OR REPLACE FUNCTION public.current_user_role()
RETURNS TEXT AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- --------------------------------------------------------------------
-- PROFILES POLICIES
-- --------------------------------------------------------------------
-- Anyone authenticated can view profiles (to see manager or tenant names)
CREATE POLICY "Allow authenticated to view profiles"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (true);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- Admins can update any profile (change roles, etc.)
CREATE POLICY "Admins can update any profile"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (public.current_user_role() = 'admin')
  WITH CHECK (public.current_user_role() = 'admin');

-- --------------------------------------------------------------------
-- PROPERTIES POLICIES
-- --------------------------------------------------------------------
-- Authenticated users can view properties
CREATE POLICY "Authenticated users can view properties"
  ON public.properties FOR SELECT
  TO authenticated
  USING (true);

-- Managers and Admins can insert/update/delete properties
CREATE POLICY "Managers and Admins can manage properties"
  ON public.properties FOR ALL
  TO authenticated
  USING (
    public.current_user_role() IN ('manager', 'admin')
    AND (owner_id = auth.uid() OR public.current_user_role() = 'admin')
  )
  WITH CHECK (
    public.current_user_role() IN ('manager', 'admin')
  );

-- --------------------------------------------------------------------
-- UNITS POLICIES
-- --------------------------------------------------------------------
-- Authenticated users can view units
CREATE POLICY "Authenticated users can view units"
  ON public.units FOR SELECT
  TO authenticated
  USING (true);

-- Managers and Admins can manage units
CREATE POLICY "Managers and Admins can manage units"
  ON public.units FOR ALL
  TO authenticated
  USING (
    public.current_user_role() IN ('manager', 'admin')
  )
  WITH CHECK (
    public.current_user_role() IN ('manager', 'admin')
  );

-- --------------------------------------------------------------------
-- MAINTENANCE REQUESTS POLICIES
-- --------------------------------------------------------------------
-- Tenants can view their own requests; Managers and Admins can view all for their properties
CREATE POLICY "Users can view relevant maintenance requests"
  ON public.maintenance_requests FOR SELECT
  TO authenticated
  USING (
    tenant_id = auth.uid()
    OR public.current_user_role() IN ('manager', 'admin')
  );

-- Tenants can create maintenance requests
CREATE POLICY "Tenants can insert maintenance requests"
  ON public.maintenance_requests FOR INSERT
  TO authenticated
  WITH CHECK (
    tenant_id = auth.uid()
  );

-- Managers and Admins can update maintenance requests (status, notes)
CREATE POLICY "Managers and Admins can update maintenance requests"
  ON public.maintenance_requests FOR UPDATE
  TO authenticated
  USING (
    public.current_user_role() IN ('manager', 'admin')
  )
  WITH CHECK (
    public.current_user_role() IN ('manager', 'admin')
  );

-- --------------------------------------------------------------------
-- AMENITIES POLICIES
-- --------------------------------------------------------------------
-- Authenticated users can view active amenities
CREATE POLICY "Authenticated users can view amenities"
  ON public.amenities FOR SELECT
  TO authenticated
  USING (true);

-- Managers and Admins can manage amenities
CREATE POLICY "Managers and Admins can manage amenities"
  ON public.amenities FOR ALL
  TO authenticated
  USING (
    public.current_user_role() IN ('manager', 'admin')
  )
  WITH CHECK (
    public.current_user_role() IN ('manager', 'admin')
  );

-- --------------------------------------------------------------------
-- AMENITY BOOKINGS POLICIES
-- --------------------------------------------------------------------
-- Users can view their own bookings; Managers/Admins can view all
CREATE POLICY "Users can view bookings"
  ON public.amenity_bookings FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid()
    OR public.current_user_role() IN ('manager', 'admin')
  );

-- Tenants can create bookings
CREATE POLICY "Tenants can create bookings"
  ON public.amenity_bookings FOR INSERT
  TO authenticated
  WITH CHECK (
    user_id = auth.uid()
  );

-- Users can cancel own bookings; Managers/Admins can update status
CREATE POLICY "Update bookings"
  ON public.amenity_bookings FOR UPDATE
  TO authenticated
  USING (
    user_id = auth.uid()
    OR public.current_user_role() IN ('manager', 'admin')
  )
  WITH CHECK (
    user_id = auth.uid()
    OR public.current_user_role() IN ('manager', 'admin')
  );

-- --------------------------------------------------------------------
-- NOTIFICATIONS POLICIES
-- --------------------------------------------------------------------
CREATE POLICY "Users can view own notifications"
  ON public.notifications FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can mark own notifications as read"
  ON public.notifications FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());
