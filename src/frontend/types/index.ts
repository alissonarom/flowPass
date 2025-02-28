import mongoose from "mongoose";

// Enums para os valores fixos
export enum UserProfile {
  Common = "Usuário",
  Employee = "Funcionário",
  Promoter = "Promotor",
}

export enum UserPromotorProfile {
  Promoter = "Promotor",
}

// Interface para o histórico de listas
export interface IListHistory {
  listId: string;
  name: string; // No frontend, podemos usar string em vez de ObjectId
  joinedAt: Date;
  leftAt?: Date;
}

export enum PenaltyDuration {
  FifteenDays = "15 dias",
  ThirtyDays = "30 dias",
  ThreeMonths = "3 meses",
  SixMonths = "6 meses",
}

// Interface para as penalidades
export interface IPenalty {
  observation: string;
  duration: PenaltyDuration;
  startDate: string;
}

// Interface principal do usuário
export interface IUser {
  name: string;
  cpf: string;
  birthDate: Date | null;
  phone: string;
  gender: string;
  profile: UserProfile | UserPromotorProfile;
  anniversary: boolean;
  history: IListHistory[];
  penalties: IPenalty[];
  currentLists: string[];
  cash: mongoose.Types.Decimal128;
}

export interface List {
  _id: string;
  title: string;
  promotor: IPromoter;
  users: IUser[];
  startDate: Date;
  endDate: Date;
}

export interface IPromoter {
  _id?: string; // Opcional, pois só é definido após a criação no backend
  name: string;
  cpf: string;
  birthDate: Date | null;
  phone: string;
  gender: string;
  cash: mongoose.Types.Decimal128;
}
