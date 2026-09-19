'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { getApiUrl } from '../lib/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Initialize and persist session on mount
  useEffect(() => {
    async function initAuth() {
      try {
        // 1. Check if we have a cached local session (supports both demo & Supabase)
        const cachedToken = localStorage.getItem('staysync_token');
        const cachedUser = localStorage.getItem('staysync_user');

        if (cachedToken && cachedUser) {
          setToken(cachedToken);
          setUser(JSON.parse(cachedUser));
        }

        // 2. Check Supabase session if configured
        if (process.env.NEXT_PUBLIC_SUPABASE_URL && !process.env.NEXT_PUBLIC_SUPABASE_URL.includes('your-project-id')) {
          const { data: { session } } = await supabase.auth.getSession();
          if (session) {
            setToken(session.access_token);
            // Sync user profile
            const { data: profile } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', session.user.id)
              .single();

            const userData = {
              id: session.user.id,
              email: session.user.email,
              full_name: profile?.full_name || session.user.user_metadata?.full_name || 'User',
              role: profile?.role || session.user.user_metadata?.role || 'tenant',
              phone: profile?.phone || ''
            };

            setUser(userData);
            localStorage.setItem('staysync_token', session.access_token);
            localStorage.setItem('staysync_user', JSON.stringify(userData));
          }
        }
      } catch (err) {
        console.error('Failed to initialize auth state:', err);
      } finally {
        setLoading(false);
      }
    }

    initAuth();

    // 3. Listen to Supabase auth changes if client is active
    let authListener = null;
    try {
      const { data } = supabase.auth.onAuthStateChange(async (event, session) => {
        if (event === 'SIGNED_IN' && session) {
          setToken(session.access_token);
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();

          const userData = {
            id: session.user.id,
            email: session.user.email,
            full_name: profile?.full_name || session.user.user_metadata?.full_name || 'User',
            role: profile?.role || session.user.user_metadata?.role || 'tenant',
            phone: profile?.phone || ''
          };

          setUser(userData);
          localStorage.setItem('staysync_token', session.access_token);
          localStorage.setItem('staysync_user', JSON.stringify(userData));
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          setToken(null);
          localStorage.removeItem('staysync_token');
          localStorage.removeItem('staysync_user');
        }
      });
      authListener = data;
    } catch (e) {
      // Ignore if placeholder credentials
    }

    return () => {
      if (authListener?.subscription) {
        authListener.subscription.unsubscribe();
      }
    };
  }, []);

  // Login method
  const login = async (email, password) => {
    const apiUrl = getApiUrl();
    const res = await fetch(`${apiUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || 'Login failed');
    }

    setUser(data.user);
    setToken(data.token);
    localStorage.setItem('staysync_token', data.token);
    localStorage.setItem('staysync_user', JSON.stringify(data.user));
    return data.user;
  };

  // Demo Login method (Instant 1-click for testing roles)
  const demoLogin = async (role) => {
    const apiUrl = getApiUrl();
    const res = await fetch(`${apiUrl}/auth/demo-login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role })
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || 'Demo login failed');
    }

    setUser(data.user);
    setToken(data.token);
    localStorage.setItem('staysync_token', data.token);
    localStorage.setItem('staysync_user', JSON.stringify(data.user));
    return data.user;
  };

  // Register method
  const register = async (formData) => {
    const apiUrl = getApiUrl();
    const res = await fetch(`${apiUrl}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || 'Registration failed');
    }

    if (data.token && data.user) {
      setUser(data.user);
      setToken(data.token);
      localStorage.setItem('staysync_token', data.token);
      localStorage.setItem('staysync_user', JSON.stringify(data.user));
    }
    return data;
  };

  // Logout method
  const logout = async () => {
    try {
      if (process.env.NEXT_PUBLIC_SUPABASE_URL && !process.env.NEXT_PUBLIC_SUPABASE_URL.includes('your-project-id')) {
        await supabase.auth.signOut();
      }
    } catch (e) {
      // Ignore
    } finally {
      setUser(null);
      setToken(null);
      localStorage.removeItem('staysync_token');
      localStorage.removeItem('staysync_user');
      window.location.href = '/login';
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        role: user?.role || null,
        loading,
        login,
        demoLogin,
        register,
        logout,
        isAuthenticated: !!user
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default AuthContext;
