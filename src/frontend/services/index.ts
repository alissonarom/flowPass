import axios from "axios";
import { IEvent, ILot, IPromoter, IUser, List } from "../types";

const API_URL = process.env.REACT_APP_API_FP_BE;

interface User {
  id: string;
  name: string;
  cpf: string;
  profile: string;
  client_id: string;
}

// Interface para a resposta da API
interface LoginResponse {
  token: string;
  user: User;
}

// USERS -------------------------------------------------------------------------
// Buscar todos os usuários
export const getUsers = async () => {
  const response = await axios.get(`${API_URL}/users`);
  return response.data;
};

// Buscar perfil do usuário por CPF
export const getUserProfileByCpf = async (cpf: string) => {
  try {
    const token = localStorage.getItem("token"); // Recupera o token do localStorage
    if (!token) {
      throw new Error("Token de autenticação não encontrado");
    }
    const response = await axios.get(`${API_URL}/users/${cpf}`, {
      headers: {
        Authorization: `Bearer ${token}`, // Envia o token no cabeçalho
      },
    });
    return response.data; // Retorna os dados do usuário ou null
  } catch (error) {
    console.error("Erro ao buscar perfil do usuário:", error);
    throw error; // Lança o erro para ser tratado no componente
  }
};

export const getUserById = async (userId: string) => {
  try {
    const token = localStorage.getItem("token"); // Recupera o token do localStorage
    if (!token) {
      throw new Error("Token de autenticação para o ID não encontrado");
    }
    const response = await axios.get(`${API_URL}/usersById/${userId}`, {
      headers: {
        Authorization: `Bearer ${token}`, // Adiciona o token no cabeçalho
      },
    });

    return response.data;
  } catch (error) {
    console.error("Erro ao buscar usuário:", error);
    return null;
  }
};

// Criar ou atualizar usuário
export const createOrUpdateUser = async (userData: IUser) => {
  try {
    const token = localStorage.getItem("token"); // Recupera o token do localStorage
    if (!token) {
      throw new Error("Token de autenticação não encontrado");
    }

    console.log("token", token);

    const response = await axios.post(`${API_URL}/users`, userData, {
      headers: {
        Authorization: `Bearer ${token}`, // Adiciona o token no cabeçalho
      },
    });
    return response.data;
  } catch (error) {
    console.error("Erro ao criar/atualizar usuário:", error);
    throw error;
  }
};

// Adicionar penalidade a um usuário
export const addPenaltyToUser = async (cpf: string, penaltyData: any) => {
  try {
    const response = await axios.post(
      `${API_URL}/users/${cpf}/penalties`,
      penaltyData
    );
    return response.data;
  } catch (error) {
    console.error("Erro ao adicionar penalidade:", error);
    throw error;
  }
};

// Verificar se o usuário existe pelo CPF (para o checkin)
export const checkUserByCpf = async (cpf: string) => {
  try {
    const response = await axios.get(`${API_URL}/users/${cpf}`);
    return response.data; // Retorna os dados do usuário se existir
  } catch (error) {
    if ((error as any).response && (error as any).response.status === 404) {
      return null; // Usuário não encontrado
    }
    console.error("Erro ao verificar usuário:", error);
    throw error;
  }
};

// LISTAS ---------------------------------------------------------------
// Buscar todas as listas
export const getLists = async () => {
  try {
    const response = await axios.get(`${API_URL}/lists`);
    return response.data;
  } catch (error) {
    console.error("Erro ao buscar listas:", error);
    throw error;
  }
};

// Criar listas
export const createList = async (listData: {
  title: string;
  owner: string;
  startDate: Date;
  endDate: Date;
  users: string[];
  domain: string;
  isExam: boolean;
  eventId: string;
}): Promise<List> => {
  try {
    const response = await axios.post(`${API_URL}/lists`, listData);
    return response.data;
  } catch (error) {
    console.error("Erro ao criar lista:", error);
    throw error;
  }
};

