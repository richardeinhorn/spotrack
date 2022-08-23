import React from "react";
import OnboardingPage from "./pages/OnboardingPage";
import { ChakraProvider } from "@chakra-ui/react";
import theme from "./theme";

const App = () => {
  return (
    <ChakraProvider theme={theme}>
      <OnboardingPage />
    </ChakraProvider>
  );
};

export default App;
