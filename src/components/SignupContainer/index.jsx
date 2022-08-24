import React from "react";
import { Box, Center, HStack } from "@chakra-ui/react";

const SignupContainer = ({ headerComponent, children }) => {
  return (
    <Box marginBottom={30}>
      <Center id="signup-header-container" marginBottom="20px">
        {headerComponent}
      </Center>
    <HStack spacing="32px" id="signupContainer" alignItems="stretch" marginBottom="20px">
      {children}
    </HStack>
    </Box>
  );
};

export default SignupContainer;
