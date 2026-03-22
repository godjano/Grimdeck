import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://pjyjiekrptztfllmwrlt.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBqeWppZWtycHR6dGZsbG13cmx0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQxNzkyNzYsImV4cCI6MjA4OTc1NTI3Nn0.KVqJ723msi5CuzWp43JoLRhkByHY44u5iR8ERx60J48';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
