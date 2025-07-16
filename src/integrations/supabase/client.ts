import { createClient } from '@supabase/supabase-js'
import type { Database } from './types'

const SUPABASE_URL = 'https://ppcslytljasqmivwrsre.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBwY3NseXRsamFzcW1pdndyc3JlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI2MTM4NzksImV4cCI6MjA2ODE4OTg3OX0.isb6C2ZQO-K_P5bH_Q3L9RFPqG4wstkr1ESbNT4e7hQ'

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  }
})