const required = (value, name) => {
  if (!value) throw new Error(`Falta la variable de entorno ${name}`);
  return value;
};

export const config = {
  supabaseUrl: import.meta.env.VITE_SUPABASE_URL ?? '',
  supabaseAnonKey: import.meta.env.VITE_SUPABASE_ANON_KEY ?? '',
  storageBucket: 'memories',
  maxUploadBytes: 50 * 1024 * 1024,
  maxMediaFiles: 12
};

export const assertConfig = () => {
  required(config.supabaseUrl, 'VITE_SUPABASE_URL');
  required(config.supabaseAnonKey, 'VITE_SUPABASE_ANON_KEY');
};

export const isConfigured = () => Boolean(config.supabaseUrl && config.supabaseAnonKey);
