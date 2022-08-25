import { Text } from "@chakra-ui/react";
import React from "react";

const CardTitle = ({ title, isCompleted, successMsg, isActive = false }) => {
  return (
    <Text
      fontSize="3xl"
      fontWeight="bold"
      color={isCompleted ? "secondary.600" : isActive ? "dark" : "gray.500"}
      lineHeight="1.3"
    >
      {isCompleted ? successMsg : title}
    </Text>
  );
};

export default CardTitle;
