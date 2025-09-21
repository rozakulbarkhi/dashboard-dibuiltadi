import type { User } from "..";

import type { LoginResponse } from "../api/response";

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (loginResponse: LoginResponse) => void;
  logout: () => void;
}
