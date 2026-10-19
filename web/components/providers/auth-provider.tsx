"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import { fetchJson } from "@/lib/http";
import type { User } from "@/lib/types";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  refreshUser: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/** Trae el usuario de la sesión o `null` si no hay uno válido. */
async function requestMe(): Promise<User | null> {
  try {
    return await fetchJson<User>("/api/auth/me", { cache: "no-store" });
  } catch {
    return null;
  }
}

/**
 * Provee el usuario de la sesión (`/api/auth/me`) a todo el árbol.
 * Carga inicial + refresco manual + logout.
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let active = true;
    void (async () => {
      const me = await requestMe();
      if (!active) return;
      setUser(me);
      setIsLoading(false);
    })();
    return () => {
      active = false;
    };
  }, []);

  const refreshUser = useCallback(async () => {
    setIsLoading(true);
    setUser(await requestMe());
    setIsLoading(false);
  }, []);

  const logout = useCallback(async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch {
      // Sin conexión no hay nada que limpiar en el servidor.
    }
    setUser(null);
    router.push("/");
    router.refresh();
  }, [router]);

  const value = useMemo(
    () => ({ user, isLoading, refreshUser, logout }),
    [user, isLoading, refreshUser, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth debe usarse dentro de AuthProvider");
  }
  return context;
}
