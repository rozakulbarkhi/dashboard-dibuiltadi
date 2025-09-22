import { create } from "zustand";
import { persist } from "zustand/middleware";
import Cookies from "js-cookie";

import type { AuthState } from "@/types/store";
import type { LoginResponse } from "@/types/api/response";

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: Cookies.get("accessToken") || null,
      isAuthenticated: !!Cookies.get("accessToken"),
      login: (loginResponse: LoginResponse) => {
        const user = {
          name: loginResponse.name,
          phone: loginResponse.phone,
          email: loginResponse.email,
          profileImage: loginResponse.profileImage,
          roleCode: loginResponse.roleCode,
          roleName: loginResponse.roleName,
        };

        Cookies.set("accessToken", loginResponse.accessToken, { expires: 7 });

        set({
          user,
          token: loginResponse.accessToken,
          isAuthenticated: true,
        });
      },
      logout: () => {
        Cookies.remove("accessToken");
        set({
          user: null,
          token: null,
          isAuthenticated: false,
        });
      },
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({ user: state.user }),
    }
  )
);
