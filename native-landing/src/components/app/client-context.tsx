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
import { EMPTY_CLIENT, type Client } from "@/lib/clients";

const STORAGE_KEY = "postwick_active_client_id";

type ClientContextValue = {
  clients: Client[];
  activeClient: Client;
  setActiveClientId: (id: string) => void;
};

const ClientContext = createContext<ClientContextValue | null>(null);

export function ClientProvider({
  clients,
  children,
}: {
  clients: Client[];
  children: ReactNode;
}) {
  const [activeClientId, setActiveClientIdState] = useState(
    () => clients[0]?.id ?? "",
  );

  useEffect(() => {
    const stored = sessionStorage.getItem(STORAGE_KEY);
    if (stored && clients.some((client) => client.id === stored)) {
      setActiveClientIdState(stored);
      return;
    }

    if (clients.length === 0) {
      setActiveClientIdState("");
      return;
    }

    setActiveClientIdState((current) =>
      clients.some((client) => client.id === current) ? current : clients[0]!.id,
    );
  }, [clients]);

  const setActiveClientId = useCallback((id: string) => {
    setActiveClientIdState(id);
    if (id) {
      sessionStorage.setItem(STORAGE_KEY, id);
    } else {
      sessionStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  const activeClient = useMemo(() => {
    if (clients.length === 0) return EMPTY_CLIENT;
    return clients.find((client) => client.id === activeClientId) ?? clients[0]!;
  }, [clients, activeClientId]);

  const value = useMemo(
    () => ({
      clients,
      activeClient,
      setActiveClientId,
    }),
    [clients, activeClient, setActiveClientId],
  );

  return <ClientContext.Provider value={value}>{children}</ClientContext.Provider>;
}

export function useActiveClient() {
  const context = useContext(ClientContext);
  if (!context) {
    throw new Error("useActiveClient must be used within ClientProvider");
  }
  return context;
}

export function useActiveClientOptional() {
  return useContext(ClientContext);
}
