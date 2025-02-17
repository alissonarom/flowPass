/* eslint-disable */
/* prettier-ignore */

import React, { useState } from 'react';
import {
  Container,
  Typography,
  Box,
  Button,
  List,
  ListItem,
  ListItemText,
  AppBar,
  Toolbar,
  IconButton,
  Grid,
  TextField,
  MenuItem,
  TextareaAutosize,
  Modal,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import Chip from "@mui/material/Chip";
import Stack from "@mui/material/Stack";
import AddIcon from "@mui/icons-material/Add";

const modalStyle = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 300,
  bgcolor: "background.paper",
  boxShadow: 24,
  p: 4,
  borderRadius: "8px",
};

const Profile: React.FC = () => {
  const [lista, setLista] = useState<string>("");
  const mockProfile = {
    name: "João Silva",
    birthDate: "",
    cpf: "529.982.247-25",
    phone: "(11) 98765-4321",
    gender: "",
    profile: "Usuário",
    history: [
      { date: "10/10/2023", time: "22:30", event: "Festa de Aniversário" },
      { date: "25/09/2023", time: "23:15", event: "Show de Rock" },
    ],
    penalties: [{ reason: "Comportamento inadequado", duration: "30 dias" }],
    list: lista,
  };
  const navigate = useNavigate();
  const [profileData, setProfileData] = useState(mockProfile);
  const [newIncident, setNewIncident] = useState("");
  const [gender, setGender] = useState(mockProfile.gender);
  const [errors, setErrors] = useState(!gender);
  const [openModal, setOpenModal] = useState(false);
  const promotores = ["Promotor A", "Promotor B", "Promotor C", "Sem lista"];

  const handleChange = (field: string, value: string) => {
    setProfileData({ ...profileData, [field]: value });
    if (field == "gender") {
      setGender(value);
      setErrors(false);
    }
  };

  const handleSave = () => {
    // Validação de campos obrigatórios
    if (mockProfile.profile === "") {
      setErrors(true);
      return;
    }

    // Lógica para salvar as alterações (substitua por chamada à API)
    console.log("Dados salvos:", profileData);
    if (newIncident) {
      console.log("Novo incidente adicionado:", newIncident);
    }
    alert("Dados salvos com sucesso!");
  };

  const handleOpenModal = () => {
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
  };

  const handleSelectPromoter = (promoter: string) => {
    setLista(promoter); // Atualiza o estado com o promotor selecionado
    handleCloseModal(); // Fecha o modal
  };

  return (
    <div style={{ backgroundColor: "#EDEDED" }}>
      <AppBar
        position="static"
        sx={{
          backgroundColor: "#26d07c",
          height: "65px",
          justifyContent: "center",
        }}
      >
        <Toolbar>
          <IconButton onClick={() => navigate("/")} sx={{ color: "white" }}>
            <ArrowBackIcon />
          </IconButton>
          <img
            src="/logo-top-bar-bco.png"
            alt="Logo"
            style={{ width: "120px", height: "45px", marginLeft: "40px" }}
          />
        </Toolbar>
      </AppBar>
      <Stack
        direction="row"
        sx={{
          marging: "10px",
          height: "55px",
          justifyContent: "center",
          backgroundColor: "#EDEDED",
          alignItems: "center",
          gap: "10px",
        }}
      >
        {/* Chip dinâmico */}
        <Chip
          label={
            lista == "Sem lista" || lista == ""
              ? "O usuário não está numa lista"
              : `LISTA: ${lista}`
          }
          color={lista == "Sem lista" || lista == "" ? "warning" : "primary"}
          sx={{ width: "50%", justifyContent: "flex-start" }}
        />

        {/* Botão de adicionar (aparece apenas se a lista estiver vazia) */}
        {lista == "Sem lista" || lista == "" ? (
          <IconButton
            onClick={handleOpenModal}
            sx={{
              color: "white",
              backgroundColor: "#ed6c02",
              "&:hover": { backgroundColor: "#f3862d" },
            }}
          >
            <AddIcon />
          </IconButton>
        ) : (
          <Button
            variant="contained"
            sx={{
              backgroundColor: "#26d07c",
              borderRadius: "25px",
              "&:hover": {
                backgroundColor: "#1fa968",
              },
            }}
            onClick={handleOpenModal}
          >
            Editar
          </Button>
        )}

        {/* Modal para seleção de promotor */}
        <Modal open={openModal} onClose={handleCloseModal}>
          <Box sx={modalStyle}>
            <Typography variant="h6" gutterBottom>
              Selecione um Promotor
            </Typography>
            <List>
              {promotores.map((promoter, index) => (
                <ListItem
                  component="li"
                  key={index}
                  onClick={() => handleSelectPromoter(promoter)}
                >
                  <ListItemText primary={promoter} />
                </ListItem>
              ))}
            </List>
          </Box>
        </Modal>
      </Stack>
      <Container
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "20px",
          backgroundColor: "#EDEDED",
        }}
      >
        {/* Card de Dados Pessoais */}
        <Box
          sx={{
            width: "100%",
            maxWidth: "800px",
            backgroundColor: "white",
            borderRadius: "8px",
            boxShadow: 3,
            padding: "20px",
            marginBottom: "20px",
          }}
        >
          <Typography variant="h6" gutterBottom>
            Dados Pessoais
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <TextField
                label="Nome"
                value={profileData.name}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  handleChange("name", e.target.value)
                }
                fullWidth
                margin="normal"
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                label="CPF"
                value={profileData.cpf}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  handleChange("cpf", e.target.value)
                }
                fullWidth
                disabled
                margin="normal"
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                label="Data de Nascimento"
                value={profileData.birthDate}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  handleChange("birthDate", e.target.value)
                }
                fullWidth
                margin="normal"
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                label="Celular"
                value={profileData.phone}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  handleChange("phone", e.target.value)
                }
                fullWidth
                margin="normal"
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                select
                label="Gênero"
                value={profileData.gender}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  handleChange("gender", e.target.value)
                }
                fullWidth
                error={!gender}
                helperText={mockProfile.gender ? "" : "Campo obrigatório"}
                margin="normal"
              >
                <MenuItem value="Promotor">Masculino</MenuItem>
                <MenuItem value="Usuário">Feminino</MenuItem>
                <MenuItem value="Funcionário">Não opinar</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={6}>
              <TextField
                select
                label="Perfil"
                value={profileData.profile}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  handleChange("profile", e.target.value)
                }
                fullWidth
                margin="normal"
              >
                <MenuItem value="Promotor">Promotor</MenuItem>
                <MenuItem value="Usuário">Usuário</MenuItem>
                <MenuItem value="Funcionário">Funcionário</MenuItem>
              </TextField>
            </Grid>
          </Grid>
        </Box>

        {/* Card de Histórico de Entradas */}
        <Box
          sx={{
            width: "100%",
            maxWidth: "800px",
            backgroundColor: "white",
            borderRadius: "8px",
            boxShadow: 3,
            padding: "20px",
            marginBottom: "20px",
          }}
        >
          <Typography variant="h6" gutterBottom>
            Histórico de Entradas
          </Typography>
          <List>
            {profileData.history.map((entry, index) => (
              <ListItem key={index}>
                <ListItemText
                  primary={`${entry.date} às ${entry.time}`}
                  secondary={entry.event}
                />
              </ListItem>
            ))}
          </List>
          <TextareaAutosize
            minRows={3}
            placeholder="Adicionar novo incidente"
            value={newIncident}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
              setNewIncident(e.target.value)
            }
            style={{ width: "100%", padding: "10px", marginTop: "10px" }}
          />
        </Box>

        {/* Botão Salvar */}
        <Button
          variant="contained"
          disabled={errors}
          sx={{
            backgroundColor: "#26d07c",
            marginTop: "20px",
            "&:hover": {
              backgroundColor: "#1fa968",
            },
          }}
          onClick={handleSave}
        >
          Salvar
        </Button>
      </Container>
    </div>
  );
};

export default Profile;
