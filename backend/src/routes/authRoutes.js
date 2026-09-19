const express = require('express');
const router = express.Router();
const { supabaseClient, supabaseAdmin } = require('../config/supabase');
const { authenticate, DEMO_USERS } = require('../middleware/authMiddleware');

// 1. Get current authenticated user
router.get('/me', authenticate, (req, res) => {
  res.status(200).json({
    success: true,
    user: req.user
  });
});

// 2. Demo Login (for instant testing across roles without requiring Supabase cloud setup)
router.post('/demo-login', (req, res) => {
  const { role } = req.body;
  const tokenMap = {
    tenant: 'demo-tenant-token',
    manager: 'demo-manager-token',
    admin: 'demo-admin-token'
  };

  const token = tokenMap[role] || 'demo-tenant-token';
  const user = DEMO_USERS[token];

  res.status(200).json({
    success: true,
    message: `Logged in successfully as Demo ${role || 'tenant'}`,
    token,
    user
  });
});

// 3. Live Login (using Supabase Auth)
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: 'Email and password are required.'
    });
  }

  // Check if live Supabase is configured
  if (!process.env.SUPABASE_URL || process.env.SUPABASE_URL.includes('your-project-id')) {
    // Fallback: If user enters demo email, log them in as demo
    if (email.includes('tenant')) {
      return res.status(200).json({
        success: true,
        message: 'Demo Tenant login successful',
        token: 'demo-tenant-token',
        user: DEMO_USERS['demo-tenant-token']
      });
    } else if (email.includes('manager')) {
      return res.status(200).json({
        success: true,
        message: 'Demo Manager login successful',
        token: 'demo-manager-token',
        user: DEMO_USERS['demo-manager-token']
      });
    } else if (email.includes('admin')) {
      return res.status(200).json({
        success: true,
        message: 'Demo Admin login successful',
        token: 'demo-admin-token',
        user: DEMO_USERS['demo-admin-token']
      });
    }

    return res.status(400).json({
      success: false,
      message: 'Supabase cloud credentials not yet configured in .env. Please use the Demo Login buttons or update backend/.env.'
    });
  }

  try {
    const { data, error } = await supabaseClient.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      return res.status(401).json({
        success: false,
        message: error.message
      });
    }

    // Fetch profile from profiles table
    const dbClient = supabaseAdmin || supabaseClient;
    const { data: profile } = await dbClient
      .from('profiles')
      .select('*')
      .eq('id', data.user.id)
      .single();

    res.status(200).json({
      success: true,
      message: 'Login successful',
      token: data.session.access_token,
      user: {
        id: data.user.id,
        email: data.user.email,
        full_name: profile?.full_name || data.user.user_metadata?.full_name || 'User',
        role: profile?.role || data.user.user_metadata?.role || 'tenant',
        phone: profile?.phone || ''
      }
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to process login request.'
    });
  }
});

// 4. Live Register (using Supabase Auth)
router.post('/register', async (req, res) => {
  const { email, password, full_name, role = 'tenant', phone = '' } = req.body;

  if (!email || !password || !full_name) {
    return res.status(400).json({
      success: false,
      message: 'Full name, email, and password are required.'
    });
  }

  // Validate allowed roles
  if (!['tenant', 'manager', 'admin'].includes(role)) {
    return res.status(400).json({
      success: false,
      message: 'Role must be tenant, manager, or admin.'
    });
  }

  // If live Supabase not configured, provide simulated registered user
  if (!process.env.SUPABASE_URL || process.env.SUPABASE_URL.includes('your-project-id')) {
    return res.status(201).json({
      success: true,
      message: 'Registration simulated! Configure your Supabase project in .env for persistent multi-user registration.',
      token: `demo-${role}-token`,
      user: {
        id: `demo-${Date.now()}`,
        email,
        full_name,
        role,
        phone
      }
    });
  }

  try {
    const { data, error } = await supabaseClient.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name,
          role,
          phone
        }
      }
    });

    if (error) {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }

    // Insert profile directly into profiles table using admin client if available
    if (data.user && supabaseAdmin) {
      await supabaseAdmin.from('profiles').upsert({
        id: data.user.id,
        full_name,
        email,
        phone,
        role
      });
    }

    res.status(201).json({
      success: true,
      message: 'Registration successful! You can now log in.',
      token: data.session?.access_token || null,
      user: {
        id: data.user.id,
        email: data.user.email,
        full_name,
        role,
        phone
      }
    });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to process registration.'
    });
  }
});

module.exports = router;
