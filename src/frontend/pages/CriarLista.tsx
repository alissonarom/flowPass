import React, { useState } from "react";
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
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import AddIcon from "@mui/icons-material/Add";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { ptBR } from "date-fns/locale";

// Dados mockados de promotores
const mockPromoters = [
  {
    id: 1,
    name: "Promotor A",
    cpf: "111.111.111-11",
    birthDate: "01/01/1990",
    phone: "(11) 1111-1111",
  },
  {
    id: 2,
    name: "Promotor B",
    cpf: "222.222.222-22",
    birthDate: "02/02/1991",
    phone: "(22) 2222-2222",
  },
];

const mockUsers = [
  { id: 1, name: "Alice Silva", cpf: "123.456.789-00" },
  { id: 2, name: "Bruno Costa", cpf: "234.567.890-11" },
  { id: 3, name: "Carla Mendes", cpf: "345.678.901-22" },
  { id: 4, name: "Diego Rocha", cpf: "456.789.012-33" },
  { id: 5, name: "Eduarda Lima", cpf: "567.890.123-44" },
  { id: 6, name: "Felipe Alves", cpf: "678.901.234-55" },
  { id: 7, name: "Gabriela Nunes", cpf: "789.012.345-66" },
  { id: 8, name: "Henrique Silva", cpf: "890.123.456-77" },
  { id: 9, name: "Isabela Torres", cpf: "901.234.567-88" },
];

const initialLists = [
  {
    title: "Lista 1",
    promoter: 1,
    users: [
      mockUsers[0],
      mockUsers[1],
      mockUsers[2],
      mockUsers[3],
      mockUsers[4],
    ],
  },
  {
    title: "Lista 2",
    promoter: 2,
    users: [mockUsers[5], mockUsers[6], mockUsers[7], mockUsers[8]],
  },
];

