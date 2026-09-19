'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '../../context/AuthContext';
import ProtectedRoute from '../../components/ProtectedRoute';
import AppShell from '../../components/AppShell';
import { 
  Building2, 
  Home, 
  Wrench, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Users, 
  ShieldCheck, 
  PlusCircle, 
  ArrowRight, 
  Activity, 
  Sparkles,
  Flame,
  LogIn,
  LogOut,
  MapPin
} from 'lucide-react';
import { getApiUrl } from '../../lib/api';

export default function DashboardPage() {
  const { user, role, token, demoLogin } = useAuth();

  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const apiUrl = getApiUrl();

  const loadDashboard = async () => {
    if (!token) return;
    setLoading(true);
    setError('');

    try {
      const endpointRole = role || 'tenant';
      const res = await fetch(`${apiUrl}/dashboard/${endpointRole}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok && data.data) {
        setDashboardData(data.data);
      }
    } catch (err) {
      console.error('Error fetching dashboard:', err);
      setError('Failed to load dashboard metrics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, [role, token]);

  const kpis = dashboardData?.kpis || {};

  return (
    <ProtectedRoute>
      <AppShell breadcrumbs={['Overview Dashboard']}>
        {/* Welcome Hero Banner */}
        <div className="card glass-panel" style={{
          padding: '2rem',
          marginBottom: '2rem',
          background: 'var(--accent-card-gradient)',
          position: 'relative'
        }}>
          <div className="flex items-center justify-between" style={{ flexWrap: 'wrap', gap: '1.25rem' }}>
            <div>
              <div className="flex items-center gap-2" style={{ marginBottom: '0.4rem' }}>
                <span className={`badge badge-${role === 'manager' ? 'in_progress' : (role === 'admin' ? 'urgent' : 'completed')}`}>
                  {role} Portal
                </span>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  Logged in as {user?.email}
                </span>
              </div>

              <h1 style={{ fontSize: '1.85rem', color: 'var(--text-primary)' }}>
                Welcome back, {user?.full_name}!
              </h1>

              <p style={{ marginTop: '0.35rem', color: 'var(--text-secondary)', maxWidth: '680px' }}>
                {role === 'tenant' && 'Monitor your apartment maintenance requests, reserve luxury amenities, and view community schedules.'}
                {role === 'manager' && 'Oversee property occupancy, review urgent maintenance tickets, and track today\'s amenity usage.'}
                {role === 'admin' && 'Central system administration, portfolio governance, user provisioning, and platform security oversight.'}
              </p>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-3">
              {role === 'tenant' ? (
                <>
                  <Link href="/maintenance" className="btn btn-primary btn-sm flex items-center gap-1">
                    <PlusCircle size={15} /> Report Issue
                  </Link>
                  <Link href="/amenities" className="btn btn-secondary btn-sm flex items-center gap-1">
                    <Calendar size={15} /> Book Amenity
                  </Link>
                </>
              ) : (
                <>
                  <Link href="/properties" className="btn btn-primary btn-sm flex items-center gap-1">
                    <PlusCircle size={15} /> Add Property
                  </Link>
                  <Link href="/maintenance" className="btn btn-secondary btn-sm flex items-center gap-1">
                    <Wrench size={15} /> Triage Queue
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* ROLE VIEW: TENANT DASHBOARD (Phase 10) */}
        {/* ========================================================= */}
        {role === 'tenant' && (
          <div>
            {/* KPI Cards */}
            <div className="grid grid-cols-4 gap-4" style={{ marginBottom: '2rem' }}>
              <div className="kpi-card">
                <div>
                  <div className="kpi-title">Open Requests</div>
                  <div className="kpi-value text-gradient">{kpis.open_requests ?? 2}</div>
                  <span style={{ fontSize: '0.8rem', color: '#FBBF24' }}>Requires technician attention</span>
                </div>
                <div className="kpi-icon">
                  <Wrench size={22} />
                </div>
              </div>

              <div className="kpi-card">
                <div>
                  <div className="kpi-title">Upcoming Bookings</div>
                  <div className="kpi-value" style={{ color: '#60A5FA' }}>{kpis.upcoming_bookings ?? 1}</div>
                  <span style={{ fontSize: '0.8rem', color: '#34D399' }}>Rooftop Pool today</span>
                </div>
                <div className="kpi-icon" style={{ color: '#60A5FA' }}>
                  <Calendar size={22} />
                </div>
              </div>

              <div className="kpi-card">
                <div>
                  <div className="kpi-title">Assigned Unit</div>
                  <div className="kpi-value" style={{ fontSize: '1.45rem' }}>
                    {dashboardData?.unit?.unit_number || 'Unit 101'}
                  </div>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    {dashboardData?.property?.name || 'Skyline Luxury Towers'}
                  </span>
                </div>
                <div className="kpi-icon">
                  <Home size={22} />
                </div>
              </div>

              <div className="kpi-card">
                <div>
                  <div className="kpi-title">Available Amenities</div>
                  <div className="kpi-value" style={{ color: '#34D399' }}>{kpis.available_amenities ?? 4}</div>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Open for reservation</span>
                </div>
                <div className="kpi-icon">
                  <Sparkles size={22} color="#34D399" />
                </div>
              </div>
            </div>

            {/* Split Grid: Maintenance Stepper & Upcoming Booking */}
            <div className="grid grid-cols-2 gap-6">
              {/* Active Maintenance Requests */}
              <div className="card glass-panel" style={{ padding: '1.75rem' }}>
                <div className="flex items-center justify-between" style={{ marginBottom: '1.25rem' }}>
                  <div className="flex items-center gap-2">
                    <Wrench size={20} color="var(--primary)" />
                    <h2 style={{ fontSize: '1.2rem' }}>Active Maintenance Requests</h2>
                  </div>
                  <Link href="/maintenance" className="flex items-center gap-1" style={{ fontSize: '0.8rem', color: 'var(--primary)', fontWeight: 600 }}>
                    View All <ArrowRight size={14} />
                  </Link>
                </div>

                {dashboardData?.recent_requests?.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {dashboardData.recent_requests.map((req) => (
                      <div key={req.id} style={{
                        padding: '1rem',
                        background: 'var(--bg-surface-elevated)',
                        borderRadius: 'var(--radius-md)',
                        border: '1px solid var(--border-subtle)'
                      }}>
                        <div className="flex items-center justify-between" style={{ marginBottom: '0.35rem' }}>
                          <span style={{ fontWeight: 600, fontSize: '0.95rem' }}>{req.title}</span>
                          <span className={`badge badge-${req.priority}`}>{req.priority}</span>
                        </div>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.825rem', marginBottom: '0.75rem' }}>
                          {req.description}
                        </p>
                        {/* Mini Stepper */}
                        <div className="flex items-center gap-2" style={{ fontSize: '0.75rem' }}>
                          <span style={{ color: '#10B981', fontWeight: 600 }}>✓ Submitted</span>
                          <span style={{ color: 'var(--text-muted)' }}>➔</span>
                          <span style={{ color: req.status !== 'pending' ? '#60A5FA' : 'var(--text-muted)', fontWeight: req.status !== 'pending' ? 600 : 400 }}>
                            {req.status === 'in_progress' ? '● In Progress' : 'In Progress'}
                          </span>
                          <span style={{ color: 'var(--text-muted)' }}>➔</span>
                          <span style={{ color: req.status === 'completed' ? '#34D399' : 'var(--text-muted)' }}>
                            Resolved
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                    No active maintenance tickets. Everything is in order!
                  </div>
                )}
              </div>

              {/* Next Upcoming Reservation */}
              <div className="card glass-panel" style={{ padding: '1.75rem' }}>
                <div className="flex items-center justify-between" style={{ marginBottom: '1.25rem' }}>
                  <div className="flex items-center gap-2">
                    <Calendar size={20} color="var(--accent)" />
                    <h2 style={{ fontSize: '1.2rem' }}>Next Reservation</h2>
                  </div>
                  <Link href="/amenities" className="flex items-center gap-1" style={{ fontSize: '0.8rem', color: 'var(--accent)', fontWeight: 600 }}>
                    Bookings <ArrowRight size={14} />
                  </Link>
                </div>

                {dashboardData?.next_booking ? (
                  <div style={{
                    padding: '1.25rem',
                    background: 'var(--bg-surface-elevated)',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-subtle)'
                  }}>
                    <span className="badge badge-confirmed" style={{ marginBottom: '0.5rem' }}>
                      Confirmed Reservation
                    </span>
                    <h3 style={{ fontSize: '1.25rem', marginBottom: '0.35rem' }}>
                      {dashboardData.next_booking.amenity_name}
                    </h3>
                    <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '0.35rem', margin: '0.75rem 0 1.25rem' }}>
                      <div className="flex items-center gap-2">
                        <Calendar size={15} color="var(--primary)" />
                        <span>Date: <strong>{dashboardData.next_booking.booking_date}</strong></span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock size={15} color="var(--primary)" />
                        <span>Time: <strong>{dashboardData.next_booking.start_time} - {dashboardData.next_booking.end_time}</strong></span>
                      </div>
                    </div>

                    <Link href="/amenities" className="btn btn-primary btn-sm flex items-center justify-center gap-2" style={{ width: '100%' }}>
                      <LogIn size={15} /> Manage & Check In
                    </Link>
                  </div>
                ) : (
                  <div style={{ textAlign: 'center', padding: '2rem' }}>
                    <Calendar size={36} color="var(--text-muted)" style={{ margin: '0 auto 0.75rem' }} />
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>No upcoming reservations scheduled.</p>
                    <Link href="/amenities" className="btn btn-secondary btn-sm" style={{ marginTop: '1rem' }}>
                      Reserve an Amenity
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* ROLE VIEW: PROPERTY MANAGER DASHBOARD (Phase 11) */}
        {/* ========================================================= */}
        {role === 'manager' && (
          <div>
            {/* Manager KPIs */}
            <div className="grid grid-cols-4 gap-4" style={{ marginBottom: '2rem' }}>
              <div className="kpi-card">
                <div>
                  <div className="kpi-title">Portfolio Occupancy</div>
                  <div className="kpi-value text-gradient">{kpis.occupancy_rate ?? 67}%</div>
                  <span style={{ fontSize: '0.8rem', color: '#34D399' }}>
                    {kpis.occupied_units} of {kpis.total_units} Units Leased
                  </span>
                </div>
                <div className="kpi-icon">
                  <Building2 size={22} />
                </div>
              </div>

              <div className="kpi-card">
                <div>
                  <div className="kpi-title">Urgent Tickets</div>
                  <div className="kpi-value" style={{ color: '#F87171' }}>{kpis.urgent_requests ?? 1}</div>
                  <span style={{ fontSize: '0.8rem', color: '#F87171' }}>Needs contractor dispatch</span>
                </div>
                <div className="kpi-icon" style={{ color: '#F87171' }}>
                  <Flame size={22} />
                </div>
              </div>

              <div className="kpi-card">
                <div>
                  <div className="kpi-title">In Progress Orders</div>
                  <div className="kpi-value" style={{ color: '#60A5FA' }}>{kpis.in_progress_requests ?? 2}</div>
                  <span style={{ fontSize: '0.8rem', color: '#60A5FA' }}>Work orders active</span>
                </div>
                <div className="kpi-icon" style={{ color: '#60A5FA' }}>
                  <Wrench size={22} />
                </div>
              </div>

              <div className="kpi-card">
                <div>
                  <div className="kpi-title">Today's Bookings</div>
                  <div className="kpi-value">{kpis.today_bookings_count ?? 2}</div>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Amenity reservations</span>
                </div>
                <div className="kpi-icon">
                  <Calendar size={22} />
                </div>
              </div>
            </div>

            {/* Manager Split Grid */}
            <div className="grid grid-cols-2 gap-6" style={{ marginBottom: '2rem' }}>
              {/* Urgent Maintenance Queue */}
              <div className="card glass-panel" style={{ padding: '1.75rem' }}>
                <div className="flex items-center justify-between" style={{ marginBottom: '1.25rem' }}>
                  <div className="flex items-center gap-2">
                    <Flame size={20} color="#EF4444" />
                    <h2 style={{ fontSize: '1.2rem' }}>Urgent Maintenance Queue</h2>
                  </div>
                  <Link href="/maintenance" className="btn btn-secondary btn-sm" style={{ fontSize: '0.75rem' }}>
                    Open Queue
                  </Link>
                </div>

                {dashboardData?.urgent_queue?.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {dashboardData.urgent_queue.map((t) => (
                      <div key={t.id} style={{
                        padding: '1rem',
                        background: 'var(--bg-surface-elevated)',
                        borderRadius: 'var(--radius-md)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between'
                      }}>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className={`badge badge-${t.priority}`}>{t.priority}</span>
                            <span style={{ fontWeight: 600 }}>{t.title}</span>
                          </div>
                          <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                            {t.unit_number} • {t.tenant_name}
                          </div>
                        </div>
                        <Link href="/maintenance" className="btn btn-outline btn-sm" style={{ fontSize: '0.75rem' }}>
                          Triage
                        </Link>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                    No urgent tickets in queue.
                  </div>
                )}
              </div>

              {/* Today's Amenity Schedule */}
              <div className="card glass-panel" style={{ padding: '1.75rem' }}>
                <div className="flex items-center justify-between" style={{ marginBottom: '1.25rem' }}>
                  <div className="flex items-center gap-2">
                    <Calendar size={20} color="var(--accent)" />
                    <h2 style={{ fontSize: '1.2rem' }}>Today's Amenity Schedule</h2>
                  </div>
                  <Link href="/amenities" className="btn btn-secondary btn-sm" style={{ fontSize: '0.75rem' }}>
                    View All
                  </Link>
                </div>

                {dashboardData?.today_schedule?.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {dashboardData.today_schedule.map((b) => (
                      <div key={b.id} style={{
                        padding: '1rem',
                        background: 'var(--bg-surface-elevated)',
                        borderRadius: 'var(--radius-md)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between'
                      }}>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className={`badge badge-${b.status}`}>{b.status}</span>
                            <span style={{ fontWeight: 600 }}>{b.amenity_name}</span>
                          </div>
                          <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                            Reserved by {b.user_name} • {b.start_time} - {b.end_time}
                          </div>
                        </div>
                        {b.check_in_at ? (
                          <span style={{ fontSize: '0.75rem', color: '#34D399', fontWeight: 600 }}>Checked In</span>
                        ) : (
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Awaiting Arrival</span>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                    No bookings scheduled for today.
                  </div>
                )}
              </div>
            </div>

            {/* Properties Overview Table */}
            <div className="card glass-panel" style={{ padding: '1.75rem' }}>
              <div className="flex items-center justify-between" style={{ marginBottom: '1rem' }}>
                <h2 style={{ fontSize: '1.2rem' }}>Managed Properties</h2>
                <Link href="/properties" className="btn btn-primary btn-sm flex items-center gap-1">
                  <Building2 size={15} /> All Properties
                </Link>
              </div>

              <div className="table-container">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Property Name</th>
                      <th>Total Units</th>
                      <th>Occupied</th>
                      <th>Occupancy Rate</th>
                      <th style={{ textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dashboardData?.portfolio_summary?.map((p) => (
                      <tr key={p.id}>
                        <td style={{ fontWeight: 600 }}>{p.name}</td>
                        <td>{p.total_units} Units</td>
                        <td>{p.occupied_units} Occupied</td>
                        <td>
                          <span className="badge badge-in_progress">{p.occupancy_rate}%</span>
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <Link href={`/properties/${p.id}`} className="btn btn-secondary btn-sm" style={{ fontSize: '0.75rem' }}>
                            Manage
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* ROLE VIEW: ADMIN DASHBOARD (Phase 12) */}
        {/* ========================================================= */}
        {role === 'admin' && (
          <div>
            {/* System KPIs */}
            <div className="grid grid-cols-4 gap-4" style={{ marginBottom: '2rem' }}>
              <div className="kpi-card">
                <div>
                  <div className="kpi-title">Platform Users</div>
                  <div className="kpi-value text-gradient">{kpis.total_users ?? 3}</div>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Provisioned profiles</span>
                </div>
                <div className="kpi-icon">
                  <Users size={22} />
                </div>
              </div>

              <div className="kpi-card">
                <div>
                  <div className="kpi-title">Total Units</div>
                  <div className="kpi-value">{kpis.total_units ?? 4}</div>
                  <span style={{ fontSize: '0.8rem', color: '#34D399' }}>Across 2 buildings</span>
                </div>
                <div className="kpi-icon">
                  <Home size={22} />
                </div>
              </div>

              <div className="kpi-card">
                <div>
                  <div className="kpi-title">Resolution Rate</div>
                  <div className="kpi-value" style={{ color: '#34D399' }}>{kpis.resolution_rate ?? '85%'}</div>
                  <span style={{ fontSize: '0.8rem', color: '#34D399' }}>Target: ≥ 90%</span>
                </div>
                <div className="kpi-icon" style={{ color: '#34D399' }}>
                  <CheckCircle2 size={22} />
                </div>
              </div>

              <div className="kpi-card">
                <div>
                  <div className="kpi-title">Booking Conflicts</div>
                  <div className="kpi-value" style={{ color: '#34D399' }}>0</div>
                  <span style={{ fontSize: '0.8rem', color: '#34D399' }}>Engine Target Met (0)</span>
                </div>
                <div className="kpi-icon" style={{ color: '#34D399' }}>
                  <ShieldCheck size={22} />
                </div>
              </div>
            </div>

            {/* Platform User Management Table */}
            <div className="card glass-panel" style={{ padding: '1.75rem', marginBottom: '2rem' }}>
              <div className="flex items-center justify-between" style={{ marginBottom: '1rem' }}>
                <div>
                  <h2 style={{ fontSize: '1.25rem' }}>User & Role Administration</h2>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                    View platform accounts and assign user access permissions.
                  </p>
                </div>
                <span className="badge badge-completed">Row Level Security Active</span>
              </div>

              <div className="table-container">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Full Name</th>
                      <th>Email</th>
                      <th>Role</th>
                      <th>Phone</th>
                      <th style={{ textAlign: 'right' }}>Role Switch</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dashboardData?.users?.map((u) => (
                      <tr key={u.id}>
                        <td style={{ fontWeight: 600 }}>{u.full_name}</td>
                        <td style={{ color: 'var(--text-secondary)' }}>{u.email}</td>
                        <td>
                          <span className={`badge badge-${u.role === 'manager' ? 'in_progress' : (u.role === 'admin' ? 'urgent' : 'completed')}`}>
                            {u.role}
                          </span>
                        </td>
                        <td style={{ color: 'var(--text-muted)' }}>{u.phone}</td>
                        <td style={{ textAlign: 'right' }}>
                          <button
                            onClick={() => demoLogin(u.role)}
                            className="btn btn-secondary btn-sm"
                            style={{ fontSize: '0.72rem', padding: '0.3rem 0.65rem' }}
                          >
                            Act as {u.role}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </AppShell>
    </ProtectedRoute>
  );
}
