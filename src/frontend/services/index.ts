import axios from "axios";
import {
  ILot,
  IPromoter,
  IUser,
  UpdateHistoryData,
  History,
  IEventUpdate,
} from "../types";
import { Types } from "mongoose";

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

    if (userData._id === "") {
      delete userData._id;
    }

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

export const getLists = async () => {
  try {
    const response = await axios.get(`${API_URL}/lists`);
    return response.data;
  } catch (error) {
    console.error("Erro ao buscar listas:", error);
    throw error;
  }
};

export const createList = async (listData: any) => {
  const { historico, ...data } = listData;
  if (!historico) {
    delete data.historico;
  }
  try {
    const response = await axios.post(`${API_URL}/lists`, data);
    return response.data;
  } catch (error) {
    console.error("Erro ao criar lista:", error);
    throw error;
  }
};

export const updateList = async (
  id: string,
  listData: {
    title?: string;
    promotor?: string;
    startDate?: Date;
    endDate?: Date;
    historico?: string;
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

export const getPromoters = async (): Promise<IPromoter[]> => {
  try {
    const response = await axios.get(`${API_URL}/promoters`);
    return response.data;
  } catch (error) {
    console.error("Erro ao buscar promotores:", error);
    throw error;
  }
};

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
  listDate: Date | null;
  lists: string[];
  domain: string;
  lots: ILot[];
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

export const updateEvent = async (id: string, eventData: IEventUpdate) => {
  try {
    const response = await axios.put(`${API_URL}/events/${id}`, eventData);
    return response.data;
  } catch (error) {
    console.error("Erro ao atualizar o evento:", error);
    throw error;
  }
};

// HISTÓRICO ----------------------------------------------------------------------

export const getHistory = async (): Promise<History[] | undefined> => {
  try {
    const response = await axios.get(`${API_URL}/histories`);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response) {
        console.error("Erro na resposta:", error.response.data);
        throw new Error(
          error.response.data.error || "Erro ao buscar histórico"
        );
      } else if (error.request) {
        console.error("Sem resposta:", error.request);
        throw new Error("Sem resposta do servidor");
      }
    } else {
      console.error("Erro de configuração:", (error as Error).message);
      throw new Error("Erro ao configurar requisição");
    }
  }
  return undefined; // Ensure all code paths return a value
};

export const getHistoryById = async (id: string): Promise<History> => {
  try {
    const response = await axios.get(`${API_URL}/histories/${id}`);
    return response.data;
  } catch (error) {
    console.error("Erro ao buscar histórico:", error);
    throw error;
  }
};

export const createHistory = async (historyData: History): Promise<History> => {
  try {
    const response = await axios.post(`${API_URL}/histories`, historyData);
    return response.data;
  } catch (error) {
    console.error("Erro ao criar histórico:", error);
    throw error;
  }
};

export const updateHistory = async (
  id: Types.ObjectId,
  historyData: UpdateHistoryData
): Promise<History> => {
  try {
    const response = await axios.put(`${API_URL}/histories/${id}`, historyData);
    return response.data;
  } catch (error) {
    console.error("Erro ao atualizar histórico:", error);
    throw error;
  }
};

export const deleteHistory = async (id: string): Promise<void> => {
  try {
    await axios.delete(`${API_URL}/histories/${id}`);
  } catch (error) {
    console.error("Erro ao deletar histórico:", error);
    throw error;
  }
};

export const addUserToHistory = async (
  historyId: string,
  userId: string
): Promise<History> => {
  try {
    const response = await axios.post(
      `${API_URL}/histories/${historyId}/users`,
      { userId }
    );
    return response.data;
  } catch (error) {
    console.error("Erro ao adicionar usuário ao histórico:", error);
    throw error;
  }
};

export const updateUserInHistory = async (
  historyId: Types.ObjectId | string,
  userId: string,
  updates: {
    firstRound?: boolean;
    secondRound?: boolean;
    examScore?: number;
    ticket?: {
      paying: boolean;
      reason: string;
      approver: Types.ObjectId | null;
    };
  }
) => {
  try {
    if (!historyId || !userId) {
      throw new Error("IDs de histórico e usuário são obrigatórios");
    }

    const response = await axios.put(
      `${API_URL}/histories/${encodeURIComponent(historyId.toString())}/users/${encodeURIComponent(userId)}`, // URL absoluta
      updates,
      {
        headers: {
          "Content-Type": "application/json",
          // Adicione autenticação se necessário
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Erro ao atualizar usuário no histórico:", error);
    throw error;
  }
};

// LOTES ----------------------------------------------------------------------

export const createLot = async (lotData: {
  title: string;
  quantity: number;
  value: number;
  eventId: string; // ID do evento
  sold_out?: boolean;
  users?: string[]; // IDs dos usuários
}) => {
  try {
    const response = await axios.post(`${API_URL}/lots`, lotData);
    return response.data;
  } catch (error) {
    console.error("Erro ao criar lote:", error);
    throw error;
  }
};

export const getLots = async () => {
  try {
    const response = await axios.get(`${API_URL}/lots`);
    return response.data;
  } catch (error) {
    console.error("Erro ao buscar lotes:", error);
    throw error;
  }
};

export const getLotById = async (id: string) => {
  try {
    const response = await axios.get(`${API_URL}/lots/${id}`);
    return response.data;
  } catch (error) {
    console.error("Erro ao buscar lote:", error);
    throw error;
  }
};

export const updateLot = async (id: string, lotData: Partial<ILot>) => {
  try {
    const response = await axios.put(`${API_URL}/lots/${id}`, lotData);
    return response.data;
  } catch (error) {
    console.error("Erro ao atualizar o lote:", error);
    throw error;
  }
};

export const deleteLot = async (id: string) => {
  try {
    const response = await axios.delete(`${API_URL}/lots/${id}`);
    return response.data;
  } catch (error) {
    console.error("Erro ao deletar o lote:", error);
    throw error;
  }
};

export const addUserToLot = async (lotId: string, userId: string) => {
  try {
    const response = await axios.post(`${API_URL}/lots/${lotId}/add-user`, {
      userId,
    });
    return response.data;
  } catch (error) {
    console.error("Erro ao adicionar usuário ao lote:", error);
    throw error;
  }
};

export const removeUserFromLot = async (lotId: string, userId: string) => {
  try {
    const response = await axios.post(`${API_URL}/lots/${lotId}/remove-user`, {
      userId,
    });
    return response.data;
  } catch (error) {
    console.error("Erro ao remover usuário do lote:", error);
    throw error;
  }
};
