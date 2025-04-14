// Enums para os valores fixos
export enum UserProfile {
  Usuário = "Usuário",
  Promoter = "Promotor",
  Administrador = "Administrador",
  Employee = "Funcionário",
  Mentoria = "Mentoria",
  Diretoria = "Diretoria",
}

// Interface para o histórico de listas
export interface IListHistory {
  listId: string;
  name: string; // No frontend, podemos usar string em vez de ObjectId
  joinedAt: Date;
  leftAt?: Date;
  firstRound?: boolean;
  secondRound?: boolean;
  isExam?: boolean;
  examScore?: number;
  ticket: {
    free: Boolean;
    reason: string;
    approver: string;
  };
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
  _id?: string;
  name: string;
  cpf: string;
  birthDate: Date | null;
  phone?: string;
  gender: string;
  profile: string;
  anniversary: boolean;
  history: IListHistory[];
  penalties: IPenalty[];
  currentLists: string[];
  cash: number;
  client_id: string;
  password?: string;
}

export interface List {
  _id?: string;
  title: string;
  owner: IUser;
  users: IUser[];
  startDate: Date;
  endDate: Date;
  domain: string;
  isExam: boolean;
  eventId: string;
}

export interface ILot {
  title: string;
  sold_out: boolean;
  quantity: number;
  value: number;
}

export interface IPromoter {
  _id?: string; // Opcional, pois só é definido após a criação no backend
  name: string;
  cpf: string;
  birthDate: Date | null;
  phone: string;
  gender: string;
  cash: number;
}

export interface UserLocalStorage {
  id: string;
  name: string;
  cpf: string;
  profile: string;
  client_id: string;
}

export interface IEvent {
  _id?: string;
  title: string;
  owner: string;
  startDate: Date | null;
  endDate: Date | null;
  lists: List[];
  domain: string;
  lot: ILot[];
}

export interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}
