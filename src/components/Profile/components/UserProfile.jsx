import React from "react";
import { TimeIcon, WarningIcon } from "@chakra-ui/icons";
import { Box, Button, ButtonGroup, Center } from "@chakra-ui/react";
import { useUserContext } from "../../../contexts/UserContext";

const UserProfile = () => {
  const {
    deleteUserProfile,
    togglePausingUser,
    isDeletingUser,
    isPausingUser,
    isUserPaused,
  } = useUserContext();

  return (
    <Box margin="20px 0px">
      <Center>
        <ButtonGroup gap="4">
        <Button
          isLoading={isPausingUser}
          leftIcon={<TimeIcon />}
          onClick={togglePausingUser}
          variant="outline"
          colorScheme="orange"
          >
          {isUserPaused ? "Resume" : "Pause"}
        </Button>
        <Button
          isLoading={isDeletingUser}
          _hover={{ bg: "red", color: "white" }}
          colorScheme="red"
          variant="outline"
          leftIcon={<WarningIcon />}
          onClick={deleteUserProfile}
        >
          Delete
        </Button>
        </ButtonGroup>
      </Center>
    </Box>
  );
};

export default UserProfile;
