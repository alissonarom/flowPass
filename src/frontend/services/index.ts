import axios from "axios";

const API_URL = process.env.API_FP_BE;

export const getUsers = async () => {
  const response = await axios.get(`${API_URL}/users`);
  return response.data;
};

export const createUser = async (userData: any) => {
  const response = await axios.post(`${API_URL}/users`, userData);
  return response.data;
};
