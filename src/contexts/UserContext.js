import axios from "axios";
import React, { createContext, useState, useContext, useEffect } from "react";
import { supabase } from "../lib/supabase";

const UserContext = createContext(undefined);

export const UserContextProvider = ({ children }) => {
  const [isDeletingUser, setIsDeletingUser] = useState(false);
  const [isPausingUser, setIsPausingUser] = useState(false);
  const [isUserPaused, setIsUserPaused] = useState(null);
  const [session, setSession] = useState(null);
  const [userError, setUserError] = useState(null);
  const [user, setUser] = useState(null);
  const [isFetchingUser, setIsFetchingUser] = useState(false);

  const checkUserToken = () => {
    console.debug("retrieving access token");
    if (!session?.access_token) {
      const session = supabase.auth.session();
      if (!session) {
        console.error("No access token found in local session");
        setUserError("No access token");
        return false;
      } else setSession(session);
    }
    setUserError(null);
    return true;
  };

  // delete user profile from Spotrack service
  const deleteUserProfile = async () => {
    if (!checkUserToken()) return;
    console.debug("deleting user profile");
    setIsDeletingUser(true);

    const res = await axios.post("/api/user/delete", null, {
      headers: { "X-Supabase-Auth": session?.access_token },
    });
    if (res.statusCode === 204) {
      setIsDeletingUser(false);
      supabase.auth.logout();

      // reload page
      window.location.reload(false);
    } else {
      console.error("Error deleting user");
      setUserError(res.statusText);
      setIsDeletingUser(false);
    }
  };

  // pause tracking for user
  const pauseUser = async () => {
    if (!checkUserToken()) return;
    console.debug("pausing tracking for user");
    setIsPausingUser(true);

    const res = await axios.post("/api/user/pause", null, {
      headers: { "X-Supabase-Auth": session?.access_token },
    });
    if (res.statusCode === 200) {
      setIsUserPaused(res.data?.user_metadata?.isPaused);
    } else {
      console.error("Error pausing user");
      setUserError(res.statusText);
    }
    setIsPausingUser(false);
  };

  // resume tracking for user
  const unpauseUser = async () => {
    if (!checkUserToken()) return;
    console.debug("unpausing tracking for user");
    setIsPausingUser(true);

    const res = await axios.post("/api/user/unpause", null, {
      headers: { "X-Supabase-Auth": session?.access_token },
    });
    if (res.statusCode === 200) {
      setIsUserPaused(res.data?.user_metadata?.isPaused);
    } else {
      console.error("Error unpausing user");
      setUserError(res.statusText);
    }
    setIsPausingUser(false);
  };

  const togglePausingUser = () => (isUserPaused ? unpauseUser() : pauseUser());

  const signoutUser = async () => {
    console.debug("signing out user.");
    console.log("Please sign in again.");
    await supabase.auth.signOut();
    setSession(null);
    setUser(null);
  };

  // fetch complete user record from supabase
  const getUserFromDatabase = async (token = undefined) => {
    if (!token && !checkUserToken()) return;
    setIsFetchingUser(true);
    console.debug("fetching user record from database.");

    const { user, error } = await supabase.auth.api.getUser(
      token || session?.access_token
    );
    if (error) {
      console.error("Error getting user from database", error);

      // if local user record not found, signout and clear state
      if (error.status === 404) signoutUser();
      return;
    }
    setUser(user);

    setIsFetchingUser(false);
    return user;
  };

  // initiate session and user
  useEffect(() => {
    const session = supabase.auth.session();
    const user = supabase.auth.user();

    // rehydrate local session
    setSession(session);

    // initialise with local record of user data
    setIsUserPaused(user?.is_paused);
    setUser(user);

    // refresh local data with database record
    if (session?.access_token) getUserFromDatabase(session.access_token);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // fetch user data after login
  supabase.auth.onAuthStateChange(async (event, session) => {
    if (event === "SIGNED_IN") {
      setSession(session);
      setUser(session.user);
      console.debug("sign in event detected");
    }
  });

  return (
    <UserContext.Provider
      value={{
        deleteUserProfile,
        pauseUser,
        unpauseUser,
        togglePausingUser,
        reloadUser: getUserFromDatabase,
        userError,
        isDeletingUser,
        isPausingUser,
        isUserPaused,
        isFetchingUser,
        user,
        calendarId: user?.user_metadata?.calendarId,
        calendarEmail: user?.user_metadata?.calendarEmail,
        access_token: session?.access_token,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUserContext = () => {
  return useContext(UserContext);
};