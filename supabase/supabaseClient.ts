import { createClient } from '@supabase/supabase-js';

// Replace these with your actual Supabase project credentials if available, 
// or fallback placeholders so the application runs without errors locally.
const supabaseUrl = (import.meta as any).env?.VITE_SUPABASE_URL || 'https://your-supabase-url.supabase.co';
const supabaseAnonKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || 'your-anon-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);