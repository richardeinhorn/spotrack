import React from "react";
import OnboardingPage from "./pages/OnboardingPage";
import { ChakraProvider } from "@chakra-ui/react";
import theme from "./theme";
import { UserContextProvider } from "./contexts/UserContext";

const App = () => {
  return (
    <ChakraProvider theme={theme}>
      <UserContextProvider>
        <OnboardingPage />
      </UserContextProvider>
    </ChakraProvider>
  );
};

export default App;
