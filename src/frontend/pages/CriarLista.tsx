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
  Checkbox,
  FormControlLabel,
  Chip,
  useMediaQuery,
  Grid2,
  Stack,
  InputAdornment,
  Tabs,
  Tab,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { ptBR } from "date-fns/locale";
import {
  createEvent,
  createList,
  createOrUpdateUser,
  getEvents,
  getLists,
  getPromoters,
  getUserById,
  getUserProfileByCpf,
  getUsers,
  updateEvent,
  updateList,
  updatePromotorCash,
} from "../services";
import {
  IEvent,
  IListHistory,
  ILot,
  IPromoter,
  IUser,
  List as ListType,
  TabPanelProps,
} from "../types";
import {
  formatPhoneNumber,
  getUserFromLocalStorage,
  handleCpfChange,
  validateCPF,
} from "../utils";
import { AxiosError } from "axios";
import { AssignmentTurnedIn, Person } from "@mui/icons-material";

const CriarLista: React.FC = () => {
  const user = getUserFromLocalStorage();
  const navigate = useNavigate();
  const [listTitle, setListTitle] = useState("");
  const [selectedPromoter, setSelectedPromoter] = useState<IPromoter | null>(
    null
  );
  const [startDate, setStartDate] = useState<Date | null>(new Date());
  const [endDate, setEndDate] = useState<Date | null>(new Date());
  const [lists, setLists] = useState<ListType[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isModalOpenTicket, setIsModalOpenTicket] = useState(false);
  const [isModalOpenUsuário, setIsModalOpenUsuário] = useState(false);
  const [promoters, setPromoters] = useState<IPromoter[]>([]);
  const [events, setEvents] = useState<IEvent[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<IEvent | null>(null);
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
  const isAmorChurch = user?.client_id === "amorChurch";
  const [isExam, setIsExam] = useState(false);
  const [userIds, setUserIds] = useState<string[]>([]);
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const [isFree, setisFree] = useState<boolean>(false);
  const [motivo, setMotivo] = useState<string>("");
  const [lotTitle, setLotTitle] = useState("");
  const [lotQuantity, setLotQuantity] = useState("");
  const [lotValue, setLotValue] = useState("");
  const [lots, setLots] = useState<ILot[]>([]);
  const [value, setValue] = React.useState(0);

  const checkInputs = async () => {
    const isFormValid =
      newPromoter.name &&
      newPromoter.cpf.length === 14 &&
      newPromoter.birthDate &&
      newPromoter.phone &&
      newPromoter.gender;

    const isCpfValid = validateCPF(newPromoter.cpf);

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

    try {
      const profile = await getUserProfileByCpf(newPromoter.cpf); // Busca o perfil do usuário pelo CPF
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
    setIsModalOpenTicket(false);
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
      handleCloseModal();
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
    const isClosedCurrentListUser =
      foundUser && foundUser.currentLists.length > 0
        ? isListClosed(
            new Date(lists[Number(foundUser.currentLists[0])].endDate)
          )
        : false;

    if (foundUser && currentListIndex !== null) {
      // Extrai os IDs dos usuários existentes
      const existingUserIds = lists[currentListIndex].users
        .map((user) => user._id) // Mapeia para um array de strings ou undefined
        .filter((id): id is string => id !== undefined); // Filtra apenas strings válidas

      // Verifica se o usuário já está na lista
      if (
        (foundUser._id && existingUserIds.includes(foundUser._id)) ||
        !isClosedCurrentListUser
      ) {
        setSnackbarMessage("Usuário já está numa lista ativa.");
        setSnackbarSeverity("error");
        setSnackbarOpen(true);
        return;
      }

      // Cria a lista de IDs de usuários atualizada
      const updatedUsers = [...existingUserIds, foundUser._id];

      try {
        // Atualiza a lista no backend usando a função updateList
        const upList = await updateList(lists[currentListIndex]._id ?? "", {
          users: updatedUsers.filter((id): id is string => id !== undefined),
        });

        if (!upList) {
          setSnackbarMessage("Erro ao adicionar usuário. Tente novamente.");
          setSnackbarSeverity("error");
          setSnackbarOpen(true);
          return;
        }
        const hasExistingEntry = foundUser.history.some(
          (entry) => entry.listId === lists[currentListIndex]._id
        );
        // Atualiza o usuário com as novas informações
        const updatedUser: IUser = {
          ...foundUser, // Mantém todos os outros campos do usuário
          history: hasExistingEntry
            ? foundUser.history
            : [
                ...foundUser.history,
                {
                  listId: lists[currentListIndex]._id || "", // Ensure listId is a string
                  joinedAt: new Date(), // Data de entrada
                  leftAt: lists[currentListIndex].endDate, // Data de saída (null porque o usuário ainda não saiu)
                  name: lists[currentListIndex].title,
                  ticket: {
                    free: isFree,
                    reason: motivo,
                    approver: user?.id || "",
                  },
                },
              ], // Mantém o histórico existente
          currentLists: [lists[currentListIndex]._id!],
        };

        // Atualiza o usuário no backend
        await createOrUpdateUser(updatedUser);
        const isPromotor = lists[currentListIndex].owner._id === foundUser._id;
        if (!isFree && !isPromotor) {
          // Atualiza o campo 'cash' do promotor
          const promotor = lists[currentListIndex].owner; // Supondo que o owner seja o ID do promotor
          await updatePromotorCash(promotor, 5); // Incrementa 5 reais
        }

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

      const userToRemove = await getUserById(idUser);

      // Filtra os usuários da lista, removendo o usuário com o ID especificado
      const updatedUsers = currentList.users
        .map((user) => user._id)
        .filter((user) => user !== idUser);

      // Atualiza a lista no backend
      await updateList(currentList._id ?? "", {
        users: updatedUsers.filter((id): id is string => id !== undefined),
      });

      if (userToRemove) {
        await createOrUpdateUser({
          ...userToRemove, // Usa os dados do usuário obtidos
          currentLists: [],
        });
      }

      // Atualiza o estado local (lists) com a lista atualizada
      fetchLists();

      if (!(isAmorChurch || isFree)) {
        // Atualiza o campo 'cash' do promotor (subtrai 5 reais)
        const promotor = currentList.owner; // Supondo que `owner` seja o objeto do promotor
        await updatePromotorCash(promotor, -5); // Decrementa 5 reais
      }

      setSnackbarMessage("Usuário removido com sucesso.");
      setSnackbarSeverity("success");
      setSnackbarOpen(true);
    } catch (error) {
      console.error("Erro ao remover usuário da lista:", error);
      setSnackbarMessage("Erro ao remover usuário. Tente novamente.");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    }
  };

  const fetchLists = async () => {
    setLoadingLists(true);
    setLoading(true);
    try {
      const data = await getLists();

      // Filtra as listas
      const filteredLists = data.filter((list: ListType) => {
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
          // TODO Se o domain for "amorChurch", filtra também por startDate igual a today

          // if (list.domain === "amorChurch") {
          //   return (
          //     startDateWithoutTime.getTime() === todayWithoutTime.getTime()
          //   );
          // }
          // Caso contrário, retorna true (filtra apenas por domain)
          return true;
        }
        // Se o domain não for igual ao client_id do usuário, retorna false
        return false;
      });

      setLists(filteredLists); // Atualiza o estado com as listas filtradas
    } catch (error) {
      console.error("Erro ao carregar listas:", error);
    } finally {
      setLoading(false);
      setLoadingLists(false);
    }
  };

  const fetchUsers = async () => {
    setLoading(true);
    try {
      // Recupera o client_id do usuário do localStorage
      const clientId = user?.client_id;

      if (!clientId) {
        console.error("client_id não encontrado no localStorage");
        return;
      }

      // Busca todos os usuários
      const users = await getUsers();

      // Filtra os usuários pelo client_id
      const filteredUsers = users.filter(
        (user: any) => user.client_id === clientId
      );

      // Extrai os _ids dos usuários filtrados
      const ids = filteredUsers.map((user: any) => user._id);

      // Atualiza o estado com os _ids
      setUserIds(ids);
    } catch (error) {
      console.error("Erro ao buscar usuários:", error);
    } finally {
      setLoading(false);
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

  const fetchPromoters = async () => {
    setLoading(true);
    try {
      const data = await getPromoters();
      setPromoters(data);
    } catch (error) {
      console.error("Erro ao carregar promotores:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const data = await getEvents();
      setEvents(data);
    } catch (error) {
      console.error("Erro ao carregar Eventos:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateEvent = async () => {
    setLoading(true);
    try {
      const newEvent = {
        title: listTitle,
        owner: user?.id || "",
        startDate: startDate,
        endDate: endDate,
        lists: [],
        domain: user?.client_id || "",
        lot: lots,
      };

      await createEvent(newEvent);
      setSnackbarMessage("Evento criado com sucesso!");
      setSnackbarSeverity("success");
      setSnackbarOpen(true);
      clearStates();
    } catch (error) {
      console.error("Erro ao criar Evento:", error);
      setSnackbarMessage(`Erro ao criar Evento: ${error}. Tente novamente.`);
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    } finally {
      setLoading(false);
      fetchEvents();
    }
  };

  useEffect(() => {
    clearStates();
    fetchLists();
    fetchUsers();
    fetchPromoters();
    fetchEvents();
  }, []);

  const clearStates = () => {
    setListTitle("");
    setListTitle("");
    setSelectedPromoter(null);
    setStartDate(new Date());
    setEndDate(new Date());
    setIsExam(false);
  };

  const handleCreateList = async () => {
    setLoadingLists(true);
    if (startDate && endDate) {
      const newList = {
        title: listTitle,
        owner: isAmorChurch ? user.id : selectedPromoter?._id || "", // ID do promotor
        startDate: startDate,
        endDate: endDate,
        users: isAmorChurch ? userIds : [],
        domain: user?.client_id || "",
        isExam: isExam,
        eventId: selectedEvent?._id || "",
      };

      try {
        // Cria a lista e obtém o ID da lista criada
        const createdList = await createList(newList);

        // Se isAmorChurch for true, atualiza o histórico de cada usuário
        if (isAmorChurch && createdList?._id) {
          const listId = createdList._id; // ID da lista criada
          const listName = createdList.title; // Nome da lista criada

          // Para cada usuário, adiciona um registro no histórico
          for (const userId of userIds) {
            const userToUpdate = await getUserById(userId); // Função para buscar o usuário pelo ID

            if (userToUpdate) {
              const newHistoryEntry: IListHistory = {
                listId: listId,
                name: listName,
                joinedAt: new Date(), // Data atual
                isExam: isExam,
                ticket: {
                  free: isFree,
                  reason: "",
                  approver: user.id || "",
                },
              };

              // Atualiza o histórico do usuário
              userToUpdate.history.push(newHistoryEntry);

              // Atualiza o usuário no banco de dados
              await createOrUpdateUser(userToUpdate);
            }
          }
        }

        // Recarrega as listas após a criação
        fetchLists();

        // Atualiza o evento com o ID da nova lista
        if (selectedEvent?._id && createdList?._id) {
          const updatedEvent = await updateEvent(selectedEvent._id, {
            ...selectedEvent,
            lists: [...selectedEvent.lists, createdList],
          });

          if (!updatedEvent) {
            throw new Error("Falha ao atualizar o evento com a nova lista");
          }
        }

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

  // Função para adicionar lote
  const handleAddLot = () => {
    const newLot: ILot = {
      title: lotTitle,
      quantity: Number(lotQuantity),
      value: Number(lotValue),
      sold_out: false,
    };

    setLots([...lots, newLot]);
    setLotTitle("");
    setLotQuantity("");
    setLotValue("");
  };

  // Função para remover lote
  const handleRemoveLot = (index: number) => {
    const updatedLots = [...lots];
    updatedLots.splice(index, 1);
    setLots(updatedLots);
  };

  function CustomTabPanel(props: TabPanelProps) {
    const { children, value, index, ...other } = props;

    return (
      <div
        role="tabpanel"
        // hidden={value !== index}
        id={`simple-tabpanel-${index}`}
        aria-labelledby={`simple-tab-${index}`}
        {...other}
        style={{
          display: value !== index ? "none" : "block",
        }}
      >
        {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
      </div>
    );
  }

  function a11yProps(index: number) {
    return {
      id: `simple-tab-${index}`,
      "aria-controls": `simple-tabpanel-${index}`,
    };
  }

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
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
                marginInline: { xs: "10px", sm: "20px" },
              }}
            />
          </Toolbar>
        </AppBar>
        {/* Container */}
        <Box sx={{ borderBottom: 1, borderColor: "divider", padding: 0 }}>
          <Tabs
            value={value}
            onChange={handleChange}
            aria-label="basic tabs example"
          >
            <Tab label="Criar" {...a11yProps(0)} />
            <Tab label="Relatórios" {...a11yProps(1)} />
          </Tabs>
        </Box>
        <CustomTabPanel value={value} index={0} key="tab2">
          <Box
            width="100%"
            display="flex"
            marginTop={{ xs: "0px", md: "30px" }}
            flexDirection={{ xs: "column", md: "column" }}
            sx={{
              backgroundColor: "#EDEDED",
            }}
          >
            <>
              {/* Criar Novo Evento */}
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
                  Novo Evento
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
                    <Grid
                      item
                      display={"flex"}
                      sx={{
                        display: "flex",
                        flexGrow: 1,
                        flexDirection: isDesktop ? "row" : "column",
                      }}
                    >
                      {/* Título do Evento */}
                      <TextField
                        label="Título do Evento"
                        fullWidth
                        value={listTitle}
                        onChange={(e) => setListTitle(e.target.value)}
                        sx={{
                          marginBottom: "20px",
                          flex: "none",
                          flexShrink: 1,
                        }}
                      />
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

                  {/* Adicionar Lotes */}
                  <Grid item xs={12}>
                    <Typography variant="subtitle1" gutterBottom>
                      Criar Lotes
                    </Typography>

                    <Grid container spacing={2} alignItems="center">
                      <Grid item xs={12} sm={4}>
                        <TextField
                          label="Título do Lote"
                          fullWidth
                          value={lotTitle}
                          onChange={(e) => setLotTitle(e.target.value)}
                        />
                      </Grid>
                      <Grid item xs={12} sm={3}>
                        <TextField
                          label="Quantidade"
                          type="number"
                          fullWidth
                          value={lotQuantity}
                          onChange={(e) => setLotQuantity(e.target.value)}
                          inputProps={{ min: 1 }}
                        />
                      </Grid>
                      <Grid item xs={12} sm={3}>
                        <TextField
                          label="Valor (R$)"
                          type="number"
                          fullWidth
                          value={lotValue}
                          onChange={(e) => setLotValue(e.target.value)}
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                R$
                              </InputAdornment>
                            ),
                          }}
                          inputProps={{ step: "0.01", min: 0 }}
                        />
                      </Grid>
                      <Grid item xs={12} sm={2}>
                        <Button
                          variant="contained"
                          color="success"
                          startIcon={<AddIcon />}
                          onClick={handleAddLot}
                          disabled={!lotTitle || !lotQuantity || !lotValue}
                          fullWidth
                          sx={{
                            maxHeight: "fit-content",
                            marginTop: 5,
                            marginBottom: 30,
                          }} // Para alinhar com os campos
                        >
                          Adicionar lote
                        </Button>
                      </Grid>
                    </Grid>

                    {/* Lista de Lotes Adicionados */}
                    {lots.length > 0 && (
                      <Box sx={{ mt: 3 }}>
                        <Typography variant="subtitle2" gutterBottom>
                          Lotes adicionados:
                        </Typography>
                        <List dense>
                          {lots.map((lot, index) => (
                            <ListItem
                              key={index}
                              secondaryAction={
                                <IconButton
                                  edge="end"
                                  aria-label="delete"
                                  onClick={() => handleRemoveLot(index)}
                                  color="error"
                                >
                                  <DeleteIcon />
                                </IconButton>
                              }
                            >
                              <ListItemText
                                primary={`${lot.title} - ${lot.quantity} ingressos`}
                                secondary={`R$ ${lot.value.toFixed(2)}`}
                              />
                            </ListItem>
                          ))}
                        </List>
                      </Box>
                    )}
                  </Grid>

                  <Button
                    disabled={!(lots && listTitle && startDate && endDate)}
                    variant="contained"
                    sx={{
                      backgroundColor: "#26d07c",
                      "&:hover": {
                        backgroundColor: "#1fa968",
                        height: "54px",
                      },
                      display: "flex",
                      justifySelf: "stretch",
                    }}
                    onClick={handleCreateEvent}
                  >
                    Criar Evento
                  </Button>
                </Box>
              </Box>

              {/* Criar Nova Lista */}
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
                  Nova {isAmorChurch ? "Aula" : "Lista"}
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
                      {/* Select de Eventos */}
                      <Select
                        value={selectedEvent?._id || ""}
                        onChange={(e) => {
                          const selectedEvent =
                            events.find(
                              (event) => event._id === e.target.value
                            ) || null;
                          setSelectedEvent(selectedEvent);
                        }}
                        displayEmpty
                        fullWidth
                        sx={{ marginBottom: "20px" }}
                      >
                        <MenuItem value="" disabled sx={{ color: "gray" }}>
                          Selecione um Evento
                        </MenuItem>
                        {events.length > 0 ? (
                          events.map((event) => (
                            <MenuItem key={event._id} value={event._id}>
                              {event.title}
                            </MenuItem>
                          ))
                        ) : (
                          <MenuItem>Nenhum evento cadastrado</MenuItem>
                        )}
                        <MenuItem
                          sx={{ backgroundColor: "#dffff2" }}
                          value="new"
                        >
                          Cadastrar novo promotor
                        </MenuItem>
                      </Select>
                    </Grid>
                    <Grid
                      item
                      display={"flex"}
                      sx={{
                        display: "flex",
                        flexGrow: 1,
                        flexDirection: isDesktop ? "row" : "column",
                      }}
                    >
                      {/* Título da Lista */}
                      <TextField
                        label="Título da Lista"
                        fullWidth
                        value={listTitle}
                        onChange={(e) => setListTitle(e.target.value)}
                        sx={{
                          marginBottom: "20px",
                          flex: "none",
                          flexShrink: 1,
                        }}
                      />
                      {isAmorChurch && (
                        <FormControlLabel
                          sx={{ marginInline: "20px", marginBottom: "20px" }}
                          control={
                            <Checkbox
                              checked={isExam}
                              onChange={(
                                event: React.ChangeEvent<HTMLInputElement>
                              ) => {
                                setIsExam(event.target.checked);
                              }}
                              sx={{ "& .MuiSvgIcon-root": { fontSize: 30 } }}
                            />
                          }
                          label="Nesta aula terá prova."
                        />
                      )}
                    </Grid>
                    {!isAmorChurch && (
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
                          <MenuItem
                            sx={{ backgroundColor: "#dffff2" }}
                            value="new"
                          >
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
                                    Usuário já cadastrado na base. Para
                                    promove-lo à Promotor acesse o perfil do
                                    usuário.
                                  </Typography>
                                ) : (
                                  <Typography>
                                    Usuário já é um promotor.
                                  </Typography>
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
                    )}
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
                  {isAmorChurch ? (
                    <Button
                      disabled={!(listTitle && startDate && endDate)}
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
                      Criar Aula
                    </Button>
                  ) : (
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
                  )}
                </Box>
              </Box>

              {/* Listas dos Promotores */}
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
                    {isAmorChurch ? "Aulas" : "Listas dos Promotores"}
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
                              borderBottom: "1px",
                              borderBottomColor: "#caffd2",
                              alignItems: "center",
                            }}
                          >
                            <AccordionSummary
                              expandIcon={<ExpandMoreIcon />}
                              sx={{ alignItems: { xs: "center" } }}
                            >
                              <Typography>
                                {list.title}{" "}
                                {isAmorChurch
                                  ? ""
                                  : `- Promotor: ${list.owner.name}`}{" "}
                                - de{" "}
                                {new Date(list.startDate).toLocaleDateString()}
                                {!isAmorChurch
                                  ? ` a ${new Date(list.endDate).toLocaleDateString()}`
                                  : ""}
                              </Typography>
                              {list.isExam ? (
                                <Chip
                                  label="Prova"
                                  icon={<AssignmentTurnedIn />}
                                  color="secondary"
                                  sx={{
                                    marginLeft: "auto",
                                    marginRight: "50px",
                                  }}
                                />
                              ) : null}
                            </AccordionSummary>
                            <AccordionDetails
                              sx={{ backgroundColor: "#f0f0f0" }}
                            >
                              <List>
                                {!isAmorChurch ? (
                                  <Button
                                    onClick={() => handleOpenModalList(index)}
                                    startIcon={<AddIcon />}
                                    endIcon={<Person />}
                                    variant="contained"
                                    sx={{
                                      marginLeft: "auto",
                                      maxHeight: "fit-content",
                                      width: "100%",
                                    }}
                                    disabled={isClosed} // Desabilita o botão se a lista estiver fechada
                                  ></Button>
                                ) : null}
                                {list.users.length ? (
                                  list.users.map((user) => (
                                    <ListItem key={user._id}>
                                      <ListItemText
                                        primary={user.name}
                                        secondary={
                                          isAmorChurch ? user.profile : user.cpf
                                        }
                                        sx={{
                                          ".MuiListItemText-primary": {
                                            width: "80%",
                                          },
                                        }}
                                      />

                                      {user.client_id == "greyMist" && (
                                        <ListItemText
                                          primary={
                                            user.history[
                                              user.history.length - 1
                                            ]?.ticket.free
                                              ? "Free"
                                              : "Pagante"
                                          } // TODO o tipo de entrada precisa persistir em todas as listas
                                        />
                                      )}
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
                      Nenhuma {isAmorChurch ? "aula" : "lista cadastrada"}
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
                        <Stack
                          spacing={4}
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
                          <Box onClick={handleAddExistingUser}>
                            <Typography>
                              {foundUser.name} - {foundUser.cpf}
                            </Typography>
                          </Box>
                          <FormControlLabel
                            control={
                              <Checkbox
                                checked={isFree}
                                onChange={(event) => {
                                  if (!isFree) {
                                    setIsModalOpenTicket(true); // Se estava false, abre o modal
                                  } else {
                                    setisFree(false);
                                    setMotivo(""); // Se estava true, apenas desmarca
                                  }
                                }}
                                sx={{
                                  "& .MuiSvgIcon-root": { fontSize: 30 },
                                }}
                              />
                            }
                            label="Free"
                          />
                        </Stack>
                      )}
                      {verifyUser && (
                        <>
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
                          <Button
                            fullWidth
                            variant="outlined"
                            onClick={handleOpenModalUsuário}
                            disabled={cpfSearch.length < 14 || errorCpf}
                          >
                            Cadastrar usuário
                          </Button>
                        </>
                      )}
                    </Box>
                  </Modal>
                  <Modal open={isModalOpenUsuário} onClose={handleCloseModal}>
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
                          newUser?.birthDate
                            ? new Date(newUser.birthDate)
                            : null
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
                        helperText={
                          !newUser?.profile ? "Campo obrigatório" : ""
                        } // Mensagem de erro
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
        </CustomTabPanel>
        <CustomTabPanel value={value} index={1} key="tab2">
          <Box
            width="100%"
            display="flex"
            marginTop={{ xs: "0px", md: "30px" }}
            flexDirection={{ xs: "column", md: "column" }}
            sx={{
              backgroundColor: "#EDEDED",
            }}
          >
            <>
              {/* Criar Nova Lista */}
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
                  Dados dos eventos
                </Typography>
              </Box>

              {/* Listas dos Promotores */}
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
                    {isAmorChurch ? "Aulas" : "Listas dos Promotores"}
                  </Typography>

                  {/* Lista de Acordeões */}
                  {loadingLists ? (
                    <CircularProgress style={{ color: "#00df81" }} size={64} />
                  ) : events.length ? (
                    <>
                      {events.map((event, index) => {
                        return (
                          <Accordion
                            key={index}
                            sx={{
                              backgroundColor: "#a8ddbd",
                              "&.Mui-expanded": { backgroundColor: "#caffd2" },
                              marginBottom: "10px",
                              borderBottom: "1px",
                              borderBottomColor: "#caffd2",
                              alignItems: "center",
                            }}
                          >
                            <AccordionSummary
                              expandIcon={<ExpandMoreIcon />}
                              sx={{ alignItems: { xs: "center" } }}
                            >
                              <Typography>
                                {event.title} - do dia{" "}
                                {event.startDate
                                  ? new Date(
                                      event.startDate
                                    ).toLocaleDateString()
                                  : "Data não disponível"}
                              </Typography>
                            </AccordionSummary>
                            <AccordionDetails
                              sx={{ backgroundColor: "#f0f0f0" }}
                            >
                              <List>
                                {event.lists.length ? (
                                  event.lists.map((list) => (
                                    <ListItem key={list._id}>
                                      <ListItemText
                                        primary={list.title}
                                        secondary={list.owner.name}
                                        sx={{
                                          ".MuiListItemText-primary": {
                                            width: "80%",
                                          },
                                        }}
                                      />
                                      <List>
                                        {list.users.length &&
                                          list.users.map((user) => (
                                            <ListItem key={user._id}>
                                              <ListItemText
                                                primary={user.name}
                                                secondary={
                                                  user.history[
                                                    user.history.length - 1
                                                  ]?.ticket.free
                                                    ? "Free"
                                                    : "Pagante"
                                                } // TODO o tipo de entrada precisa persistir em todas as listas
                                              />
                                            </ListItem>
                                          ))}
                                      </List>
                                    </ListItem>
                                  ))
                                ) : (
                                  <Typography
                                    variant="subtitle2"
                                    sx={{ color: "gray" }}
                                  >
                                    Essa lista está vazia
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
                      Nenhum evento encontrado
                    </Typography>
                  )}
                  {/* Modal de Adicionar Participante */}
                </Box>
              </Box>
            </>
          </Box>
        </CustomTabPanel>
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

export default CriarLista;
