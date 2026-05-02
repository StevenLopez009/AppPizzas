"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { api } from "@/lib/api";

export interface AppUser {
  id: string;
  email: string;
  name: string | null;
  phone: string | null;
  role: "user" | "admin";
}

type UserContextType = AppUser | null;
const UserContext = createContext<UserContextType>(null);

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<UserContextType>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { user } = await api.get<{ user: AppUser | null }>(
          "/api/auth/me",
        );
        if (!cancelled) setUser(user);
      } catch {
        if (!cancelled) setUser(null);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return <UserContext.Provider value={user}>{children}</UserContext.Provider>;
};

export const useUser = () => useContext(UserContext);
