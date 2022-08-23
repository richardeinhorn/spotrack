import { extendTheme } from "@chakra-ui/react";

const colors = {
  primary: {
    800: "#008827",
    400: "#1DB954",
    200: "#62EC83",
  },
  secondary: {
    400: "#1DB7B9",
  },
  light: {
    400: "#ffffff",
  },
  dark: {
    400: "#191414",
  }
};

const theme = extendTheme({ colors });

export default theme;
