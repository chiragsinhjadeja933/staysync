'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import ProtectedRoute from '../../components/ProtectedRoute';
import AppShell from '../../components/AppShell';
import { 
  Wrench, 
  Plus, 
  Search, 
  AlertCircle, 
  Clock, 
  CheckCircle2, 
  Flame, 
  ArrowRight, 
  Building2, 
  Home, 
  X, 
  Filter,
  MessageSquare,
  Activity,
  Calendar
} from 'lucide-react';

export default function MaintenancePage() {
  const { user, role, token } = useAuth();

  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Create Request Modal State
  const [createModal, setCreateModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [newRequest, setNewRequest] = useState({
    title: '',
    description: '',
    priority: 'medium',
    category: 'Plumbing'
  });

  // Update Status Modal State (Manager/Admin)
  const [statusModal, setStatusModal] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [statusForm, setStatusForm] = useState({
    status: 'in_progress',
    notes: ''
  });

  // Real-time flash notification state
  const [liveNotice, setLiveNotice] = useState(null);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5005/api';

  // 1. Initial Load of Maintenance Requests
  const loadRequests = async () => {
    if (!token) return;
    setLoading(true);
    setError('');

    try {
      const res = await fetch(`${apiUrl}/maintenance`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok && data.requests) {
        setRequests(data.requests);
      }
    } catch (err) {
      console.error(err);
      setError('Failed to retrieve maintenance requests.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRequests();
  }, [token, role]);

  // 2. Real-Time Synchronization via Server-Sent Events (SSE)
  useEffect(() => {
    let eventSource = null;
    try {
      eventSource = new EventSource(`${apiUrl}/maintenance/stream`);

      eventSource.onmessage = (event) => {
        try {
          const payload = JSON.parse(event.data);

          if (payload.type === 'ticket_created') {
            const ticket = payload.data;
            setRequests((prev) => [ticket, ...prev.filter(t => t.id !== ticket.id)]);
            setLiveNotice(`⚡ Real-Time: New ticket submitted for ${ticket.unit_number}`);
            setTimeout(() => setLiveNotice(null), 4000);
          } else if (payload.type === 'ticket_updated') {
            const updated = payload.data;
            setRequests((prev) =>
              prev.map((t) => (t.id === updated.id ? { ...t, ...updated } : t))
            );
            setLiveNotice(`⚡ Real-Time Update: Ticket #${updated.unit_number} status changed to ${updated.status.toUpperCase()}`);
            setTimeout(() => setLiveNotice(null), 4000);
          }
        } catch (e) {
          // Ignore heartbeats
        }
      };
    } catch (e) {
      console.warn('Real-time SSE subscription not available', e);
    }

    return () => {
      if (eventSource) {
        eventSource.close();
      }
    };
  }, [apiUrl]);

  // Handle Create Request
  const handleCreateRequest = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      const res = await fetch(`${apiUrl}/maintenance`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(newRequest)
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to submit ticket');

      setCreateModal(false);
      setNewRequest({ title: '', description: '', priority: 'medium', category: 'Plumbing' });
      // The SSE broadcast will automatically add the ticket to state, or fallback:
      loadRequests();
    } catch (err) {
      alert(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  // Handle Update Status
  const handleUpdateStatus = async (e) => {
    e.preventDefault();
    if (!selectedTicket) return;

    try {
      const res = await fetch(`${apiUrl}/maintenance/${selectedTicket.id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(statusForm)
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to update status');

      setStatusModal(false);
      setSelectedTicket(null);
      // The SSE broadcast will automatically update the ticket state across all screens
    } catch (err) {
      alert(err.message);
    }
  };

  // Filter requests
  const filteredRequests = requests.filter((r) => {
    const matchesStatus = statusFilter === 'all' || r.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || r.priority === priorityFilter;
    const matchesSearch =
      r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.unit_number?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.property_name?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesPriority && matchesSearch;
  });

  const pendingCount = requests.filter(r => r.status === 'pending').length;
  const inProgressCount = requests.filter(r => r.status === 'in_progress').length;
  const completedCount = requests.filter(r => r.status === 'completed').length;
  const urgentCount = requests.filter(r => r.priority === 'urgent' && r.status !== 'completed').length;

  return (
    <ProtectedRoute>
      <AppShell breadcrumbs={['Maintenance Requests']}>
        {/* Real-time Alert Banner */}
        {liveNotice && (
          <div className="animate-fade-in" style={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            zIndex: 1000,
            background: 'rgba(16, 185, 129, 0.95)',
            backdropFilter: 'blur(12px)',
            color: '#ffffff',
            padding: '0.85rem 1.25rem',
            borderRadius: 'var(--radius-md)',
            boxShadow: '0 10px 25px rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            fontSize: '0.875rem',
            fontWeight: 600
          }}>
            <Activity size={18} />
            <span>{liveNotice}</span>
          </div>
        )}

        {/* Page Header */}
        <div className="flex items-center justify-between" style={{ marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <span style={{ fontSize: '0.85rem', color: 'var(--primary)', fontWeight: 600 }}>
              {role === 'tenant' ? 'Resident Maintenance Center' : 'Operational Maintenance Queue'}
            </span>
            <h1 style={{ fontSize: '1.75rem', marginTop: '0.25rem' }}>
              Maintenance Requests
            </h1>
            <p style={{ color: 'var(--text-secondary)' }}>
              {role === 'tenant'
                ? 'Submit repair tickets for your apartment and monitor resolution progress in real time.'
                : 'Review, triage, dispatch contractors, and resolve property maintenance tickets.'}
            </p>
          </div>

          <button
            onClick={() => setCreateModal(true)}
            className="btn btn-primary flex items-center gap-2"
          >
            <Plus size={18} /> Report Issue
          </button>
        </div>

        {/* Status Metrics Bar */}
        <div className="grid grid-cols-4 gap-4" style={{ marginBottom: '2rem' }}>
          <div className="kpi-card">
            <div>
              <div className="kpi-title">Total Requests</div>
              <div className="kpi-value text-gradient">{requests.length}</div>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>All time logged</span>
            </div>
            <div className="kpi-icon">
              <Wrench size={22} />
            </div>
          </div>

          <div className="kpi-card">
            <div>
              <div className="kpi-title">In Progress</div>
              <div className="kpi-value" style={{ color: '#60A5FA' }}>{inProgressCount}</div>
              <span style={{ fontSize: '0.8rem', color: '#60A5FA' }}>Technician active</span>
            </div>
            <div className="kpi-icon" style={{ color: '#60A5FA' }}>
              <Clock size={22} />
            </div>
          </div>

          <div className="kpi-card">
            <div>
              <div className="kpi-title">Pending Triage</div>
              <div className="kpi-value" style={{ color: '#FBBF24' }}>{pendingCount}</div>
              <span style={{ fontSize: '0.8rem', color: '#FBBF24' }}>Awaiting review</span>
            </div>
            <div className="kpi-icon" style={{ color: '#FBBF24' }}>
              <AlertCircle size={22} />
            </div>
          </div>

          <div className="kpi-card">
            <div>
              <div className="kpi-title">Urgent Priority</div>
              <div className="kpi-value" style={{ color: '#F87171' }}>{urgentCount}</div>
              <span style={{ fontSize: '0.8rem', color: '#F87171' }}>Immediate response</span>
            </div>
            <div className="kpi-icon" style={{ color: '#F87171' }}>
              <Flame size={22} />
            </div>
          </div>
        </div>

        {/* Filters and Search Bar */}
        <div className="flex items-center justify-between" style={{ marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
          {/* Status Tabs */}
          <div className="flex items-center gap-2">
            {[
              { label: 'All Requests', val: 'all', count: requests.length },
              { label: 'Pending', val: 'pending', count: pendingCount },
              { label: 'In Progress', val: 'in_progress', count: inProgressCount },
              { label: 'Completed', val: 'completed', count: completedCount }
            ].map((tab) => (
              <button
                key={tab.val}
                onClick={() => setStatusFilter(tab.val)}
                className={`btn btn-sm ${statusFilter === tab.val ? 'btn-primary' : 'btn-outline'}`}
                style={{ fontSize: '0.8rem' }}
              >
                {tab.label} ({tab.count})
              </button>
            ))}
          </div>

          {/* Search & Priority Filter */}
          <div className="flex items-center gap-3">
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="form-select"
              style={{ width: 'auto', padding: '0.45rem 1rem', fontSize: '0.825rem' }}
            >
              <option value="all">All Priorities</option>
              <option value="urgent">Urgent</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>

            <div style={{ position: 'relative', width: '260px' }}>
              <Search size={14} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="text"
                placeholder="Search issues..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="form-input"
                style={{ padding: '0.45rem 1rem 0.45rem 34px', fontSize: '0.825rem' }}
              />
            </div>
          </div>
        </div>

        {/* Maintenance Requests List */}
        {loading ? (
          <div className="card glass-panel" style={{ padding: '3rem', textAlign: 'center' }}>
            <p style={{ color: 'var(--text-secondary)' }}>Loading maintenance tickets...</p>
          </div>
        ) : filteredRequests.length === 0 ? (
          <div className="card glass-panel" style={{ padding: '3rem', textAlign: 'center' }}>
            <Wrench size={38} color="var(--text-muted)" style={{ margin: '0 auto 1rem' }} />
            <h3>No Maintenance Requests</h3>
            <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
              {searchQuery ? 'No requests match your search criteria.' : 'Everything is in working order! No open issues.'}
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {filteredRequests.map((ticket) => (
              <div
                key={ticket.id}
                className="card glass-panel"
                style={{
                  padding: '1.5rem',
                  borderLeft: `4px solid ${
                    ticket.priority === 'urgent' ? '#EF4444' : (ticket.priority === 'high' ? '#F59E0B' : 'var(--primary)')
                  }`
                }}
              >
                <div className="flex items-start justify-between" style={{ flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem' }}>
                  <div>
                    <div className="flex items-center gap-2" style={{ marginBottom: '0.35rem' }}>
                      <span className={`badge badge-${ticket.priority}`}>
                        {ticket.priority} priority
                      </span>
                      <span className="badge badge-vacant">
                        {ticket.unit_number} • {ticket.property_name}
                      </span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        Reported {new Date(ticket.created_at).toLocaleDateString()} at {new Date(ticket.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    <h3 style={{ fontSize: '1.25rem', color: 'var(--text-primary)' }}>
                      {ticket.title}
                    </h3>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '0.35rem', maxWidth: '800px' }}>
                      {ticket.description}
                    </p>
                  </div>

                  {/* Actions for Manager / Status for Tenant */}
                  <div className="flex items-center gap-3">
                    {role !== 'tenant' && (
                      <button
                        onClick={() => {
                          setSelectedTicket(ticket);
                          setStatusForm({ status: ticket.status, notes: ticket.notes || '' });
                          setStatusModal(true);
                        }}
                        className="btn btn-secondary btn-sm flex items-center gap-1"
                      >
                        <Wrench size={14} /> Update Status
                      </button>
                    )}
                  </div>
                </div>

                {/* Status Progression Stepper */}
                <div style={{
                  background: 'var(--bg-surface-elevated)',
                  padding: '1rem 1.25rem',
                  borderRadius: 'var(--radius-md)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '1rem'
                }}>
                  {/* Stepper Bar */}
                  <div className="flex items-center gap-3" style={{ fontSize: '0.85rem' }}>
                    {/* Step 1: Pending */}
                    <div className="flex items-center gap-2">
                      <span style={{
                        width: '24px',
                        height: '24px',
                        borderRadius: '50%',
                        background: ticket.status === 'pending' ? 'var(--status-pending-bg)' : '#10B981',
                        color: ticket.status === 'pending' ? '#FBBF24' : '#ffffff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '0.75rem',
                        fontWeight: 700
                      }}>
                        {ticket.status !== 'pending' ? <CheckCircle2 size={15} /> : '1'}
                      </span>
                      <span style={{ color: ticket.status === 'pending' ? '#FBBF24' : 'var(--text-primary)', fontWeight: 600 }}>
                        Pending Review
                      </span>
                    </div>

                    <span style={{ width: '32px', height: '2px', background: ticket.status !== 'pending' ? '#10B981' : 'var(--border-subtle)' }}></span>

                    {/* Step 2: In Progress */}
                    <div className="flex items-center gap-2">
                      <span style={{
                        width: '24px',
                        height: '24px',
                        borderRadius: '50%',
                        background: ticket.status === 'in_progress' ? '#3B82F6' : (ticket.status === 'completed' ? '#10B981' : 'var(--bg-surface)'),
                        color: ticket.status === 'pending' ? 'var(--text-muted)' : '#ffffff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '0.75rem',
                        fontWeight: 700
                      }}>
                        {ticket.status === 'completed' ? <CheckCircle2 size={15} /> : '2'}
                      </span>
                      <span style={{
                        color: ticket.status === 'in_progress' ? '#60A5FA' : (ticket.status === 'completed' ? 'var(--text-primary)' : 'var(--text-muted)'),
                        fontWeight: ticket.status === 'in_progress' ? 600 : 400
                      }}>
                        In Progress
                      </span>
                    </div>

                    <span style={{ width: '32px', height: '2px', background: ticket.status === 'completed' ? '#10B981' : 'var(--border-subtle)' }}></span>

                    {/* Step 3: Completed */}
                    <div className="flex items-center gap-2">
                      <span style={{
                        width: '24px',
                        height: '24px',
                        borderRadius: '50%',
                        background: ticket.status === 'completed' ? '#10B981' : 'var(--bg-surface)',
                        color: ticket.status === 'completed' ? '#ffffff' : 'var(--text-muted)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '0.75rem',
                        fontWeight: 700
                      }}>
                        3
                      </span>
                      <span style={{
                        color: ticket.status === 'completed' ? '#34D399' : 'var(--text-muted)',
                        fontWeight: ticket.status === 'completed' ? 600 : 400
                      }}>
                        Resolved
                      </span>
                    </div>
                  </div>

                  {/* Resolution Notes / Dispatch Note */}
                  {ticket.notes && (
                    <div className="flex items-center gap-2" style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                      <MessageSquare size={14} color="var(--primary)" />
                      <span><strong>Manager Note:</strong> {ticket.notes}</span>
                    </div>
                  )}

                  {ticket.resolved_at && (
                    <div style={{ fontSize: '0.78rem', color: '#34D399', fontWeight: 500 }}>
                      Resolved on {new Date(ticket.resolved_at).toLocaleDateString()}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ========================================================= */}
        {/* NEW MAINTENANCE REQUEST MODAL */}
        {/* ========================================================= */}
        {createModal && (
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
            <div className="card glass-panel" style={{ width: '100%', maxWidth: '520px', padding: '2rem' }}>
              <div className="flex items-center justify-between" style={{ marginBottom: '1.5rem' }}>
                <div className="flex items-center gap-2">
                  <Wrench size={22} color="var(--primary)" />
                  <h2 style={{ fontSize: '1.35rem' }}>Submit Maintenance Request</h2>
                </div>
                <button
                  onClick={() => setCreateModal(false)}
                  style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
                >
                  <X size={20} />
                </button>
              </div>

              <div style={{
                background: 'var(--bg-surface-elevated)',
                padding: '0.65rem 1rem',
                borderRadius: 'var(--radius-md)',
                marginBottom: '1.25rem',
                fontSize: '0.825rem',
                color: 'var(--text-secondary)'
              }}>
                📍 Reporting for your assigned residence: <strong>Unit 101 • Skyline Luxury Towers</strong>
              </div>

              <form onSubmit={handleCreateRequest}>
                <div className="form-group">
                  <label className="form-label">Issue Title</label>
                  <input
                    type="text"
                    required
                    className="form-input"
                    placeholder="e.g. Kitchen sink faucet leaking"
                    value={newRequest.title}
                    onChange={(e) => setNewRequest({ ...newRequest, title: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="form-group">
                    <label className="form-label">Category</label>
                    <select
                      className="form-select"
                      value={newRequest.category}
                      onChange={(e) => setNewRequest({ ...newRequest, category: e.target.value })}
                    >
                      <option value="Plumbing">Plumbing</option>
                      <option value="Electrical">Electrical</option>
                      <option value="HVAC / Climate">HVAC / Climate</option>
                      <option value="Appliance">Appliance</option>
                      <option value="Carpentry / Doors">Carpentry / Doors</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Priority Level</label>
                    <select
                      className="form-select"
                      value={newRequest.priority}
                      onChange={(e) => setNewRequest({ ...newRequest, priority: e.target.value })}
                    >
                      <option value="low">Low (Non-urgent)</option>
                      <option value="medium">Medium (Standard)</option>
                      <option value="high">High (Needs quick attention)</option>
                      <option value="urgent">Urgent (Emergency / Safety)</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Detailed Description</label>
                  <textarea
                    rows={4}
                    required
                    className="form-textarea"
                    placeholder="Please explain the problem, location inside the unit, and any relevant details..."
                    value={newRequest.description}
                    onChange={(e) => setNewRequest({ ...newRequest, description: e.target.value })}
                  ></textarea>
                </div>

                <div className="flex items-center justify-end gap-3" style={{ marginTop: '1.5rem' }}>
                  <button
                    type="button"
                    onClick={() => setCreateModal(false)}
                    className="btn btn-outline btn-sm"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="btn btn-primary btn-sm"
                  >
                    {submitting ? 'Submitting...' : 'Send Request'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* UPDATE STATUS MODAL (MANAGER) */}
        {/* ========================================================= */}
        {statusModal && selectedTicket && (
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
              <div className="flex items-center justify-between" style={{ marginBottom: '1.25rem' }}>
                <div>
                  <h3 style={{ fontSize: '1.25rem' }}>Update Ticket Status</h3>
                  <span style={{ fontSize: '0.85rem', color: 'var(--primary)' }}>
                    {selectedTicket.unit_number} • {selectedTicket.title}
                  </span>
                </div>
                <button
                  onClick={() => setStatusModal(false)}
                  style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleUpdateStatus}>
                <div className="form-group">
                  <label className="form-label">New Status</label>
                  <select
                    className="form-select"
                    value={statusForm.status}
                    onChange={(e) => setStatusForm({ ...statusForm, status: e.target.value })}
                  >
                    <option value="pending">Pending (Awaiting dispatch)</option>
                    <option value="in_progress">In Progress (Work ongoing)</option>
                    <option value="completed">Completed (Resolved)</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Manager Resolution Note</label>
                  <textarea
                    rows={3}
                    className="form-textarea"
                    placeholder="e.g. Technician dispatched from CoolAir. Replaced heating coil."
                    value={statusForm.notes}
                    onChange={(e) => setStatusForm({ ...statusForm, notes: e.target.value })}
                  ></textarea>
                </div>

                <div className="flex items-center justify-end gap-3" style={{ marginTop: '1.5rem' }}>
                  <button
                    type="button"
                    onClick={() => setStatusModal(false)}
                    className="btn btn-outline btn-sm"
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary btn-sm">
                    Save Status Change
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </AppShell>
    </ProtectedRoute>
  );
}
