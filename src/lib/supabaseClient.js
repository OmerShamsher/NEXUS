import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey || supabaseAnonKey.includes('PLACE')) {
  console.error("⚠️ SUPABASE ERROR: Your VITE_SUPABASE_ANON_KEY is missing in .env! Get it from Supabase Dashboard -> Project Settings -> API.");
}

export const supabase = createClient(supabaseUrl || 'https://ihsabuxckiubxfiaiuje.supabase.co', supabaseAnonKey || 'missing');
