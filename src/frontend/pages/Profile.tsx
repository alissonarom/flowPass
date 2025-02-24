/* eslint-disable */
/* prettier-ignore */

import React, { useState, useEffect } from 'react';
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
  Avatar,
  Select,
  SelectChangeEvent,
} from "@mui/material";
import { useNavigate, useSearchParams } from "react-router-dom";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import Chip from "@mui/material/Chip";
import Stack from "@mui/material/Stack";
import AddIcon from "@mui/icons-material/Add";
import { getUserProfileByCpf } from "../services/index";

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
  const [searchParams] = useSearchParams();
  const cpf = searchParams.get("cpf"); // Captura o CPF da URL
  const mockProfile = {
    name: "",
    birthDate: "",
    cpf: cpf,
    phone: "",
    gender: "",
    profile: "Usuário",
    history: [],
    penalties: [],
    list: [],
  };
  const navigate = useNavigate();
  const [profileData, setProfileData] = useState(mockProfile);
  const [newIncident, setNewIncident] = useState("");
  const [gender, setGender] = useState();
  const [errors, setErrors] = useState(!profileData.name || !profileData.profile);
  const [openModal, setOpenModal] = useState(false);
  const promotores = ["Promotor A", "Promotor B", "Promotor C", "Sem lista"];
  const [suspensionTime, setSuspensionTime] = useState<string>("");
  const [loading, setLoading] = useState(true);

  const handleChange = (field: string, value: string) => {
    setProfileData({ ...profileData, [field]: value });
    if (field == "gender") {
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

  // Função para lidar com a seleção do tempo de suspensão
  const handleSuspensionChange = (event: SelectChangeEvent<string>) => {
    setSuspensionTime(event.target.value as string);
  };

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        if (!cpf) throw new Error("CPF não informado");

        const profile = await getUserProfileByCpf(cpf); // Usa a função do serviço

        if (profile) {
          setProfileData(profile); // Define o perfil com os dados do backend
        } else {
          setProfileData(mockProfile); // Usa o mock se o usuário não for encontrado
        }
      } catch (error) {
        console.error("Erro ao buscar perfil do usuário:", error);
        setProfileData(mockProfile); // Usa o mock em caso de erro
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [cpf]);

  if (loading) {
    return <p>Carregando...</p>;
  }

  return (
    <div style={{ backgroundColor: "#EDEDED", minHeight: "100vh" }}>
      <AppBar
        position="static"
        sx={{
          backgroundColor: "#00df81",
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
          marginTop: "24px !important",
          justifyContent: "center",
          backgroundColor: "#EDEDED",
          alignItems: "center",
          gap: "24px",
        }}
      >
        {/* Chip dinâmico */}
        <Chip
          label={
            profileData.profile == "Promotor"
              ? `Promotor: ${profileData.name}`
              : lista == "Sem lista" || lista == ""
                ? "O usuário não está numa lista"
                : `LISTA: ${lista}`
          }
          avatar={
            profileData.profile == "Promotor" ? (
              <Avatar src="./flowpass-favicon.png" />
            ) : undefined
          }
          color={
            profileData.profile == "Promotor"
              ? "default"
              : lista == "Sem lista" || lista == ""
                ? "warning"
                : "primary"
          }
          sx={{ width: "40%", justifyContent: "flex-start" }}
          size="medium"
        />

        {/* Botão de adicionar (aparece apenas se a lista estiver vazia) */}
        {profileData.profile == "Promotor" ? undefined : lista == "Sem lista" ||
          lista == "" ? (
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
        {profileData.profile == "Promotor" && (
          <Box
            sx={{
              flexDirection: "row",
              display: "flex",
              justifyContent: "center",
            }}
          >
            <Typography
              variant="h6"
              gutterBottom
              sx={{ display: "block", color: "#03624c" }}
            >
              R$
            </Typography>
            <Typography
              variant="h3"
              gutterBottom
              sx={{ display: "block", color: "#03624c" }}
            >
              4,20
            </Typography>
          </Box>
        )}
        {/* Modal para seleção de promotor */}
        <Modal open={openModal} onClose={handleCloseModal}>
          <Box sx={modalStyle}>
            <Typography variant="h6" gutterBottom>
              Selecione uma Lista
            </Typography>
            <List>
              {promotores.map((promoter, index) => (
                <ListItem
                  component="li"
                  key={index}
                  onClick={() => handleSelectPromoter(promoter)}
                  sx={{
                    cursor: "pointer", // Cursor pointer para indicar que é clicável
                    "&:hover": {
                      backgroundColor: "#CAFFD2", // Cor de fundo ao passar o mouse
                    },
                  }}
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
            {profileData.history ? (
              profileData.history.map((entry:any, index) => (
                <ListItem key={index}>
                  <ListItemText
                    primary={`${entry.date} às ${entry.time}`}
                    secondary={entry.event}
                  />
                </ListItem>
              ))
            ) : (
              <Typography variant="h6" gutterBottom>
                Sem histórico
              </Typography>
            )}
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
          <Box sx={{ marginTop: "20px" }}>
            <Typography variant="body1" gutterBottom>
              Selecionar Tempo de Suspensão:
            </Typography>
            <Select
              value={suspensionTime}
              onChange={handleSuspensionChange}
              displayEmpty
              fullWidth
              sx={{ marginBottom: "20px" }}
            >
              <MenuItem value="" disabled>
                Selecione um tempo
              </MenuItem>
              <MenuItem value="15 dias">15 dias</MenuItem>
              <MenuItem value="30 dias">30 dias</MenuItem>
              <MenuItem value="3 meses">3 meses</MenuItem>
              <MenuItem value="6 meses">6 meses</MenuItem>
            </Select>
          </Box>
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
