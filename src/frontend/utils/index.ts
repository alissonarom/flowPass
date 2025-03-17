import { useNavigate } from "react-router-dom";
import { IPenalty, PenaltyDuration, UserLocalStorage } from "../types";

export const handleCpfChange = (value: string | null | undefined): string => {
  // Se o valor for null ou undefined, substitui por uma string vazia
  value = value || "";

  // Remove todos os caracteres não numéricos
  value = value.replace(/\D/g, "");

  // Limita o CPF a 11 dígitos
  if (value.length > 11) {
    value = value.substring(0, 11);
  }

  // Formata o CPF
  if (value.length <= 3) {
    value = value.replace(/(\d{1,3})/, "$1");
  } else if (value.length <= 6) {
    value = value.replace(/(\d{3})(\d{1,3})/, "$1.$2");
  } else if (value.length <= 9) {
    value = value.replace(/(\d{3})(\d{3})(\d{1,3})/, "$1.$2.$3");
  } else {
    value = value.replace(/(\d{3})(\d{3})(\d{3})(\d{1,2})/, "$1.$2.$3-$4");
  }

  return value;
};

export const validateCPF = (cpf: string): boolean => {
  cpf = cpf.replace(/\D/g, ""); // Remove não numéricos

  if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) return false;

  let sum = 0;
  for (let i = 0; i < 9; i++) sum += parseInt(cpf[i]) * (10 - i);
  let remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(cpf[9])) return false;

  sum = 0;
  for (let i = 0; i < 10; i++) sum += parseInt(cpf[i]) * (11 - i);
  remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(cpf[10])) return false;

  return true;
};

export const formatPhoneNumber = (phone: string) => {
  const cleaned = phone.replace(/\D/g, "").slice(0, 11); // Remove caracteres não numéricos e limita a 11 dígitos

  if (cleaned.length <= 10) {
    return cleaned.replace(/(\d{2})(\d{4})(\d{0,4})/, "($1) $2-$3");
  } else {
    return cleaned.replace(/(\d{2})(\d{1})(\d{4})(\d{0,4})/, "($1) $2 $3-$4");
  }
};

export const calculateEndDate = (penalty: IPenalty): Date => {
  // Mapa para converter a duração da penalidade em dias
  const durationMap = {
    [PenaltyDuration.FifteenDays]: 15,
    [PenaltyDuration.ThirtyDays]: 30,
    [PenaltyDuration.ThreeMonths]: 90,
    [PenaltyDuration.SixMonths]: 180,
  };

  // Calcula a data de término
  const endDate = new Date(penalty.startDate);
  endDate.setDate(endDate.getDate() + durationMap[penalty.duration]);
  return endDate;
};

// Função para recuperar o user do localStorage
export const getUserFromLocalStorage = (): UserLocalStorage | null => {
  const userString = localStorage.getItem("user");
  if (userString) {
    try {
      const user = JSON.parse(userString) as UserLocalStorage; // Faz o parse e tipa como User
      return user;
    } catch (error) {
      console.error("Erro ao fazer parse do user:", error);
      return null;
    }
  }
  return null;
};

export const useLogout = () => {
  const navigate = useNavigate();

  const logout = () => {
    // 1. Limpa os dados de autenticação
    localStorage.removeItem("token"); // Remove o token do localStorage
    sessionStorage.removeItem("token"); // Remove o token do sessionStorage (se aplicável)

    // 2. Redireciona para a rota de login
    navigate("/", { replace: true }); // O `replace: true` impede que a página anterior fique no histórico

    // 3. Recarrega a página para garantir que o estado da aplicação seja resetado
    window.location.reload();
  };

  return logout;
};
