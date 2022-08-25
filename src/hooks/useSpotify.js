import { useState } from "react";
import { supabase } from "../lib/supabase";

const useSpotify = () => {
  const [isLoggingInOnSpotify, setIsLoggingInOnSpotify] = useState(false);
  const [isAllowingTrackingOnSpotify, setIsAllowingTrackingOnSpotify] = useState(false);
  const [spotifyError, setSpotifyError] = useState(null);

  const signInWithSpotify = async () => {
    setIsLoggingInOnSpotify(true);
    setSpotifyError(null);
    const { user, error } = await supabase.auth.signIn(
      {
        provider: "spotify",
      },
      {
        redirectTo: process.env.REACT_APP_API_URL, // TODO: check Heroku envs
        scopes: "user-read-private user-read-email user-read-currently-playing",
      }
    );

    setIsLoggingInOnSpotify(false);
    if (error) {
      console.error(error);
      setSpotifyError(error);
      throw new Error(error);
    }
    return user;
  };

  const allowSpotifyTracking = () => {
    setIsAllowingTrackingOnSpotify(true);
    window.location.replace(`${process.env.REACT_APP_API_URL}api/spotify/auth`);
  };

  const handleSpotifyCallback = (queryParams) => {
    // handle error
    const error = queryParams.get("error");
    if (error) {
      window.history.replaceState({}, "", "/");
      console.error(error);
      setSpotifyError(error);
      return;
    }

    // handle successful callback
    const callbackStep = queryParams.get("callbackStep");
    if (callbackStep && parseInt(callbackStep) === 2) {
      window.history.replaceState({}, "", "/");
    }
  }

  return {
    isLoggingInOnSpotify,
    isAllowingTrackingOnSpotify,
    signInWithSpotify,
    allowSpotifyTracking,
    handleSpotifyCallback,
    spotifyError,
  };
};

export default useSpotify;
