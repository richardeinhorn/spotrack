import { Text } from "@chakra-ui/react";
import React from "react";

const CardTagline = ({ text }) => {
  return (
    <Text fontSize="xs" color="gray.500">
      {text}
    </Text>
  );
};

export default CardTagline;
