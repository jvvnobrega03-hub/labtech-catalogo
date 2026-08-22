import 'server-only';

import { setDefaultResultOrder } from 'node:dns';
import { createClient } from '@supabase/supabase-js';

function preferIpv4ForSupabase() {
  // Some shared-hosting networks advertise IPv6 DNS records without a usable
  // IPv6 route. Prefer IPv4 before opening an outbound Supabase connection.
  setDefaultResultOrder('ipv4first');
}

export function createSupabaseAdminClient() {
  preferIpv4ForSupabase();
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  // Supabase now issues `sb_secret_...` keys. Keep the legacy service-role
  // variable as a fallback while deployments are migrated.
  const serviceRoleKey = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    throw new Error('Supabase server configuration is incomplete');
  }

  return createClient(url, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      detectSessionInUrl: false,
      persistSession: false,
    },
  });
}

export function createSupabaseSignupClient() {
  preferIpv4ForSupabase();
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
    || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    || process.env.SUPABASE_PUBLISHABLE_KEY
    || process.env.SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    throw new Error('Supabase public configuration is incomplete');
  }

  return createClient(url, anonKey, {
    auth: {
      autoRefreshToken: false,
      detectSessionInUrl: false,
      persistSession: false,
    },
  });
}
