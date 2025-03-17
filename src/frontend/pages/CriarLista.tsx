import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  TextField,
  Select,
  MenuItem,
  Button,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  ListItemText,
  Toolbar,
  AppBar,
  IconButton,
  Grid,
  Modal,
  Snackbar,
  Alert,
  CircularProgress,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import CloseIcon from "@mui/icons-material/Close";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { ptBR } from "date-fns/locale";
import {
  createList,
  createOrUpdateUser,
  getLists,
  getPromoters,
  getUserProfileByCpf,
  updateList,
} from "../services";
import { IPromoter, IUser, List as ListType } from "../types";
import {
  formatPhoneNumber,
  getUserFromLocalStorage,
  handleCpfChange,
  validateCPF,
} from "../utils";
import { AxiosError } from "axios";

const CriarLista: React.FC = () => {
  const user = getUserFromLocalStorage();
  const navigate = useNavigate();
  const [listTitle, setListTitle] = useState("");
  const [selectedPromoter, setSelectedPromoter] = useState<IPromoter | null>(
    null
  );
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [lists, setLists] = useState<ListType[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isModalOpenUsuário, setIsModalOpenUsuário] = useState(false);
  const [promoters, setPromoters] = useState<IPromoter[]>([]);
  const [foundUser, setFoundUser] = useState<IUser | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingLists, setLoadingLists] = useState(false);
  const [cpfSearch, setCpfSearch] = useState("");
  const [newUser, setNewUser] = useState<IUser>({
    name: "",
    cpf: "",
    birthDate: null,
    phone: "",
    gender: "",
    profile: "Usuário",
    anniversary: false,
    history: [],
    penalties: [],
    currentLists: [],
    cash: 0,
    client_id: user?.client_id || "",
  });
  const [currentListIndex, setCurrentListIndex] = useState<number>(0);
  const [openModal, setOpenModal] = useState(false);
  const [newPromoter, setNewPromoter] = useState<IUser>({
    name: "",
    cpf: "",
    birthDate: null,
    phone: "",
    gender: "",
    profile: "Promotor",
    anniversary: false,
    history: [],
    penalties: [],
    currentLists: [],
    cash: 0,
    client_id: user?.client_id || "",
  });
  const [foundPromotor, setfoundPromotor] = useState<IUser | null>(null);
  const [errorCpf, setErrorCpf] = useState<boolean>(false);
  const [verifyUser, setVerifyUser] = useState<boolean>(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarSeverity, setSnackbarSeverity] = useState<"success" | "error">(
    "success"
  );
  const [snackbarMessage, setSnackbarMessage] = useState("");

  const checkInputs = async () => {
    const isFormValid =
      newPromoter.name &&
      newPromoter.cpf.length === 14 &&
      newPromoter.birthDate &&
      newPromoter.phone &&
      newPromoter.gender;

    const isCpfValid = validateCPF(newPromoter.cpf);
    console.log("isCpfValid in checkInputs", isCpfValid);

    if (!isFormValid) {
      setSnackbarMessage("Verifique os campos obrigatórios.");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
      return;
    }
    if (!isCpfValid) {
      setErrorCpf(!isCpfValid);
      return;
    }
    let cpfReplace = newPromoter.cpf.replace(/\D/g, "");
    try {
      const profile = await getUserProfileByCpf(cpfReplace); // Busca o perfil do usuário pelo CPF
      setfoundPromotor(profile); // Se encontrar, atualiza o estado com o perfil
    } catch (error) {
      if (
        error instanceof AxiosError &&
        error.response &&
        error.response.status === 404
      ) {
        // Se o erro for 404 (usuário não encontrado), prossegue para criar o promotor
        handleCreatePromoter();
      } else {
        // Se for outro tipo de erro, loga o erro e não prossegue com o cadastro
        console.error("Erro ao buscar perfil do usuário:", error);
      }
    } finally {
      setLoading(false); // Finaliza o estado de loading
    }
  };

  const checkInputsUser = () => {
    setLoading(true);
    const isFormValid =
      newUser.name && newUser.birthDate && newUser.phone && newUser.gender;

    if (isFormValid) {
      handleCreateUser();
    }
    setLoading(false);
  };

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleOpenModalUsuário = () => {
    setOpenModal(false);
    setIsModalOpenUsuário(true);
  };

  const cleanPromotor = () => {
    setNewPromoter({
      name: "",
      cpf: "",
      birthDate: null,
      phone: "",
      gender: "",
      profile: "Promotor",
      anniversary: false,
      history: [],
      penalties: [],
      currentLists: [],
      cash: 0,
      client_id: user?.client_id || "",
    });
  };

  const handleCloseModal = () => {
    cleanPromotor();
    setIsModalOpen(false);
  };

  const handleCloseModalUsuário = () => {
    setIsModalOpenUsuário(false);
  };

  const handleCreatePromoter = async () => {
    if (!newPromoter) {
      console.error("Dados do promotor estão incompletos ou nulos.");
      return;
    }

    try {
      const createdPromoter = await createOrUpdateUser({
        ...newPromoter,
        cpf: newPromoter.cpf.replace(/\D/g, ""),
      });
      setPromoters((prevPromoters) => [...prevPromoters, createdPromoter]);
      setSnackbarMessage("Promotor criado com sucesso!");
      setSnackbarSeverity("success");
      setSnackbarOpen(true);
      cleanPromotor();
      setIsModalOpen(false);
    } catch (error) {
      console.error("Erro ao criar promotor:", error);
      setSnackbarMessage("Erro ao criar Promotor. Tente novamente.");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    }
  };

  const handleCreateUser = async () => {
    if (!newUser) {
      console.error("Dados do usuário estão incompletos ou nulos.");
      return;
    }

    try {
      await createOrUpdateUser({
        ...newUser,
        cpf: cpfSearch.replace(/\D/g, ""),
      });
      setSnackbarMessage("Usuário criado com sucesso!");
      setSnackbarSeverity("success");
      setSnackbarOpen(true);
      handleCloseModalUsuário();
    } catch (error) {
      console.error("Erro ao criar Usuário:", error);
      setSnackbarMessage("Erro ao criar Usuário. Tente novamente.");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    } finally {
      setVerifyUser(false);
    }
  };

  const handleInputChangePromotor = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    if (newPromoter) {
      setNewPromoter({ ...newPromoter, [name]: value });
    }
  };

  const handleInputChangeUser = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    if (newUser) {
      setNewUser({ ...newUser, [name]: value });
    }
  };

  const handleFormatChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setVerifyUser(false);
    setErrorCpf(false);
    setFoundUser(null);
    setCpfSearch("");
    const value = handleCpfChange(e.target.value);

    if (e.target.name === "cpfSearch") setCpfSearch(value);

    if (e.target.name === "cpfPromotor") {
      setNewPromoter((prevPromoter) => ({
        ...prevPromoter,
        cpf: value,
      }));
    }
  };

  const handleOpenModalList = (index: number) => {
    setCurrentListIndex(index);
    setCpfSearch("");
    setFoundUser(null);
    setNewUser({
      name: "",
      cpf: "",
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
    setOpenModal(true);
  };

  const handleSearch = async () => {
    setLoading(true);
    const isCpfValid = validateCPF(cpfSearch);

    if (!isCpfValid) {
      setErrorCpf(true);
      setLoading(false);
      return;
    }
    let cpfReplace = cpfSearch.replace(/\D/g, "");

    try {
      const profile = await getUserProfileByCpf(cpfReplace); // Usa a função do serviço
      setFoundUser(profile);
    } catch (error) {
      if (
        error instanceof AxiosError &&
        error.response &&
        error.response.status === 404
      ) {
        // Se o erro for 404 (usuário não encontrado), prossegue para criar o promotor
        setVerifyUser(true);
      } else {
        // Se for outro tipo de erro, loga o erro e não prossegue com o cadastro
        console.error("Erro ao buscar perfil do usuário:", error);
        setSnackbarMessage(
          "Erro ao buscar perfil do usuário. Tente novamente."
        );
        setSnackbarSeverity("error");
        setSnackbarOpen(true);
      }
      console.error("Erro ao buscar perfil do usuário:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddExistingUser = async () => {
    if (foundUser && currentListIndex !== null) {
      // Extrai os IDs dos usuários existentes
      const existingUserIds = lists[currentListIndex].users
        .map((user) => user._id) // Mapeia para um array de strings ou undefined
        .filter((id): id is string => id !== undefined); // Filtra apenas strings válidas

      // Verifica se o usuário já está na lista
      if (foundUser._id && existingUserIds.includes(foundUser._id)) {
        setSnackbarMessage("Usuário já está na lista.");
        setSnackbarSeverity("error");
        setSnackbarOpen(true);
        return;
      }

      // Cria a lista de IDs de usuários atualizada
      const updatedUsers = [...existingUserIds, foundUser._id];

      try {
        // Atualiza a lista no backend usando a função updateList
        const upList = await updateList(lists[currentListIndex]._id, {
          users: updatedUsers.filter((id): id is string => id !== undefined),
        });

        if (!upList) {
          setSnackbarMessage("Erro ao adicionar usuário. Tente novamente.");
          setSnackbarSeverity("error");
          setSnackbarOpen(true);
          return;
        }

        // Atualiza o usuário com as novas informações
        const updatedUser: IUser = {
          ...foundUser, // Mantém todos os outros campos do usuário
          history: [
            ...foundUser.history, // Mantém o histórico existente
            {
              listId: lists[currentListIndex]._id, // ID da lista atual
              joinedAt: new Date(), // Data de entrada
              leftAt: lists[currentListIndex].endDate, // Data de saída (null porque o usuário ainda não saiu)
              name: lists[currentListIndex].title,
            },
          ],
          currentLists: [lists[currentListIndex]._id],
        };

        // Atualiza o usuário no backend
        await createOrUpdateUser(updatedUser);

        // Atualiza o campo 'cash' do promotor
        const promotor = lists[currentListIndex].promotor; // Supondo que o owner seja o ID do promotor

        await updatePromotorCash(promotor, 5); // Incrementa 5 reais

        // Atualiza as listas no frontend
        fetchLists();
        setVerifyUser(false);
        setSnackbarMessage("Usuário adicionado com sucesso!");
        setSnackbarSeverity("success");
        setSnackbarOpen(true);
        setOpenModal(false);
      } catch (error) {
        console.error("Erro ao adicionar usuário à lista:", error);
      }
    }
  };

  const handleRemoveUser = async (idUser: string, indexlist: number) => {
    try {
      // Verifica se há uma lista selecionada

      // Obtém a lista atual
      const currentList = lists[indexlist];

      // Filtra os usuários da lista, removendo o usuário com o ID especificado
      const updatedUsers = currentList.users
        .map((user) => user._id)
        .filter((user) => user !== idUser);

      // Atualiza a lista no backend
      await updateList(currentList._id, {
        users: updatedUsers.filter((id): id is string => id !== undefined),
      });

      // Atualiza o estado local (lists) com a lista atualizada
      fetchLists();

      // Atualiza o campo 'cash' do promotor (subtrai 5 reais)
      const promotor = currentList.promotor; // Supondo que `owner` seja o objeto do promotor
      await updatePromotorCash(promotor, -5); // Decrementa 5 reais

      setSnackbarMessage("Usuário removido com sucesso.");
      setSnackbarSeverity("success");
      setSnackbarOpen(true);

      console.log(
        "Usuário removido com sucesso e cash do promotor atualizado."
      );
    } catch (error) {
      console.error("Erro ao remover usuário da lista:", error);
      setSnackbarMessage("Erro ao remover usuário. Tente novamente.");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    }
  };

  const updatePromotorCash = async (promotor: IUser, amount: number) => {
    try {
      // Converte o valor atual de `cash` para número
      const currentCash = promotor.cash || 0;

      console.log("currentCash", currentCash); // resultado 'currentCash 0' (ou outro valor)

      // Calcula o novo valor de `cash`
      const newCash = currentCash + amount;

      console.log("newCash", newCash); // resultado 'newCash X' (onde X é o novo valor)

      // Cria um novo objeto com o campo `cash` atualizado
      const updatedPromotor: IUser = {
        ...promotor, // Mantém todos os outros campos do promotor
        cash: newCash, // Atualiza o campo `cash` como número
      };

      // Atualiza o promotor com o novo valor de `cash`
      await createOrUpdateUser(updatedPromotor);
    } catch (error) {
      console.error("Erro ao atualizar o campo cash do promotor:", error);
      throw error;
    }
  };

  const fetchLists = async () => {
    setLoadingLists(true);
    setLoading(true);
    try {
      const data = await getLists();
      setLists(data);
    } catch (error) {
      console.error("Erro ao carregar listas:", error);
    } finally {
      setLoading(false);
      setLoadingLists(false);
    }
  };

  const isListClosed = (endDate: Date): boolean => {
    const today = new Date();
    const listEndDate = new Date(endDate);

    // Define o início do dia de hoje (00:00:00)
    const startOfToday = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate()
    );

    // Define o início do dia seguinte ao endDate (00:00:00)
    const startOfEndDate = new Date(
      listEndDate.getFullYear(),
      listEndDate.getMonth(),
      listEndDate.getDate() + 1
    );

    // A lista está fechada se o início do dia seguinte ao endDate for anterior ao início do dia de hoje
    return startOfEndDate < startOfToday;
  };

  useEffect(() => {
    fetchLists();
  }, []);

  // Carrega os promotores ao montar o componente
  useEffect(() => {
    clearStates();
    setLoading(true);
    const fetchPromoters = async () => {
      try {
        const data = await getPromoters();
        setPromoters(data);
      } catch (error) {
        console.error("Erro ao carregar promotores:", error);
      }
    };
    fetchPromoters();
    setLoading(false);
  }, []);

  const clearStates = () => {
    setListTitle("");
    setSelectedPromoter(null);
    setStartDate(null);
    setEndDate(null);
  };

  const handleCreateList = async () => {
    if (startDate && endDate) {
      const newList = {
        title: listTitle,
        promotor: selectedPromoter?._id || "", // ID do promotor
        startDate: startDate,
        endDate: endDate,
        users: [], // IDs dos usuários
      };

      try {
        await createList(newList);

        // Recarrega as listas após a criação
        const updatedLists = await getLists();
        setLists(updatedLists);

        setSnackbarMessage("Lista criada com sucesso!");
        setSnackbarSeverity("success");
        setSnackbarOpen(true);
        clearStates();
      } catch (error) {
        console.error("Erro ao criar lista:", error);
        setSnackbarMessage("Erro ao criar lista. Tente novamente.");
        setSnackbarSeverity("error");
        setSnackbarOpen(true);
      }
    } else {
      console.error("Datas de início e fim são obrigatórias.");
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
  };

  return (
    <div
      style={{
        backgroundColor: "#EDEDED",
        minHeight: "100vh",
      }}
    >
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
                marginRight: { xs: "10px", sm: "20px" },
              }}
            />
          </Toolbar>
        </AppBar>
        {/* Container */}
        <Box
          width="100%"
          display="flex"
          marginTop={{ xs: "65px", md: "30px" }}
          flexDirection={{ xs: "column", md: "column" }}
          sx={{
            backgroundColor: "#EDEDED",
          }}
        >
          <>
            {/* Primeiro Box: Criar Nova Lista */}
            <Box
              sx={{
                backgroundColor: "white",
                borderRadius: "8px",
                boxShadow: 3,
                padding: "20px",
                margin: "20px",
              }}
            >
              <Typography variant="h6" gutterBottom>
                Criar Nova Lista
              </Typography>
              <Box>
                <Grid
                  container
                  spacing={2}
                  sx={{
                    display: "flex",
                    flexDirection: "row",
                    alignItems: "center",
                  }}
                >
                  <Grid item xs={12} md={6}>
                    {/* Título da Lista */}
                    <TextField
                      label="Título da Lista"
                      fullWidth
                      value={listTitle}
                      onChange={(e) => setListTitle(e.target.value)}
                      sx={{ marginBottom: "20px" }}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    {/* Select de Promotores */}
                    <Select
                      value={selectedPromoter?._id || ""} // Usa o ID do promotor ou uma string vazia
                      onChange={(e) => {
                        if (e.target.value === "new") {
                          handleOpenModal(); // Abre o modal se a opção for "Cadastrar novo promotor"
                        } else {
                          const selectedPromoterId = e.target.value;
                          const promoter =
                            promoters.find(
                              (p) => p._id === selectedPromoterId
                            ) || null;
                          setSelectedPromoter(promoter); // Seleciona o promotor
                        }
                      }}
                      displayEmpty
                      fullWidth
                      sx={{ marginBottom: "20px" }}
                    >
                      <MenuItem value="" disabled sx={{ color: "gray" }}>
                        Selecione um Promotor
                      </MenuItem>
                      {promoters.map((promoter) => (
                        <MenuItem key={promoter._id} value={promoter._id}>
                          {promoter.name}
                        </MenuItem>
                      ))}
                      <MenuItem sx={{ backgroundColor: "#dffff2" }} value="new">
                        Cadastrar novo promotor
                      </MenuItem>
                    </Select>
                    {/* Modal de Cadastro de Promotor */}
                    <Modal open={isModalOpen} onClose={handleCloseModal}>
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
                        }}
                      >
                        <Typography variant="h6" gutterBottom>
                          Cadastrar Novo Promotor
                        </Typography>
                        {/* Box se usuário já cadastrado com outro perfil que não promotor */}
                        {foundPromotor && (
                          <Box
                            sx={{
                              p: 2,
                              bgcolor: "#e0f7fa",
                              borderRadius: 1,
                              cursor: "pointer",
                              "&:hover": { bgcolor: "#b2ebf2" },
                              justifyContent: "space-between",
                              display: "flex",
                              width: "100%",
                              marginBottom: "16px",
                            }}
                          >
                            {foundPromotor.profile === "Promotor" ? (
                              <Typography>
                                Usuário já cadastrado na base. Para promove-lo à
                                Promotor acesse o perfil do usuário.
                              </Typography>
                            ) : (
                              <Typography>Usuário já é um promotor.</Typography>
                            )}
                          </Box>
                        )}

                        {/* Formulário de Cadastro */}
                        <TextField
                          label="Nome"
                          name="name"
                          fullWidth
                          value={newPromoter?.name}
                          onChange={handleInputChangePromotor}
                          error={!newPromoter?.name}
                          helperText={
                            !newPromoter?.name && "Campo obrigatório."
                          }
                          sx={{ marginBottom: "20px" }}
                        />
                        <TextField
                          label="CPF"
                          name="cpfPromotor"
                          fullWidth
                          value={newPromoter?.cpf}
                          onChange={handleFormatChange}
                          error={errorCpf}
                          helperText={errorCpf ? "CPF inválido" : ""}
                          sx={{ marginBottom: "20px" }}
                        />
                        {/* DatePicker para Data de Nascimento */}
                        <DatePicker
                          label="Data de Nascimento"
                          value={
                            newPromoter?.birthDate
                              ? new Date(newPromoter.birthDate)
                              : null
                          }
                          onChange={(newValue) =>
                            setNewPromoter((prev) => ({
                              ...prev,
                              birthDate: newValue ?? null,
                            }))
                          }
                          sx={{ marginBottom: "20px", width: "100%" }}
                          format="dd/MM/yyyy"
                        />
                        <TextField
                          label="Telefone"
                          name="phone"
                          fullWidth
                          value={newPromoter?.phone || ""}
                          onChange={(e) => {
                            const formattedValue = formatPhoneNumber(
                              e.target.value
                            ); // Formata o telefone
                            setNewPromoter((prevPromoter) => ({
                              ...prevPromoter,
                              phone: formattedValue, // Atualiza o estado com o telefone formatado
                            }));
                          }}
                          placeholder="(43) 9 9999-9999"
                          sx={{ marginBottom: "20px" }}
                        />
                        <TextField
                          select
                          label="Gênero"
                          value={newPromoter.gender || ""} // Garante que o valor seja uma string
                          onChange={(e) => {
                            setNewPromoter((prevPromoter) => ({
                              ...prevPromoter,
                              gender: e.target.value, // Atualiza o estado com o gênero selecionado
                            }));
                          }}
                          fullWidth
                          error={!newPromoter.gender} // Exibe erro se o campo estiver vazio
                          helperText={
                            !newPromoter.gender ? "Campo obrigatório" : ""
                          } // Mensagem de erro
                          margin="normal"
                        >
                          <MenuItem value="Feminino">Feminino</MenuItem>
                          <MenuItem value="Masculino">Masculino</MenuItem>
                        </TextField>

                        {/* Botão de Salvar */}
                        <Box
                          display="flex"
                          flexDirection={"row"}
                          justifyContent="space-evenly"
                          sx={{ marginTop: "20px" }}
                        >
                          <Button
                            onClick={checkInputs}
                            variant="contained"
                            sx={{
                              backgroundColor: "#26d07c",
                              "&:hover": {
                                backgroundColor: "#1fa968",
                              },
                            }}
                          >
                            Salvar
                          </Button>
                          <Button
                            onClick={cleanPromotor}
                            variant="outlined"
                            sx={{
                              backgroundColor: "white",
                              "&:hover": {
                                backgroundColor: "#e7fbf1",
                              },
                            }}
                          >
                            Limpar
                          </Button>
                        </Box>
                      </Box>
                    </Modal>
                  </Grid>
                </Grid>
                {/* Date Pickers para Início e Fim */}
                <Grid
                  container
                  spacing={2}
                  sx={{
                    display: "flex",
                    flexDirection: "row",
                    alignItems: "center",
                  }}
                >
                  <Grid item xs={12} md={6}>
                    <DatePicker
                      label="Data de Início"
                      value={startDate}
                      onChange={(newValue) => setStartDate(newValue)}
                      sx={{ marginBottom: "20px", width: "100%" }}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <DatePicker
                      label="Data de Fim"
                      value={endDate}
                      onChange={(newValue) => setEndDate(newValue)}
                      sx={{ marginBottom: "20px", width: "100%" }}
                    />
                  </Grid>
                </Grid>
                {/* Botão de Salvar Lista */}
                <Button
                  disabled={
                    !(listTitle && selectedPromoter && startDate && endDate)
                  }
                  variant="contained"
                  sx={{
                    backgroundColor: "#26d07c",
                    "&:hover": {
                      backgroundColor: "#1fa968",
                    },
                    display: "flex",
                    justifySelf: "stretch",
                  }}
                  onClick={handleCreateList}
                >
                  Criar Lista
                </Button>
              </Box>
            </Box>
            {/* Segundo Box: Listas dos Promotores */}
            <Box
              sx={{
                backgroundColor: "white",
                borderRadius: "8px",
                boxShadow: 3,
                padding: "20px",
                marginInline: "20px",
              }}
            >
              <Box>
                {/* Segundo Box: Listas dos Promotores */}
                <Typography variant="h6" gutterBottom>
                  Listas dos Promotores
                </Typography>

                {/* Lista de Acordeões */}
                {loadingLists ? (
                  <CircularProgress style={{ color: "#00df81" }} size={64} />
                ) : lists.length ? (
                  <>
                    {lists.map((list, index) => {
                      const isClosed = isListClosed(new Date(list.endDate)); // Verifica se a lista está fechada
                      return (
                        <Accordion
                          key={index}
                          sx={{
                            backgroundColor: "#a8ddbd",
                            "&.Mui-expanded": { backgroundColor: "#caffd2" },
                            marginBottom: "10px",
                          }}
                        >
                          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                            <Typography>
                              {list.title} - Promotor: {list.promotor.name} - de{" "}
                              {new Date(list.startDate).toLocaleDateString()} a{" "}
                              {new Date(list.endDate).toLocaleDateString()}
                            </Typography>
                            <Button
                              onClick={() => handleOpenModalList(index)}
                              startIcon={isClosed ? <CloseIcon /> : <AddIcon />} // Altera o ícone
                              variant="contained"
                              sx={{ marginLeft: "auto" }}
                              disabled={isClosed} // Desabilita o botão se a lista estiver fechada
                            >
                              {isClosed
                                ? "LISTA FECHADA"
                                : "Adicionar participante"}{" "}
                            </Button>
                          </AccordionSummary>
                          <AccordionDetails sx={{ backgroundColor: "#f0f0f0" }}>
                            <List>
                              {list.users.length ? (
                                list.users.map((user) => (
                                  <ListItem key={user._id}>
                                    <ListItemText
                                      primary={user.name}
                                      secondary={user.cpf}
                                    />
                                    <IconButton
                                      edge="end"
                                      aria-label="delete"
                                      onClick={() =>
                                        user._id &&
                                        handleRemoveUser(user._id, index)
                                      }
                                      disabled={isClosed} // Desabilita o botão de remover se a lista estiver fechada
                                    >
                                      <DeleteIcon />
                                    </IconButton>
                                  </ListItem>
                                ))
                              ) : (
                                <Typography
                                  variant="subtitle2"
                                  sx={{ color: "gray" }}
                                >
                                  A lista está vazia
                                </Typography>
                              )}
                            </List>
                          </AccordionDetails>
                        </Accordion>
                      );
                    })}
                  </>
                ) : (
                  <Typography variant="subtitle2" sx={{ color: "gray" }}>
                    Nenhuma lista cadastrada
                  </Typography>
                )}
                {/* Modal de Adicionar Participante */}
                <Modal
                  open={openModal}
                  onClose={() => [
                    setOpenModal(false),
                    setErrorCpf(false),
                    setVerifyUser(false),
                  ]}
                >
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
                      borderRadius: 2,
                    }}
                  >
                    <Typography variant="h6" gutterBottom>
                      Buscar usuário por CPF
                    </Typography>
                    <Box display="flex" gap={2} mb={2}>
                      <TextField
                        label="CPF"
                        name="cpfSearch"
                        error={errorCpf}
                        helperText={errorCpf ? "CPF inválido" : ""}
                        value={cpfSearch}
                        onChange={handleFormatChange}
                      />
                      <Button
                        variant="contained"
                        onClick={handleSearch}
                        disabled={loading} // Desabilita o botão durante o loading
                        sx={{
                          height: "fitContent",
                        }}
                      >
                        {loading ? <CircularProgress size={24} /> : "Buscar"}
                      </Button>
                    </Box>
                    {foundUser && cpfSearch && (
                      <Box
                        onClick={handleAddExistingUser}
                        sx={{
                          p: 2,
                          bgcolor: "#e0f7fa",
                          borderRadius: 1,
                          cursor: "pointer",
                          "&:hover": { bgcolor: "#b2ebf2" },
                          justifyContent: "space-between",
                          display: "flex",
                          width: "100%",
                          marginBottom: "16px",
                        }}
                      >
                        <Typography>
                          {foundUser.name} - {foundUser.cpf}
                        </Typography>
                      </Box>
                    )}
                    {verifyUser && (
                      <Box
                        sx={{
                          p: 2,
                          bgcolor: "#fae3e0",
                          borderRadius: 1,
                          cursor: "none",
                          "&:hover": { bgcolor: "#f6cfca" },
                          justifyContent: "space-between",
                          display: "flex",
                          width: "100%",
                          marginBottom: "16px",
                        }}
                      >
                        <Typography>Usuário não cadastrado!</Typography>
                      </Box>
                    )}

                    <Button
                      fullWidth
                      variant="outlined"
                      onClick={handleOpenModalUsuário}
                      disabled={cpfSearch.length < 14 || errorCpf}
                    >
                      Cadastrar usuário
                    </Button>
                  </Box>
                </Modal>
                <Modal
                  open={isModalOpenUsuário}
                  onClose={handleCloseModalUsuário}
                >
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
                    }}
                  >
                    <Typography variant="h6" gutterBottom>
                      Cadastrar Novo Usuário
                    </Typography>

                    {/* Formulário de Cadastro */}
                    <TextField
                      label="Nome"
                      name="name"
                      fullWidth
                      value={newUser?.name}
                      onChange={handleInputChangeUser}
                      error={!newUser?.name}
                      helperText={!newUser?.name && "Campo obrigatório."}
                      sx={{ marginBottom: "20px" }}
                    />
                    <TextField
                      label="CPF"
                      name="cpf"
                      fullWidth
                      value={cpfSearch}
                      sx={{ marginBottom: "20px" }}
                      disabled
                    />
                    {/* DatePicker para Data de Nascimento */}
                    <DatePicker
                      label="Data de Nascimento"
                      value={
                        newUser?.birthDate ? new Date(newUser.birthDate) : null
                      }
                      onChange={(newValue) =>
                        setNewUser((prev) => ({
                          ...prev!,
                          birthDate: newValue ?? null,
                        }))
                      }
                      sx={{ marginBottom: "20px", width: "100%" }}
                      format="dd/MM/yyyy"
                    />
                    <TextField
                      label="Telefone"
                      name="phone"
                      fullWidth
                      value={newUser?.phone || ""}
                      onChange={(e) => {
                        const formattedValue = formatPhoneNumber(
                          e.target.value
                        ); // Formata o telefone
                        setNewUser((prev) => ({
                          ...prev!,
                          phone: formattedValue, // Atualiza o estado com o telefone formatado
                        }));
                      }}
                      placeholder="(43) 9 9999-9999"
                      sx={{ marginBottom: "5px" }}
                    />
                    <TextField
                      select
                      label="Gênero"
                      name="gender"
                      value={newUser?.gender || ""} // Garante que o valor seja uma string
                      onChange={handleInputChangeUser}
                      fullWidth
                      error={!newUser?.gender} // Exibe erro se o campo estiver vazio
                      helperText={!newUser?.gender ? "Campo obrigatório" : ""} // Mensagem de erro
                      margin="normal"
                    >
                      <MenuItem value="Feminino">Feminino</MenuItem>
                      <MenuItem value="Masculino">Masculino</MenuItem>
                    </TextField>
                    <TextField
                      select
                      label="Perfil"
                      name="profile"
                      value={newUser?.profile || ""} // Garante que o valor seja uma string
                      onChange={handleInputChangeUser}
                      fullWidth
                      error={!newUser?.profile} // Exibe erro se o campo estiver vazio
                      helperText={!newUser?.profile ? "Campo obrigatório" : ""} // Mensagem de erro
                      margin="normal"
                    >
                      <MenuItem value="Usuário">Usuário</MenuItem>
                      <MenuItem value="Promotor">Promotor</MenuItem>
                      <MenuItem value="Funcionário">Funcionário</MenuItem>
                    </TextField>

                    {/* Botão de Salvar */}
                    <Button
                      onClick={checkInputsUser}
                      variant="contained"
                      sx={{
                        width: "100%",
                        backgroundColor: "#26d07c",
                        "&:hover": {
                          backgroundColor: "#1fa968",
                        },
                      }}
                    >
                      {loading ? <CircularProgress size={24} /> : "Salvar"}
                    </Button>
                  </Box>
                </Modal>
              </Box>
            </Box>
          </>
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
        </Box>
      </LocalizationProvider>
    </div>
  );
};

export default CriarLista;
