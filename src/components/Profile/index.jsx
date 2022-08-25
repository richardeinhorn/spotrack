import {
  Accordion,
  Center,
  Flex,
  Stat,
  StatLabel,
  StatNumber,
  Text,
} from "@chakra-ui/react";
import React, { useEffect } from "react";
import { useUserContext } from "../../contexts/UserContext";
import { CalendarSetup, UserProfile } from "./components";
import AccordionElement from "./components/AccordionElement";

const ProfileCard = ({ id }) => {
  const { user, isUserPaused, userStats, getUserStatistics } = useUserContext();

  useEffect(() => {
    if (!userStats && getUserStatistics) getUserStatistics();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
      key={id}
    >
      <Text
        fontSize="3xl"
        fontWeight="bold"
        color="dark"
        lineHeight="1.3"
        marginBottom="20px"
        align="left"
      >
        {isUserPaused ? "Spotrack is paused" : "Spotrack is running"}
      </Text>
      {userStats?.count && (
        <Center margin="20px auto 25px auto" align="center">
          <Stat>
            <StatLabel>Songs recorded</StatLabel>
            <StatNumber>{userStats?.count}</StatNumber>
          </Stat>
        </Center>
      )}
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
