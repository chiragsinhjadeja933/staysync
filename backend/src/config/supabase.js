const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || '';
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('⚠️ Warning: SUPABASE_URL or SUPABASE_ANON_KEY is not configured in backend/.env');
}

// Client with Anon Key (subject to RLS)
const supabaseClient = createClient(supabaseUrl, supabaseAnonKey);

// Admin client with Service Role Key (bypasses RLS for system operations)
const supabaseAdmin = supabaseServiceRoleKey
  ? createClient(supabaseUrl, supabaseServiceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })
  : null;

module.exports = {
  supabaseClient,
  supabaseAdmin
};
