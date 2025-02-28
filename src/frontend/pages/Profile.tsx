/* eslint-disable */
/* prettier-ignore */

import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Button,
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
  Snackbar,
  Alert,
  Select,
  SelectChangeEvent,
  CircularProgress,
  ListItemIcon,
  List as MuiList,
} from "@mui/material";
import { useNavigate, useSearchParams } from "react-router-dom";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import Chip from "@mui/material/Chip";
import Stack from "@mui/material/Stack";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import ErrorIcon from "@mui/icons-material/Error";
import {
  createOrUpdateUser,
  getLists,
  getUserProfileByCpf,
} from "../services/index";
import {
  IPenalty,
  IUser,
  PenaltyDuration,
  UserProfile,
  UserPromotorProfile,
  List,
  IListHistory,
} from "../types";
import { DatePicker } from "@mui/x-date-pickers";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { ptBR } from "date-fns/locale";
import { calculateEndDate, formatPhoneNumber } from "../utils";
import { Decimal128 } from "bson";

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
  const [lista, setLista] = useState<List[]>([]);
  const [searchParams] = useSearchParams();
  const cpf = (searchParams.get("cpf") || "").replace(/\D/g, "");
  const navigate = useNavigate();
  const [profileData, setProfileData] = useState<IUser>({
    name: "",
    cpf: cpf,
    birthDate: null,
    phone: "",
    gender: "",
    profile: UserProfile.Common,
    anniversary: false,
    history: [],
    penalties: [],
    currentLists: "",
    cash: new Decimal128("0"),
  });
  const [newIncident, setNewIncident] = useState("");
  const [errors, setErrors] = useState(
    profileData.name == "" || profileData.gender == ""
  );
  const [openModal, setOpenModal] = useState(false);
  const [suspensionTime, setSuspensionTime] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState<"success" | "error">(
    "success"
  );

  const handleAddIncident = () => {
    if (!newIncident || !suspensionTime) {
      alert("Preencha todos os campos do incidente.");
      return;
    }

    const newPenalty: IPenalty = {
      observation: newIncident,
      duration: suspensionTime as PenaltyDuration,
      startDate: new Date().toISOString(),
    };

    setProfileData((prevProfileData) => ({
      ...prevProfileData,
      penalties: [...prevProfileData.penalties, newPenalty],
    }));

    setNewIncident("");
    setSuspensionTime("");
  };

  const handleChange = (field: string, value: string | null | Date) => {
    let formattedValue = value;

    // Formata a data para o padrão ISO (backend espera "1990-01-15T00:00:00.000Z")
    if (field === "birthDate" && value instanceof Date) {
      formattedValue = value.toISOString(); // Converte para o formato ISO
    }

    // Atualiza o estado com o valor formatado
    setProfileData({ ...profileData, [field]: formattedValue });
  };

  const handleOpenModal = () => {
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
  };

  const handleSelectList = (id: string) => {
    // Atualiza o estado profileData
    setProfileData((prevProfileData) => ({
      ...prevProfileData,
      currentLists: id, // Adiciona o ID da lista
      history: [
        ...prevProfileData.history,
        {
          listId: id, // ID da lista
          name: lista.find((list) => list._id === id)?.title || "", // Adiciona o nome da lista
          joinedAt: new Date(), // Data de entrada
          leftAt: lista.find((list) => list._id === id)?.endDate, // Data de saída (indefinida por enquanto)
        },
      ],
      profile: UserProfile.Common, // Ou outro perfil, se necessário
    }));

    // Fecha o modal
    handleCloseModal();
  };

  const handleRemoveFromList = () => {
    setProfileData((prevProfileData) => {
      // Verifica se o usuário está em uma lista
      if (prevProfileData.currentLists) {
        return prevProfileData; // Retorna sem alterações se não estiver em uma lista
      }

      // Atualiza o histórico para registrar a saída da lista
      const updatedHistory = prevProfileData.history.map((entry) => {
        if (entry.listId === prevProfileData.currentLists && !entry.leftAt) {
          return { ...entry, leftAt: new Date() }; // Adiciona a data de saída
        }
        return entry;
      });

      // Retorna o novo estado
      return {
        ...prevProfileData,
        currentLists: "", // Limpa a lista atual
        history: updatedHistory, // Atualiza o histórico
      };
    });
  };

  const handleSaveUser = async () => {
    console.log("Salvando usuário:", profileData);
    try {
      const user = await createOrUpdateUser(profileData);

      // Exibe mensagem de sucesso
      setSnackbarMessage("Usuário salvo com sucesso!");
      setSnackbarSeverity("success");
      setSnackbarOpen(true);
    } catch (error) {
      console.error("Erro ao salvar/atualizar usuário:", error);

      // Exibe mensagem de erro
      setSnackbarMessage("Erro ao salvar usuário. Tente novamente.");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
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
        }
      } catch (error) {
        console.error("Erro ao buscar perfil do usuário:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [cpf]);

  useEffect(() => {
    setErrors(profileData.name === "" || profileData.gender === "");
  }, [profileData]);

  useEffect(() => {
    const fetchLists = async () => {
      try {
        const data = await getLists();
        setLista(data);
      } catch (error) {
        console.error("Erro ao carregar listas:", error);
      }
    };

    fetchLists();
  }, []);

  return (
    <div style={{ backgroundColor: "#EDEDED", minHeight: "100vh" }}>
      <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ptBR}>
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
        <Box
          width="100%"
          display="flex"
          alignItems="center"
          justifyContent="center"
          marginTop={{ xs: "65px", md: "30px" }}
          flexDirection={{ xs: "column", md: "column" }}
          sx={{
            backgroundColor: "#EDEDED",
          }}
        >
          {loading ? (
            <CircularProgress style={{ color: "#00df81" }} size={64} />
          ) : (
            <>
              <Stack
                direction="row"
                sx={{
                  justifyContent: "space-between",
                  backgroundColor: "#EDEDED",
                  alignItems: "center",
                  gap: "10px",
                }}
              >
                {/* Chip dinâmico */}
                <Chip
                  label={
                    profileData.profile == UserProfile.Promoter
                      ? `Promotor: ${profileData.name}`
                      : profileData.currentLists.length === 0
                        ? "O usuário não está numa lista"
                        : `LISTA: ${lista.find((list) => list._id === profileData.currentLists)?.title}`
                  }
                  color={
                    profileData.profile == UserProfile.Promoter ||
                    profileData.currentLists.length > 0
                      ? "primary"
                      : "warning"
                  }
                  sx={{
                    width: "100%",
                    justifyContent: "flex-start",
                    minWidth: "250px",
                    color: "white",
                  }}
                  size="medium"
                />

                {/* Botão de adicionar (aparece apenas se a lista estiver vazia) */}
                {profileData.profile ==
                UserProfile.Promoter ? undefined : !profileData.currentLists
                    .length ? (
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
                  <IconButton
                    onClick={handleOpenModal}
                    sx={{
                      color: "white",
                      backgroundColor: "#26d07c",
                      "&:hover": {
                        backgroundColor: "#1fa968",
                      },
                    }}
                  >
                    <EditIcon />
                  </IconButton>
                )}
                {profileData.profile !== UserPromotorProfile.Promoter &&
                profileData.currentLists.length ? (
                  <IconButton
                    onClick={handleRemoveFromList} // Chama a função para remover da lista
                    sx={{
                      color: "white",
                      backgroundColor: "#26d07c",
                      "&:hover": {
                        backgroundColor: "#1fa968",
                      },
                    }}
                  >
                    <DeleteIcon />
                  </IconButton>
                ) : undefined}
                {profileData.profile == UserPromotorProfile.Promoter && (
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
                    {lista.length ? (
                      <MuiList>
                        {lista.map((listas, index) => (
                          <ListItem
                            component="li"
                            key={index}
                            onClick={() => handleSelectList(listas._id)}
                            sx={{
                              cursor: "pointer", // Cursor pointer para indicar que é clicável
                              "&:hover": {
                                backgroundColor: "#CAFFD2", // Cor de fundo ao passar o mouse
                              },
                            }}
                          >
                            <ListItemText primary={listas.title} />
                          </ListItem>
                        ))}
                      </MuiList>
                    ) : (
                      <Typography
                        variant="subtitle2"
                        sx={{ color: "grey" }}
                        gutterBottom
                      >
                        Não há listas cadastradas
                      </Typography>
                    )}
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
                        error={profileData.name ? false : true}
                        helperText={profileData.name ? "" : "Campo obrigatório"}
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
                      <DatePicker
                        sx={{ minWidth: "100%", marginTop: "16px" }}
                        label="Data de Nascimento"
                        value={
                          profileData.birthDate
                            ? new Date(profileData.birthDate) // Converte a string ISO para Date
                            : null // Caso não haja data definida
                        }
                        onChange={
                          (date: Date | null) => handleChange("birthDate", date) // Passa o objeto Date diretamente
                        }
                      />
                    </Grid>
                    <Grid item xs={6}>
                      <TextField
                        label="Celular"
                        value={formatPhoneNumber(profileData.phone)}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                          handleChange(
                            "phone",
                            e.target.value.replace(/\D/g, "")
                          )
                        }
                        placeholder="(43) 9 9999-9999"
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
                        error={profileData.gender ? false : true}
                        helperText={
                          profileData.gender ? "" : "Campo obrigatório"
                        }
                        margin="normal"
                      >
                        <MenuItem value="Feminino">Feminino</MenuItem>
                        <MenuItem value="Masculino">Masculino</MenuItem>
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
                        error={profileData.profile ? false : true}
                        helperText={
                          profileData.profile ? "" : "Campo obrigatório"
                        }
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
                  <MuiList>
                    {profileData.history.length ? (
                      profileData.history.map(
                        (entry: IListHistory, index: number) => (
                          <ListItem key={index}>
                            <ListItemText
                              primary={entry.name}
                              secondary={entry.joinedAt.toLocaleDateString()}
                            />
                          </ListItem>
                        )
                      )
                    ) : (
                      <Typography
                        variant="subtitle1"
                        sx={{ color: "grey" }}
                        gutterBottom
                      >
                        Sem histórico de entradas
                      </Typography>
                    )}
                  </MuiList>
                </Box>

                {/* Card histórico de Incidentes */}
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
                    Histórico de incidentes
                  </Typography>
                  <MuiList>
                    {profileData.penalties.length ? (
                      profileData.penalties.map(
                        (entry: IPenalty, index: number) => (
                          <ListItem key={index}>
                            <ListItemIcon>
                              <ErrorIcon />
                            </ListItemIcon>
                            <ListItemText
                              primary={
                                <>
                                  Suspenso por <strong>{entry.duration}</strong>{" "}
                                  - Termina em{" "}
                                  <strong>
                                    {calculateEndDate(
                                      entry
                                    ).toLocaleDateString()}
                                  </strong>
                                </>
                              }
                              secondary={entry.observation}
                            />
                          </ListItem>
                        )
                      )
                    ) : (
                      <Typography
                        variant="subtitle1"
                        sx={{ color: "grey" }}
                        gutterBottom
                      >
                        Sem incidentes
                      </Typography>
                    )}
                  </MuiList>
                </Box>

                {/* Card adicionar novo Incidentes */}
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
                    Adicionar incidentes
                  </Typography>

                  <TextareaAutosize
                    minRows={3}
                    placeholder="Descreva o que aconteceu"
                    value={newIncident}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                      setNewIncident(e.target.value)
                    }
                    style={{
                      width: "100%",
                      padding: "10px",
                      marginTop: "10px",
                    }}
                  />
                  <Box sx={{ marginTop: "20px" }}>
                    <Select
                      value={suspensionTime}
                      onChange={handleSuspensionChange}
                      displayEmpty
                      fullWidth
                      sx={{ marginBottom: "20px" }}
                    >
                      <MenuItem value="" disabled>
                        Tempo de suspensão
                      </MenuItem>
                      {Object.values(PenaltyDuration).map((duration) => (
                        <MenuItem key={duration} value={duration}>
                          {duration}
                        </MenuItem>
                      ))}
                    </Select>
                  </Box>
                  <Button
                    variant="contained"
                    onClick={handleAddIncident}
                    disabled={!newIncident || !suspensionTime}
                  >
                    Adicionar Incidente
                  </Button>
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
                  onClick={handleSaveUser}
                >
                  Salvar
                </Button>
              </Container>
              <Snackbar
                open={snackbarOpen}
                autoHideDuration={5000} // Fecha automaticamente após 6 segundos
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
            </>
          )}
        </Box>
      </LocalizationProvider>
    </div>
  );
};

export default Profile;
