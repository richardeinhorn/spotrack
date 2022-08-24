import { extendTheme } from "@chakra-ui/react";

const colors = {
  primary: {
    800: "#008827",
    400: "#1DB954",
    200: "#62EC83",
  },
  secondary: {
    800: "#14A496",
    600: "#1DB7B9",
    400: "#1AD3C0",
    200: "#60EBDD",
  },
  light: "#ffffff",
  dark: "#191414",
};

const theme = extendTheme({ colors });

export default theme;
