import React from "react";
import { TimeIcon, WarningIcon } from "@chakra-ui/icons";
import { Button, Flex, Text, Tooltip } from "@chakra-ui/react";
import useUser from "../../../hooks/useUser";

const UserProfile = ({ user }) => {
  const {
    deleteUserProfile,
    togglePausingUser,
    userError,
    isDeletingUser,
    isPausingUser,
    isUserPaused,
  } = useUser();

  return (
    <Flex alignItems="center">
      <Text flex="1">{`Name: ${user?.user_metadata?.name}`}</Text>
      {userError && (
        <Tooltip label={userError} placement="bottom">
          <WarningIcon color="red" />
        </Tooltip>
      )}
      <Button
        isLoading={isPausingUser}
        leftIcon={<TimeIcon />}
        onClick={togglePausingUser}
      >
        {isUserPaused ? "Resume" : "Pause"}
      </Button>
      <Button
        isLoading={isDeletingUser}
        bg="red"
        color="white"
        leftIcon={<WarningIcon />}
        onClick={deleteUserProfile}
      >
        Delete
      </Button>
    </Flex>
  );
};

export default UserProfile;
