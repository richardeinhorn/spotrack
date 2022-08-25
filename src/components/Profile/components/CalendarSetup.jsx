import React, { useState } from "react";
import { useUserContext } from "../../../contexts/UserContext";
import {
  Box,
  Button,
  ButtonGroup,
  FormControl,
  FormLabel,
  Input,
  InputGroup,
  InputLeftElement,
  Text,
} from "@chakra-ui/react";
import { useCalendar } from "../../../hooks";
import { EmailIcon } from "@chakra-ui/icons";

const CalendarSetup = ({ initialValue }) => {
  const [newEmail, setNewEmail] = useState(initialValue);
  const [isChangingEmail, setIsChangingEmail] = useState(false);

  const { changeCalendarEmail, isChangingEmailOnServer } = useCalendar();

  const { calendarId, calendarEmail } = useUserContext();

  return (
    <Box margin="5px 0px 10px 0px">
      {!isChangingEmail ? (
        <Box align="center">
          <Text align="left" marginTop="6px" lineHeight="2.2em">
            Go to{" "}
            <a
              style={{ color: "inherit", textDecoration: "underline" }}
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
              {calendarId || "[error loading URL]"}
            </span>
            <br />
            or follow the instructions sent to {calendarEmail ||
              "your email"}.{" "}
          </Text>
          <Button
            variant="outline"
            margin="10px auto"
            onClick={() => setIsChangingEmail(true)}
            fontWeight="normal"
          >
            Need to change email address?
          </Button>
        </Box>
      ) : (
        <Box>
          <FormControl>
            <FormLabel>Your Google account email:</FormLabel>
            <InputGroup>
              <InputLeftElement
                pointerEvents="none"
                children={<EmailIcon color="gray.300" />}
              />
              <Input
                placeholder="your.email@google.com"
                value={newEmail}
                onChange={(event) => setNewEmail(event.target.value)}
                disabled={isChangingEmailOnServer}
              />
            </InputGroup>
          </FormControl>
          <ButtonGroup gap="4" margin="10px auto">
            <Button
              id="cancel-new-email-btn"
              type="button"
              disabled={isChangingEmailOnServer}
              variant="outline"
              onClick={() => setIsChangingEmail(false)}
              minWidth="90px"
            >
              Cancel
            </Button>
            <Button
              id="save-new-email-btn"
              type="button"
              isLoading={isChangingEmailOnServer}
              colorScheme="green"
              onClick={() =>
                changeCalendarEmail(newEmail, () => setIsChangingEmail(false))
              }
              disabled={!newEmail}
              minWidth="90px"
            >
              Save
            </Button>
          </ButtonGroup>
        </Box>
      )}
    </Box>
  );
};

export default CalendarSetup;
