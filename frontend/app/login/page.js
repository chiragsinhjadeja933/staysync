'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../../context/AuthContext';
import { Building2, LogIn, Lock, Mail, AlertCircle, ArrowRight, UserCheck, ShieldCheck, Home } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { login, demoLogin } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      router.push('/dashboard');
    } catch (err) {
      setError(err.message || 'Login failed. Please verify your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async (role) => {
    setError('');
    setLoading(true);
    try {
      await demoLogin(role);
      router.push('/dashboard');
    } catch (err) {
      setError(err.message || 'Demo login failed');
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
      padding: '2rem 1rem'
    }}>
      <div className="card glass-panel" style={{
        width: '100%',
        maxWidth: '460px',
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
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.35rem' }}>Welcome Back</h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
            Sign in to manage your property, requests, and bookings
          </p>
        </div>

        {/* Error Alert */}
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

        {/* Login Form */}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label flex items-center gap-1">
              <Mail size={14} /> Email Address
            </label>
            <input
              type="email"
              required
              className="form-input"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label flex items-center justify-between">
              <span className="flex items-center gap-1">
                <Lock size={14} /> Password
              </span>
              <a href="#" style={{ fontSize: '0.8rem', color: 'var(--primary)' }}>
                Forgot?
              </a>
            </label>
            <input
              type="password"
              required
              className="form-input"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary"
            style={{ width: '100%', marginTop: '0.5rem', padding: '0.8rem' }}
          >
            {loading ? 'Authenticating...' : (
              <>
                <LogIn size={18} /> Sign In
              </>
            )}
          </button>
        </form>

        {/* 1-Click Demo Login Section */}
        <div style={{ margin: '2rem 0 1.5rem', textAlign: 'center', position: 'relative' }}>
          <div style={{
            position: 'absolute',
            left: 0,
            top: '50%',
            width: '100%',
            height: '1px',
            background: 'var(--border-subtle)'
          }}></div>
          <span style={{
            position: 'relative',
            background: 'var(--bg-surface)',
            padding: '0 12px',
            fontSize: '0.75rem',
            color: 'var(--text-muted)',
            textTransform: 'uppercase',
            letterSpacing: '0.05em'
          }}>
            Or Instant Demo Login
          </span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
          <button
            type="button"
            disabled={loading}
            onClick={() => handleDemoLogin('tenant')}
            className="btn btn-secondary btn-sm"
            style={{ justifyContent: 'space-between', padding: '0.6rem 1rem' }}
          >
            <span className="flex items-center gap-2">
              <Home size={16} color="#6366F1" />
              <span>Login as <strong>Demo Tenant</strong></span>
            </span>
            <ArrowRight size={14} color="var(--text-muted)" />
          </button>

          <button
            type="button"
            disabled={loading}
            onClick={() => handleDemoLogin('manager')}
            className="btn btn-secondary btn-sm"
            style={{ justifyContent: 'space-between', padding: '0.6rem 1rem' }}
          >
            <span className="flex items-center gap-2">
              <Building2 size={16} color="#06B6D4" />
              <span>Login as <strong>Property Manager</strong></span>
            </span>
            <ArrowRight size={14} color="var(--text-muted)" />
          </button>

          <button
            type="button"
            disabled={loading}
            onClick={() => handleDemoLogin('admin')}
            className="btn btn-secondary btn-sm"
            style={{ justifyContent: 'space-between', padding: '0.6rem 1rem' }}
          >
            <span className="flex items-center gap-2">
              <ShieldCheck size={16} color="#EC4899" />
              <span>Login as <strong>System Admin</strong></span>
            </span>
            <ArrowRight size={14} color="var(--text-muted)" />
          </button>
        </div>

        {/* Register link */}
        <div style={{ marginTop: '2rem', textAlign: 'center', fontSize: '0.875rem' }}>
          <span style={{ color: 'var(--text-secondary)' }}>Don't have an account? </span>
          <Link href="/register" style={{ color: 'var(--primary)', fontWeight: 600 }}>
            Create an account
          </Link>
        </div>
      </div>
    </div>
  );
}
