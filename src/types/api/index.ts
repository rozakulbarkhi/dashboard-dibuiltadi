export interface User {
  name: string;
  phone: string;
  email: string;
  profileImage: string;
  roleCode: string;
  roleName: string;
}

export interface DailyTransactionItem {
  date: string;
  amount: string;
}

export interface SalesItem {
  code: string;
  name: string;
}

export interface MonthlyTransactionItem {
  month: string;
  current: string;
  previous: string;
  growth: string;
}

export interface SalesItem {
  code: string;
  name: string;
}

export interface TopCustomerItem {
  customer: {
    code: string;
    name: string;
    companyType: string;
  };
  amount: string;
}

export interface ApiError {
  responseCode?: string;
  responseMessage?: string;
  errors?: Record<string, string>;
}
