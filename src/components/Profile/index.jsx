import { Accordion, Flex, Text } from "@chakra-ui/react";
import React from "react";
import { useUserContext } from "../../contexts/UserContext";
import { CalendarSetup, UserProfile } from "./components";
import AccordionElement from "./components/AccordionElement";

const ProfileCard = () => {
  const { user, isUserPaused } = useUserContext();

  return (
    <Flex
      bg="white"
      maxWidth="900px"
      role="alert"
      direction="column"
      style={{ borderRadius: 20, overflow: "hidden" }}
      margin="0px auto"
      padding="25px"
      minWidth="60vw"
    >
      <Text
        fontSize="3xl"
        fontWeight="bold"
        color="dark"
        lineHeight="1.3"
        marginBottom="20px"
      >
        {isUserPaused ? "Spotrack is running" : "Spotrack is paused"}
      </Text>
      <Accordion defaultIndex={[0]} allowMultiple>
        <AccordionElement title="Add your calendar in Google Calendar">
          <CalendarSetup
            calendarId={user?.user_metadata?.calendarId}
            calendarEmail={user?.user_metadata?.calendarEmail}
            initialValue={
              user?.user_metadata?.calendarEmail || user?.user_metadata?.email
            }
          />
        </AccordionElement>
        <AccordionElement title="Manage your account">
          <UserProfile />
        </AccordionElement>
      </Accordion>
    </Flex>
  );
};

export default ProfileCard;
