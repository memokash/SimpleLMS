import { createBrowserClient } from '@supabase/ssr';
import type { Database } from './database.types';

// Create a single supabase client for interacting with your database
export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}