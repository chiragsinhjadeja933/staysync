'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '../../context/AuthContext';
import ProtectedRoute from '../../components/ProtectedRoute';
import AppShell from '../../components/AppShell';
import { 
  Building2, 
  Plus, 
  MapPin, 
  Users, 
  Home, 
  Wrench, 
  ArrowRight, 
  Search, 
  X, 
  CheckCircle2, 
  DollarSign,
  Phone,
  ShieldCheck,
  Calendar
} from 'lucide-react';

export default function PropertiesPage() {
  const { user, role, token } = useAuth();

  const [properties, setProperties] = useState([]);
  const [tenantUnit, setTenantUnit] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Add Property Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [newProperty, setNewProperty] = useState({
    name: '',
    address: '',
    city: '',
    state: '',
    postal_code: '',
    image_url: ''
  });

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5005/api';

  // Load properties or tenant residence
  useEffect(() => {
    async function loadData() {
      if (!token) return;
      setLoading(true);
      setError('');

      try {
        if (role === 'tenant') {
          // Fetch tenant's assigned unit & property
          const res = await fetch(`${apiUrl}/units/my-unit`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          const data = await res.json();
          if (res.ok) {
            setTenantUnit(data);
          }
        } else {
          // Fetch all managed properties
          const res = await fetch(`${apiUrl}/properties`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          const data = await res.json();
          if (res.ok && data.properties) {
            setProperties(data.properties);
          }
        }
      } catch (err) {
        console.error('Error loading properties:', err);
        setError('Failed to retrieve properties from API.');
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [role, token, apiUrl]);

  // Handle Add Property Submission
  const handleAddProperty = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      const res = await fetch(`${apiUrl}/properties`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(newProperty)
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Failed to create property');
      }

      // Add to list and close modal
      setProperties((prev) => [data.property, ...prev]);
      setModalOpen(false);
      setNewProperty({
        name: '',
        address: '',
        city: '',
        state: '',
        postal_code: '',
        image_url: ''
      });
    } catch (err) {
      setError(err.message || 'Error submitting property');
    } finally {
      setSubmitting(false);
    }
  };

  // Filter properties by search query
  const filteredProperties = properties.filter((p) =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.address.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Calculate portfolio totals
  const totalUnits = properties.reduce((acc, p) => acc + (p.total_units || 0), 0);
  const occupiedUnits = properties.reduce((acc, p) => acc + (p.occupied_units || 0), 0);
  const vacantUnits = properties.reduce((acc, p) => acc + (p.vacant_units || 0), 0);
  const overallOccupancy = totalUnits > 0 ? Math.round((occupiedUnits / totalUnits) * 100) : 0;

  return (
    <ProtectedRoute>
      <AppShell breadcrumbs={['Properties & Units']}>
        {/* ========================================================= */}
        {/* TENANT RESIDENCE VIEW */}
        {/* ========================================================= */}
        {role === 'tenant' ? (
          <div>
            <div style={{ marginBottom: '2rem' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--primary)', fontWeight: 600 }}>
                Tenant Residence Overview
              </span>
              <h1 style={{ fontSize: '1.75rem', marginTop: '0.25rem' }}>My Home</h1>
              <p style={{ color: 'var(--text-secondary)' }}>
                View information regarding your assigned apartment unit, building contacts, and property services.
              </p>
            </div>

            {loading ? (
              <div className="card glass-panel" style={{ padding: '3rem', textAlign: 'center' }}>
                <p style={{ color: 'var(--text-secondary)' }}>Loading your unit information...</p>
              </div>
            ) : tenantUnit ? (
              <div className="grid grid-cols-3 gap-6">
                {/* Main Unit & Property Card */}
                <div className="card glass-panel" style={{ gridColumn: 'span 2', padding: 0, overflow: 'hidden' }}>
                  <div style={{
                    height: '240px',
                    width: '100%',
                    backgroundImage: `url(${tenantUnit.property?.image_url || 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=800&q=80'})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    position: 'relative'
                  }}>
                    <div style={{
                      position: 'absolute',
                      inset: 0,
                      background: 'linear-gradient(to top, var(--bg-surface) 0%, rgba(11, 15, 25, 0.4) 100%)'
                    }}></div>
                    <div style={{
                      position: 'absolute',
                      bottom: '1.5rem',
                      left: '1.5rem',
                      right: '1.5rem',
                      display: 'flex',
                      alignItems: 'flex-end',
                      justifyContent: 'space-between'
                    }}>
                      <div>
                        <span className="badge badge-occupied" style={{ marginBottom: '0.5rem' }}>
                          Current Residence
                        </span>
                        <h2 style={{ fontSize: '1.85rem', color: '#ffffff' }}>
                          {tenantUnit.property?.name}
                        </h2>
                        <div className="flex items-center gap-2" style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                          <MapPin size={15} color="var(--primary)" />
                          <span>{tenantUnit.property?.address}, {tenantUnit.property?.city}, {tenantUnit.property?.state} {tenantUnit.property?.postal_code}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div style={{ padding: '1.75rem' }}>
                    <div className="grid grid-cols-3 gap-4" style={{ marginBottom: '1.5rem' }}>
                      <div style={{ padding: '1rem', background: 'var(--bg-surface-elevated)', borderRadius: 'var(--radius-md)' }}>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Assigned Unit</span>
                        <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                          {tenantUnit.unit?.unit_number}
                        </div>
                      </div>
                      <div style={{ padding: '1rem', background: 'var(--bg-surface-elevated)', borderRadius: 'var(--radius-md)' }}>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Floor Level</span>
                        <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                          {tenantUnit.unit?.floor}
                        </div>
                      </div>
                      <div style={{ padding: '1rem', background: 'var(--bg-surface-elevated)', borderRadius: 'var(--radius-md)' }}>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Monthly Rent</span>
                        <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#34D399' }}>
                          ${tenantUnit.unit?.rent_amount?.toLocaleString()}/mo
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <Link href="/maintenance" className="btn btn-primary btn-sm flex items-center gap-1">
                        <Wrench size={15} /> Submit Maintenance for {tenantUnit.unit?.unit_number}
                      </Link>
                      <Link href="/amenities" className="btn btn-secondary btn-sm flex items-center gap-1">
                        <Calendar size={15} /> Book Building Amenity
                      </Link>
                    </div>
                  </div>
                </div>

                {/* Building Management & Emergency Contacts */}
                <div className="card glass-panel" style={{ padding: '1.75rem' }}>
                  <h3 style={{ fontSize: '1.15rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Building2 size={20} color="var(--primary)" /> Building Management
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', fontSize: '0.875rem' }}>
                    <div>
                      <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>Property Manager</span>
                      <div style={{ fontWeight: 600 }}>Sarah Connor (Management Office)</div>
                      <div style={{ color: 'var(--text-secondary)' }}>manager@staysync.com</div>
                    </div>
                    <div>
                      <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>Maintenance Hours</span>
                      <div style={{ fontWeight: 500 }}>Mon - Sat: 8:00 AM - 6:00 PM</div>
                    </div>
                    <div>
                      <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>Emergency Helpline</span>
                      <div style={{ fontWeight: 700, color: '#F87171', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Phone size={14} /> +1 (800) 555-0199
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="card glass-panel" style={{ padding: '3rem', textAlign: 'center' }}>
                <Home size={40} color="var(--text-muted)" style={{ margin: '0 auto 1rem' }} />
                <h3>No Unit Assigned Yet</h3>
                <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
                  Your property manager has not yet linked an apartment unit to your tenant account.
                </p>
              </div>
            )}
          </div>
        ) : (
          /* ========================================================= */
          /* MANAGER & ADMIN PROPERTIES VIEW */
          /* ========================================================= */
          <div>
            {/* Header & Action Bar */}
            <div className="flex items-center justify-between" style={{ marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <span style={{ fontSize: '0.85rem', color: 'var(--primary)', fontWeight: 600 }}>
                  Portfolio Management
                </span>
                <h1 style={{ fontSize: '1.75rem', marginTop: '0.25rem' }}>Properties & Units</h1>
                <p style={{ color: 'var(--text-secondary)' }}>
                  Manage real-estate properties, unit inventories, floor plans, and tenant assignments.
                </p>
              </div>

              <button
                onClick={() => setModalOpen(true)}
                className="btn btn-primary flex items-center gap-2"
                style={{ padding: '0.75rem 1.25rem' }}
              >
                <Plus size={18} /> Add Property
              </button>
            </div>

            {/* Portfolio Summary Metrics */}
            <div className="grid grid-cols-4 gap-4" style={{ marginBottom: '2rem' }}>
              <div className="kpi-card">
                <div>
                  <div className="kpi-title">Total Properties</div>
                  <div className="kpi-value text-gradient">{properties.length}</div>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Managed Portfolio</span>
                </div>
                <div className="kpi-icon">
                  <Building2 size={22} />
                </div>
              </div>

              <div className="kpi-card">
                <div>
                  <div className="kpi-title">Total Units</div>
                  <div className="kpi-value">{totalUnits}</div>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Across All Buildings</span>
                </div>
                <div className="kpi-icon">
                  <Home size={22} />
                </div>
              </div>

              <div className="kpi-card">
                <div>
                  <div className="kpi-title">Occupancy Rate</div>
                  <div className="kpi-value" style={{ color: overallOccupancy >= 75 ? '#34D399' : '#60A5FA' }}>
                    {overallOccupancy}%
                  </div>
                  <span style={{ fontSize: '0.8rem', color: '#34D399' }}>{occupiedUnits} of {totalUnits} Occupied</span>
                </div>
                <div className="kpi-icon">
                  <Users size={22} />
                </div>
              </div>

              <div className="kpi-card">
                <div>
                  <div className="kpi-title">Vacant Units</div>
                  <div className="kpi-value" style={{ color: '#FBBF24' }}>{vacantUnits}</div>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Available to lease</span>
                </div>
                <div className="kpi-icon">
                  <CheckCircle2 size={22} />
                </div>
              </div>
            </div>

            {/* Search Bar */}
            <div style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{
                position: 'relative',
                flex: 1,
                maxWidth: '450px'
              }}>
                <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type="text"
                  placeholder="Search by property name, address, or city..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="form-input"
                  style={{ paddingLeft: '40px' }}
                />
              </div>
            </div>

            {/* Properties Grid */}
            {loading ? (
              <div className="card glass-panel" style={{ padding: '3rem', textAlign: 'center' }}>
                <p style={{ color: 'var(--text-secondary)' }}>Loading properties portfolio...</p>
              </div>
            ) : filteredProperties.length === 0 ? (
              <div className="card glass-panel" style={{ padding: '3rem', textAlign: 'center' }}>
                <Building2 size={40} color="var(--text-muted)" style={{ margin: '0 auto 1rem' }} />
                <h3>No Properties Found</h3>
                <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
                  {searchQuery ? 'No properties matched your search term.' : 'Get started by creating your first managed property.'}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-6">
                {filteredProperties.map((prop) => (
                  <div key={prop.id} className="card glass-panel" style={{ padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                    <div style={{
                      height: '200px',
                      backgroundImage: `url(${prop.image_url || 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=800&q=80'})`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                      position: 'relative'
                    }}>
                      <div style={{
                        position: 'absolute',
                        inset: 0,
                        background: 'linear-gradient(to top, rgba(17, 24, 39, 0.95) 0%, rgba(17, 24, 39, 0.2) 60%)'
                      }}></div>
                      <div style={{
                        position: 'absolute',
                        bottom: '1rem',
                        left: '1.25rem',
                        right: '1.25rem',
                        display: 'flex',
                        alignItems: 'flex-end',
                        justifyContent: 'space-between'
                      }}>
                        <div>
                          <h3 style={{ fontSize: '1.35rem', color: '#ffffff', marginBottom: '0.2rem' }}>
                            {prop.name}
                          </h3>
                          <div className="flex items-center gap-1" style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                            <MapPin size={14} color="var(--primary)" />
                            <span>{prop.address}, {prop.city}, {prop.state}</span>
                          </div>
                        </div>
                        <span className="badge badge-in_progress">
                          {prop.occupancy_rate}% Occupied
                        </span>
                      </div>
                    </div>

                    <div style={{ padding: '1.25rem', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                      {/* Occupancy Progress Bar */}
                      <div style={{ marginBottom: '1.25rem' }}>
                        <div className="flex items-center justify-between" style={{ fontSize: '0.8rem', marginBottom: '0.35rem' }}>
                          <span style={{ color: 'var(--text-muted)' }}>Occupancy Progress</span>
                          <span style={{ fontWeight: 600 }}>{prop.occupied_units} / {prop.total_units} Units</span>
                        </div>
                        <div style={{ width: '100%', height: '6px', background: 'var(--bg-surface-elevated)', borderRadius: '3px', overflow: 'hidden' }}>
                          <div style={{
                            width: `${prop.occupancy_rate}%`,
                            height: '100%',
                            background: 'var(--accent-gradient)',
                            borderRadius: '3px'
                          }}></div>
                        </div>
                      </div>

                      {/* Units Breakdown Tags */}
                      <div className="flex items-center gap-2" style={{ marginBottom: '1.5rem' }}>
                        <span className="badge badge-occupied" style={{ fontSize: '0.72rem' }}>
                          {prop.occupied_units} Occupied
                        </span>
                        <span className="badge badge-vacant" style={{ fontSize: '0.72rem' }}>
                          {prop.vacant_units} Vacant
                        </span>
                        {prop.maintenance_units > 0 && (
                          <span className="badge badge-pending" style={{ fontSize: '0.72rem' }}>
                            {prop.maintenance_units} Maintenance
                          </span>
                        )}
                      </div>

                      {/* Manage Button */}
                      <Link
                        href={`/properties/${prop.id}`}
                        className="btn btn-secondary btn-sm flex items-center justify-between"
                        style={{ width: '100%', padding: '0.65rem 1rem' }}
                      >
                        <span>Manage Units & Tenants</span>
                        <ArrowRight size={16} />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* ========================================================= */}
            {/* ADD PROPERTY MODAL */}
            {/* ========================================================= */}
            {modalOpen && (
              <div style={{
                position: 'fixed',
                inset: 0,
                background: 'rgba(0, 0, 0, 0.75)',
                backdropFilter: 'blur(8px)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 100,
                padding: '1.5rem'
              }}>
                <div className="card glass-panel" style={{
                  width: '100%',
                  maxWidth: '540px',
                  padding: '2rem',
                  boxShadow: 'var(--shadow-lg)'
                }}>
                  <div className="flex items-center justify-between" style={{ marginBottom: '1.5rem' }}>
                    <div className="flex items-center gap-2">
                      <Building2 size={22} color="var(--primary)" />
                      <h2 style={{ fontSize: '1.35rem' }}>Add New Property</h2>
                    </div>
                    <button
                      onClick={() => setModalOpen(false)}
                      style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
                    >
                      <X size={20} />
                    </button>
                  </div>

                  <form onSubmit={handleAddProperty}>
                    <div className="form-group">
                      <label className="form-label">Property Name</label>
                      <input
                        type="text"
                        required
                        className="form-input"
                        placeholder="e.g. Sunset Heights Apartments"
                        value={newProperty.name}
                        onChange={(e) => setNewProperty({ ...newProperty, name: e.target.value })}
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Street Address</label>
                      <input
                        type="text"
                        required
                        className="form-input"
                        placeholder="e.g. 742 Evergreen Terrace"
                        value={newProperty.address}
                        onChange={(e) => setNewProperty({ ...newProperty, address: e.target.value })}
                      />
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                      <div className="form-group">
                        <label className="form-label">City</label>
                        <input
                          type="text"
                          required
                          className="form-input"
                          placeholder="Austin"
                          value={newProperty.city}
                          onChange={(e) => setNewProperty({ ...newProperty, city: e.target.value })}
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label">State</label>
                        <input
                          type="text"
                          required
                          className="form-input"
                          placeholder="TX"
                          value={newProperty.state}
                          onChange={(e) => setNewProperty({ ...newProperty, state: e.target.value })}
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Postal Code</label>
                        <input
                          type="text"
                          className="form-input"
                          placeholder="78701"
                          value={newProperty.postal_code}
                          onChange={(e) => setNewProperty({ ...newProperty, postal_code: e.target.value })}
                        />
                      </div>
                    </div>

                    <div className="form-group">
                      <label className="form-label">Cover Image URL (optional)</label>
                      <input
                        type="url"
                        className="form-input"
                        placeholder="https://images.unsplash.com/..."
                        value={newProperty.image_url}
                        onChange={(e) => setNewProperty({ ...newProperty, image_url: e.target.value })}
                      />
                    </div>

                    <div className="flex items-center justify-end gap-3" style={{ marginTop: '1.75rem' }}>
                      <button
                        type="button"
                        onClick={() => setModalOpen(false)}
                        className="btn btn-outline btn-sm"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={submitting}
                        className="btn btn-primary btn-sm"
                      >
                        {submitting ? 'Creating Property...' : 'Save Property'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}
      </AppShell>
    </ProtectedRoute>
  );
}
