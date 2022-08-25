import React, { useState } from "react";
import {
  Box,
  Button,
  ButtonGroup,
  Flex,
  FormControl,
  FormLabel,
  Input,
  InputGroup,
  InputLeftElement,
} from "@chakra-ui/react";
import { useCalendar } from "../../../hooks";
import { EmailIcon } from "@chakra-ui/icons";

// TODO: use Chakra form

const ChangeEmail = ({ initialValue }) => {
  const [newEmail, setNewEmail] = useState(initialValue);
  const [isChangingEmail, setIsChangingEmail] = useState(false);

  const { changeCalendarEmail, isChangingEmailOnServer } = useCalendar();

  return (
    <Box id="change-email-container" width="100%">
      {!isChangingEmail ? (
        <Button
          id="change-email-btn"
          variant="outline"
          margin="auto"
          onClick={() => setIsChangingEmail(true)}
        >
          Need to change email address?
        </Button>
      ) : (
        <Flex flex="1">
          <FormControl>
            <FormLabel>Your Google account email:</FormLabel>
            <InputGroup>
              <InputLeftElement
                pointerEvents="none"
                children={<EmailIcon color="gray.300" />}
              />
              <Input
                placeholder="your.email@google.com"
                // type="text"
                // className="form-control"
                // id="calendar-email"
                // aria-describedby="basic-addon3"
                // name="calendarEmail"
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
              isLoading={isChangingEmailOnServer}
              variant="outline"
              onClick={() => setIsChangingEmail(false)}
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
            >
              Save
            </Button>
          </ButtonGroup>
        </Flex>
      )}
    </Box>
  );
};

export default ChangeEmail;
