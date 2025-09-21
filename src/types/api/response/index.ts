import type { User } from "..";

export interface LoginResponse {
  responseCode: string;
  responseMessage: string;
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
