/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from "react";
import "./App.css";
import {
  Logo,
  SignupContainer,
  AboutSection,
  CalendarEmailForm,
  SignupWrapper,
  CardButton,
  CardTitle,
  ProfileCard,
  CardTagline,
  SignUpCard,
} from "../components";
import { LoginImage, TrackingImage, CalendarImage } from "../assets";
import { chakra, Text } from "@chakra-ui/react";
import { CalendarIcon, LinkIcon, UnlockIcon } from "@chakra-ui/icons";
import { useSpotify, useCalendar } from "../hooks";
import { useUserContext } from "../contexts/UserContext";

// TODO: error display and error handling

const OnboardingPage = () => {
  const queryParams = new URLSearchParams(window.location.search);
  const [signupStep, setSignupStep] = useState(1);
  const [email, setEmail] = useState("");

  const { user } = useUserContext();
  const {
    signInWithSpotify,
    isLoggingInOnSpotify,
    allowSpotifyTracking,
    isAllowingTrackingOnSpotify,
    handleSpotifyCallback,
  } = useSpotify();
  const { createCalendar, isCreatingCalendarOnServer } = useCalendar();

  process.env.NODE_ENV !== "production" && console.log("App component loaded."); // check rerendering

  // handle callback after authorization
  useEffect(() => handleSpotifyCallback(queryParams), []);

  // set step
  useEffect(() => {
    // set Spotify email as default email for new calendar
    if (!email) setEmail(user?.email);

    console.debug("Setting step and email.");

    if (user?.user_metadata?.calendarId && signupStep !== 4) setSignupStep(4);
    else if (user?.user_metadata?.refresh_token  && signupStep !== 3) setSignupStep(3);
    else if (user?.id  && signupStep !== 2) setSignupStep(2);
    else if (signupStep !== 1) setSignupStep(1);
  }, [user]);

  return (
    <chakra.main className="app">
      <Logo />
      <Text fontSize="xl" marginBottom={30} textAlign="center">
        Track songs you listen to on Spotify. Easy setup, free to use.
      </Text>
      <SignupWrapper>
        {signupStep === 4 ? (
          <ProfileCard id={"profile-card"} />
        ) : (
          <SignupContainer id={"signup-box"}>
            <SignUpCard
              id={"signup-card-1"}
              imageSrc={LoginImage}
              imageAlt={"Login with Spotify"}
              isActive={signupStep === 1}
            >
              <CardTagline
                text={signupStep > 1 ? "Account setup" : "Create your account"}
              />
              <CardTitle
                title="Login with Spotify to create your account"
                isCompleted={signupStep > 1}
                successMsg={`Hello ${user?.user_metadata?.name}`}
                isActive={signupStep === 1}
              />
              {signupStep === 1 && (
                <CardButton
                  label="Login"
                  isLoading={isLoggingInOnSpotify}
                  onClick={signInWithSpotify}
                  disabled={signupStep !== 1}
                  icon={<UnlockIcon />}
                />
              )}
            </SignUpCard>
            <SignUpCard
              id={"signup-card-2"}
              imageSrc={TrackingImage}
              imageAlt={"Login with Spotify"}
              isActive={signupStep === 2}
            >
              <CardTagline
                text={signupStep > 2 ? "Spotify setup" : "Grant access"}
              />
              <CardTitle
                title="Let us record the songs you are listening to"
                isCompleted={signupStep > 2}
                successMsg={`Tracking songs.`}
                isActive={signupStep === 2}
              />
              {signupStep === 2 && (
                <CardButton
                  label="Start tracking"
                  isLoading={isAllowingTrackingOnSpotify}
                  onClick={allowSpotifyTracking}
                  disabled={signupStep !== 2}
                  icon={<LinkIcon />}
                />
              )}
            </SignUpCard>
            <SignUpCard
              id={"signup-card-3"}
              imageSrc={CalendarImage}
              imageAlt={"Login with Spotify"}
              isActive={signupStep === 3}
            >
              <CardTagline
                text={
                  signupStep > 3 ? "Google Calendar setup" : "Set up calendar"
                }
              />
              <CardTitle
                title="Get your private Google calendar with all songs"
                isCompleted={signupStep > 3}
                successMsg={`All done!`}
                isActive={signupStep === 3}
              />
              {signupStep === 3 && (
                <CalendarEmailForm
                  email={email}
                  setEmail={setEmail}
                  isCreatingCalendarOnServer={isCreatingCalendarOnServer}
                />
              )}
              {signupStep === 3 && (
                <CardButton
                  label="Create calendar"
                  isLoading={isCreatingCalendarOnServer}
                  onClick={() => createCalendar(email || user?.email)}
                  disabled={signupStep !== 3}
                  icon={<CalendarIcon />}
                />
              )}
            </SignUpCard>

            {false && (
              <div
                className="alert alert-error"
                role="alert"
                style={{ marginTop: 10 }}
              >
                {`⚠ Error. Please reload the page and try again.`}
              </div>
            )}
          </SignupContainer>
        )}
      </SignupWrapper>
      <AboutSection />
    </chakra.main>
  );
};

export default OnboardingPage;
