const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || 'placeholder-anon-key';
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

if (!process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY) {
  console.log('ℹ️ Running in demo in-memory mode (SUPABASE_URL not configured)');
}

// Client with Anon Key (subject to RLS)
let supabaseClient = null;
try {
  supabaseClient = createClient(supabaseUrl, supabaseAnonKey);
} catch (err) {
  console.warn('⚠️ Supabase client init warning:', err.message);
}

// Admin client with Service Role Key (bypasses RLS for system operations)
let supabaseAdmin = null;
if (supabaseServiceRoleKey && process.env.SUPABASE_URL) {
  try {
    supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });
  } catch (err) {
    console.warn('⚠️ Supabase admin init warning:', err.message);
  }
}

module.exports = {
  supabaseClient,
  supabaseAdmin
};
