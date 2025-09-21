import type { User } from "..";

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
