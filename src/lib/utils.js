export const validateEmail = (calendarEmail) => {
  var error;

  // TODO: validate calendarEmail here or on form element
  if (!calendarEmail) {
    error = "no email address provided";
    console.error(error);
    throw new Error(error);
  }

  return { error };
};

export const handleError = (error, setError, throwError = false) => {
  console.error(error);
  setError && setError(error);
  if (throwError) throw new Error(error);
};

export const getAccessToken = (session, supabase, setError) => {
  var accessToken = session?.access_token;
  if (!accessToken) {
    const session = supabase.auth.session();
    accessToken = session?.access_token;
  }
  if (!accessToken) handleError("No access token available", setError, true);
  return accessToken;
};

export const getDarkModeSetting = () => {
  return window.matchMedia("(prefers-color-scheme: dark)").matches;
};
