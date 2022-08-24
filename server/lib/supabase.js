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

export async function deleteUser(userUid) {
  const { data: user, error } = await supabase.auth.api.deleteUser(userUid);
  if (error) throw new Error(error);

  console.info(`Deleted user ${userUid} from database.`);
  return user;
}

export async function updateUserData(userUid, newMetaData) {
  const { data: user, error } = await supabase.auth.api.updateUserById(
    userUid,
    { user_metadata: newMetaData }
  );
  if (error) throw new Error(error);

  console.info(`Updated meta data for user ${userUid}.`);
  return user;
}

export async function getUserData(token) {
  const { data: user, error } = await supabase.auth.api.getUser(token);
  if (error) throw new Error(error);

  console.info(`Fetched user data based on token.`);
  return user;
}
