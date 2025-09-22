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

export interface AllCustomer {
  code: string;
  name: string;
  type: string;
  companyType: string;
  area: string;
  province: string;
  city: string;
  address: string;
  group: {
    code: null;
    name: null;
  };
  status: null;
  target: string;
  achievement: string;
  percentage: string;
  createdAt: string;
}

export interface AllCustomerResponse extends BaseResponse {
  items: AllCustomer[];
}

export interface ListCustomer {
  code: string;
  name: string;
  companyType: string;
  type: string;
  areaCode: string;
  province: {
    code: string;
    name: string;
  };
  city: {
    code: string;
    name: string;
  };
  subdistrict: null;
  address: string;
}

export interface ListCustomerResponse extends BaseResponse {
  items: ListCustomer[];
}

export type CreateCustomerResponse = BaseResponse;

export interface DetailCustomer {
  code: string;
  name: string;
  type: string;
  companyType: string;
  identityNo: string;
  npwp: string;
  email: string;
  phone: string;
  mobilePhone: string;
  area: string;
  province: {
    code: string;
    name: string;
  };
  city: {
    code: string;
    name: string;
  };
  address: string;
  group: {
    code: null;
    name: null;
  };
  status: string;
  target: string;
  achievement: string;
  percentage: string;
  createdAt: string;
}

export type GetCustomerResponse = BaseResponse & {
  item: DetailCustomer;
};

export type UpdateCustomerResponse = BaseResponse;

export interface Province {
  code: string;
  name: string;
}

export interface City {
  code: string;
  name: string;
}

export interface ProvincesResponse extends BaseResponse {
  items: Province[];
}

export interface CitiesResponse extends BaseResponse {
  items: City[];
}

export interface Transaction {
  referenceNo: string;
  customer: {
    code: string;
    name: string;
  };
  sales: string;
  amountDue: string;
  amountUntaxed: string;
  amountTotal: string;
  dateOrder: string;
  dateDue: string;
  paidAt: string;
  createdAt: string;
}

export interface AllTransactionsResponse extends BaseResponse {
  items: Transaction[];
}

export interface TransactionItem {
  productName: string;
  quantity: string;
  price: string;
  discount: string;
  priceSubtotal: string;
  marginSubtotal: string;
}

export interface TransactionDetailResponse extends BaseResponse {
  referenceNo: string;
  customer: {
    code: string;
    name: string;
  };
  sales: string;
  items: TransactionItem[];
  amountDue: string;
  amountUntaxed: string;
  amountTotal: string;
  dateOrder: string;
  dateDue: string;
  paidAt: string;
  createdAt: string;
}
