import { Button } from "@chakra-ui/react";
import React from "react";

// TODO: add button styles, including on hover and disabled states

const CardButton = ({ label, onClick, icon, isLoading, ...buttonProps }) => {
  return (
    <Button
      isLoading={isLoading}
      onClick={onClick}
      leftIcon={icon}
      bg="secondary.600"
      _hover={{ bg: "secondary.800" }}
      size="lg"
      variant="solid"
      color="white"
      textTransform="uppercase"
      style={{ margin: "30px 0px" }}
      width="100%"
      {...buttonProps}
    >
      {label}
    </Button>
  );
};

export default CardButton;
