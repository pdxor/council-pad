import { createClient, SupabaseClient } from '@supabase/supabase-js';

let supabaseInstance: SupabaseClient | null = null;

/**
 * Get the Supabase client instance (lazy initialization).
 * This function creates the client on first use rather than at module load time,
 * allowing Next.js builds to succeed without environment variables being present.
 */
export function getSupabase(): SupabaseClient {
  if (supabaseInstance) {
    return supabaseInstance;
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      'Missing Supabase environment variables. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in your .env.local file'
    );
  }

  supabaseInstance = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: false
    },
    global: {
      fetch: (url, options = {}) => {
        // @ts-ignore - Fix SSL cert issues in dev
        if (typeof process !== 'undefined' && process.env.NODE_ENV === 'development') {
          process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
        }
        return fetch(url, options);
      }
    }
  });

  return supabaseInstance;
}

/**
 * @deprecated Use getSupabase() instead for lazy initialization.
 * This export is kept for backwards compatibility but will throw at module load
 * if environment variables are missing.
 */
export const supabase = {
  get from() {
    return getSupabase().from.bind(getSupabase());
  },
  get rpc() {
    return getSupabase().rpc.bind(getSupabase());
  },
  get channel() {
    return getSupabase().channel.bind(getSupabase());
  },
  get removeChannel() {
    return getSupabase().removeChannel.bind(getSupabase());
  },
  get auth() {
    return getSupabase().auth;
  },
  get storage() {
    return getSupabase().storage;
  },
  get functions() {
    return getSupabase().functions;
  },
  get realtime() {
    return getSupabase().realtime;
  },
};

