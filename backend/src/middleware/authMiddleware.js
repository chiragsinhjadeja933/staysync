const { supabaseClient, supabaseAdmin } = require('../config/supabase');

// Predefined demo accounts for instant testing if Supabase cloud keys are not yet configured
const DEMO_USERS = {
  'demo-tenant-token': {
    id: 'd1111111-1111-1111-1111-111111111111',
    email: 'tenant@staysync.com',
    full_name: 'Alex Johnson (Demo Tenant)',
    role: 'tenant',
    phone: '+1 (555) 234-5678'
  },
  'demo-manager-token': {
    id: 'd2222222-2222-2222-2222-222222222222',
    email: 'manager@staysync.com',
    full_name: 'Sarah Connor (Demo Manager)',
    role: 'manager',
    phone: '+1 (555) 876-5432'
  },
  'demo-admin-token': {
    id: 'd3333333-3333-3333-3333-333333333333',
    email: 'admin@staysync.com',
    full_name: 'Marcus Vance (Demo Admin)',
    role: 'admin',
    phone: '+1 (555) 999-0000'
  }
};

/**
 * Middleware to authenticate requests using Supabase JWT or Dev Demo tokens
 */
async function authenticate(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required. Please provide a valid Bearer token.'
      });
    }

    const token = authHeader.split(' ')[1];

    // Check if token matches a demo token (for quick testing/development)
    if (DEMO_USERS[token]) {
      req.user = DEMO_USERS[token];
      return next();
    }

    // Check with Supabase Auth
    if (process.env.SUPABASE_URL && !process.env.SUPABASE_URL.includes('your-project-id')) {
      const { data: { user }, error } = await supabaseClient.auth.getUser(token);

      if (error || !user) {
        return res.status(401).json({
          success: false,
          message: 'Invalid or expired session token.',
          error: error?.message
        });
      }

      // Fetch profile data (role, full_name) from profiles table
      const dbClient = supabaseAdmin || supabaseClient;
      const { data: profile, error: profileError } = await dbClient
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      req.user = {
        id: user.id,
        email: user.email,
        full_name: profile?.full_name || user.user_metadata?.full_name || 'User',
        role: profile?.role || user.user_metadata?.role || 'tenant',
        phone: profile?.phone || user.user_metadata?.phone || ''
      };

      return next();
    } else {
      // If Supabase keys are not configured and token isn't recognized
      return res.status(401).json({
        success: false,
        message: 'Invalid authentication token. (Configure live Supabase keys or use a demo login).'
      });
    }
  } catch (err) {
    console.error('Auth middleware error:', err);
    return res.status(500).json({
      success: false,
      message: 'Authentication processing failed.'
    });
  }
}

module.exports = {
  authenticate,
  DEMO_USERS
};
