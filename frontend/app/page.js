'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Building2, 
  Wrench, 
  CalendarCheck2, 
  ShieldCheck, 
  ArrowRight, 
  Activity, 
  Users, 
  CheckCircle2,
  Sparkles,
  Layers
} from 'lucide-react';

export default function HomePage() {
  const [apiStatus, setApiStatus] = useState({ loading: true, online: false, message: '' });

  useEffect(() => {
    async function checkBackend() {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5005/api';
      try {
        const res = await fetch(`${apiUrl}/health`);
        if (res.ok) {
          const data = await res.json();
          setApiStatus({ loading: false, online: true, message: data.message });
        } else {
          setApiStatus({ loading: false, online: false, message: 'API responded with error' });
        }
      } catch (err) {
        setApiStatus({ loading: false, online: false, message: 'Backend not reachable on port 5005' });
      }
    }
    checkBackend();
  }, []);

  return (
    <main style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Top Navigation Bar */}
      <header style={{
        borderBottom: '1px solid var(--border-subtle)',
        background: 'rgba(11, 15, 25, 0.85)',
        backdropFilter: 'blur(12px)',
        position: 'sticky',
        top: 0,
        zIndex: 50
      }}>
        <div className="container flex items-center justify-between" style={{ height: '72px' }}>
          <div className="flex items-center gap-3">
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: 'var(--radius-md)',
              background: 'var(--accent-gradient)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 16px var(--primary-glow)'
            }}>
              <Building2 size={22} color="#ffffff" />
            </div>
            <div>
              <span style={{ fontSize: '1.25rem', fontWeight: 800, letterSpacing: '-0.02em' }}>
                Stay<span className="text-gradient">Sync</span>
              </span>
              <span style={{ 
                fontSize: '0.65rem', 
                fontWeight: 700, 
                background: 'rgba(99, 102, 241, 0.15)', 
                color: 'var(--primary)', 
                padding: '2px 6px', 
                borderRadius: '4px',
                marginLeft: '8px',
                border: '1px solid rgba(99, 102, 241, 0.3)'
              }}>
                v1.0 Phase 1
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Real-time backend status badge */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '4px 12px',
              borderRadius: 'var(--radius-full)',
              background: apiStatus.online ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
              border: `1px solid ${apiStatus.online ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
              fontSize: '0.75rem',
              fontWeight: 600,
              color: apiStatus.online ? '#34D399' : '#F87171'
            }}>
              <span style={{
                width: '7px',
                height: '7px',
                borderRadius: '50%',
                background: apiStatus.online ? '#10B981' : '#EF4444',
                boxShadow: apiStatus.online ? '0 0 8px #10B981' : '0 0 8px #EF4444'
              }}></span>
              {apiStatus.loading ? 'Checking API...' : (apiStatus.online ? 'Express API Online' : 'API Offline')}
            </div>

            <Link href="/login" className="btn btn-secondary btn-sm">
              Sign In
            </Link>
            <Link href="/register" className="btn btn-primary btn-sm">
              Get Started
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section style={{
        padding: '5rem 0 4rem',
        background: 'radial-gradient(circle at 50% 0%, rgba(99, 102, 241, 0.12) 0%, rgba(11, 15, 25, 0) 70%)',
        position: 'relative'
      }}>
        <div className="container" style={{ textAlign: 'center', maxWidth: '880px' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '6px 16px',
            borderRadius: 'var(--radius-full)',
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid var(--border-subtle)',
            fontSize: '0.85rem',
            fontWeight: 500,
            marginBottom: '1.5rem',
            color: 'var(--text-secondary)'
          }}>
            <Sparkles size={16} color="#6366F1" />
            <span>Next-Gen Property Operations & Amenity Logistics</span>
          </div>

          <h1 style={{
            fontSize: 'clamp(2.4rem, 5vw, 4rem)',
            fontWeight: 800,
            lineHeight: 1.15,
            letterSpacing: '-0.03em',
            marginBottom: '1.5rem'
          }}>
            Real-Time Property Rental, <br />
            <span className="text-gradient">Maintenance & Amenity</span> Platform
          </h1>

          <p style={{
            fontSize: '1.15rem',
            lineHeight: 1.7,
            color: 'var(--text-secondary)',
            marginBottom: '2.5rem',
            maxWidth: '680px',
            margin: '0 auto 2.5rem'
          }}>
            A unified web platform empowering tenants with real-time maintenance tracking and conflict-free amenity reservations, while delivering comprehensive operational oversight to property managers.
          </p>

          <div className="flex items-center justify-center gap-4" style={{ flexWrap: 'wrap' }}>
            <Link href="/register" className="btn btn-primary" style={{ padding: '0.85rem 1.75rem', fontSize: '1rem' }}>
              Explore Platform <ArrowRight size={18} />
            </Link>
            <Link href="/login" className="btn btn-secondary" style={{ padding: '0.85rem 1.75rem', fontSize: '1rem' }}>
              Access Dashboard
            </Link>
          </div>
        </div>
      </section>

      {/* Role-Based Overview Grid */}
      <section style={{ padding: '3rem 0 5rem' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <h2 style={{ fontSize: '1.85rem', marginBottom: '0.5rem' }}>Built for Every Stakeholder</h2>
            <p style={{ color: 'var(--text-secondary)' }}>Tailored interfaces and permission boundaries across user tiers.</p>
          </div>

          <div className="grid grid-cols-3 gap-6">
            {/* Tenant Card */}
            <div className="card glass-panel" style={{ padding: '2rem' }}>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: 'var(--radius-md)',
                background: 'rgba(99, 102, 241, 0.15)',
                color: 'var(--primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '1.25rem'
              }}>
                <Users size={24} />
              </div>
              <h3 style={{ fontSize: '1.25rem', marginBottom: '0.75rem' }}>Tenant Portal</h3>
              <p style={{ fontSize: '0.9rem', marginBottom: '1.25rem' }}>
                Report unit issues with photo attachments, observe live status transitions, and book shared amenities with zero time conflicts.
              </p>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={16} color="#10B981" /> Real-time status progression
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={16} color="#10B981" /> 1-Click amenity reservation
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={16} color="#10B981" /> Digital check-in / check-out
                </li>
              </ul>
            </div>

            {/* Property Manager Card */}
            <div className="card glass-panel" style={{ padding: '2rem', borderColor: 'rgba(99, 102, 241, 0.3)' }}>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: 'var(--radius-md)',
                background: 'rgba(6, 182, 212, 0.15)',
                color: 'var(--accent)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '1.25rem'
              }}>
                <Building2 size={24} />
              </div>
              <h3 style={{ fontSize: '1.25rem', marginBottom: '0.75rem' }}>Property Manager</h3>
              <p style={{ fontSize: '0.9rem', marginBottom: '1.25rem' }}>
                Centralized oversight of properties, units, occupancy, maintenance queues, and amenity schedules with instant status dispatch.
              </p>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={16} color="#10B981" /> Unit occupancy management
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={16} color="#10B981" /> Maintenance dispatch & notes
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={16} color="#10B981" /> Amenity scheduling & hours
                </li>
              </ul>
            </div>

            {/* Administrator Card */}
            <div className="card glass-panel" style={{ padding: '2rem' }}>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: 'var(--radius-md)',
                background: 'rgba(236, 72, 153, 0.15)',
                color: '#EC4899',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '1.25rem'
              }}>
                <ShieldCheck size={24} />
              </div>
              <h3 style={{ fontSize: '1.25rem', marginBottom: '0.75rem' }}>Administrator</h3>
              <p style={{ fontSize: '0.9rem', marginBottom: '1.25rem' }}>
                Complete system governance, role provisioning, portfolio-wide metrics, system audit logs, and security enforcement.
              </p>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={16} color="#10B981" /> User & role administration
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={16} color="#10B981" /> Portfolio-wide analytics
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={16} color="#10B981" /> Row Level Security policy
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Core Technology Stack Highlights */}
      <section style={{
        padding: '3rem 0',
        background: 'var(--bg-surface)',
        borderTop: '1px solid var(--border-subtle)',
        borderBottom: '1px solid var(--border-subtle)'
      }}>
        <div className="container">
          <div className="grid grid-cols-4 gap-6 text-center">
            <div>
              <div style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)' }}>Next.js 15</div>
              <p style={{ fontSize: '0.8rem' }}>App Router Frontend</p>
            </div>
            <div>
              <div style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)' }}>Node.js & Express</div>
              <p style={{ fontSize: '0.8rem' }}>REST API & Business Logic</p>
            </div>
            <div>
              <div style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)' }}>Supabase PostgreSQL</div>
              <p style={{ fontSize: '0.8rem' }}>Relational DB & RLS Security</p>
            </div>
            <div>
              <div style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)' }}>Supabase Realtime</div>
              <p style={{ fontSize: '0.8rem' }}>Instant WebSocket Sync</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{
        marginTop: 'auto',
        padding: '2.5rem 0',
        borderTop: '1px solid var(--border-subtle)',
        background: 'var(--bg-main)',
        fontSize: '0.85rem',
        color: 'var(--text-muted)'
      }}>
        <div className="container flex items-center justify-between" style={{ flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            © 2026 StaySync Platform. Built according to full phase-wise requirements.
          </div>
          <div className="flex items-center gap-6">
            <span className="flex items-center gap-2">
              <Activity size={14} color="#10B981" /> Port 5000 (Backend)
            </span>
            <span className="flex items-center gap-2">
              <Layers size={14} color="#6366F1" /> Port 3000 (Next.js)
            </span>
          </div>
        </div>
      </footer>
    </main>
  );
}
