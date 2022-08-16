import axios from "axios";
import { useEffect, useState } from "react";
import "./App.css";
import { ReactComponent as Logo } from "./assets/spotrack-logo-wordmark--light.svg";
import { SignupContainer, StepNumber } from "./components";
import { supabase } from "./lib/supabase";

// const APP_URL = process.env.APP_URL || "http://localhost:3000/";
const API_URL = process.env.API_URL || "http://localhost:8080/";

const App = () => {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [error, setError] = useState(null);
  const [step, setStep] = useState(1);
  const [calendarId, setCalendarId] = useState(null);
  const queryParams = new URLSearchParams(window.location.search);

  // fetch complete user record from supabase
  const getUserFromDatabase = async (token = session["access_token"]) => {
    var accessToken = token;
    if (!accessToken) {
      const session = supabase.auth.session();
      if (!session)
        return console.error("No user or session available. Please sign in.");
      setSession(session);
      accessToken = session["access_token"];
    }
    const { user, error } = await supabase.auth.api.getUser(accessToken);
    if (error) return console.error("Error getting user from database", error);
    setUser(user);
  };

  // check user signup process (tracking authorised, calendar created)
  useEffect(() => {
    if (!user) return;
    if (user.user_metadata.refresh_token) {
      console.info("User is already tracking songs");
      setStep(3);
    }
    if (user.user_metadata.calendarId) {
      console.info("User has already created calendar");
      setStep(4);
      setCalendarId(user.user_metadata.calendarId);
    }
  }, [user]);

  // check if user is logged in
  // useEffect(() => {
  //   const session = supabase.auth.session();
  //   if (session) {
  //     setSession(session);
  //     console.info(`Existing session detected`);
  //     setStep(2); // skip login
  //     getUserFromDatabase();
  //     // check if user is already tracking (must fetch user metadata to check refresh token)
  //   } else console.info("No session.");
  //   const user = supabase.auth.user();
  //   if (user) {
  //     setUser(user);
  //     console.info(`User logged in: ${user.id}`);
  //     setStep(2); // skip login
  //     // check if user is already tracking (must fetch user metadata to check refresh token)
  //   } else console.info("No user.");
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, []);

  supabase.auth.onAuthStateChange((event, session) => {
    if (event === "SIGNED_IN") {
      console.info("User signed in");
      setSession(session);
      setStep(2); // skip login
      getUserFromDatabase(session["access_token"]);
    }
  });

  // handle callback after authorization
  useEffect(() => {
    // handle error
    const error = queryParams.get("error");
    if (error) {
      setError(error);
      window.history.replaceState({}, "", "/");
      console.error(error);
      return;
    }

    // handle successful callback
    const callbackStep = queryParams.get("callbackStep");
    if (callbackStep && parseInt(callbackStep) === 2) {
      setStep(3);
      window.history.replaceState({}, "", "/");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onSignIn = async () => {
    const { user, session, error } = await supabase.auth.signIn({
      provider: "spotify",
    });
    if (error) return console.error(error);
    setUser(user);
    setSession(session);
    setStep(2);
  };

  const onCreateCalendar = async () => {
    var accessToken = session?.access_token;
    if (!accessToken) {
      const session = supabase.auth.session();
      accessToken = session?.access_token;
    }
    console.log(
      `requesting server resource using access token: ${accessToken}`
    );

    const res = await axios.get(`${API_URL}api/calendar/create`, {
      headers: { "X-Supabase-Auth": accessToken },
    });
    const calendarId = res?.data;
    if (!calendarId) {
      setError("Couldn't create calendar");
      return console.error("Couldn't create calendar");
    }
    console.log(`Created calendar with id: ${calendarId}`);
    setStep(4);
    setCalendarId(calendarId);
  };

  return (
    <main className="app">
      <header id="header">
        <div className="logo-container">
          <Logo />
        </div>
      </header>
      <div className="content">
        <SignupContainer>
          <p className="info">
            Start tracking songs in minutes for free. No credit card required.
          </p>
          <div id="step-1">
            <StepNumber number={1} />
            <button
              id="signin-btn"
              type="button"
              className={`btn ${step === 1 ? "btn-primary" : "btn-success"}`}
              onClick={async () => await onSignIn()}
              disabled={step !== 1}
            >
              {step > 1 && user?.user_metadata?.name
                ? `✅ Hello ${user?.user_metadata?.name}!`
                : "Sign in with Spotify"}
            </button>
          </div>
          <div id="step-2">
            <StepNumber number={2} />
            <a
              href={`${API_URL}api/spotify/auth`}
              className={`btn ${step <= 2 ? "btn-primary" : "btn-success"} ${
                step === 2 ? "active" : "disabled"
              }`}
            >
              {step > 2 ? "✅ Tracking songs." : "Start tracking"}
            </a>
          </div>
          <div id="step-3">
            <StepNumber number={3} />
            <button
              id="signup-btn"
              type="button"
              className={`btn ${step <= 3 ? "btn-primary" : "btn-success"}`}
              onClick={async () => await onCreateCalendar()}
              disabled={step !== 3}
            >
              {step > 3 ? "✅ Calendar created." : "Create your calendar"}
            </button>
          </div>
          <div
            className="alert alert-error"
            role="alert"
            style={{ marginTop: 10, opacity: error ? 1 : 0 }}
          >
            {`⚠ Error authorizing the application. Please reload the page and try again.\n(Error: ${error})`}
          </div>
          <div
            className="alert alert-success"
            role="alert"
            style={{ marginTop: 10, opacity: step === 4 ? 1 : 0 }}
          >
            <div>
              <p>
                🎉 Congratulations. Songs will now be added to your calendar!
              </p>
              <p>
                Go to <a href="https://calendar.google.com">Google Calendar</a>{" "}
                and add the following calendar:
                <br />
                {calendarId !== null
                  ? calendarId
                  : "error loading calendar URL"}
              </p>
            </div>
          </div>
        </SignupContainer>
        <div className="about">
          <h1>About Spotrack</h1>
          <p>
            Spotrack records your Spotify listening to your Google calendar.
            Travel through time and discover what songs you listened to at every
            moment.
          </p>
          <a href="https://github.com/richardeinhorn/spotrack">
            <img
              alt="GitHub"
              src="https://img.shields.io/badge/Github-open--source--repository-green?logo=github&style=for-the-badge"
            />
          </a>
        </div>
      </div>
    </main>
  );
};

export default App;
