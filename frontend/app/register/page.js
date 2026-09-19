'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../../context/AuthContext';
import { Building2, UserPlus, Lock, Mail, User, Phone, AlertCircle, CheckCircle2 } from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAuth();

  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    password: '',
    role: 'tenant'
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const res = await register(formData);
      setSuccess('Account created successfully! Redirecting to dashboard...');
      setTimeout(() => {
        router.push('/dashboard');
      }, 1200);
    } catch (err) {
      setError(err.message || 'Registration failed. Please check your inputs.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'radial-gradient(circle at 50% 10%, rgba(99, 102, 241, 0.15) 0%, rgba(11, 15, 25, 1) 75%)',
      padding: '2.5rem 1rem'
    }}>
      <div className="card glass-panel" style={{
        width: '100%',
        maxWidth: '500px',
        padding: '2.5rem',
        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.6)'
      }}>
        {/* Brand Header */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', marginBottom: '1rem' }}>
            <div style={{
              width: '42px',
              height: '42px',
              borderRadius: 'var(--radius-md)',
              background: 'var(--accent-gradient)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 16px var(--primary-glow)'
            }}>
              <Building2 size={24} color="#ffffff" />
            </div>
            <span style={{ fontSize: '1.45rem', fontWeight: 800, letterSpacing: '-0.02em' }}>
              Stay<span className="text-gradient">Sync</span>
            </span>
          </Link>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.35rem' }}>Create Your Account</h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
            Join the platform to access maintenance & amenity services
          </p>
        </div>

        {/* Alerts */}
        {error && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '0.75rem 1rem',
            background: 'var(--status-urgent-bg)',
            border: '1px solid var(--status-urgent-border)',
            borderRadius: 'var(--radius-md)',
            color: 'var(--status-urgent-text)',
            fontSize: '0.85rem',
            marginBottom: '1.5rem'
          }}>
            <AlertCircle size={18} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '0.75rem 1rem',
            background: 'var(--status-completed-bg)',
            border: '1px solid var(--status-completed-border)',
            borderRadius: 'var(--radius-md)',
            color: 'var(--status-completed-text)',
            fontSize: '0.85rem',
            marginBottom: '1.5rem'
          }}>
            <CheckCircle2 size={18} style={{ flexShrink: 0 }} />
            <span>{success}</span>
          </div>
        )}

        {/* Register Form */}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label flex items-center gap-1">
              <User size={14} /> Full Name
            </label>
            <input
              type="text"
              name="full_name"
              required
              className="form-input"
              placeholder="Alex Johnson"
              value={formData.full_name}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label className="form-label flex items-center gap-1">
              <Mail size={14} /> Email Address
            </label>
            <input
              type="email"
              name="email"
              required
              className="form-input"
              placeholder="alex@example.com"
              value={formData.email}
              onChange={handleChange}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="form-group">
              <label className="form-label flex items-center gap-1">
                <Phone size={14} /> Phone Number
              </label>
              <input
                type="tel"
                name="phone"
                className="form-input"
                placeholder="+1 (555) 000-0000"
                value={formData.phone}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label className="form-label flex items-center gap-1">
                Account Role
              </label>
              <select
                name="role"
                className="form-select"
                value={formData.role}
                onChange={handleChange}
              >
                <option value="tenant">Tenant</option>
                <option value="manager">Property Manager</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label flex items-center gap-1">
              <Lock size={14} /> Password
            </label>
            <input
              type="password"
              name="password"
              required
              minLength={6}
              className="form-input"
              placeholder="At least 6 characters"
              value={formData.password}
              onChange={handleChange}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary"
            style={{ width: '100%', marginTop: '0.75rem', padding: '0.8rem' }}
          >
            {loading ? 'Creating Account...' : (
              <>
                <UserPlus size={18} /> Register Now
              </>
            )}
          </button>
        </form>

        {/* Login link */}
        <div style={{ marginTop: '2rem', textAlign: 'center', fontSize: '0.875rem' }}>
          <span style={{ color: 'var(--text-secondary)' }}>Already have an account? </span>
          <Link href="/login" style={{ color: 'var(--primary)', fontWeight: 600 }}>
            Sign In here
          </Link>
        </div>
      </div>
    </div>
  );
}
