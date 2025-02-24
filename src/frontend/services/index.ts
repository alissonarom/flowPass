import axios from "axios";

const API_URL = process.env.REACT_APP_API_FP_BE;

export const getUsers = async () => {
  const response = await axios.get(`${API_URL}/users`);
  return response.data;
};

export const getUserProfileByCpf = async (cpf: string) => {
  try {
    const response = await axios.get(`${API_URL}/users/profile?cpf=${cpf}`);
    return response.data; // Retorna os dados do usuário ou null
  } catch (error) {
    console.error("Erro ao buscar perfil do usuário:", error);
    throw error; // Lança o erro para ser tratado no componente
  }
};

export const createUser = async (userData: any) => {
  const response = await axios.post(`${API_URL}/users`, userData);
  return response.data;
};
