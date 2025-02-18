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
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";

// Dados mockados (substitua por dados reais da API)
const mockPromoters = [
  { id: 1, name: "Promotor A" },
  { id: 2, name: "Promotor B" },
];

const mockUsers = [
  { id: 1, name: "João Silva", cpf: "529.982.247-25" },
  { id: 2, name: "Maria Oliveira", cpf: "123.456.789-00" },
];

const CriarLista: React.FC = () => {
  const [listTitle, setListTitle] = useState("");
  const [selectedPromoter, setSelectedPromoter] = useState("");
  const [selectedUser, setSelectedUser] = useState("");
  const [userType, setUserType] = useState("");
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [lists, setLists] = useState<any[]>([]);

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
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box sx={{ padding: "20px" }}>
        {/* Primeiro Box: Criação de Lista */}
        <Box
          sx={{
            backgroundColor: "white",
            borderRadius: "8px",
            boxShadow: 3,
            padding: "20px",
            marginBottom: "20px",
          }}
        >
          <Typography variant="h6" gutterBottom>
            Criar Nova Lista
          </Typography>

          {/* Título da Lista */}
          <TextField
            label="Título da Lista"
            fullWidth
            value={listTitle}
            onChange={(e) => setListTitle(e.target.value)}
            sx={{ marginBottom: "20px" }}
          />

          {/* Seleção do Promotor */}
          <Select
            value={selectedPromoter}
            onChange={(e) => setSelectedPromoter(e.target.value)}
            displayEmpty
            fullWidth
            sx={{ marginBottom: "20px" }}
          >
            <MenuItem value="" disabled>
              Selecione um Promotor
            </MenuItem>
            {mockPromoters.map((promoter) => (
              <MenuItem key={promoter.id} value={promoter.id}>
                {promoter.name}
              </MenuItem>
            ))}
          </Select>

          {/* Adicionar Usuário */}
          <Select
            value={selectedUser}
            onChange={(e) => setSelectedUser(e.target.value)}
            displayEmpty
            fullWidth
            sx={{ marginBottom: "20px" }}
          >
            <MenuItem value="" disabled>
              Selecione um Usuário
            </MenuItem>
            {mockUsers.map((user) => (
              <MenuItem key={user.id} value={user.id}>
                {user.name} - {user.cpf}
              </MenuItem>
            ))}
          </Select>

          {/* Tipo de Usuário */}
          <Select
            value={userType}
            onChange={(e) => setUserType(e.target.value)}
            displayEmpty
            fullWidth
            sx={{ marginBottom: "20px" }}
          >
            <MenuItem value="" disabled>
              Selecione o Tipo de Usuário
            </MenuItem>
            <MenuItem value="aniversariante">Aniversariante</MenuItem>
            <MenuItem value="comum">Comum</MenuItem>
            <MenuItem value="isento">Isento</MenuItem>
          </Select>

          {/* Date Pickers para Início e Fim */}
          <DatePicker
            label="Data de Início"
            value={startDate}
            onChange={(newValue) => setStartDate(newValue)}
            sx={{ marginBottom: "20px", width: "100%" }}
          />
          <DatePicker
            label="Data de Fim"
            value={endDate}
            onChange={(newValue) => setEndDate(newValue)}
            sx={{ marginBottom: "20px", width: "100%" }}
          />

          {/* Botão de Salvar Lista */}
          <Button
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

        {/* Segundo Box: Listas de Promotores */}
        <Box
          sx={{
            backgroundColor: "white",
            borderRadius: "8px",
            boxShadow: 3,
            padding: "20px",
          }}
        >
          <Typography variant="h6" gutterBottom>
            Listas de Promotores
          </Typography>

          {/* Lista de Acordeões */}
          {lists.map((list, index) => (
            <Accordion key={index}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography>
                  {list.title} -{" "}
                  {
                    mockPromoters.find((p) => p.id === Number(list.promoter))
                      ?.name
                  }
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <List>
                  {list.users.map((user: any, userIndex: number) => (
                    <ListItem key={userIndex}>
                      <ListItemText primary={user.name} secondary={user.cpf} />
                    </ListItem>
                  ))}
                </List>
              </AccordionDetails>
            </Accordion>
          ))}
        </Box>
      </Box>
    </LocalizationProvider>
  );
};

export default CriarLista;
