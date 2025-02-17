/* eslint-disable */
/* prettier-ignore */

import React from 'react';
import { CssBaseline, ThemeProvider } from "@mui/material";
import { BrowserRouter as Router, Route } from "react-router-dom";
import { Routes } from "react-router";
import theme from "./styles/theme";
import Login from "./pages/Login";
import Profile from "./pages/Profile";

const App: React.FC = () => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/profile" element={<Profile />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
};

export default App;
