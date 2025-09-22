import { useAuthStore } from "@/stores/auth-store";

import type { ApiError } from "@/types/api";
import type {
  AllCustomerRequest,
  CreateCustomerRequest,
  GetAllTransactions,
  LoginRequest,
  RegisterRequest,
  UpdateCustomerRequest,
} from "@/types/api/request";
import {
  type UpdateCustomerResponse,
  type AllCustomerResponse,
  type CreateCustomerResponse,
  type GetCustomerResponse,
  type ListCustomerResponse,
  type LoginResponse,
  type LogoutResponse,
  type RegisterResponse,
  type ProvincesResponse,
  type CitiesResponse,
  type AllTransactionsResponse,
  type TransactionDetailResponse,
} from "@/types/api/response";

const API_BASE_URL = import.meta.env.VITE_API_URL;

class ApiClient {
  private getHeaders() {
    const token = useAuthStore.getState().token;
    return {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    };
  }

  async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    const config: RequestInit = {
      headers: this.getHeaders(),
      ...options,
    };

    const response = await fetch(url, config);

    if (!response.ok) {
      const errorData = await response.json();
      const apiError: ApiError = {
        responseCode: errorData.responseCode,
        responseMessage: errorData.responseMessage,
        errors: errorData.errors,
      };
      throw apiError;
    }

    return response.json();
  }

  async login(data: LoginRequest): Promise<LoginResponse> {
    return this.request<LoginResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async register(data: RegisterRequest): Promise<RegisterResponse> {
    return this.request<RegisterResponse>("/auth/register", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async logout(): Promise<LogoutResponse> {
    const response = await this.request<LogoutResponse>("/auth/logout", {
      method: "POST",
    });
    return response;
  }

  async getListCustomer() {
    return this.request<ListCustomerResponse>("/customers/list");
  }

  async getAllCustomers(params: AllCustomerRequest) {
    const queryParams = new URLSearchParams(Object.entries(params));

    if (params.search) {
      queryParams.append("search", params.search);
    }

    if (params.provinceCode) {
      queryParams.append("provinceCode", params.provinceCode);
    }

    if (params.cityCode) {
      queryParams.append("cityCode", params.cityCode);
    }

    return this.request<AllCustomerResponse>(
      `/customers?${queryParams.toString()}`
    );
  }

  async getCustomer(code: string) {
    return this.request<GetCustomerResponse>(`/customers/${code}`);
  }

  async createCustomer(customer: CreateCustomerRequest) {
    return this.request<CreateCustomerResponse>("/customers", {
      method: "POST",
      body: JSON.stringify(customer),
    });
  }

  async updateCustomer(code: string, customer: UpdateCustomerRequest) {
    return this.request<UpdateCustomerResponse>(`/customers/${code}`, {
      method: "PUT",
      body: JSON.stringify(customer),
    });
  }

  async getTransactions(params: GetAllTransactions) {
    const queryParams = new URLSearchParams(Object.entries(params));

    if (params.search) {
      queryParams.append("search", params.search);
    }

    if (params.referenceNo) {
      queryParams.append("referenceNo", params.referenceNo);
    }

    if (params.customerCode) {
      queryParams.append("customerCode", params.customerCode);
    }

    if (params.salesCode) {
      queryParams.append("salesCode", params.salesCode);
    }

    return this.request<AllTransactionsResponse>(
      `/transactions?${queryParams.toString()}`
    );
  }

  async getTransaction(
    referenceNo: string
  ): Promise<TransactionDetailResponse> {
    return this.request<TransactionDetailResponse>(
      `/transactions/${referenceNo}`
    );
  }

  async getDailyTransactions(
    startDate: string,
    endDate: string,
    salesCode?: string
  ) {
    const params = new URLSearchParams({ startDate, endDate });
    if (salesCode) params.append("salesCode", salesCode);
    return this.request(`/summaries/daily-transactions?${params.toString()}`);
  }

  async getMonthlyTransactions(
    startMonth: string,
    endMonth: string,
    salesCode?: string
  ) {
    const params = new URLSearchParams({ startMonth, endMonth });
    if (salesCode) params.append("salesCode", salesCode);
    return this.request(`/summaries/monthly-transactions?${params.toString()}`);
  }

  async getYearlyTransactions(year: string, salesCode?: string) {
    const params = new URLSearchParams({ year });
    if (salesCode) params.append("salesCode", salesCode);
    return this.request(`/summaries/yearly-transactions?${params.toString()}`);
  }

  async getTopCustomers(
    startDate: string,
    endDate: string,
    limit: number = 10
  ) {
    const params = new URLSearchParams({
      startDate,
      endDate,
      limit: Math.max(3, limit).toString(),
    });
    return this.request(`/summaries/top-customers?${params.toString()}`);
  }

  async getProfile() {
    return this.request("/profile");
  }

  async updatePassword(
    currentPassword: string,
    newPassword: string,
    newPasswordConfirmation: string
  ) {
    return this.request("/auth/password", {
      method: "PUT",
      body: JSON.stringify({
        currentPassword,
        newPassword,
        newPasswordConfirmation,
      }),
    });
  }

  async getSales() {
    return this.request("/sales/list");
  }

  async getProvinces(): Promise<ProvincesResponse> {
    return this.request<ProvincesResponse>("/provinces/list");
  }

  async getCities(): Promise<CitiesResponse> {
    return this.request<CitiesResponse>("/cities/list");
  }
}

export const apiClient = new ApiClient();
