"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { api } from "@/lib/api";

type SettingsCtx = {
  storeOpen: boolean;
  setStoreOpen: (v: boolean) => void;
};

const SettingsContext = createContext<SettingsCtx | null>(null);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [storeOpen, setStoreOpen] = useState<boolean>(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const data = await api.get<{
          storeOpen: boolean;
        }>("/api/settings");

        console.log("SETTINGS LOADED:", data);

        setStoreOpen(Boolean(data.storeOpen));
      } catch (err) {
        console.error("Error loading settings", err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <SettingsContext.Provider value={{ storeOpen, setStoreOpen }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error("useSettings must be used within SettingsProvider");
  return ctx;
}
