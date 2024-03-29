import axios from "axios";
import { useState } from "react";
import { handleError, validateEmail } from "../lib/utils";
import { useUserContext } from "../contexts/UserContext";
import useToasts from "./useToasts";

const useCalendar = () => {
  const [isCreatingCalendarOnServer, setisCreatingCalendarOnServer] =
    useState(false);
  const [isChangingEmailOnServer, setIsChangingEmailOnServer] = useState(false);
  const [calendarError, setCalendarError] = useState(null);

  const { access_token, reloadUser, calendarEmail } = useUserContext();
  const { showToast } = useToasts();

  const createCalendar = async (email) => {
    setCalendarError(null);
    setisCreatingCalendarOnServer(true);

    if (!access_token) return console.error("No access token");

    try {
      // check that email address is valid
      const { error } = validateEmail(email);
      if (error) handleError(error);

      // request calendar creation and user sharing from server
      const res = await axios.post(
        "/api/calendar/create",
        { email },
        {
          headers: { "X-Supabase-Auth": access_token },
        }
      );
      const calendarId = res?.data?.calendarId;
      if (!calendarId) {
        const errorMsg = "Couldn't create calendar";
        return handleError(errorMsg, setCalendarError);
      }
      console.debug(`Created calendar with id: ${calendarId}`);
      showToast("success", "🎉 Congratulations", "Songs will now be added to your calendar.")

      reloadUser();
    } catch (error) {
      handleError(error, setCalendarError);
    } finally {
      setisCreatingCalendarOnServer(false);
    }
  };

  const changeCalendarEmail = async (newEmail, onSuccess = () => {}) => {
    setIsChangingEmailOnServer(true);

    if (!access_token) return console.error("No access token");

    if (newEmail !== calendarEmail) {
      // check that email address is valid
      const { error } = validateEmail(newEmail);
      if (error) handleError(error);

      // request new calendar sharing and update user record on server
      const res = await axios.post(
        "/api/calendar/update",
        { calendarEmail: newEmail },
        {
          headers: { "X-Supabase-Auth": access_token },
        }
      );
      const calendarId = res?.data?.calendarId;
      if (!calendarId) {
        const errorMsg = "Couldn't change email address";
        return handleError(errorMsg, setCalendarError);
      }
      process.env.NODE_ENV !== "production" &&
        console.info(`Changed email address for calendar: ${calendarId}`);

      reloadUser();
    }

    onSuccess && onSuccess();
    setIsChangingEmailOnServer(false);
  };
  return {
    createCalendar,
    changeCalendarEmail,
    calendarError,
    isCreatingCalendarOnServer,
    isChangingEmailOnServer,
  };
};

export default useCalendar;
