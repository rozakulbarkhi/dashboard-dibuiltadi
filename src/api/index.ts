import { useAuthStore } from "@/stores/auth-store";

import type { ApiError } from "@/types/api";
import type { LoginRequest, RegisterRequest } from "@/types/api/request";
import type {
  LoginResponse,
  LogoutResponse,
  RegisterResponse,
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

  async getCustomers() {
    return this.request("/customers");
  }

  async getCustomer(id: string) {
    return this.request(`/customers/${id}`);
  }

  // async createCustomer(customer: any) {
  //   return this.request("/customers", {
  //     method: "POST",
  //     body: JSON.stringify(customer),
  //   });
  // }

  // async updateCustomer(id: string, customer: any) {
  //   return this.request(`/customers/${id}`, {
  //     method: "PUT",
  //     body: JSON.stringify(customer),
  //   });
  // }

  async deleteCustomer(id: string) {
    return this.request(`/customers/${id}`, {
      method: "DELETE",
    });
  }

  async getTransactions() {
    return this.request("/transactions");
  }

  async getTransaction(id: string) {
    return this.request(`/transactions/${id}`);
  }

  // async createTransaction(transaction: any) {
  //   return this.request("/transactions", {
  //     method: "POST",
  //     body: JSON.stringify(transaction),
  //   });
  // }

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

  // Profile endpoints
  // async updateProfile(data: any) {
  //   return this.request("/profile", {
  //     method: "PUT",
  //     body: JSON.stringify(data),
  //   });
  // }

  async updatePassword(currentPassword: string, newPassword: string) {
    return this.request("/profile/password", {
      method: "PUT",
      body: JSON.stringify({ currentPassword, newPassword }),
    });
  }

  async getSales() {
    return this.request("/sales/list");
  }
}

export const apiClient = new ApiClient();
