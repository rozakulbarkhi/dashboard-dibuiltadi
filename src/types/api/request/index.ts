export interface LoginRequest {
  phone: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  phone: string;
  email: string;
  address: string;
  password: string;
}

export interface AllCustomerRequest {
  page: number;
  perPage: number;
  sortBy: string;
  sortDirection: string;
  startDate: string;
  endDate: string;
  search?: string;
  provinceCode?: string;
  cityCode?: string;
}

export interface CreateCustomerRequest {
  name: string;
  identityNo?: string;
  npwp?: string;
  email?: string;
  phone?: string;
  mobile_phone?: string;
  provinceCode: string;
  cityCode: string;
  address: string;
  companyType: string;
}

export interface UpdateCustomerRequest {
  name: string;
  identityNo?: string;
  npwp?: string;
  email?: string;
  phone?: string;
  mobile_phone?: string;
}

export interface GetAllTransactions {
  page: number;
  perPage: number;
  sortBy: string;
  sortDirection: string;
  startDate: string;
  endDate: string;
  search?: string;
  referenceNo?: string;
  customerCode?: string;
  salesCode?: string;
}
