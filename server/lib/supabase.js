import { createClient } from "@supabase/supabase-js";

// Create a single supabase client for interacting with your database
export const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

// get all users from supabase db
export async function getUsers() {
  const { data: users, error } = await supabase.auth.api.listUsers();
  if (error) throw new Error(error);

  console.info("Retrieved users from database.");
  return users;
}