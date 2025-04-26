import { createBrowserClient } from '@supabase/ssr'
import { Database } from '@/lib/types/database.types'

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  console.log('[DEBUG] Supabase client init:', supabaseUrl, supabaseKey);
  return createBrowserClient<Database>(supabaseUrl, supabaseKey);
}
