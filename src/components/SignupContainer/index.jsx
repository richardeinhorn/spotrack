import React from "react";
import { HStack } from "@chakra-ui/react";
import { motion } from "framer-motion";

// TODO: handle narrow display

const containerAnimation = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
    },
  },
};

const SignupContainer = ({ children, id }) => {
  const AnimatedHStack = motion(HStack);

  return (
    <AnimatedHStack
      spacing="32px"
      id="signupContainer"
      alignItems="stretch"
      marginBottom="20px"
      variants={containerAnimation}
      initial="hidden"
      animate="show"
      key={id}
    >
      {children}
    </AnimatedHStack>
  );
};

export default SignupContainer;
