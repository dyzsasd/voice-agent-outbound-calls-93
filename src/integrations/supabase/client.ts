// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://mfheadgibsxipjzovzew.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1maGVhZGdpYnN4aXBqem92emV3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDUwMDYwMzcsImV4cCI6MjA2MDU4MjAzN30.Kt8eZptdvpeU9FqDjOtVwe4lB7wafLTCJ1Omh6n82Y4";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);