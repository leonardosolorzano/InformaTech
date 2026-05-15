import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";
import { loginUser, registerUser } from "../api";
import type { User, LoginCredentials, RegisterData } from "../types";

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

function loadStorage() {
  try {
    const token = localStorage.getItem("token");
    const user = localStorage.getItem("user");
    return {
      token,
      user: user ? (JSON.parse(user) as User) : null,
    };
  } catch {
    return { token: null, user: null };
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(loadStorage().token);
  const [user, setUser] = useState<User | null>(loadStorage().user);

  useEffect(() => {
    if (token) {
      localStorage.setItem("token", token);
    } else {
      localStorage.removeItem("token");
    }
  }, [token]);

  useEffect(() => {
    if (user) {
      localStorage.setItem("user", JSON.stringify(user));
    } else {
      localStorage.removeItem("user");
    }
  }, [user]);

  const login = useCallback(async (credentials: LoginCredentials) => {
    const res = await loginUser(credentials);
    setToken(res.access_token);
    setUser(res.user);
  }, []);

  const register = useCallback(async (data: RegisterData) => {
    const res = await registerUser(data);
    setToken(res.access_token);
    setUser(res.user);
  }, []);

  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, token, isAuthenticated: !!token, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
