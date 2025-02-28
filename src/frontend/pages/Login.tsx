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
import { handleCpfChange, validateCPF } from "../utils";

const Login: React.FC = () => {
  const [cpf, setCpf] = useState("");
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleCheck = () => {
    const isValid = validateCPF(cpf);
    setError(!isValid);
    if (isValid) {
      navigate(`/profile?cpf=${cpf}`);
    }
  };

  const handleLista = () => {
    navigate("/CriarLista");
  };
  const editaCpf = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCpf(handleCpfChange(e.target.value));
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
                onChange={editaCpf}
                error={error}
                helperText={error ? "CPF inválido ou não encontrado." : ""}
              />
              <Grid
                container
                sx={{
                  display: "flex",
                  flexDirection: "row",
                  alignItems: "center",
                }}
              >
                <Grid item xs={6}>
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
                </Grid>
                <Grid item xs={6}>
                  <Button
                    variant="text"
                    sx={{
                      marginTop: "20px",
                      "&:hover": { backgroundColor: "#caffd2" },
                      width: "100%", // Botão com largura total
                      alignSelf: "flex-start",
                      color: "#021b1a",
                    }}
                    onClick={handleLista}
                  >
                    Criar Lista
                  </Button>
                </Grid>
              </Grid>
            </Box>
          </Grid>
        </Grid>
      </Container>
    </>
  );
};

export default Login;
