import { createClient } from '@supabase/supabase-js';

// Hardcode Supabase credentials to ensure the connection works reliably.
const supabaseUrl = "https://pnydrxuwzifnmjpsykmf.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBueWRyeHV3emlmbm1qcHN5a21mIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcxMDIzNDQsImV4cCI6MjA3MjY3ODM0NH0.Yntk4l4ngd7j_rpmy_ZXtHOb9Vv7xpBA1FxjH5-_yIA";


// Ensure the variables are provided, otherwise throw an error.
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Supabase URL and Anon Key must be provided.");
}

// Create and export the Supabase client instance with explicit session persistence.
// This ensures the user's session is stored in localStorage and they remain logged in.
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: window.localStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
});
