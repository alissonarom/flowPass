/* eslint-disable */
/* prettier-ignore */

import React, { useState } from "react";
import {
  AppBar,
  Toolbar,
  Container,
  Typography,
  TextField,
  Button,
  Box,
  Grid,
} from "@mui/material";
import { useNavigate } from "react-router-dom";

const Login: React.FC = () => {
  const [cpf, setCpf] = useState("");
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Validação de CPF local
  const validateCPF = (cpf: string): boolean => {
    cpf = cpf.replace(/\D/g, ""); // Remove não numéricos

    if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) return false;

    let sum = 0;
    for (let i = 0; i < 9; i++) sum += parseInt(cpf[i]) * (10 - i);
    let remainder = (sum * 10) % 11;
    if (remainder === 10 || remainder === 11) remainder = 0;
    if (remainder !== parseInt(cpf[9])) return false;

    sum = 0;
    for (let i = 0; i < 10; i++) sum += parseInt(cpf[i]) * (11 - i);
    remainder = (sum * 10) % 11;
    if (remainder === 10 || remainder === 11) remainder = 0;
    if (remainder !== parseInt(cpf[10])) return false;

    return true;
  };

  const handleCheck = () => {
    const isValid = validateCPF(cpf);
    setError(!isValid);
    if (isValid) {
      navigate("/profile");
    }
  };
  const handleLista = () => {
    navigate("/CriarLista");
  };

  const handleCpfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, ""); // Remove todos os caracteres não numéricos
    if (value.length <= 3) {
      value = value.replace(/(\d{1,3})/, "$1");
    } else if (value.length <= 6) {
      value = value.replace(/(\d{3})(\d{1,3})/, "$1.$2");
    } else if (value.length <= 9) {
      value = value.replace(/(\d{3})(\d{3})(\d{1,3})/, "$1.$2.$3");
    } else {
      value = value.replace(/(\d{3})(\d{3})(\d{3})(\d{1,2})/, "$1.$2.$3-$4");
    }
    setCpf(value);
  };

  return (
    <>
      {/* Barra superior */}
      <AppBar
        position="static"
        sx={{
          backgroundColor: "#00df81",
          height: "65px",
          justifyContent: "center",
          paddingInline: 10,
        }}
      >
        <Toolbar>
          <img
            src="/logo-top-bar-bco.png"
            alt="Logo"
            style={{ width: "120px", height: "45px" }}
          />
        </Toolbar>
      </AppBar>

      {/* Corpo */}
      <Container
        sx={{
          display: "flex",
          justifyContent: "center",
          height: "calc(100vh - 65px)",
          padding: 2,
        }}
      >
        <Grid container spacing={2} alignItems="center">
          {/* Coluna 1: Typography */}
          <Grid
            item
            xs={12}
            md={6}
            sx={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Typography variant="h4" gutterBottom>
              Digite o CPF para fazer o check-in
            </Typography>
          </Grid>

          {/* Coluna 2: Box com campo de CPF e botão */}
          <Grid
            item
            xs={12}
            md={6}
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <Box
              sx={{
                width: "70%",
                border: "1px solid lightgray", // Borda cinza claro
                borderRadius: "8px", // Cantos arredondados
                padding: "32px", // Espaçamento interno
              }}
            >
              <TextField
                label="Insira um CPF"
                variant="outlined"
                fullWidth
                value={cpf}
                onChange={handleCpfChange}
                error={error}
                helperText={error ? "CPF inválido ou não encontrado." : ""}
              />

              {/* Botão "Checar" dentro do Box */}
              <Button
                variant="contained"
                sx={{
                  backgroundColor: "#26d07c",
                  marginTop: "20px",
                  "&:hover": { backgroundColor: "#1fa968" },
                  width: "60%", // Botão com largura total
                  alignSelf: "flex-start",
                }}
                disabled={cpf.length !== 14 || loading}
                onClick={handleCheck}
              >
                {loading ? "Verificando..." : "Checar"}
              </Button>

              <Button
                variant="contained"
                sx={{
                  backgroundColor: "#26d07c",
                  marginTop: "20px",
                  "&:hover": { backgroundColor: "#1fa968" },
                  width: "60%", // Botão com largura total
                  alignSelf: "flex-start",
                }}
                onClick={handleLista}
              >
                Criar Lista
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Container>
    </>
  );
};

export default Login;
