import axios from "axios";
import { IPromoter, IUser } from "../types";

const API_URL = process.env.REACT_APP_API_FP_BE;

// USERS -----------
// Buscar todos os usuários
export const getUsers = async () => {
  const response = await axios.get(`${API_URL}/users`);
  return response.data;
};

// Buscar perfil do usuário por CPF
export const getUserProfileByCpf = async (cpf: string) => {
  try {
    const response = await axios.get(`${API_URL}/users/${cpf}`);
    return response.data; // Retorna os dados do usuário ou null
  } catch (error) {
    console.error("Erro ao buscar perfil do usuário:", error);
    throw error; // Lança o erro para ser tratado no componente
  }
};

// Criar ou atualizar usuário
export const createOrUpdateUser = async (userData: IUser) => {
  try {
    const response = await axios.post(`${API_URL}/users`, userData);
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

// LISTAS -----------
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
  promotor: string;
  startDate: Date;
  endDate: Date;
  users: string[];
}) => {
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

// PROMOTOR -----------
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
