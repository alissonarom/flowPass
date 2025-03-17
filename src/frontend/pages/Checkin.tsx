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
  Tooltip,
  IconButton,
  Menu,
  MenuItem,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import {
  getUserFromLocalStorage,
  handleCpfChange,
  useLogout,
  validateCPF,
} from "../utils";
import QrCodeReader from "../components";
import QrCodeIcon from "@mui/icons-material/QrCode";
import MenuIcon from "@mui/icons-material/Menu";
import useMediaQuery from "@mui/material/useMediaQuery";
import { AccountCircle } from "@mui/icons-material";

const Checkin: React.FC = () => {
  const [cpf, setCpf] = useState("");
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const user = getUserFromLocalStorage();
  const settings = ["Perfil", "Logout"];
  const [anchorElUser, setAnchorElUser] = React.useState<null | HTMLElement>(
    null
  );
  const [showScanner, setShowScanner] = useState(false);
  const isDesktop = useMediaQuery("(min-width: 768px)");

  const isUserId = user?.client_id === "amorChurch";

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

  const handleOpenUserMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElUser(event.currentTarget);
  };

  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };

  const logout = useLogout();

  return (
    <>
      {/* Barra superior */}
      <AppBar
        position="static"
        sx={{
          backgroundColor: "#00df81",
          height: "65px",
          justifyContent: "center",
          paddingInline: { xl: 10, md: 5, sm: "20px" },
        }}
      >
        <Toolbar
          sx={{
            justifyContent: "space-between",
            paddingInline: { xl: 10, md: 5, sm: 0 },
          }}
        >
          <Box
            component="img"
            src="/logo-top-bar-bco.png"
            alt="Logo"
            sx={{
              width: "120px",
              height: "45px",
              marginRight: { xs: "10px", sm: "20px" }, // Estilo responsivo
            }}
          />

          <Box sx={{ flexGrow: 0 }} flexDirection="row" display={"flex"}>
            {isDesktop && (
              <Typography variant="h6" sx={{ marginRight: "20px" }}>
                {user?.name}
              </Typography>
            )}
            <Tooltip title="Open settings">
              <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
                {isDesktop ? <AccountCircle /> : <MenuIcon />}
              </IconButton>
            </Tooltip>
            <Menu
              sx={{ mt: "45px" }}
              id="menu-appbar"
              anchorEl={anchorElUser}
              anchorOrigin={{
                vertical: "top",
                horizontal: "right",
              }}
              keepMounted
              transformOrigin={{
                vertical: "top",
                horizontal: "right",
              }}
              open={Boolean(anchorElUser)}
              onClose={handleCloseUserMenu}
            >
              {settings.map((setting) => (
                <MenuItem
                  key={setting}
                  onClick={() => {
                    if (setting === "Logout") {
                      logout(); // Chama a função logout
                    } else {
                      handleCloseUserMenu(); // Chama a função handleCloseUserMenu
                    }
                  }}
                >
                  <Typography sx={{ textAlign: "center" }}>
                    {setting}
                  </Typography>
                </MenuItem>
              ))}
            </Menu>
          </Box>
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
              {isUserId
                ? "Entre com as credenciais para confirmar presença"
                : "Digite o CPF para fazer o check-in"}
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
                  flexDirection: "column",
                  alignItems: "center",
                }}
              >
                <Grid width={"100%"}>
                  <Button
                    variant="contained"
                    sx={{
                      backgroundColor: "#26d07c",
                      marginTop: "20px",
                      "&:hover": { backgroundColor: "#1fa968" },
                      width: "100%", // Botão com largura total
                      alignSelf: "flex-start",
                    }}
                    disabled={cpf.length !== 14 || loading}
                    onClick={handleCheck}
                  >
                    {loading ? "Verificando..." : "Checar"}
                  </Button>
                </Grid>
                <Grid width={"100%"}>
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
                    {isUserId ? "Gerenciar aulas" : "Gerenciar listas"}
                  </Button>
                </Grid>
                {!isDesktop && isUserId && (
                  <Grid width={"100%"}>
                    <Button
                      variant="contained"
                      sx={{
                        backgroundColor: "#26d07c",
                        marginTop: "20px",
                        "&:hover": { backgroundColor: "#1fa968" },
                        width: "100%", // Botão com largura total
                        alignSelf: "flex-start",
                      }}
                      onClick={() => setShowScanner(true)}
                      startIcon={<QrCodeIcon />}
                    >
                      Ler QR Code
                    </Button>
                  </Grid>
                )}
              </Grid>
              {showScanner && (
                <div>
                  <QrCodeReader />
                  <Button
                    variant="outlined"
                    sx={{ marginTop: "10px", width: "100%" }}
                    onClick={() => setShowScanner(false)} // Fecha o leitor
                  >
                    Cancelar
                  </Button>
                </div>
              )}
            </Box>
          </Grid>
        </Grid>
      </Container>
    </>
  );
};

export default Checkin;
