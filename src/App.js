import { useEffect, useState } from "react";
import "./App.css";
import { ReactComponent as Logo } from "./assets/spotrack-logo-wordmark--light.svg";
import { SignupContainer, StepNumber } from "./components";
import { supabase } from "./lib/supabase";

const App = () => {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [error, setError] = useState(null);
  const [step, setStep] = useState(1);
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

  // check if tracking is active for user
  useEffect(() => {
    if (!user) return;
    if (user.user_metadata.refresh_token) {
      console.info("User is already tracking songs");
      setStep(3);
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
  const onAddToCalendar = async () => {
    setStep(4);
  };

  const onSignIn = async () => {
    const { user, session, error } = await supabase.auth.signIn({
      provider: "spotify",
    });
    if (error) return console.error(error);
    setUser(user);
    setSession(session);
    setStep(2);
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
                ? `✅ Hello ${user?.user_metadata?.name}`
                : "Sign in with Spotify"}
            </button>
          </div>
          <div id="step-2">
            <StepNumber number={2} />
            <a
              href="http://localhost:8080/api/spotify/auth"
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
              onClick={async () => await onAddToCalendar()}
              disabled={step !== 3}
            >
              Add to your calendar
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
            🎉 Congratulations. Songs will now be added to your calendar!
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
