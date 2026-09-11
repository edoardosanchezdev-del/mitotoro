import { createClient } from '@supabase/supabase-js';
import { config } from '../config.js';

let client = null;

export const getSupabase = () => {
  if (!client) {
    client = createClient(config.supabaseUrl, config.supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true
      }
    });
  }
  return client;
};