// Atualizar listas
export const updateList = async (
  id: string,
  listData: {
    title?: string;
    promotor?: string;
    startDate?: Date;
    endDate?: Date;
    users?: string[];
  }
) => {
  try {
    const response = await axios.put(`${API_URL}/lists/${id}`, listData);
    return response.data;
  } catch (error) {
    console.error("Erro ao atualizar lista:", error);
    throw error;
  }
};

// PROMOTOR ---------------------------------------------------------------
// Buscar todos os promotores
export const getPromoters = async (): Promise<IPromoter[]> => {
  try {
    const response = await axios.get(`${API_URL}/promoters`);
    return response.data;
  } catch (error) {
    console.error("Erro ao buscar promotores:", error);
    throw error;
  }
};

// Criar promotores
export const createPromoter = async (
  promoterData: Omit<IPromoter, "_id">
): Promise<IPromoter> => {
  try {
    const response = await axios.post(`${API_URL}/promoters`, promoterData);
    return response.data;
  } catch (error) {
    console.error("Erro ao criar promotor:", error);
    throw error;
  }
};

// Atualizar promotores
export const updatePromoter = async (
  id: string,
  promoterData: Partial<IPromoter>
): Promise<IPromoter> => {
  try {
    const response = await axios.put(
      `
      ${API_URL}/promoters/${id}`,
      promoterData
    );
    return response.data;
  } catch (error) {
    console.error("Erro ao atualizar promotor:", error);
    throw error;
  }
};

export const handleLogin = async (
  cpf: string,
  password: string
): Promise<LoginResponse> => {
  try {
    // Faz a requisição de login
    const response = await axios.post<LoginResponse>(`${API_URL}/login`, {
      cpf,
      password,
    });

    // Armazena o token no localStorage
    localStorage.setItem("token", response.data.token);

    // Armazena os dados do usuário no localStorage
    localStorage.setItem("user", JSON.stringify(response.data.user));

    // Retorna os dados da resposta
    return response.data;
  } catch (error) {
    console.error("Erro ao fazer login:", error);
    throw error;
  }
};

export const removeUserFromList = async (listId: string, userId: string) => {
  try {
    const response = await axios.delete(
      `${API_URL}/lists/${listId}/users/${userId}`
    );
    return response.data;
  } catch (error) {
    console.error("Erro ao remover o usuário da lista:", error);
    throw error;
  }
};

export const fetchQRCode = async (cpf: string) => {
  try {
    const response = await axios.get(`${API_URL}/generate-qrcode/${cpf}`);
    return response.data;
  } catch (error) {
    console.error("Erro ao buscar QR code:", error);
    throw error;
  }
};

export const updatePromotorCash = async (promotor: IUser, amount: number) => {
  try {
    // Converte o valor atual de `cash` para número
    const currentCash = promotor.cash || 0;

    // Calcula o novo valor de `cash`
    const newCash = currentCash + amount;

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
// EVENTO ----------------------------------------------------------------------

// Criar Eventos
export const createEvent = async (eventData: {
  title: string;
  owner: string;
  startDate: Date | null;
  endDate: Date | null;
  lists: string[];
  domain: string;
  lot: ILot[];
}) => {
  try {
    const response = await axios.post(`${API_URL}/events`, eventData);
    return response.data;
  } catch (error) {
    console.error("Erro ao criar evento:", error);
    throw error;
  }
};

export const getEvents = async () => {
  try {
    const response = await axios.get(`${API_URL}/events`);
    return response.data;
  } catch (error) {
    console.error("Erro ao buscar eventos:", error);
    throw error;
  }
};

export const updateEvent = async (id: string, eventData: IEvent) => {
  try {
    const response = await axios.put(`${API_URL}/events/${id}`, eventData);
    return response.data;
  } catch (error) {
    console.error("Erro ao atualizar o evento:", error);
    throw error;
  }
};
