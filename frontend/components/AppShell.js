'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import { 
  Building2, 
  LayoutDashboard, 
  Home, 
  Wrench, 
  Calendar, 
  Bell, 
  LogOut, 
  PlusCircle, 
  ShieldCheck, 
  Users, 
  Menu, 
  X,
  ChevronRight,
  Sparkles
} from 'lucide-react';

export default function AppShell({ children, breadcrumbs = [] }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, role, logout, demoLogin } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  const navItems = [
    {
      name: 'Dashboard',
      href: '/dashboard',
      icon: LayoutDashboard,
      roles: ['tenant', 'manager', 'admin']
    },
    {
      name: role === 'tenant' ? 'My Home' : 'Properties & Units',
      href: '/properties',
      icon: role === 'tenant' ? Home : Building2,
      roles: ['tenant', 'manager', 'admin']
    },
    {
      name: 'Maintenance',
      href: '/maintenance',
      icon: Wrench,
      roles: ['tenant', 'manager', 'admin']
    },
    {
      name: 'Amenities & Bookings',
      href: '/amenities',
      icon: Calendar,
      roles: ['tenant', 'manager', 'admin']
    }
  ];

  const filteredNav = navItems.filter(item => !item.roles || item.roles.includes(role || 'tenant'));

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-main)' }}>
      {/* Sidebar - Desktop */}
      <aside style={{
        width: '260px',
        background: 'var(--bg-surface)',
        borderRight: '1px solid var(--border-subtle)',
        display: 'flex',
        flexDirection: 'column',
        position: 'sticky',
        top: 0,
        height: '100vh',
        zIndex: 40
      }} className="hidden-mobile">
        {/* Brand */}
        <div style={{
          padding: '1.25rem 1.5rem',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: 'var(--radius-md)',
              background: 'var(--accent-gradient)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 12px var(--primary-glow)'
            }}>
              <Building2 size={20} color="#ffffff" />
            </div>
            <span style={{ fontSize: '1.25rem', fontWeight: 800, letterSpacing: '-0.02em' }}>
              Stay<span className="text-gradient">Sync</span>
            </span>
          </Link>
        </div>

        {/* Current Role Indicator */}
        <div style={{ padding: '1rem 1.5rem 0.5rem' }}>
          <div style={{
            background: 'var(--bg-surface-elevated)',
            padding: '0.65rem 0.85rem',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <div>
              <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block' }}>
                Active Role
              </span>
              <span style={{ fontSize: '0.85rem', fontWeight: 700, textTransform: 'capitalize' }}>
                {role || 'User'}
              </span>
            </div>
            <span className={`badge badge-${role === 'manager' ? 'in_progress' : (role === 'admin' ? 'urgent' : 'completed')}`}>
              {role}
            </span>
          </div>
        </div>

        {/* Navigation Items */}
        <nav style={{ padding: '0.75rem 1rem', flex: 1, display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
          {filteredNav.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.name}
                href={item.href}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '0.7rem 0.85rem',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '0.9rem',
                  fontWeight: isActive ? 600 : 500,
                  color: isActive ? '#ffffff' : 'var(--text-secondary)',
                  background: isActive ? 'rgba(99, 102, 241, 0.15)' : 'transparent',
                  border: isActive ? '1px solid rgba(99, 102, 241, 0.3)' : '1px solid transparent',
                  transition: 'all var(--transition-fast)'
                }}
              >
                <Icon size={18} color={isActive ? '#6366F1' : 'currentColor'} />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* Quick Role Switcher (Developer & Demo Testing) */}
        <div style={{
          padding: '1rem',
          borderTop: '1px solid var(--border-subtle)',
          background: 'rgba(0, 0, 0, 0.2)'
        }}>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Sparkles size={12} color="#6366F1" /> Quick Role Switch
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '4px' }}>
            <button
              onClick={() => demoLogin('tenant')}
              style={{
                padding: '4px 2px',
                fontSize: '0.7rem',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border-subtle)',
                background: role === 'tenant' ? 'var(--primary)' : 'var(--bg-surface-elevated)',
                color: '#ffffff',
                cursor: 'pointer'
              }}
            >
              Tenant
            </button>
            <button
              onClick={() => demoLogin('manager')}
              style={{
                padding: '4px 2px',
                fontSize: '0.7rem',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border-subtle)',
                background: role === 'manager' ? 'var(--primary)' : 'var(--bg-surface-elevated)',
                color: '#ffffff',
                cursor: 'pointer'
              }}
            >
              Manager
            </button>
            <button
              onClick={() => demoLogin('admin')}
              style={{
                padding: '4px 2px',
                fontSize: '0.7rem',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border-subtle)',
                background: role === 'admin' ? 'var(--primary)' : 'var(--bg-surface-elevated)',
                color: '#ffffff',
                cursor: 'pointer'
              }}
            >
              Admin
            </button>
          </div>
        </div>

        {/* User Account Info */}
        <div style={{
          padding: '1rem 1.25rem',
          borderTop: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ overflow: 'hidden' }}>
            <div style={{ fontSize: '0.85rem', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {user?.full_name}
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {user?.email}
            </div>
          </div>
          <button
            onClick={logout}
            title="Sign Out"
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              padding: '6px',
              borderRadius: 'var(--radius-sm)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <LogOut size={16} />
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        {/* Top Header */}
        <header style={{
          height: '64px',
          borderBottom: '1px solid var(--border-subtle)',
          background: 'rgba(11, 15, 25, 0.75)',
          backdropFilter: 'blur(12px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 1.5rem',
          position: 'sticky',
          top: 0,
          zIndex: 30
        }}>
          {/* Breadcrumbs */}
          <div className="flex items-center gap-2" style={{ fontSize: '0.875rem' }}>
            <span style={{ color: 'var(--text-muted)' }}>StaySync</span>
            <ChevronRight size={14} color="var(--text-muted)" />
            {breadcrumbs.map((crumb, idx) => (
              <span key={idx} className="flex items-center gap-2">
                <span style={{ color: idx === breadcrumbs.length - 1 ? 'var(--text-primary)' : 'var(--text-muted)', fontWeight: idx === breadcrumbs.length - 1 ? 600 : 400 }}>
                  {crumb}
                </span>
                {idx < breadcrumbs.length - 1 && <ChevronRight size={14} color="var(--text-muted)" />}
              </span>
            ))}
          </div>

          {/* Quick Actions & Notifications */}
          <div className="flex items-center gap-3">
            {/* Quick action buttons */}
            {role === 'tenant' ? (
              <Link href="/maintenance" className="btn btn-primary btn-sm flex items-center gap-1">
                <PlusCircle size={15} /> Report Issue
              </Link>
            ) : (
              <Link href="/properties" className="btn btn-primary btn-sm flex items-center gap-1">
                <PlusCircle size={15} /> Add Property
              </Link>
            )}

            {/* Notification Bell */}
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--bg-surface-elevated)',
                  border: '1px solid var(--border-subtle)',
                  color: 'var(--text-primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  position: 'relative'
                }}
              >
                <Bell size={16} />
                <span style={{
                  position: 'absolute',
                  top: '6px',
                  right: '6px',
                  width: '7px',
                  height: '7px',
                  borderRadius: '50%',
                  background: '#EC4899',
                  boxShadow: '0 0 6px #EC4899'
                }}></span>
              </button>

              {/* Notification Dropdown */}
              {notificationsOpen && (
                <div className="card glass-panel" style={{
                  position: 'absolute',
                  top: '46px',
                  right: 0,
                  width: '320px',
                  padding: '1rem',
                  zIndex: 100,
                  boxShadow: 'var(--shadow-lg)'
                }}>
                  <div className="flex items-center justify-between" style={{ marginBottom: '0.75rem' }}>
                    <span style={{ fontSize: '0.85rem', fontWeight: 700 }}>Notifications</span>
                    <span className="badge badge-pending">2 New</span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.8rem' }}>
                    <div style={{ padding: '0.5rem', background: 'rgba(255, 255, 255, 0.03)', borderRadius: 'var(--radius-sm)' }}>
                      <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>Maintenance Updated</div>
                      <div style={{ color: 'var(--text-secondary)' }}>Ticket #M-101 moved to In Progress</div>
                    </div>
                    <div style={{ padding: '0.5rem', background: 'rgba(255, 255, 255, 0.03)', borderRadius: 'var(--radius-sm)' }}>
                      <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>Booking Confirmed</div>
                      <div style={{ color: 'var(--text-secondary)' }}>Rooftop Pool reservation today at 6:00 PM</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div style={{ flex: 1, padding: '2rem 1.5rem' }}>
          {children}
        </div>
      </div>
    </div>
  );
}
