import React from "react";
import { HStack } from "@chakra-ui/react";

// TODO: handle narrow display

const SignupContainer = ({ children }) => {
  return (
    <HStack
      spacing="32px"
      id="signupContainer"
      alignItems="stretch"
      marginBottom="20px"
    >
      {children}
    </HStack>
  );
};

export default SignupContainer;
