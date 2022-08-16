import { createClient } from "@supabase/supabase-js";

// Create a single supabase client for interacting with your database
export const supabase = createClient(
  "https://gevuekgnexrwhsqknoho.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdldnVla2duZXhyd2hzcWtub2hvIiwicm9sZSI6ImFub24iLCJpYXQiOjE2NjA2NjY2MDEsImV4cCI6MTk3NjI0MjYwMX0.6FDolpWkDS9csjuQqVZKSXvToKpQzMFGye4_ZVm9Sow"
);
