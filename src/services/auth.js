import { getSupabase } from '../lib/supabase.js';

export const authService = {
  async getSession() {
    const { data, error } = await getSupabase().auth.getSession();
    if (error) throw error;
    return data.session;
  },

  onAuthChange(callback) {
    const { data } = getSupabase().auth.onAuthStateChange((_event, session) => callback(session));
    return () => data.subscription.unsubscribe();
  },

  async signIn(email, password) {
    const { data, error } = await getSupabase().auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data.session;
  },

  async signOut() {
    const { error } = await getSupabase().auth.signOut();
    if (error) throw error;
  }
};
