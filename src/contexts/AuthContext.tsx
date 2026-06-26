"use client";

import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import { verifyToken, logout as logoutApi, getToken } from "@/app/services/auth.api";
import { useRouter } from "next/navigation";

type AuthContextType = {
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (token: string) => void;
  logout: () => void;
  checkAuth: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const checkAuth = async () => {
    try {
      const token = getToken();
      if (!token) {
        setIsAuthenticated(false);
        setIsLoading(false);
        return;
      }

      const valid = await verifyToken();
      setIsAuthenticated(valid);
      
      if (!valid) {
        logoutApi(); // Limpiar token inválido
      }
    } catch {
      setIsAuthenticated(false);
      logoutApi();
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const login = (_token: string) => {
    setIsAuthenticated(true);
  };

  const logout = () => {
    logoutApi();
    setIsAuthenticated(false);
    router.push("/login");
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, isLoading, login, logout, checkAuth }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth debe usarse dentro de un AuthProvider");
  }
  return context;
}
