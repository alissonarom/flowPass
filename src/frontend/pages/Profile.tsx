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
  useMediaQuery,
  Tooltip,
  Menu,
  Checkbox,
  FormGroup,
  FormControlLabel,
  Paper,
} from "@mui/material";
import { useNavigate, useSearchParams } from "react-router-dom";
import Chip from "@mui/material/Chip";
import Stack from "@mui/material/Stack";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import MenuIcon from "@mui/icons-material/Menu";
import ErrorIcon from "@mui/icons-material/Error";
import {
  createOrUpdateUser,
  getLists,
  getUserProfileByCpf,
  updateList,
  updatePromotorCash,
} from "../services/index";
import { IPenalty, IUser, PenaltyDuration, List, IListHistory } from "../types";
import { DatePicker } from "@mui/x-date-pickers";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { ptBR } from "date-fns/locale";
import {
  calculateEndDate,
  formatPhoneNumber,
  getUserFromLocalStorage,
  useLogout,
} from "../utils";
import {
  AccountCircle,
  CalendarMonth,
  GppMaybe,
  Bookmark,
} from "@mui/icons-material";
import BookmarkBorderIcon from "@mui/icons-material/BookmarkBorder";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

const modalStyle = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: "50%",
  bgcolor: "background.paper",
  boxShadow: 24,
  p: 4,
  borderRadius: "8px",
};

