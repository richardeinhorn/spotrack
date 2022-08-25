import React from "react";
import { HStack } from "@chakra-ui/react";
import { AnimatePresence, motion } from "framer-motion";

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

const USE_ANIMATION = true;

const SignupContainer = ({ children, id }) => {
  return (
      <HStack
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
      </HStack>
  );
};

const AnimatedSignupContainer = ({ children, id }) => {
  const AnimatedHStack = motion(HStack);

  return (
    <AnimatePresence>
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
    </AnimatePresence>
  );
};

export default USE_ANIMATION ? AnimatedSignupContainer: SignupContainer;
