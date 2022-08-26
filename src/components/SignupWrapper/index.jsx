import React from "react";
import { Box, Spinner } from "@chakra-ui/react";

const SignupWrapper = ({ children, isLoading }) => {
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
        {isLoading ? <Spinner /> : children}
      </Box>
    </>
  );
};

export default SignupWrapper;