const CriarLista: React.FC = () => {
  const navigate = useNavigate();
  const [listTitle, setListTitle] = useState("");
  const [selectedPromoter, setSelectedPromoter] = useState("");
  const [selectedUser, setSelectedUser] = useState("");
  const [userType, setUserType] = useState("");
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [lists, setLists] = useState<any[]>(initialLists);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newPromoter, setNewPromoter] = useState({
    name: "",
    cpf: "",
    birthDate: "",
    phone: "",
  });
  const [foundUser, setFoundUser] = useState<{
    id: number;
    name: string;
    cpf: string;
  } | null>(null);
  const [promoters, setPromoters] = useState(mockPromoters);
  const [currentListIndex, setCurrentListIndex] = useState(null);
  const [cpfSearch, setCpfSearch] = useState("");
  const [newUser, setNewUser] = useState({ name: "", cpf: "" });
  const [newUserInputs, setNewUserInputs] = useState(false);
  const [openModal, setOpenModal] = useState(false);

  // Função para salvar a lista
  const handleSaveList = () => {
    const newList = {
      title: listTitle,
      promoter: selectedPromoter,
      users: [
        {
          name: mockUsers.find((u) => u.id === Number(selectedUser))?.name,
          cpf: mockUsers.find((u) => u.id === Number(selectedUser))?.cpf,
        },
      ],
      userType,
      startDate,
      endDate,
    };
    setLists([...lists, newList]);
    alert("Lista salva com sucesso!");
    setListTitle("");
    setSelectedPromoter("");
    setSelectedUser("");
    setUserType("");
    setStartDate(null);
    setEndDate(null);
  };

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleSavePromoter = () => {
    const newId = promoters.length + 1; // Gera um novo ID
    const promoterToAdd = { id: newId, ...newPromoter };
    setPromoters([...promoters, promoterToAdd]); // Adiciona o novo promotor à lista
    setSelectedPromoter(newId.toString()); // Seleciona o novo promotor automaticamente
    handleCloseModal(); // Fecha o modal
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewPromoter({ ...newPromoter, [name]: value });
  };

  const handleOpenModalList = (index: any) => {
    setCurrentListIndex(index);
    setCpfSearch("");
    setFoundUser(null);
    setNewUser({ name: "", cpf: "" });
    setOpenModal(true);
  };

  const handleAddExistingUser = () => {
    if (foundUser && currentListIndex !== null) {
      const updatedLists = [...lists];
      updatedLists[currentListIndex].users.push(foundUser);
      setLists(updatedLists);
      setOpenModal(false);
    }
  };

  const handleSearch = () => {
    const user = mockUsers.find((u) => u.cpf === cpfSearch);
    setFoundUser(user || null);
  };

  const handleAddNewUser = () => {
    const newUserWithId = { ...newUser, id: mockUsers.length + 1 };
    mockUsers.push(newUserWithId);
    const updatedLists = [...lists];
    if (currentListIndex !== null) {
      updatedLists[currentListIndex].users.push(newUserWithId);
    }
    setLists(updatedLists);
    setOpenModal(false);
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
        <Box sx={{ paddingInline: "20px" }}>
          {/* Primeiro Box: Criação de Lista */}
          <Typography variant="h6" gutterBottom sx={{ marginTop: "24px" }}>
            Criar Nova Lista
          </Typography>
          <Box
            sx={{
              backgroundColor: "white",
              borderRadius: "8px",
              boxShadow: 3,
              padding: "20px",
              marginBottom: "20px",
            }}
          >
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
                  value={selectedPromoter}
                  onChange={(e) => {
                    if (e.target.value === "new") {
                      handleOpenModal(); // Abre o modal se a opção for "Cadastrar novo promotor"
                    } else {
                      setSelectedPromoter(e.target.value); // Seleciona o promotor
                    }
                  }}
                  displayEmpty
                  fullWidth
                  sx={{ marginBottom: "20px" }}
                >
                  <MenuItem value="" disabled>
                    Selecione um Promotor
                  </MenuItem>
                  {promoters.map((promoter) => (
                    <MenuItem key={promoter.id} value={promoter.id}>
                      {promoter.name}
                    </MenuItem>
                  ))}
                  <MenuItem value="new">Cadastrar novo promotor</MenuItem>
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
                      value={newPromoter.name}
                      onChange={handleInputChange}
                      sx={{ marginBottom: "20px" }}
                    />
                    <TextField
                      label="CPF"
                      name="cpf"
                      fullWidth
                      value={newPromoter.cpf}
                      onChange={handleInputChange}
                      sx={{ marginBottom: "20px" }}
                    />
                    {/* DatePicker para Data de Nascimento */}
                    <DatePicker
                      label="Data de Nascimento"
                      value={
                        newPromoter.birthDate
                          ? new Date(newPromoter.birthDate)
                          : null
                      }
                      onChange={(newValue) =>
                        setNewPromoter({
                          ...newPromoter,
                          birthDate: newValue
                            ? newValue.toISOString().split("T")[0]
                            : "",
                        })
                      }
                      sx={{ marginBottom: "20px", width: "100%" }}
                      format="dd/MM/yyyy"
                    />
                    <TextField
                      label="Telefone"
                      name="phone"
                      fullWidth
                      value={newPromoter.phone}
                      onChange={handleInputChange}
                      sx={{ marginBottom: "20px" }}
                    />

                    {/* Botão de Salvar */}
                    <Button
                      variant="contained"
                      sx={{
                        backgroundColor: "#26d07c",
                        "&:hover": {
                          backgroundColor: "#1fa968",
                        },
                      }}
                      onClick={handleSavePromoter}
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
              onClick={handleSaveList}
            >
              Salvar Lista
            </Button>
          </Box>

          {/* Segundo Box: Listas dos Promotores */}
          <Typography variant="h6" gutterBottom sx={{ marginTop: "24px" }}>
            Listas dos Promotores
          </Typography>

          {/* Lista de Acordeões */}
          {lists.map((list, index) => (
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
                      <ListItemText primary={user.name} secondary={user.cpf} />
                    </ListItem>
                  ))}
                </List>
              </AccordionDetails>
            </Accordion>
          ))}
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
      </LocalizationProvider>
    </Box>
  );
};

export default CriarLista;
