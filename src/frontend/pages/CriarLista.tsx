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
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import AddIcon from "@mui/icons-material/Add";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { ptBR } from "date-fns/locale";
import {
  createList,
  createPromoter,
  getLists,
  getPromoters,
} from "../services";
import { Decimal128 } from "bson";
import { IPromoter, IUser, List as ListType, UserProfile } from "../types";
import { formatPhoneNumber, handleCpfChange, validateCPF } from "../utils";

const CriarLista: React.FC = () => {
  const navigate = useNavigate();
  const [listTitle, setListTitle] = useState("");
  const [selectedPromoter, setSelectedPromoter] = useState<IPromoter | null>(
    null
  );
  const [selectedUser, setSelectedUser] = useState("");
  const [userType, setUserType] = useState("");
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [lists, setLists] = useState<ListType[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [promoters, setPromoters] = useState<IPromoter[]>([]);
  const [foundUser, setFoundUser] = useState<{
    id: number;
    name: string;
    cpf: string;
  } | null>(null);
  const [currentListIndex, setCurrentListIndex] = useState(null);
  const [cpfSearch, setCpfSearch] = useState("");
  const [newUser, setNewUser] = useState({ name: "", cpf: "" });
  const [newUserInputs, setNewUserInputs] = useState(false);
  const [openModal, setOpenModal] = useState(false);
  const [newPromoter, setNewPromoter] = useState<IUser>({
    name: "",
    cpf: "",
    birthDate: null,
    phone: "",
    gender: "",
    profile: UserProfile.Promoter,
    anniversary: false,
    history: [],
    penalties: [],
    currentLists: [],
    cash: new Decimal128("0"),
  });
  const [errorCpf, setErrorCpf] = useState<boolean>(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarSeverity, setSnackbarSeverity] = useState<"success" | "error">(
    "success"
  );
  const [snackbarMessage, setSnackbarMessage] = useState("");

  const checkInputs = () => {
    const isFormValid =
      newPromoter.name &&
      newPromoter.cpf.length === 14 &&
      newPromoter.birthDate &&
      newPromoter.phone &&
      newPromoter.gender;

    const isCpfValid = validateCPF(newPromoter.cpf);

    setErrorCpf(!isCpfValid);

    if (isFormValid && isCpfValid) {
      handleCreatePromoter();
    }
  };

  // Função para salvar a lista
  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  // Função para criar um promotor
  const handleCreatePromoter = async () => {
    if (!newPromoter) {
      console.error("Dados do promotor estão incompletos ou nulos.");
      return;
    }

    try {
      const createdPromoter = await createPromoter(newPromoter);
      setPromoters((prevPromoters) => [...prevPromoters, createdPromoter]);
      setSnackbarMessage("Promotor criado com sucesso!");
      setSnackbarSeverity("success");
      setSnackbarOpen(true);
    } catch (error) {
      console.error("Erro ao criar promotor:", error);
      setSnackbarMessage("Erro ao criar Promotor. Tente novamente.");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    if (newPromoter) {
      setNewPromoter({ ...newPromoter, [name]: value });
    }
  };

  const handleFormatChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const value = handleCpfChange(e.target.value);

    if (newPromoter) {
      setNewPromoter((prevPromoter) => ({
        ...prevPromoter,
        cpf: value,
      }));
    }
  };

  const handleOpenModalList = (index: any) => {
    setCurrentListIndex(index);
    setCpfSearch("");
    setFoundUser(null);
    setNewUser({ name: "", cpf: "" });
    setOpenModal(true);
  };

  const handleAddExistingUser = () => {
    // if (foundUser && currentListIndex !== null) {
    //   const updatedLists = [...lists];
    //   updatedLists[currentListIndex].users.push(foundUser);
    //   setLists(updatedLists);
    //   setOpenModal(false);
    // }
  };

  const handleSearch = () => {
    // const user = mockUsers.find((u) => u.cpf === cpfSearch);
    // setFoundUser(user || null);
  };

  const handleAddNewUser = () => {
    // const newUserWithId = { ...newUser, id: mockUsers.length + 1 };
    // mockUsers.push(newUserWithId);
    // const updatedLists = [...lists];
    // if (currentListIndex !== null) {
    //   updatedLists[currentListIndex].users.push(newUserWithId);
    // }
    // setLists(updatedLists);
    // setOpenModal(false);
  };

  useEffect(() => {
    const fetchLists = async () => {
      try {
        const data = await getLists();
        setLists(data);
      } catch (error) {
        console.error("Erro ao carregar listas:", error);
      }
    };

    fetchLists();
  }, []);

  // Carrega os promotores ao montar o componente
  useEffect(() => {
    clearStates();
    const fetchPromoters = async () => {
      try {
        const data = await getPromoters();
        setPromoters(data);
      } catch (error) {
        console.error("Erro ao carregar promotores:", error);
      }
    };

    fetchPromoters();
  }, []);

  const clearStates = () => {
    setListTitle("");
    setSelectedPromoter(null);
    setSelectedUser("");
    setUserType("");
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
      console.log("Nova lista:", newList);

      try {
        const createdList = await createList(newList);
        setLists((prevLists) => [...prevLists, createdList]);
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
    <Box
      sx={{
        backgroundColor: "#EDEDED",
        minHeight: "100vh",
        paddingBottom: "20px",
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
          sx={{
            backgroundColor: "white",
            borderRadius: "8px",
            boxShadow: 3,
            padding: "20px",
            margin: "20px",
          }}
        >
          {/* Primeiro Box: Criação de Lista */}
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
                        promoters.find((p) => p._id === selectedPromoterId) ||
                        null;
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

                    {/* Formulário de Cadastro */}
                    <TextField
                      label="Nome"
                      name="name"
                      fullWidth
                      value={newPromoter?.name}
                      onChange={handleInputChange}
                      error={!newPromoter?.name}
                      helperText={!newPromoter?.name && "Campo obrigatório."}
                      sx={{ marginBottom: "20px" }}
                    />
                    <TextField
                      label="CPF"
                      name="cpf"
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
              }}
              onClick={handleCreateList}
            >
              Criar Lista
            </Button>
          </Box>
        </Box>
        <Box
          sx={{
            backgroundColor: "white",
            borderRadius: "8px",
            boxShadow: 3,
            padding: "20px",
            margin: "20px",
          }}
        >
          <Box>
            {/* Segundo Box: Listas dos Promotores */}
            <Typography variant="h6" gutterBottom>
              Listas dos Promotores
            </Typography>

            {/* Lista de Acordeões */}
            {lists.length ? (
              lists.map((list, index) => (
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
                      {list.title} - Promotor {list.promoter}
                    </Typography>
                    <Button
                      onClick={() => handleOpenModalList(index)}
                      startIcon={<AddIcon />}
                      variant="contained"
                      sx={{ marginLeft: "auto" }}
                    >
                      Adicionar participante
                    </Button>
                  </AccordionSummary>
                  <AccordionDetails sx={{ backgroundColor: "#f0f0f0" }}>
                    <List>
                      {list.users.map((user: any) => (
                        <ListItem key={user.id}>
                          <ListItemText
                            primary={user.name}
                            secondary={user.cpf}
                          />
                        </ListItem>
                      ))}
                    </List>
                  </AccordionDetails>
                </Accordion>
              ))
            ) : (
              <Typography variant="subtitle2" sx={{ color: "gray" }}>
                Nenhuma lista cadastrada
              </Typography>
            )}
            {/* Modal de Adicionar Participante */}
            <Modal open={openModal} onClose={() => setOpenModal(false)}>
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
                    value={cpfSearch}
                    onChange={(e) => setCpfSearch(e.target.value)}
                    fullWidth
                  />
                  <Button variant="contained" onClick={handleSearch}>
                    Buscar
                  </Button>
                </Box>
                {foundUser ? (
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
                    }}
                  >
                    <Typography>
                      {foundUser.name} - {foundUser.cpf}
                    </Typography>
                  </Box>
                ) : (
                  <Button
                    fullWidth
                    variant="outlined"
                    onClick={() => setNewUserInputs(!newUserInputs)}
                  >
                    Cadastrar usuário
                  </Button>
                )}
                {newUserInputs && (
                  <Box mt={2}>
                    <TextField
                      label="Nome"
                      value={newUser.name}
                      onChange={(e) =>
                        setNewUser({ ...newUser, name: e.target.value })
                      }
                      fullWidth
                      sx={{ mb: 2 }}
                    />
                    <TextField
                      label="CPF"
                      value={newUser.cpf}
                      onChange={(e) =>
                        setNewUser({ ...newUser, cpf: e.target.value })
                      }
                      fullWidth
                      sx={{ mb: 2 }}
                    />
                    <Box display="flex" justifyContent="space-between">
                      <Button variant="contained" onClick={handleAddNewUser}>
                        Adicionar
                      </Button>
                      <Button
                        variant="outlined"
                        onClick={() => setOpenModal(false)}
                      >
                        Cancelar
                      </Button>
                    </Box>
                  </Box>
                )}
              </Box>
            </Modal>
          </Box>
        </Box>
      </LocalizationProvider>
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
  );
};

export default CriarLista;
