import { createClient } from '@supabase/supabase-js';

// Environment variables for Next.js (NEXT_PUBLIC_ prefix for client-side)
const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key';

// Create a single instance of the Supabase client to be used across your application
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default supabase;
