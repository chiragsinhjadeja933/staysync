'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import { ShieldAlert, Loader2 } from 'lucide-react';

export default function ProtectedRoute({ children, allowedRoles = [] }) {
  const { user, loading, role } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--bg-main)',
        flexDirection: 'column',
        gap: '1rem'
      }}>
        <div className="animate-pulse" style={{ color: 'var(--primary)' }}>
          <Loader2 size={36} className="animate-spin" />
        </div>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Verifying session security clearance...</p>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  // Check role authorization
  if (allowedRoles.length > 0 && role !== 'admin' && !allowedRoles.includes(role)) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--bg-main)',
        padding: '2rem'
      }}>
        <div className="card glass-panel" style={{ maxWidth: '520px', textAlign: 'center', padding: '2.5rem' }}>
          <div style={{
            width: '56px',
            height: '56px',
            borderRadius: '50%',
            background: 'var(--status-urgent-bg)',
            color: 'var(--status-urgent-text)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '1.25rem'
          }}>
            <ShieldAlert size={28} />
          </div>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '0.75rem' }}>Access Restricted</h2>
          <p style={{ fontSize: '0.925rem', marginBottom: '1.5rem', color: 'var(--text-secondary)' }}>
            Your account role (<strong style={{ color: 'var(--text-primary)', textTransform: 'capitalize' }}>{role}</strong>) does not have authorization to view this section.
            <br />
            Required role(s): {allowedRoles.join(', ')}.
          </p>
          <div className="flex items-center justify-center gap-3">
            <button onClick={() => router.push('/dashboard')} className="btn btn-primary btn-sm">
              Return to My Dashboard
            </button>
            <button onClick={() => router.push('/login')} className="btn btn-outline btn-sm">
              Switch Account
            </button>
          </div>
        </div>
      </div>
    );
  }

  return children;
}
