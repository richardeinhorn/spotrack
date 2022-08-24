import React from "react";
import { Square, Divider, Flex, Image, VStack } from "@chakra-ui/react";

// TODO: Add transition on first load (spaced slideFade: https://chakra-ui.com/docs/components/transitions)
// TODO: Add tooltips with explanation for email: https://chakra-ui.com/docs/components/tooltip
// TODO: use spinners to indicate loading: https://chakra-ui.com/docs/components/spinner
// TODO: add fun loading messages

const SignUpCard = ({ imageSrc, imageAlt, children, isActive = false }) => {
  return (
    <Flex
      bg="white"
      w="300px"
      boxShadow={isActive ? '2xl' : undefined}
      direction="column"
      style={{ borderRadius: 20, overflow: "hidden" }}
    >
      <Square h="300px" w="300px">
        <Image src={imageSrc} alt={imageAlt} />
      </Square>
      <Divider />
      <VStack flex="1" w="300px" padding="25px" align="flex-start">
        {children}
      </VStack>
    </Flex>
  );
};

export default SignUpCard;
