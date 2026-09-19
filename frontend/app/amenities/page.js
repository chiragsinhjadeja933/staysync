'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import ProtectedRoute from '../../components/ProtectedRoute';
import AppShell from '../../components/AppShell';
import { 
  Calendar, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  X, 
  Plus, 
  Building2, 
  Sparkles, 
  ShieldCheck, 
  User, 
  LogIn, 
  LogOut, 
  XCircle,
  MapPin,
  Flame,
  Check
} from 'lucide-react';
import { getApiUrl } from '../../lib/api';

export default function AmenitiesPage() {
  const { user, role, token } = useAuth();

  const [activeTab, setActiveTab] = useState('browse'); // 'browse' | 'my-bookings' | 'all-schedule'
  const [amenities, setAmenities] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Booking Modal State
  const [reserveModal, setReserveModal] = useState(false);
  const [selectedAmenity, setSelectedAmenity] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [availability, setAvailability] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [bookingNotes, setBookingNotes] = useState('');
  const [bookingSubmitting, setBookingSubmitting] = useState(false);
  const [conflictError, setConflictError] = useState('');

  // Add Amenity Modal (Manager/Admin)
  const [addModal, setAddModal] = useState(false);
  const [newAmenity, setNewAmenity] = useState({
    name: '',
    description: '',
    opening_time: '08:00',
    closing_time: '21:00',
    check_in_duration: 60,
    auto_confirm: true,
    image_url: ''
  });

  const apiUrl = getApiUrl();

  // 1. Fetch Amenities and Bookings
  const loadData = async () => {
    if (!token) return;
    setLoading(true);
    setError('');

    try {
      // Fetch Amenities
      const resAmenities = await fetch(`${apiUrl}/amenities`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const dataAmenities = await resAmenities.json();
      if (resAmenities.ok && dataAmenities.amenities) {
        setAmenities(dataAmenities.amenities);
      }

      // Fetch Bookings
      const resBookings = await fetch(`${apiUrl}/bookings`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const dataBookings = await resBookings.json();
      if (resBookings.ok && dataBookings.bookings) {
        setBookings(dataBookings.bookings);
      }
    } catch (err) {
      console.error(err);
      setError('Failed to load amenities and bookings.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [token, role]);

  // 2. Fetch Amenity Availability for Date
  const fetchAvailability = async (amenityId, date) => {
    try {
      setConflictError('');
      const res = await fetch(`${apiUrl}/amenities/${amenityId}/availability?date=${date}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        setAvailability(data);
      }
    } catch (err) {
      console.error('Error fetching availability:', err);
    }
  };

  // Open Reservation Modal
  const openReservationModal = (amenity) => {
    setSelectedAmenity(amenity);
    setSelectedSlot(null);
    setConflictError('');
    const todayStr = new Date().toISOString().split('T')[0];
    setSelectedDate(todayStr);
    fetchAvailability(amenity.id, todayStr);
    setReserveModal(true);
  };

  // Generate Available Time Slots from opening to closing time
  const generateSlots = () => {
    if (!selectedAmenity) return [];
    const slots = [];
    const [startH, startM] = selectedAmenity.opening_time.split(':').map(Number);
    const [endH, endM] = selectedAmenity.closing_time.split(':').map(Number);
    const duration = selectedAmenity.check_in_duration || 60;

    let current = startH * 60 + startM;
    const end = endH * 60 + endM;

    while (current + duration <= end) {
      const slotStartH = Math.floor(current / 60).toString().padStart(2, '0');
      const slotStartM = (current % 60).toString().padStart(2, '0');
      const slotEndH = Math.floor((current + duration) / 60).toString().padStart(2, '0');
      const slotEndM = ((current + duration) % 60).toString().padStart(2, '0');

      const startTimeStr = `${slotStartH}:${slotStartM}`;
      const endTimeStr = `${slotEndH}:${slotEndM}`;

      // Check if slot conflicts with existing booked slots
      const isBooked = availability?.booked_slots?.some((b) => {
        return (startTimeStr < b.end_time && endTimeStr > b.start_time);
      });

      slots.push({
        start: startTimeStr,
        end: endTimeStr,
        isBooked
      });

      current += duration;
    }

    return slots;
  };

  // Submit Reservation (Phase 8 Conflict Prevention)
  const handleReserveSubmit = async (e) => {
    e.preventDefault();
    if (!selectedSlot) {
      setConflictError('Please select a time slot.');
      return;
    }

    setBookingSubmitting(true);
    setConflictError('');

    try {
      const res = await fetch(`${apiUrl}/bookings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          amenity_id: selectedAmenity.id,
          booking_date: selectedDate,
          start_time: selectedSlot.start,
          end_time: selectedSlot.end,
          notes: bookingNotes
        })
      });

      const data = await res.json();

      if (res.status === 409) {
        // Strict conflict detected!
        setConflictError(data.message || 'Booking conflict: Slot is already reserved.');
        // Refresh availability
        fetchAvailability(selectedAmenity.id, selectedDate);
        return;
      }

      if (!res.ok) {
        throw new Error(data.message || 'Failed to complete booking');
      }

      setReserveModal(false);
      setSuccessMessage(data.message || 'Amenity booked successfully!');
      setTimeout(() => setSuccessMessage(''), 4000);
      setActiveTab('my-bookings');
      loadData();
    } catch (err) {
      setConflictError(err.message || 'Booking submission error');
    } finally {
      setBookingSubmitting(false);
    }
  };

  // Handle Check-In (Phase 9)
  const handleCheckIn = async (bookingId) => {
    try {
      const res = await fetch(`${apiUrl}/bookings/${bookingId}/check-in`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Check-in failed');

      setSuccessMessage(data.message);
      setTimeout(() => setSuccessMessage(''), 4000);
      loadData();
    } catch (err) {
      alert(err.message);
    }
  };

  // Handle Check-Out (Phase 9)
  const handleCheckOut = async (bookingId) => {
    try {
      const res = await fetch(`${apiUrl}/bookings/${bookingId}/check-out`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Check-out failed');

      setSuccessMessage(data.message);
      setTimeout(() => setSuccessMessage(''), 4000);
      loadData();
    } catch (err) {
      alert(err.message);
    }
  };

  // Handle Cancel Booking
  const handleCancelBooking = async (bookingId) => {
    if (!confirm('Are you sure you want to cancel this reservation?')) return;
    try {
      const res = await fetch(`${apiUrl}/bookings/${bookingId}/cancel`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) loadData();
    } catch (err) {
      alert('Failed to cancel booking');
    }
  };

  // Handle Add Amenity (Manager)
  const handleAddAmenity = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${apiUrl}/amenities`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          ...newAmenity,
          property_id: 'a1111111-1111-1111-1111-111111111111' // Skyline Luxury Towers
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to add amenity');

      setAddModal(false);
      setNewAmenity({
        name: '',
        description: '',
        opening_time: '08:00',
        closing_time: '21:00',
        check_in_duration: 60,
        auto_confirm: true,
        image_url: ''
      });
      loadData();
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <ProtectedRoute>
      <AppShell breadcrumbs={['Amenities & Bookings']}>
        {/* Success Toast */}
        {successMessage && (
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
            <CheckCircle2 size={18} />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Page Header */}
        <div className="flex items-center justify-between" style={{ marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <span style={{ fontSize: '0.85rem', color: 'var(--accent)', fontWeight: 600 }}>
              Shared Property Amenities & Reservations
            </span>
            <h1 style={{ fontSize: '1.75rem', marginTop: '0.25rem' }}>
              Amenities & Bookings
            </h1>
            <p style={{ color: 'var(--text-secondary)' }}>
              Explore luxury building amenities, reserve time slots with zero double-booking conflicts, and check in.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {role !== 'tenant' && (
              <button
                onClick={() => setAddModal(true)}
                className="btn btn-secondary btn-sm flex items-center gap-1"
              >
                <Plus size={16} /> Add Amenity
              </button>
            )}
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-3" style={{ borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.75rem', marginBottom: '2rem' }}>
          <button
            onClick={() => setActiveTab('browse')}
            className={`btn btn-sm ${activeTab === 'browse' ? 'btn-primary' : 'btn-outline'}`}
          >
            Browse Amenities ({amenities.length})
          </button>
          <button
            onClick={() => setActiveTab('my-bookings')}
            className={`btn btn-sm ${activeTab === 'my-bookings' ? 'btn-primary' : 'btn-outline'}`}
          >
            {role === 'tenant' ? 'My Reservations' : 'All Bookings'} ({bookings.length})
          </button>
        </div>

        {/* ========================================================= */}
        {/* TAB 1: BROWSE AMENITIES & RESERVE */}
        {/* ========================================================= */}
        {activeTab === 'browse' && (
          <div>
            <div className="grid grid-cols-2 gap-6">
              {amenities.map((amenity) => (
                <div key={amenity.id} className="card glass-panel" style={{ padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                  <div style={{
                    height: '220px',
                    backgroundImage: `url(${amenity.image_url || 'https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?auto=format&fit=crop&w=800&q=80'})`,
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
                      top: '1rem',
                      right: '1rem'
                    }}>
                      <span className={`badge ${amenity.available ? 'badge-completed' : 'badge-urgent'}`}>
                        {amenity.available ? 'Open & Available' : 'Closed for Maintenance'}
                      </span>
                    </div>
                    <div style={{
                      position: 'absolute',
                      bottom: '1rem',
                      left: '1.25rem',
                      right: '1.25rem'
                    }}>
                      <h3 style={{ fontSize: '1.35rem', color: '#ffffff', marginBottom: '0.2rem' }}>
                        {amenity.name}
                      </h3>
                      <div className="flex items-center gap-1" style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                        <MapPin size={14} color="var(--primary)" />
                        <span>{amenity.property_name}</span>
                      </div>
                    </div>
                  </div>

                  <div style={{ padding: '1.5rem', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.25rem', lineHeight: 1.6 }}>
                      {amenity.description}
                    </p>

                    <div className="grid grid-cols-3 gap-3" style={{ marginBottom: '1.5rem', fontSize: '0.8rem' }}>
                      <div style={{ background: 'var(--bg-surface-elevated)', padding: '0.65rem', borderRadius: 'var(--radius-md)' }}>
                        <span style={{ color: 'var(--text-muted)', display: 'block' }}>Hours</span>
                        <strong>{amenity.opening_time} - {amenity.closing_time}</strong>
                      </div>
                      <div style={{ background: 'var(--bg-surface-elevated)', padding: '0.65rem', borderRadius: 'var(--radius-md)' }}>
                        <span style={{ color: 'var(--text-muted)', display: 'block' }}>Slot Duration</span>
                        <strong>{amenity.check_in_duration} Mins</strong>
                      </div>
                      <div style={{ background: 'var(--bg-surface-elevated)', padding: '0.65rem', borderRadius: 'var(--radius-md)' }}>
                        <span style={{ color: 'var(--text-muted)', display: 'block' }}>Approval</span>
                        <strong>{amenity.auto_confirm ? 'Instant' : 'Manager Review'}</strong>
                      </div>
                    </div>

                    <button
                      onClick={() => openReservationModal(amenity)}
                      disabled={!amenity.available}
                      className="btn btn-primary btn-sm flex items-center justify-center gap-2"
                      style={{ padding: '0.75rem' }}
                    >
                      <Calendar size={16} /> Reserve Time Slot
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 2: MY BOOKINGS & CHECK-IN / CHECK-OUT */}
        {/* ========================================================= */}
        {activeTab === 'my-bookings' && (
          <div>
            {bookings.length === 0 ? (
              <div className="card glass-panel" style={{ padding: '3.5rem', textAlign: 'center' }}>
                <Calendar size={40} color="var(--text-muted)" style={{ margin: '0 auto 1rem' }} />
                <h3>No Reservations Found</h3>
                <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
                  You do not have any active or upcoming amenity bookings.
                </p>
                <button onClick={() => setActiveTab('browse')} className="btn btn-primary btn-sm" style={{ marginTop: '1.25rem' }}>
                  Browse Amenities
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {bookings.map((b) => (
                  <div key={b.id} className="card glass-panel" style={{ padding: '1.5rem' }}>
                    <div className="flex items-start justify-between" style={{ flexWrap: 'wrap', gap: '1rem' }}>
                      <div>
                        <div className="flex items-center gap-2" style={{ marginBottom: '0.4rem' }}>
                          <span className={`badge badge-${b.status}`}>
                            {b.status}
                          </span>
                          <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                            {b.property_name}
                          </span>
                        </div>

                        <h3 style={{ fontSize: '1.25rem', color: 'var(--text-primary)' }}>
                          {b.amenity_name}
                        </h3>

                        <div className="flex items-center gap-4" style={{ marginTop: '0.5rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                          <span className="flex items-center gap-1">
                            <Calendar size={15} color="var(--accent)" />
                            <strong>{b.booking_date}</strong>
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock size={15} color="var(--accent)" />
                            <strong>{b.start_time} - {b.end_time}</strong>
                          </span>
                          {role !== 'tenant' && (
                            <span className="flex items-center gap-1">
                              <User size={15} /> {b.user_name}
                            </span>
                          )}
                        </div>

                        {/* Check-In / Check-Out Timestamps (Phase 9 Audit Trail) */}
                        <div className="flex items-center gap-4" style={{ marginTop: '0.75rem', fontSize: '0.8rem' }}>
                          {b.check_in_at ? (
                            <span style={{ color: '#34D399', display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <CheckCircle2 size={14} /> Checked In at {new Date(b.check_in_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          ) : (
                            <span style={{ color: 'var(--text-muted)' }}>Not yet checked in</span>
                          )}

                          {b.check_out_at && (
                            <span style={{ color: '#60A5FA', display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <LogOut size={14} /> Checked Out at {new Date(b.check_out_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Action Buttons: Check-In / Check-Out */}
                      <div className="flex items-center gap-3">
                        {b.status === 'confirmed' && !b.check_in_at && (
                          <button
                            onClick={() => handleCheckIn(b.id)}
                            className="btn btn-primary btn-sm flex items-center gap-1"
                            style={{ background: '#10B981', borderColor: '#10B981' }}
                          >
                            <LogIn size={15} /> Check In Now
                          </button>
                        )}

                        {b.status === 'confirmed' && b.check_in_at && !b.check_out_at && (
                          <button
                            onClick={() => handleCheckOut(b.id)}
                            className="btn btn-secondary btn-sm flex items-center gap-1"
                          >
                            <LogOut size={15} /> Check Out
                          </button>
                        )}

                        {['confirmed', 'pending'].includes(b.status) && (
                          <button
                            onClick={() => handleCancelBooking(b.id)}
                            className="btn btn-outline btn-sm"
                            style={{ fontSize: '0.75rem', color: '#F87171', borderColor: 'rgba(239, 68, 68, 0.3)' }}
                          >
                            Cancel
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ========================================================= */}
        {/* INTERACTIVE RESERVATION MODAL (PHASE 8 CONFLICT ENGINE) */}
        {/* ========================================================= */}
        {reserveModal && selectedAmenity && (
          <div style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.8)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 100,
            padding: '1.5rem'
          }}>
            <div className="card glass-panel" style={{ width: '100%', maxWidth: '580px', padding: '2rem' }}>
              <div className="flex items-center justify-between" style={{ marginBottom: '1.5rem' }}>
                <div>
                  <h2 style={{ fontSize: '1.35rem' }}>Reserve {selectedAmenity.name}</h2>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    Operating Hours: {selectedAmenity.opening_time} - {selectedAmenity.closing_time} • {selectedAmenity.check_in_duration} min sessions
                  </span>
                </div>
                <button
                  onClick={() => setReserveModal(false)}
                  style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
                >
                  <X size={20} />
                </button>
              </div>

              {/* Conflict Error Alert */}
              {conflictError && (
                <div style={{
                  padding: '0.75rem 1rem',
                  background: 'var(--status-urgent-bg)',
                  border: '1px solid var(--status-urgent-border)',
                  borderRadius: 'var(--radius-md)',
                  color: 'var(--status-urgent-text)',
                  fontSize: '0.85rem',
                  marginBottom: '1.25rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <AlertCircle size={18} style={{ flexShrink: 0 }} />
                  <span>{conflictError}</span>
                </div>
              )}

              <form onSubmit={handleReserveSubmit}>
                {/* Date Picker */}
                <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                  <label className="form-label">Select Date</label>
                  <input
                    type="date"
                    required
                    min={new Date().toISOString().split('T')[0]}
                    value={selectedDate}
                    onChange={(e) => {
                      setSelectedDate(e.target.value);
                      setSelectedSlot(null);
                      fetchAvailability(selectedAmenity.id, e.target.value);
                    }}
                    className="form-input"
                  />
                </div>

                {/* Available Slots Grid */}
                <div style={{ marginBottom: '1.5rem' }}>
                  <label className="form-label" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <span>Choose Time Slot</span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      🟢 Available • 🔴 Conflicted/Booked
                    </span>
                  </label>

                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(3, 1fr)',
                    gap: '8px',
                    maxHeight: '220px',
                    overflowY: 'auto',
                    padding: '4px'
                  }}>
                    {generateSlots().map((slot, idx) => {
                      const isSelected = selectedSlot?.start === slot.start;
                      return (
                        <button
                          key={idx}
                          type="button"
                          disabled={slot.isBooked}
                          onClick={() => {
                            setSelectedSlot(slot);
                            setConflictError('');
                          }}
                          style={{
                            padding: '0.65rem 0.5rem',
                            borderRadius: 'var(--radius-md)',
                            border: isSelected
                              ? '2px solid var(--primary)'
                              : (slot.isBooked ? '1px solid rgba(239, 68, 68, 0.3)' : '1px solid var(--border-subtle)'),
                            background: isSelected
                              ? 'rgba(99, 102, 241, 0.2)'
                              : (slot.isBooked ? 'rgba(239, 68, 68, 0.08)' : 'var(--bg-surface-elevated)'),
                            color: slot.isBooked ? '#9CA3AF' : '#ffffff',
                            cursor: slot.isBooked ? 'not-allowed' : 'pointer',
                            textAlign: 'center',
                            fontSize: '0.85rem',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: '2px',
                            transition: 'all var(--transition-fast)'
                          }}
                        >
                          <span style={{ fontWeight: 600 }}>{slot.start} - {slot.end}</span>
                          <span style={{
                            fontSize: '0.7rem',
                            color: slot.isBooked ? '#F87171' : (isSelected ? 'var(--primary)' : '#34D399')
                          }}>
                            {slot.isBooked ? 'Booked' : (isSelected ? 'Selected' : 'Available')}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3" style={{ marginTop: '1.75rem' }}>
                  <button
                    type="button"
                    onClick={() => setReserveModal(false)}
                    className="btn btn-outline btn-sm"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={!selectedSlot || bookingSubmitting}
                    className="btn btn-primary btn-sm"
                  >
                    {bookingSubmitting ? 'Verifying & Reserving...' : 'Confirm Reservation'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* ADD AMENITY MODAL (MANAGER/ADMIN) */}
        {/* ========================================================= */}
        {addModal && (
          <div style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.8)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 100,
            padding: '1.5rem'
          }}>
            <div className="card glass-panel" style={{ width: '100%', maxWidth: '520px', padding: '2rem' }}>
              <div className="flex items-center justify-between" style={{ marginBottom: '1.5rem' }}>
                <h3 style={{ fontSize: '1.25rem' }}>Add Building Amenity</h3>
                <button onClick={() => setAddModal(false)} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleAddAmenity}>
                <div className="form-group">
                  <label className="form-label">Amenity Name</label>
                  <input
                    type="text"
                    required
                    className="form-input"
                    placeholder="e.g. Steam Room & Sauna"
                    value={newAmenity.name}
                    onChange={(e) => setNewAmenity({ ...newAmenity, name: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Description</label>
                  <textarea
                    rows={3}
                    className="form-textarea"
                    placeholder="Describe facilities, capacity, and usage guidelines..."
                    value={newAmenity.description}
                    onChange={(e) => setNewAmenity({ ...newAmenity, description: e.target.value })}
                  ></textarea>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="form-group">
                    <label className="form-label">Opening Time</label>
                    <input
                      type="time"
                      required
                      className="form-input"
                      value={newAmenity.opening_time}
                      onChange={(e) => setNewAmenity({ ...newAmenity, opening_time: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Closing Time</label>
                    <input
                      type="time"
                      required
                      className="form-input"
                      value={newAmenity.closing_time}
                      onChange={(e) => setNewAmenity({ ...newAmenity, closing_time: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Duration (min)</label>
                    <input
                      type="number"
                      required
                      className="form-input"
                      value={newAmenity.check_in_duration}
                      onChange={(e) => setNewAmenity({ ...newAmenity, check_in_duration: e.target.value })}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Cover Image URL</label>
                  <input
                    type="url"
                    className="form-input"
                    placeholder="https://images.unsplash.com/..."
                    value={newAmenity.image_url}
                    onChange={(e) => setNewAmenity({ ...newAmenity, image_url: e.target.value })}
                  />
                </div>

                <div className="flex items-center justify-end gap-3" style={{ marginTop: '1.5rem' }}>
                  <button type="button" onClick={() => setAddModal(false)} className="btn btn-outline btn-sm">
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary btn-sm">
                    Save Amenity
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
