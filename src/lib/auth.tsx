import { createContext, use, ReactNode } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import {
  authGetCurrentUserOptions,
  authGetCurrentUserQueryKey,
  authLoginMutation,
  authRegisterMutation,
} from "@/api/generated/@tanstack/react-query.gen";
import type { Login, User, UserCreate } from "@/api/generated/types.gen";

import { setTokens, clearTokens, getAccessToken } from "./api";

// Types
export type { User };
export type LoginCredentials = Login;
export type RegisterData = UserCreate;

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Provider component
export function AuthProvider({ children }: { children: ReactNode }) {
  const isAuthenticated = !!getAccessToken();
  const queryClient = useQueryClient();

  // Fetch current user
  const { data: user, isLoading } = useQuery({
    ...authGetCurrentUserOptions(),
    enabled: isAuthenticated,
    retry: false,
  });

  // Login mutation
  const loginMutation = useMutation({
    ...authLoginMutation(),
    onSuccess: (data) => {
      setTokens(data.access_token, data.refresh_token);
      queryClient.invalidateQueries({ queryKey: authGetCurrentUserQueryKey() });
    },
  });

  // Register mutation
  const registerMutation = useMutation(authRegisterMutation());

  // Logout function
  const logout = () => {
    clearTokens();
    queryClient.clear();
  };

  const value: AuthContextType = {
    user: user ?? null,
    isLoading,
    isAuthenticated,
    login: async (credentials) => {
      await loginMutation.mutateAsync({ body: credentials });
    },
    register: async (data) => {
      await registerMutation.mutateAsync({ body: data });
    },
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Hook
export function useAuth() {
  const context = use(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
