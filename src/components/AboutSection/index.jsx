import React from "react";
import { VStack, Divider, Text } from '@chakra-ui/react'

const AboutSection = () => {
  return (
    <VStack maxWidth={700} border="none" margin="10px auto 30px auto">
      <Divider marginBottom={5} bg="black" />
      <Text textAlign="center" fontSize="l">
        Spotrack records your Spotify listening to your Google calendar. Travel
        through time and discover what songs you listened to at every moment.
      </Text>
      {/* <a href="https://github.com/richardeinhorn/spotrack">
        <img
          alt="GitHub"
          src="https://img.shields.io/badge/Github-open--source--repository-green?logo=github&style=for-the-badge"
        />
      </a> */}
    </VStack>
  );
};

export default AboutSection;
