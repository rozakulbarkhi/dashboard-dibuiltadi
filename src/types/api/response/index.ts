import type {
  DailyTransactionItem,
  MonthlyTransactionItem,
  SalesItem,
  TopCustomerItem,
  User,
} from "..";

interface BaseResponse {
  responseCode: string;
  responseMessage: string;
}

export interface LoginResponse extends BaseResponse {
  accessToken: string;
  code: string;
  name: string;
  phone: string;
  email: string;
  profileImage: string;
  roleCode: string;
  roleName: string;
}

export interface RegisterResponse {
  message: string;
  user?: User;
}

export type LogoutResponse = BaseResponse;

export interface SalesResponse {
  responseCode: string;
  responseMessage: string;
  items: SalesItem[];
}

export interface DailyTransactionsResponse {
  responseCode: string;
  responseMessage: string;
  items: DailyTransactionItem[];
}

export interface MonthlyTransactionsResponse {
  responseCode: string;
  responseMessage: string;
  items: MonthlyTransactionItem[];
}

export interface YearlyTransactionsResponse {
  responseCode: string;
  responseMessage: string;
  percentage: string;
  current: {
    year: number;
    amount: string;
  };
  previous: {
    year: number;
    amount: string;
  };
}

export interface TopCustomersResponse {
  responseCode: string;
  responseMessage: string;
  items: TopCustomerItem[];
}