const Profile: React.FC = () => {
  const user = getUserFromLocalStorage();
  const [lista, setLista] = useState<List[]>([]);
  const [searchParams] = useSearchParams();
  const cpf = (searchParams.get("cpf") || "").replace(/\D/g, "");
  const [profileData, setProfileData] = useState<IUser>({
    name: "",
    cpf: cpf,
    birthDate: null,
    phone: "",
    gender: "",
    profile: "",
    anniversary: false,
    history: [],
    penalties: [],
    currentLists: [],
    cash: 0,
    client_id: user?.client_id || "",
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
  const [anchorElUser, setAnchorElUser] = React.useState<null | HTMLElement>(
    null
  );
  const isAmorChurch = user?.client_id === "amorChurch";
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const settings = ["Perfil", "Logout"];
  const [activePenalties, setActivePenalties] = useState<boolean>(false);
  const navigate = useNavigate();
  const [isFree, setisFree] = useState<boolean>(false);
  const [motivo, setMotivo] = useState<string>("");
  const [isModalOpenTicket, setIsModalOpenTicket] = useState(false);

  const isPenaltyActive = (penalty: IPenalty): boolean => {
    const today = new Date();
    const endDate = calculateEndDate(penalty);
    return today <= endDate; // Retorna true se a penalidade estiver vigente
  };

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
    try {
      createOrUpdateUser(profileData);
      setSnackbarMessage("Incidente salvo com sucesso!");
      setSnackbarSeverity("success");
      setSnackbarOpen(true);
      setNewIncident("");
      setSuspensionTime("");
    } catch (error) {
      console.error("Erro ao salvar", error);
      setSnackbarMessage("Falha ao salvar Incidente. Tente novamente");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    }
  };

  const handleChange = (field: keyof IUser, value: string | null | Date) => {
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
    setIsModalOpenTicket(false);
  };

  const handleSelectList = async (id: string) => {
    try {
      // Verifica se o usuário já está na lista
      const userAlreadyInList = profileData.currentLists.includes(id);

      if (userAlreadyInList) {
        setSnackbarMessage("Usuário já está nesta lista");
        setSnackbarSeverity("error");
        setSnackbarOpen(true);
        return;
      }

      // Verifica se o usuário já tem um registro de entrada na lista
      const hasExistingEntry = profileData.history.some(
        (entry) => entry.listId === id
      );

      // Atualiza o estado profileData (localmente)
      setProfileData((prevProfileData) => ({
        ...prevProfileData,
        currentLists: [id], // Adiciona o ID da lista
        history: hasExistingEntry
          ? prevProfileData.history // Mantém o histórico existente
          : [
              ...prevProfileData.history,
              {
                listId: id, // ID da lista
                name: lista.find((list) => list._id === id)?.title || "", // Nome da lista
                joinedAt: new Date(), // Data de entrada
                leftAt: lista.find((list) => list._id === id)?.endDate, // Data de saída
                ticket: {
                  free: isFree,
                  reason: motivo,
                  approver: user?.id || "",
                },
              },
            ],
      }));

      await updateList(id, {
        users:
          lista
            .find((list) => list._id === id)
            ?.users?.filter((user) => user._id !== profileData._id)
            .map((user) => user._id)
            .filter((id): id is string => id !== undefined) || [], // Ensures only string[] (IDs)
      });

      // 3. Atualiza o usuário no backend (para limpar currentLists)
      await createOrUpdateUser({
        ...profileData,
        currentLists: [id], // Garante que o backend também reflita a remoção
      });

      let promotor = lista.find((list) => list._id === id)?.owner;

      if (promotor && !isFree) {
        await updatePromotorCash(promotor, 5);
      } else {
        console.error("Promotor not found for the selected list.");
      }

      // Fecha o modal
      handleCloseModal();
    } catch (error) {
      console.error("Erro ao adicionar usuário à lista:", error);
    }
  };

  const handleRemoveFromList = async () => {
    try {
      // Verifica se o usuário está em uma lista ativa
      if (!isUserInActiveList(profileData, lista)) {
        return;
      }

      // Obtém o ID da lista atual
      const currentListId = profileData.currentLists[0]; // Assumindo que o usuário está em apenas uma lista

      // 2. Remove o usuário da lista no backend
      await updateList(currentListId, {
        users:
          lista
            .find((list) => list._id === currentListId)
            ?.users?.filter((user) => user._id !== profileData._id)
            .map((user) => user._id)
            .filter((id): id is string => id !== undefined) || [], // Ensures only string[] (IDs)
      });

      // 3. Atualiza o usuário no backend (para limpar currentLists)
      await createOrUpdateUser({
        ...profileData,
        currentLists: [], // Garante que o backend também reflita a remoção
      });

      // Feedback visual
      setSnackbarMessage("Usuário removido da lista com sucesso!");
      setSnackbarSeverity("success");
      setSnackbarOpen(true);
    } catch (error) {
      console.error("Erro ao remover o usuário da lista:", error);
      setSnackbarMessage(
        "Erro ao remover o usuário da lista. Tente novamente."
      );
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    }
  };

  const handleSaveUser = async () => {
    try {
      // 1. Atualiza o usuário no backend
      const user = await createOrUpdateUser(profileData);

      // 2. Atualiza as listas no backend (se necessário)
      if (profileData.currentLists.length > 0) {
        const listId = profileData.currentLists[0]; // Assumindo que o usuário está em apenas uma lista
        await updateList(listId, {
          users: [
            ...(lista
              .find((list) => list._id === listId)
              ?.users?.map((user) => user._id)
              .filter((id): id is string => id !== undefined) || []), // Mapeia e filtra os _id dos usuários existentes
            profileData._id ?? "", // Adiciona o _id do novo usuário ou uma string vazia como fallback
          ],
        });
      }

      // Exibe mensagem de sucesso
      setSnackbarMessage("Informações do usuário salvas com sucesso!");
      setSnackbarSeverity("success");
      setSnackbarOpen(true);
    } catch (error) {
      console.error("Erro ao salvar/atualizar usuário:", error);

      // Exibe mensagem de erro
      setSnackbarMessage(
        "Erro ao salvar informações do usuário. Tente novamente."
      );
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
  };

  const handleSuspensionChange = (event: SelectChangeEvent<string>) => {
    setSuspensionTime(event.target.value as string);
  };

  const handleCloseUserMenu = () => {
    useLogout;
    setAnchorElUser(null);
  };

  const handleOpenUserMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElUser(event.currentTarget);
  };

  const isUserInActiveList = (profileData: any, lista: any[]) => {
    // Verifica se currentLists é um array
    if (!Array.isArray(profileData.currentLists)) {
      console.error("currentLists não é um array:", profileData.currentLists);
      return false;
    }

    // Verifica se o usuário não está em nenhuma lista
    if (profileData.currentLists.length === 0) {
      return false;
    }

    // Filtra as listas ativas (endDate >= data atual)
    const activeLists = lista.filter((list) => {
      const endDate = new Date(list.endDate);
      const today = new Date();
      return endDate >= today;
    });

    // Verifica se o usuário está em alguma lista ativa
    return profileData.currentLists.some((userListId: string) =>
      activeLists.some((list) => list._id === userListId)
    );
  };

  const logout = useLogout();

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        if (!cpf) throw new Error("CPF não informado");

        const profile = await getUserProfileByCpf(cpf); // Usa a função do serviço

        if (profile) {
          setProfileData({
            ...profile,
            profile: profile.profile, // Atribui o valor diretamente
          });
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
    fetchLists();
  }, []);

  const fetchLists = async () => {
    try {
      const data = await getLists();

      // Filtra as listas
      const filteredLists = data.filter((list: List) => {
        const startDate = new Date(list.startDate);
        const today = new Date();

        // Remove o horário das datas para comparar apenas o dia
        const startDateWithoutTime = new Date(
          startDate.getFullYear(),
          startDate.getMonth(),
          startDate.getDate()
        );
        const todayWithoutTime = new Date(
          today.getFullYear(),
          today.getMonth(),
          today.getDate()
        );

        // Verifica se o domain é igual ao client_id do usuário
        if (list.domain === user?.client_id) {
          // Se o domain for "amorChurch", filtra também por startDate igual a today
          if (list.domain === "amorChurch") {
            return (
              startDateWithoutTime.getTime() === todayWithoutTime.getTime()
            );
          }
          // Caso contrário, retorna true (filtra apenas por domain)
          return true;
        }
        // Se o domain não for igual ao client_id do usuário, retorna false
        return false;
      });

      setLista(filteredLists); // Atualiza o estado com as listas filtradas
    } catch (error) {
      console.error("Erro ao carregar listas:", error);
    }
  };

  useEffect(() => {
    const active = profileData.penalties.filter((penalty) =>
      isPenaltyActive(penalty)
    );
    setActivePenalties(active.length > 0);
  }, [profileData.penalties]);

  const updateHistoryEntry = (
    index: number,
    field: string,
    value: boolean | number
  ) => {
    const updatedHistory = [...profileData.history]; // Cria uma cópia do histórico
    updatedHistory[index] = { ...updatedHistory[index], [field]: value }; // Atualiza o campo específico
    setProfileData({ ...profileData, history: updatedHistory }); // Atualiza o estado
  };

  return (
    <div style={{ backgroundColor: "#EDEDED", minHeight: "100vh" }}>
      <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ptBR}>
        <AppBar
          position="static"
          sx={{
            backgroundColor: "rgba(0, 223, 129, 0.85)",
            height: "65px",
            justifyContent: "center",
            position: "fixed",
            top: 0,
            zIndex: 10,
          }}
        >
          <Toolbar
            sx={{
              justifyContent: "space-between",
              paddingInline: { xl: 10, md: 5, sm: 0 },
            }}
          >
            <Box sx={{ flexGrow: 0 }} flexDirection="row" display={"flex"}>
              <IconButton
                onClick={() => navigate("/checkin")}
                sx={{ color: "white" }}
              >
                <ArrowBackIcon />
              </IconButton>
              <Box
                component="img"
                src="/logo-top-bar-bco.png"
                alt="Logo"
                sx={{
                  width: "120px",
                  height: "45px",
                  marginInline: { xs: "10px", sm: "20px" },
                }}
              />
            </Box>

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
        <Box
          width="100%"
          display="flex"
          alignItems="center"
          justifyContent="center"
          paddingTop={{ xs: "85px" }}
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
                {isAmorChurch ? (
                  <Chip
                    icon={<CalendarMonth />}
                    label={lista.length ? lista[0]?.title : "Sem aula hoje"}
                    color={"success"}
                    variant="filled"
                    sx={{
                      width: "100%",
                      "&.MuiChip-iconColor": {
                        color: "red",
                      },
                      justifyContent: "flex-start",
                      color: "white",
                    }}
                    size="medium"
                  />
                ) : (
                  <>
                    {activePenalties ? (
                      <Chip
                        icon={<GppMaybe />}
                        label={"Usuário com suspensão ativa"}
                        color={"error"}
                        variant="filled"
                        sx={{
                          width: "100%",
                          "&.MuiChip-iconColor": {
                            color: "red",
                          },
                          justifyContent: "flex-start",
                          color: "white",
                        }}
                        size="medium"
                      />
                    ) : (
                      <Chip
                        label={
                          profileData.profile == "Promotor"
                            ? `Promotor: ${profileData.name}`
                            : !isUserInActiveList(profileData, lista)
                              ? "Adicione o usuário numa lista"
                              : `LISTA: ${lista.find((list) => list._id === profileData.currentLists[0])?.title}`
                        }
                        color={
                          profileData.profile == "Promotor" ||
                          isUserInActiveList(profileData, lista)
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
                    )}
                  </>
                )}

                {!activePenalties &&
                profileData.profile !== "Promotor" &&
                !isAmorChurch ? (
                  !isUserInActiveList(profileData, lista) ? (
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
                      onClick={handleRemoveFromList} // Chama a função para remover da lista
                      sx={{
                        gap: "10px",
                        color: "white",
                        backgroundColor: "#26d07c",
                        "&:hover": {
                          backgroundColor: "#1fa968",
                        },
                      }}
                    >
                      <DeleteIcon />
                    </IconButton>
                  )
                ) : null}
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
                      {profileData.cash.toString() === "0"
                        ? "0,00"
                        : profileData.cash.toString()}
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
                        {lista
                          .filter((listas) => {
                            const endDate = new Date(listas.endDate);
                            const today = new Date();

                            // Remove o horário das datas para comparar apenas o dia
                            const endDateWithoutTime = new Date(
                              endDate.getFullYear(),
                              endDate.getMonth(),
                              endDate.getDate()
                            );
                            const todayWithoutTime = new Date(
                              today.getFullYear(),
                              today.getMonth(),
                              today.getDate()
                            );

                            // Mantém apenas listas com endDate >= hoje
                            return endDateWithoutTime >= todayWithoutTime;
                          })
                          .map((listas, index) => (
                            <ListItem
                              component="li"
                              key={index}
                              onClick={() =>
                                listas._id && handleSelectList(listas._id)
                              }
                              sx={{
                                cursor: "pointer", // Cursor pointer para indicar que é clicável
                                "&:hover": {
                                  backgroundColor: "#CAFFD2", // Cor de fundo ao passar o mouse
                                },
                              }}
                            >
                              <ListItemText
                                primary={listas.title}
                                secondary={listas.owner.name}
                              />
                              <FormControlLabel
                                control={
                                  <Checkbox
                                    checked={isFree}
                                    onChange={(event) => {
                                      if (!isFree) {
                                        setIsModalOpenTicket(true); // Se estava false, abre o modal
                                      } else {
                                        setisFree(false); // Se estava true, apenas desmarca
                                      }
                                    }}
                                    sx={{
                                      "& .MuiSvgIcon-root": { fontSize: 30 },
                                    }}
                                  />
                                }
                                label="Free"
                              />
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
                    <Grid item xs={12} md={6}>
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
                    <Grid item xs={12} md={6}>
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
                    <Grid item xs={12} md={6}>
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
                    <Grid item xs={12} md={6}>
                      <TextField
                        label="Celular"
                        value={formatPhoneNumber(profileData.phone || "")}
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
                    <Grid item xs={12} md={6}>
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
                    {isAmorChurch ? (
                      <Grid item xs={12} md={6}>
                        <TextField
                          select
                          label="Perfil"
                          name="profile"
                          value={profileData.profile} // Garante que o valor seja uma string
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                            handleChange("profile", e.target.value)
                          }
                          fullWidth
                          error={!profileData.profile} // Exibe erro se o campo estiver vazio
                          helperText={
                            !profileData.profile ? "Campo obrigatório" : ""
                          } // Mensagem de erro
                          margin="normal"
                        >
                          <MenuItem value="Diretoria">Diretoria</MenuItem>
                          <MenuItem value="Mentoria">Mentoria</MenuItem>
                          <MenuItem value="Aluno">Aluno</MenuItem>
                        </TextField>
                      </Grid>
                    ) : (
                      <Grid item xs={12} md={6}>
                        <TextField
                          select
                          label="Perfil"
                          name="profile"
                          value={profileData.profile} // Garante que o valor seja uma string
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                            handleChange("profile", e.target.value)
                          }
                          fullWidth
                          error={!profileData.profile} // Exibe erro se o campo estiver vazio
                          helperText={
                            !profileData.profile ? "Campo obrigatório" : ""
                          } // Mensagem de erro
                          margin="normal"
                        >
                          <MenuItem value="Promotor">Promotor</MenuItem>
                          <MenuItem value="Usuário">Usuário</MenuItem>
                          <MenuItem value="Funcionário">Funcionário</MenuItem>
                          <MenuItem value="Funcionário">Administrador</MenuItem>
                        </TextField>
                      </Grid>
                    )}
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
                    Histórico de {isAmorChurch ? "Presença" : "Entradas"}
                  </Typography>
                  <MuiList>
                    {profileData.history.length ? (
                      profileData.history.map(
                        (entry: IListHistory, index: number) => (
                          <Grid
                            container
                            spacing={2}
                            key={index}
                            sx={{ mb: 2 }}
                          >
                            {/* Bloco 1: Título e Data */}
                            <Grid
                              item
                              xs={12}
                              sm={6}
                              md={4}
                              sx={{ height: "100%" }}
                            >
                              <Typography variant="h6" component="div">
                                {entry.name}
                              </Typography>
                              <Typography
                                variant="body2"
                                color="text.secondary"
                              >
                                {new Date(entry.joinedAt).toLocaleDateString()}
                              </Typography>
                            </Grid>

                            {/* Bloco 2: Checkboxes de Turnos (só aparece se isAmorChurch for true) */}
                            {isAmorChurch && (
                              <Grid
                                item
                                xs={12}
                                sm={6}
                                md={4}
                                sx={{ height: "100%" }}
                              >
                                <FormGroup>
                                  <FormControlLabel
                                    control={
                                      <Checkbox
                                        icon={<BookmarkBorderIcon />}
                                        checkedIcon={<Bookmark />}
                                        checked={entry.firstRound || false}
                                        onChange={(
                                          event: React.ChangeEvent<HTMLInputElement>
                                        ) => {
                                          updateHistoryEntry(
                                            index,
                                            "firstRound",
                                            event.target.checked
                                          );
                                        }}
                                      />
                                    }
                                    label="1º Turno"
                                  />
                                  <FormControlLabel
                                    control={
                                      <Checkbox
                                        icon={<BookmarkBorderIcon />}
                                        checkedIcon={<Bookmark />}
                                        checked={entry.secondRound || false}
                                        onChange={(
                                          event: React.ChangeEvent<HTMLInputElement>
                                        ) => {
                                          updateHistoryEntry(
                                            index,
                                            "secondRound",
                                            event.target.checked
                                          );
                                        }}
                                      />
                                    }
                                    label="2º Turno"
                                  />
                                </FormGroup>
                              </Grid>
                            )}

                            {/* Bloco 3: Campo de Nota (só aparece se for exame) */}
                            {isAmorChurch && entry.isExam && (
                              <Grid
                                item
                                xs={12}
                                sm={6}
                                md={4}
                                sx={{ height: "100%" }}
                              >
                                <TextField
                                  fullWidth
                                  id="outlined-number"
                                  label="Nota da Prova"
                                  type="number"
                                  InputLabelProps={{
                                    shrink: true,
                                  }}
                                  value={entry.examScore || ""}
                                  onChange={(
                                    event: React.ChangeEvent<HTMLInputElement>
                                  ) => {
                                    updateHistoryEntry(
                                      index,
                                      "examScore",
                                      parseFloat(event.target.value)
                                    );
                                  }}
                                />
                              </Grid>
                            )}
                          </Grid>
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

                {isAmorChurch ? null : (
                  <>
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
                                      Suspenso por{" "}
                                      <strong>{entry.duration}</strong> -
                                      Termina em{" "}
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
                  </>
                )}
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
        <Modal open={isModalOpenTicket} onClose={handleCloseModal}>
          <Box
            sx={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: 400,
              bgcolor: "background.paper",
              boxShadow: 24,
              p: 4,
              borderRadius: "8px",
              display: "flex",
              flexDirection: "column",
              gap: 2,
            }}
          >
            <Typography variant="h6" gutterBottom>
              Qual o motivo do Free?
            </Typography>
            <TextField
              label="Motivo"
              multiline
              rows={4}
              variant="outlined"
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
              fullWidth
            />

            <Button
              onClick={() => {
                handleCloseModal();
                setisFree(true);
              }}
              variant="contained"
              sx={{
                backgroundColor: "#26d07c",
                "&:hover": {
                  backgroundColor: "#1fa968",
                },
              }}
            >
              Confirmar
            </Button>
            <Button
              onClick={() => {
                handleCloseModal();
                setMotivo("");
              }}
              variant="contained"
              sx={{
                backgroundColor: "#26d07c",
                "&:hover": {
                  backgroundColor: "#1fa968",
                },
              }}
            >
              Cancelar
            </Button>
          </Box>
        </Modal>
      </LocalizationProvider>
    </div>
  );
};

export default Profile;
