/* eslint-disable */
/* prettier-ignore */

import React from 'react';
import { CssBaseline, ThemeProvider } from "@mui/material";
import { BrowserRouter as Router, Route } from "react-router-dom";
import { Routes } from "react-router";
import theme from "./styles/theme";
import Login from "./pages/Login";
import Profile from "./pages/Profile";
import CriarLista from "./pages/CriarLista";
import Checkin from "./pages/Checkin";

const App: React.FC = () => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/checkin" element={<Checkin />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/criarLista" element={<CriarLista />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
};

export default App;
