/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from "react";
import "./App.css";
import {
  Logo,
  SignupContainer,
  AboutSection,
  CalendarEmailForm,
} from "../components";
import { getDarkModeSetting } from "../lib/utils";
import SignUpCard from "../components/SignUpCard";
import { LoginImage, TrackingImage, CalendarImage } from "../assets";
import { Box, chakra, Text } from "@chakra-ui/react";
import {
  CardButton,
  CardTitle,
  CardTagline,
} from "../components/SignUpCard/components";
import { CalendarIcon, LinkIcon, UnlockIcon } from "@chakra-ui/icons";
import ProfileCard from "../components/Profile";
import { useSpotify, useUser, useCalendar } from "../hooks";

// TODO: add toast messages: https://chakra-ui.com/docs/components/toast
// TODO: delete outdated files (old buttons, utils, stepnumber, css files)
// TODO: fix dark mode (or remove)
// TODO: error display

const OnboardingPage = () => {
  const queryParams = new URLSearchParams(window.location.search);
  const [isDarkMode] = useState(getDarkModeSetting());
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");

  const { user } = useUser();
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

    console.log("Setting step and email.")

    if (user?.user_metadata?.calendarId) return setStep(4);
    if (user?.user_metadata?.refresh_token) return setStep(3);
    if (user?.id) return setStep(2);
    return setStep(1);
  }, [user]);

  return (
    <chakra.main className="app" bg="primary.200">
      <Logo isDarkMode={isDarkMode} />
      <Text fontSize="xl" marginBottom={30} textAlign="center">
        Track songs you listen to on Spotify. Easy setup, free to use.
      </Text>
      <Box className="content">
        {step === 4 ? <ProfileCard user={user} /> : (<SignupContainer>
          <SignUpCard
            imageSrc={LoginImage}
            imageAlt={"Login with Spotify"}
            isActive={step === 1}
          >
            <CardTagline
              text={step > 1 ? "Account setup" : "Create your account"}
            />
            <CardTitle
              title="Login with Spotify to create your account"
              isCompleted={step > 1}
              successMsg={`Hello ${user?.user_metadata?.name}`}
              isActive={step === 1}
            />
            {step === 1 && (
              <CardButton
                label="Login"
                isLoading={isLoggingInOnSpotify}
                onClick={signInWithSpotify}
                disabled={step !== 1}
                icon={<UnlockIcon />}
              />
            )}
          </SignUpCard>
          <SignUpCard
            imageSrc={TrackingImage}
            imageAlt={"Login with Spotify"}
            isActive={step === 2}
          >
            <CardTagline text={step > 2 ? "Spotify setup" : "Grant access"} />
            <CardTitle
              title="Let us record the songs you are listening to"
              isCompleted={step > 2}
              successMsg={`Tracking songs.`}
              isActive={step === 2}
            />
            {step === 2 && (
              <CardButton
                label="Start tracking"
                isLoading={isAllowingTrackingOnSpotify}
                onClick={allowSpotifyTracking}
                disabled={step !== 2}
                icon={<LinkIcon />}
              />
            )}
          </SignUpCard>
          <SignUpCard
            imageSrc={CalendarImage}
            imageAlt={"Login with Spotify"}
            isActive={step === 3}
          >
            <CardTagline
              text={step > 3 ? "Google Calendar setup" : "Set up calendar"}
            />
            <CardTitle
              title="Get your private Google calendar with all songs"
              isCompleted={step > 3}
              successMsg={`All done!`}
              isActive={step === 3}
            />
            {step === 3 && (
              <CalendarEmailForm
                email={email}
                setEmail={setEmail}
                isCreatingCalendarOnServer={isCreatingCalendarOnServer}
              />
            )}
            {step === 3 && (
              <CardButton
                label="Create calendar"
                isLoading={isCreatingCalendarOnServer}
                onClick={() => createCalendar(email)}
                disabled={step !== 3}
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
        </SignupContainer>)}
      </Box>
      <AboutSection />
    </chakra.main>
  );
};

export default OnboardingPage;
