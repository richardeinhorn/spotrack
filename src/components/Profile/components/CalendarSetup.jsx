import { Box } from "@chakra-ui/react";
import React from "react";

const CalendarSetup = ({
  calendarId = "[error loading URL]",
  calendarEmail = "your email",
}) => {
  return (
    <Box>
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
          {calendarId}
        </span>
        <br />
        or follow the instructions sent to {calendarEmail}.
      </p>
    </Box>
  );
};

export default CalendarSetup;
