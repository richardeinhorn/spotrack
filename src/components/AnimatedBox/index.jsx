import React from "react";
import { Box } from "@chakra-ui/react";
import { motion, AnimatePresence } from "framer-motion";

const containerAnimation = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
    },
  },
};

const USE_ANIMATION = false;

const NormalBox = ({ children }) => {
  return (
    <>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 1440 320"
        preserveAspectRatio="none"
        width="100%"
        height="100px"
        key="wave"
      >
        <path
          fill="#62EC83"
          fillOpacity="1"
          d="M0,64L48,53.3C96,43,192,21,288,48C384,75,480,149,576,192C672,235,768,245,864,250.7C960,256,1056,256,1152,224C1248,192,1344,128,1392,96L1440,64L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
        ></path>
      </svg>
      <Box
        className="content"
        bg="primary.200"
        width="100%"
        paddingBottom="40px"
        key="animted-box"
      >
        {children}
      </Box>
    </>
  );
};

const AnimatedBox = ({ children }) => {
  const AnimatedBox = motion(Box);

  return (
    <AnimatePresence>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 1440 320"
        preserveAspectRatio="none"
        width="100%"
        height="100px"
        key="wave"
      >
        <path
          fill="#62EC83"
          fillOpacity="1"
          d="M0,64L48,53.3C96,43,192,21,288,48C384,75,480,149,576,192C672,235,768,245,864,250.7C960,256,1056,256,1152,224C1248,192,1344,128,1392,96L1440,64L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
        ></path>
      </svg>
      <AnimatedBox
        variants={containerAnimation}
        initial="hidden"
        animate="show"
        exit="hidden"
        className="content"
        bg="primary.200"
        width="100%"
        paddingBottom="40px"
        key="animted-box"
      >
        {children}
      </AnimatedBox>
    </AnimatePresence>
  );
};

export default USE_ANIMATION ? AnimatedBox : NormalBox;
