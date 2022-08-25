import { Flex } from "@chakra-ui/react";
import React from "react";
import { CalendarSetup, ChangeEmail, UserProfile } from "./components";

const ProfileCard = ({ user }) => {
  return (
    <Flex
      bg="white"
      maxWidth="900px"
      role="alert"
      direction="column"
      style={{ borderRadius: 20, overflow: "hidden" }}
      margin="0px auto"
      padding="25px"
    >
      <UserProfile user={user} />
      <CalendarSetup
        calendarId={user.user_metadata?.calendarId}
        calendarEmail={user.user_metadata?.calendarEmail}
      />
      <ChangeEmail
        initialValue={
          user.user_metadata?.calendarEmail || user.user_metadata?.email
        }
      />
    </Flex>
  );
};

export default ProfileCard;
