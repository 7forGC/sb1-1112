import { createClient } from '@supabase/supabase-js';
import type { Database } from '../types/supabase';

const supabaseUrl = 'https://btiolkhzkxaqwqhlenhm.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ0aW9sa2h6a3hhcXdxaGxlbmhtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzE3ODUzNzEsImV4cCI6MjA0NzM2MTM3MX0.cYB1VU0zG35R_EiCiA8uk7cDdmMjNQ26NWtzCeI2ugc';

export const supabase = createClient<Database>(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  },
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  }
});