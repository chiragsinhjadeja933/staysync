'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../context/AuthContext';
import ProtectedRoute from '../../../components/ProtectedRoute';
import AppShell from '../../../components/AppShell';
import { 
  Building2, 
  ArrowLeft, 
  Plus, 
  Users, 
  Home, 
  MapPin, 
  X, 
  UserCheck, 
  DollarSign, 
  Edit, 
  Trash2,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

export default function PropertyDetailPage({ params }) {
  // Unwrap params in Next.js 15
  const unwrappedParams = use(params);
  const propertyId = unwrappedParams.id;

  const { token, role } = useAuth();
  const router = useRouter();

  const [property, setProperty] = useState(null);
  const [units, setUnits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  // Add Unit Modal
  const [addUnitModal, setAddUnitModal] = useState(false);
  const [newUnit, setNewUnit] = useState({
    unit_number: '',
    floor: '1st Floor',
    rent_amount: 2000,
    status: 'vacant'
  });

  // Assign Tenant Modal
  const [assignModal, setAssignModal] = useState(false);
  const [selectedUnit, setSelectedUnit] = useState(null);
  const [tenantForm, setTenantForm] = useState({
    tenant_name: '',
    tenant_email: ''
  });

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5005/api';

  const loadPropertyData = async () => {
    if (!token) return;
    setLoading(true);
    setError('');

    try {
      // 1. Fetch Property Details
      const res = await fetch(`${apiUrl}/properties/${propertyId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to load property');
      setProperty(data.property);

      // 2. Fetch Units for Property
      const unitsRes = await fetch(`${apiUrl}/units?property_id=${propertyId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const unitsData = await unitsRes.json();
      if (unitsRes.ok && unitsData.units) {
        setUnits(unitsData.units);
      }
    } catch (err) {
      console.error(err);
      setError(err.message || 'Error fetching data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPropertyData();
  }, [propertyId, token]);

  // Handle Add Unit
  const handleAddUnit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${apiUrl}/units`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          ...newUnit,
          property_id: propertyId
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to add unit');

      setAddUnitModal(false);
      setNewUnit({ unit_number: '', floor: '1st Floor', rent_amount: 2000, status: 'vacant' });
      loadPropertyData();
    } catch (err) {
      alert(err.message);
    }
  };

  // Handle Assign Tenant
  const handleAssignTenant = async (e) => {
    e.preventDefault();
    if (!selectedUnit) return;

    try {
      const res = await fetch(`${apiUrl}/units/${selectedUnit.id}/assign`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          tenant_id: `tenant-${Date.now()}`,
          tenant_name: tenantForm.tenant_name,
          tenant_email: tenantForm.tenant_email
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to assign tenant');

      setAssignModal(false);
      setSelectedUnit(null);
      setTenantForm({ tenant_name: '', tenant_email: '' });
      loadPropertyData();
    } catch (err) {
      alert(err.message);
    }
  };

  // Handle Vacate / Unassign Unit
  const handleVacateUnit = async (unitId) => {
    if (!confirm('Are you sure you want to vacate this unit and remove the tenant?')) return;
    try {
      const res = await fetch(`${apiUrl}/units/${unitId}/assign`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ tenant_id: null })
      });
      if (res.ok) loadPropertyData();
    } catch (err) {
      alert('Failed to vacate unit');
    }
  };

  const filteredUnits = units.filter(u => filterStatus === 'all' || u.status === filterStatus);

  return (
    <ProtectedRoute allowedRoles={['manager', 'admin']}>
      <AppShell breadcrumbs={['Properties & Units', property?.name || 'Property Details']}>
        {/* Top Back Link */}
        <Link href="/properties" className="flex items-center gap-2" style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
          <ArrowLeft size={16} /> Back to All Properties
        </Link>

        {loading ? (
          <div className="card glass-panel" style={{ padding: '3rem', textAlign: 'center' }}>
            <p style={{ color: 'var(--text-secondary)' }}>Loading property units...</p>
          </div>
        ) : property ? (
          <div>
            {/* Property Overview Banner */}
            <div className="card glass-panel" style={{ padding: '1.75rem', marginBottom: '2rem' }}>
              <div className="flex items-center justify-between" style={{ flexWrap: 'wrap', gap: '1.5rem' }}>
                <div className="flex items-center gap-4">
                  <div style={{
                    width: '64px',
                    height: '64px',
                    borderRadius: 'var(--radius-md)',
                    backgroundImage: `url(${property.image_url || 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=800&q=80'})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    border: '1px solid var(--border-subtle)'
                  }}></div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h1 style={{ fontSize: '1.6rem' }}>{property.name}</h1>
                      <span className="badge badge-in_progress">{property.occupancy_rate}% Occupied</span>
                    </div>
                    <div className="flex items-center gap-1" style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: '0.2rem' }}>
                      <MapPin size={14} color="var(--primary)" />
                      <span>{property.address}, {property.city}, {property.state} {property.postal_code}</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => setAddUnitModal(true)}
                  className="btn btn-primary flex items-center gap-2"
                >
                  <Plus size={16} /> Add Unit
                </button>
              </div>
            </div>

            {/* Units Inventory Table Section */}
            <div className="flex items-center justify-between" style={{ marginBottom: '1rem', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <h2 style={{ fontSize: '1.3rem' }}>Unit Inventory ({units.length})</h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                  Manage individual apartments, rent, occupancy status, and active tenants.
                </p>
              </div>

              {/* Status Filter Pills */}
              <div className="flex items-center gap-2">
                {['all', 'occupied', 'vacant', 'maintenance'].map((status) => (
                  <button
                    key={status}
                    onClick={() => setFilterStatus(status)}
                    className={`btn btn-sm ${filterStatus === status ? 'btn-primary' : 'btn-outline'}`}
                    style={{ textTransform: 'capitalize' }}
                  >
                    {status}
                  </button>
                ))}
              </div>
            </div>

            {/* Table */}
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Unit Number</th>
                    <th>Floor</th>
                    <th>Status</th>
                    <th>Monthly Rent</th>
                    <th>Assigned Tenant</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUnits.length === 0 ? (
                    <tr>
                      <td colSpan={6} style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--text-muted)' }}>
                        No units found matching "{filterStatus}".
                      </td>
                    </tr>
                  ) : (
                    filteredUnits.map((u) => (
                      <tr key={u.id}>
                        <td style={{ fontWeight: 700 }}>{u.unit_number}</td>
                        <td style={{ color: 'var(--text-secondary)' }}>{u.floor}</td>
                        <td>
                          <span className={`badge badge-${u.status}`}>
                            {u.status}
                          </span>
                        </td>
                        <td style={{ color: '#34D399', fontWeight: 600 }}>
                          ${u.rent_amount?.toLocaleString()}/mo
                        </td>
                        <td>
                          {u.tenant_name ? (
                            <div>
                              <div style={{ fontWeight: 600 }}>{u.tenant_name}</div>
                              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{u.tenant_email}</div>
                            </div>
                          ) : (
                            <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>— Unassigned —</span>
                          )}
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          {u.status === 'occupied' ? (
                            <button
                              onClick={() => handleVacateUnit(u.id)}
                              className="btn btn-outline btn-sm"
                              style={{ fontSize: '0.75rem', padding: '0.35rem 0.65rem' }}
                            >
                              Vacate
                            </button>
                          ) : (
                            <button
                              onClick={() => {
                                setSelectedUnit(u);
                                setAssignModal(true);
                              }}
                              className="btn btn-secondary btn-sm"
                              style={{ fontSize: '0.75rem', padding: '0.35rem 0.65rem' }}
                            >
                              Assign Tenant
                            </button>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* ========================================================= */}
            {/* ADD UNIT MODAL */}
            {/* ========================================================= */}
            {addUnitModal && (
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
                <div className="card glass-panel" style={{ width: '100%', maxWidth: '480px', padding: '2rem' }}>
                  <div className="flex items-center justify-between" style={{ marginBottom: '1.5rem' }}>
                    <h3 style={{ fontSize: '1.25rem' }}>Add Unit to {property.name}</h3>
                    <button onClick={() => setAddUnitModal(false)} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                      <X size={20} />
                    </button>
                  </div>

                  <form onSubmit={handleAddUnit}>
                    <div className="form-group">
                      <label className="form-label">Unit Number / Identifier</label>
                      <input
                        type="text"
                        required
                        className="form-input"
                        placeholder="e.g. Unit 302 or Penthouse B"
                        value={newUnit.unit_number}
                        onChange={(e) => setNewUnit({ ...newUnit, unit_number: e.target.value })}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="form-group">
                        <label className="form-label">Floor</label>
                        <input
                          type="text"
                          className="form-input"
                          placeholder="e.g. 3rd Floor"
                          value={newUnit.floor}
                          onChange={(e) => setNewUnit({ ...newUnit, floor: e.target.value })}
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Monthly Rent ($)</label>
                        <input
                          type="number"
                          required
                          className="form-input"
                          placeholder="2200"
                          value={newUnit.rent_amount}
                          onChange={(e) => setNewUnit({ ...newUnit, rent_amount: Number(e.target.value) })}
                        />
                      </div>
                    </div>

                    <div className="form-group">
                      <label className="form-label">Initial Status</label>
                      <select
                        className="form-select"
                        value={newUnit.status}
                        onChange={(e) => setNewUnit({ ...newUnit, status: e.target.value })}
                      >
                        <option value="vacant">Vacant</option>
                        <option value="maintenance">Maintenance</option>
                      </select>
                    </div>

                    <div className="flex items-center justify-end gap-3" style={{ marginTop: '1.5rem' }}>
                      <button type="button" onClick={() => setAddUnitModal(false)} className="btn btn-outline btn-sm">
                        Cancel
                      </button>
                      <button type="submit" className="btn btn-primary btn-sm">
                        Save Unit
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* ========================================================= */}
            {/* ASSIGN TENANT MODAL */}
            {/* ========================================================= */}
            {assignModal && selectedUnit && (
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
                <div className="card glass-panel" style={{ width: '100%', maxWidth: '480px', padding: '2rem' }}>
                  <div className="flex items-center justify-between" style={{ marginBottom: '1.5rem' }}>
                    <div>
                      <h3 style={{ fontSize: '1.25rem' }}>Assign Tenant</h3>
                      <span style={{ fontSize: '0.85rem', color: 'var(--primary)' }}>To {selectedUnit.unit_number}</span>
                    </div>
                    <button onClick={() => setAssignModal(false)} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                      <X size={20} />
                    </button>
                  </div>

                  <form onSubmit={handleAssignTenant}>
                    <div className="form-group">
                      <label className="form-label">Tenant Full Name</label>
                      <input
                        type="text"
                        required
                        className="form-input"
                        placeholder="e.g. Michael Scott"
                        value={tenantForm.tenant_name}
                        onChange={(e) => setTenantForm({ ...tenantForm, tenant_name: e.target.value })}
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Tenant Email Address</label>
                      <input
                        type="email"
                        required
                        className="form-input"
                        placeholder="m.scott@example.com"
                        value={tenantForm.tenant_email}
                        onChange={(e) => setTenantForm({ ...tenantForm, tenant_email: e.target.value })}
                      />
                    </div>

                    <div className="flex items-center justify-end gap-3" style={{ marginTop: '1.5rem' }}>
                      <button type="button" onClick={() => setAssignModal(false)} className="btn btn-outline btn-sm">
                        Cancel
                      </button>
                      <button type="submit" className="btn btn-primary btn-sm">
                        Confirm Assignment
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="card glass-panel" style={{ padding: '3rem', textAlign: 'center' }}>
            <AlertCircle size={36} color="#F87171" style={{ margin: '0 auto 1rem' }} />
            <h3>Property Not Found</h3>
            <Link href="/properties" className="btn btn-secondary btn-sm" style={{ marginTop: '1rem' }}>
              Return to Properties List
            </Link>
          </div>
        )}
      </AppShell>
    </ProtectedRoute>
  );
}
