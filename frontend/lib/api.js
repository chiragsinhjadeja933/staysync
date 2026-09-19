import { supabase } from './supabaseClient';

export function getApiUrl() {
  let url = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5005/api';
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    url = `https://${url}`;
  }
  url = url.replace(/\/+$/, '');
  if (!url.endsWith('/api')) {
    url = `${url}/api`;
  }
  return url;
}

const API_BASE_URL = getApiUrl();

/**
 * Universal API fetcher that automatically includes the Supabase session token
 */
export async function apiRequest(endpoint, options = {}) {
  const url = `${getApiUrl()}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

  // Get current user session from Supabase
  let token = null;
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.access_token) {
      token = session.access_token;
    }
  } catch (err) {
    console.error('Error fetching Supabase session for API request:', err);
  }

  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {})
  };

  try {
    const res = await fetch(url, {
      ...options,
      headers
    });

    const data = await res.json().catch(() => ({
      success: false,
      message: `Failed to parse response from ${url}`
    }));

    if (!res.ok) {
      throw new Error(data.message || `Request failed with status ${res.status}`);
    }

    return data;
  } catch (error) {
    console.error(`API Error on [${options.method || 'GET'} ${endpoint}]:`, error.message);
    throw error;
  }
}

export default apiRequest;
