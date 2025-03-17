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
  Snackbar,
  Alert,
  CircularProgress,
  useMediaQuery,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { handleCpfChange, validateCPF } from "../utils";
import { handleLogin } from "../services";
import { AxiosError } from "axios";

const Login: React.FC = () => {
  const [cpf, setCpf] = useState("");
  const [password, setPassword] = useState("");
  const [errorCpf, setErrorCpf] = useState(false);
  const [errorPassword, setErrorPassword] = useState<boolean>(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarSeverity, setSnackbarSeverity] = useState<"success" | "error">(
    "success"
  );
  const isDesktop = useMediaQuery("(min-width: 768px)");

  const handleCheck = async () => {
    setLoading(true);
    const isValid = validateCPF(cpf);
    setErrorCpf(!isValid);

    if (isValid) {
      let cpfReplace = cpf.replace(/\D/g, ""); // Remove caracteres não numéricos do CPF
      try {
        const responseLogin = await handleLogin(cpfReplace, password);
        if (responseLogin) {
          navigate(`/checkin?cpf=${cpf}`);
        }
        setErrorPassword(false);
      } catch (error) {
        console.error("Erro ao fazer login:", error);

        // Captura a mensagem de erro do backend
        if (error instanceof AxiosError && error.response) {
          const { status, data } = error.response;

          if (status === 404) {
            setSnackbarMessage(data.message || "Usuário não encontrado.");
          } else if (status === 401) {
            setErrorPassword(true);
            setSnackbarMessage(data.message || "Senha incorreta.");
          } else {
            setSnackbarMessage("Erro ao fazer login. Tente novamente.");
          }
        } else {
          setSnackbarMessage("Erro ao conectar com o servidor.");
        }

        setSnackbarSeverity("error");
        setSnackbarOpen(true);
      } finally {
        setLoading(false);
      }
    } else {
      setLoading(false);
    }
  };

  const handlePassword = () => {
    console.log("Alterar senha");
  };

  const editaCpf = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCpf(handleCpfChange(e.target.value));
  };

  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
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
        <Toolbar
          sx={{
            justifyContent: { xs: "center", md: "center" },
          }}
        >
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
          display: { xs: "block", sm: "flex" },
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
            <Typography
              gutterBottom
              textAlign={{ xs: "center", md: "center" }}
              fontSize={isDesktop ? "2.5rem" : "1.5rem"}
            >
              Digite o seu CPF e senha do FlowPass para iniciar sessão
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
                width: { xs: "100%", md: "70%" },
                border: "1px solid lightgray", // Borda cinza claro
                borderRadius: "8px", // Cantos arredondados
                padding: "32px", // Espaçamento interno
              }}
            >
              <TextField
                label="Insira seu CPF"
                variant="outlined"
                fullWidth
                value={cpf}
                onChange={editaCpf}
                error={errorCpf}
                helperText={errorCpf ? "CPF inválido ou não encontrado." : ""}
                margin="dense"
                sx={{ marginBottom: "20px" }}
              />
              <TextField
                label="Insira sua senha"
                variant="outlined"
                fullWidth
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                error={errorPassword}
                helperText={errorPassword ? "Senha incorreta" : ""}
                margin="dense"
                type="password"
              />
              <Grid
                container
                sx={{
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <Grid item>
                  <Button
                    variant="contained"
                    sx={{
                      backgroundColor: "#26d07c",
                      marginTop: "15px",
                      "&:hover": { backgroundColor: "#1fa968" },
                      width: "100%",
                    }}
                    disabled={cpf.length !== 14 || !password}
                    onClick={handleCheck}
                  >
                    {loading ? (
                      <CircularProgress
                        sx={{
                          color: "white",
                        }}
                        size={24}
                      />
                    ) : (
                      "Iniciar sessão"
                    )}
                  </Button>
                </Grid>
                <Grid item>
                  <Button
                    variant="text"
                    sx={{
                      marginTop: "10px",
                      "&:hover": { backgroundColor: "#caffd2" },
                      width: "100%", // Botão com largura total
                      alignSelf: "flex-start",
                      color: "#021b1a",
                    }}
                    onClick={handlePassword}
                  >
                    Esqueceu a senha?
                  </Button>
                </Grid>
              </Grid>
            </Box>
          </Grid>
        </Grid>
        <Snackbar
          open={snackbarOpen}
          autoHideDuration={3000} // Fecha automaticamente após 6 segundos
          onClose={handleCloseSnackbar}
        >
          <Alert
            onClose={handleCloseSnackbar}
            severity={snackbarSeverity}
            sx={{ width: "100%" }}
          >
            {snackbarMessage}
          </Alert>
        </Snackbar>
      </Container>
    </>
  );
};

export default Login;
