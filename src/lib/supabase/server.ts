import 'server-only';

import { createClient } from '@supabase/supabase-js';

function usesModernApiKey(apiKey: string) {
  return apiKey.startsWith('sb_publishable_') || apiKey.startsWith('sb_secret_');
}

function createDataApiFetch(apiKey: string): typeof fetch | undefined {
  if (!usesModernApiKey(apiKey)) return undefined;

  return async (input, init) => {
    const requestUrl = input instanceof Request ? input.url : input.toString();
    if (!new URL(requestUrl).pathname.startsWith('/rest/v1/')) {
      return fetch(input, init);
    }

    const headers = new Headers(init?.headers);
    if (headers.get('Authorization') === `Bearer ${apiKey}`) {
      headers.delete('Authorization');
    }

    return fetch(input, { ...init, headers });
  };
}

export function createSupabaseAdminClient() {
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
    global: {
      // `sb_secret_` keys are accepted by Supabase in the `apikey` header.
      // The SDK also adds an Authorization fallback for database calls; strip
      // that fallback for modern keys so Hostinger can use them correctly.
      fetch: createDataApiFetch(serviceRoleKey),
    },
  });
}

export function createSupabaseSignupClient() {
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
