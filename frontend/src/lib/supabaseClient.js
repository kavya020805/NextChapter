import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl) {
  throw new Error(
    'Missing Supabase URL. Please create a .env file in the frontend directory with VITE_SUPABASE_URL=your_supabase_url'
  )
}

if (!supabaseAnonKey) {
  throw new Error(
    'Missing Supabase Anon Key. Please create a .env file in the frontend directory with VITE_SUPABASE_ANON_KEY=your_anon_key'
  )
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

