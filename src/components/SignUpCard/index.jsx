import React from "react";
import { Square, Divider, Flex, Image, VStack } from "@chakra-ui/react";
import { motion } from "framer-motion";

// TODO: add loading messages

const itemAnimation = {
  hidden: { opacity: 0 },
  show: { opacity: 1 },
};

const SignUpCard = ({
  key,
  imageSrc,
  imageAlt,
  children,
  isActive = false,
}) => {
  const AnimatedFlex = motion(Flex);

  return (
    <AnimatedFlex
      key={key}
      bg="white"
      w="300px"
      boxShadow={isActive ? "2xl" : undefined}
      direction="column"
      style={{ borderRadius: 20, overflow: "hidden" }}
      variants={itemAnimation}
    >
      <Square h="300px" w="300px">
        <Image src={imageSrc} alt={imageAlt} />
      </Square>
      <Divider />
      <VStack flex="1" w="300px" padding="25px" align="flex-start">
        {children}
      </VStack>
    </AnimatedFlex>
  );
};

export default SignUpCard;
