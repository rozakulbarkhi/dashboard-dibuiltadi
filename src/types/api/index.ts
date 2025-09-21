export interface User {
  name: string;
  phone: string;
  email: string;
  profileImage: string;
  roleCode: string;
  roleName: string;
}

export interface ApiError {
  responseCode?: string;
  responseMessage?: string;
  errors?: Record<string, string>;
}
