import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    primary: {
      main: "#26d07c", // Cor principal (verde)
    },
    secondary: {
      main: "#dc004e", // Cor secundária (vermelho)
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
  },
});

export default theme;
