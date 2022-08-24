import axios from "axios";
import { useEffect, useState } from "react";
import "./App.css";
import {
  Logo,
  SignupContainer,
  AboutSection,
  CalendarEmailForm,
} from "../components";
import { supabase } from "../lib/supabase";
import {
  getAccessToken,
  getDarkModeSetting,
  handleError,
  validateEmail,
} from "../lib/utils";
import SignUpCard from "../components/SignUpCard";
import { LoginImage, TrackingImage, CalendarImage } from "../assets";
import { chakra, Text } from "@chakra-ui/react";
import {
  CardButton,
  CardTitle,
  CardTagline,
} from "../components/SignUpCard/components";
import { CalendarIcon, LinkIcon, UnlockIcon } from "@chakra-ui/icons";

// TODO: add toast messages: https://chakra-ui.com/docs/components/toast
// TODO: use stack to show onboarding boxes
// TODO: delete outdated files (old buttons, stepnumber, css files)
// TODO: fix dark mode (or remove)

const OnboardingPage = () => {
  const [isDarkMode] = useState(getDarkModeSetting());
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [error, setError] = useState(null);
  const [step, setStep] = useState(1);
  const [calendarId, setCalendarId] = useState(null);
  const [calendarEmail, setCalendarEmail] = useState(null);
  const [isChangingEmail, setIsChangingEmail] = useState(false);
  const [newEmail, setNewEmail] = useState(null);
  const queryParams = new URLSearchParams(window.location.search);

  // loading states
  const [isLoggingInOnSpotify, setIsLoggingInOnSpotify] = useState(false);
  const [isAllowingTrackingOnSpotify, setIsAllowingTrackingOnSpotify] =
    useState(false);
  const [isCreatingCalendarOnServer, setisCreatingCalendarOnServer] =
    useState(false);
  const [isChangingEmailOnServer, setIsChangingEmailOnServer] = useState(false);

  const onStartChangingEmail = () => {
    setIsChangingEmail(true);
    setNewEmail(calendarEmail);
  };

  process.env.NODE_ENV !== "production" && console.log("App component loaded."); // check rerendering

  // set spotify email as default
  useEffect(() => {
    if (!calendarEmail && user) setCalendarEmail(user?.user_metadata?.email);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

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

  // check user signup progress (tracking authorised, calendar created)
  useEffect(() => {
    if (!user) return;
    if (user.user_metadata.refresh_token) {
      process.env.NODE_ENV !== "production" &&
        console.info("User is already tracking songs");
      setStep(3);
      setIsAllowingTrackingOnSpotify(false);
    }
    if (user.user_metadata.calendarId) {
      process.env.NODE_ENV !== "production" &&
        console.info("User has already created calendar");
      setStep(4);
      setCalendarId(user.user_metadata.calendarId);
      setisCreatingCalendarOnServer(false);
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

  // TODO: used best practice from https://github.com/supabase/supabase/blob/master/examples/todo-list/react-todo-list/src/App.js
  supabase.auth.onAuthStateChange((event, session) => {
    if (event === "SIGNED_IN") {
      process.env.NODE_ENV !== "production" && console.info("User signed in");
      setSession(session);
      setStep(2); // skip login
      getUserFromDatabase(session["access_token"]);
      setIsLoggingInOnSpotify(false);
    }
  });

  // handle callback after authorization
  useEffect(() => {
    // handle error
    const error = queryParams.get("error");
    if (error) {
      window.history.replaceState({}, "", "/");
      return handleError(error, setError);
    }

    // handle successful callback
    const callbackStep = queryParams.get("callbackStep");
    if (callbackStep && parseInt(callbackStep) === 2) {
      setStep(3);
      window.history.replaceState({}, "", "/");
    }
    const session = supabase.auth.session();
    if (session) {
      setSession(session);
      setUser(session?.user);
      setCalendarEmail(session?.user?.user_metadata?.email);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onSignIn = async () => {
    setIsLoggingInOnSpotify(true);
    setError(null);
    const { user, session, error } = await supabase.auth.signIn(
      {
        provider: "spotify",
      },
      {
        scopes: "user-read-private user-read-email user-read-currently-playing",
      }
    );
    if (error) return handleError(error, setError);
    setUser(user);
    console.log("user", JSON.stringify(user, null, 2));
    setCalendarEmail(user.user_metadata.email);
    setSession(session);
  };

  const onCreateCalendar = async () => {
    setError(null);
    setisCreatingCalendarOnServer(true);

    try {
      // check that email address is valid
      const { error } = validateEmail(calendarEmail);
      if (error) handleError(error);

      // retrieving accessToken for signed in user
      const accessToken = getAccessToken(session, supabase, setError);

      // request calendar creation and user sharing from server
      const res = await axios.post(
        "/api/calendar/create",
        { calendarEmail },
        {
          headers: { "X-Supabase-Auth": accessToken },
        }
      );
      const calendarId = res?.data?.calendarId;
      if (!calendarId) {
        const errorMsg = "Couldn't create calendar";
        return handleError(errorMsg, setError);
      }
      process.env.NODE_ENV !== "production" &&
        console.info(`Created calendar with id: ${calendarId}`);

      if (res?.data?.calendarEmail) setCalendarEmail(res?.data?.calendarEmail);

      // complete signup process
      setStep(4);
      setCalendarId(calendarId);
    } catch (error) {
      handleError(error, setError);
    } finally {
      setisCreatingCalendarOnServer(false);
    }
  };

  const onChangeCalendarEmail = async () => {
    setIsChangingEmailOnServer(true);

    if (newEmail !== calendarEmail) {
      // check that email address is valid
      const { error } = validateEmail(newEmail);
      if (error) handleError(error);

      // retrieving accessToken for signed in user
      const accessToken = getAccessToken(session, supabase, setError);

      // request new calendar sharing and update user record on server
      const res = await axios.post(
        "/api/calendar/update",
        { calendarEmail: newEmail },
        {
          headers: { "X-Supabase-Auth": accessToken },
        }
      );
      const calendarId = res?.data?.calendarId;
      if (!calendarId) {
        const errorMsg = "Couldn't change email address";
        return handleError(errorMsg, setError);
      }
      process.env.NODE_ENV !== "production" &&
        console.info(`Changed email address for calendar: ${calendarId}`);

      if (res?.data?.calendarEmail) setCalendarEmail(res?.data?.calendarEmail);
    }

    setIsChangingEmail(false);
    setIsChangingEmailOnServer(false);
  };

  const onAllowTracking = () => {
    setIsAllowingTrackingOnSpotify(true);
    window.location.replace(`${process.env.REACT_APP_API_URL}api/spotify/auth`);
  };

  return (
    <chakra.main className="app" bg="primary.200">
      <Logo isDarkMode={isDarkMode} />
      <div className="content">
        <SignupContainer
          headerComponent={
            <Text fontSize="xl">
              Track songs you listen to on Spotify. It's free.
            </Text>
          }
        >
          <SignUpCard
            imageSrc={LoginImage}
            imageAlt={"Login with Spotify"}
            isActive={step === 1}
          >
            <CardTagline text="Create your account" />
            <CardTitle
              title="Login with Spotify to create your account"
              isCompleted={step > 1}
              successMsg={`✅ Hello ${user?.user_metadata?.name}!`}
              isActive={step === 1}
            />
            <CardButton
              label="Login"
              isLoading={isLoggingInOnSpotify}
              onClick={onSignIn}
              disabled={step !== 1}
              icon={<UnlockIcon />}
            />
          </SignUpCard>
          <SignUpCard
            imageSrc={TrackingImage}
            imageAlt={"Login with Spotify"}
            isActive={step === 2}
          >
            <CardTagline text="Grant access" />
            <CardTitle
              title="Let us record the songs you are listening to"
              isCompleted={step > 2}
              successMsg={`✅ Tracking songs.`}
              isActive={step === 2}
            />
            <CardButton
              label="Start tracking"
              isLoading={isAllowingTrackingOnSpotify}
              onClick={onAllowTracking}
              disabled={step !== 2}
              icon={<LinkIcon />}
            />
            {/* <TrackingButton
              step={step}
              isAllowingTrackingOnSpotify={isAllowingTrackingOnSpotify}
              onClick={() => setIsAllowingTrackingOnSpotify(true)}
            /> */}
          </SignUpCard>
          <SignUpCard
            imageSrc={CalendarImage}
            imageAlt={"Login with Spotify"}
            isActive={step === 3}
          >
            <CardTagline text="Set up calendar" />
            <CardTitle
              title="Get your private Google calendar with all songs"
              isCompleted={step > 3}
              successMsg={`✅ Calendar created.`}
              isActive={step === 3}
            />
            <CardButton
              label="Create calendar"
              isLoading={isCreatingCalendarOnServer}
              onClick={onCreateCalendar}
              disabled={step !== 3}
              icon={<CalendarIcon />}
            />
            {step === 3 && (
              <CalendarEmailForm
                calendarEmail={calendarEmail}
                setCalendarEmail={setCalendarEmail}
                isCreatingCalendarOnServer={isCreatingCalendarOnServer}
              />
            )}
            {/* <CalendarButton
              step={step}
              onConfirmEmail={async () => await onCreateCalendar()}
              isCreatingCalendarOnServer={isCreatingCalendarOnServer}
            /> */}
          </SignUpCard>

          {error && (
            <div
              className="alert alert-error"
              role="alert"
              style={{ marginTop: 10 }}
            >
              {`⚠ Error. Please reload the page and try again.\n(Message: ${error})`}
            </div>
          )}
          {step === 4 && (
            <div
              id="alert-success-container"
              className="alert alert-success"
              role="alert"
            >
              <span className="bold">
                🎉 Congratulations. Songs will now be added to your calendar!
              </span>
              <p style={{ marginTop: 6, lineHeight: "2.2em" }}>
                Go to{" "}
                <a
                  style={{ color: "inherit" }}
                  href="https://calendar.google.com/calendar/r/settings/addcalendar?pli=1"
                  target="_blank"
                  rel="noreferrer"
                >
                  Google Calendar
                </a>{" "}
                and subscribe to the following calendar:
                <br />
                <span
                  id="calendar-id"
                  onClick={() =>
                    calendarId ? navigator.clipboard.writeText(calendarId) : {}
                  }
                >
                  {calendarId !== null
                    ? calendarId
                    : "error loading calendar URL"}
                </span>
                <br />
                or follow the instructions sent to {calendarEmail}.
              </p>
              {isChangingEmail ? (
                <div id="change-email-container">
                  <div>
                    <label
                      htmlFor="calendar-email"
                      style={{ fontSize: "0.9em" }}
                    >
                      Your Google account email:
                    </label>
                    <div
                      className="input-group mb-3"
                      style={{ margin: "0px !important" }}
                    >
                      <input
                        type="text"
                        className="form-control"
                        id="calendar-email"
                        aria-describedby="basic-addon3"
                        name="calendarEmail"
                        value={newEmail}
                        onChange={(event) => setNewEmail(event.target.value)}
                        disabled={isChangingEmailOnServer}
                      />
                    </div>
                  </div>
                  <button
                    id="save-new-email-btn"
                    type="button"
                    className="btn btn-outline-success"
                    onClick={async () => await onChangeCalendarEmail()}
                    disabled={!calendarEmail || isChangingEmailOnServer}
                  >
                    {isChangingEmailOnServer ? "Saving ..." : "Save"}
                  </button>
                </div>
              ) : (
                <button
                  id="change-email-btn"
                  type="button"
                  className={"btn btn-outline-success"}
                  onClick={onStartChangingEmail}
                >
                  Need to change email address?
                </button>
              )}
            </div>
          )}
        </SignupContainer>
        <AboutSection />
      </div>
    </chakra.main>
  );
};

export default OnboardingPage;
