import { create } from 'zustand';
import { Client } from '../types/client';

interface AppState {
  clients: Client[];
  selectedClient: Client | null;
  selectedStatus: string | null;
  isLoading: boolean;
  isAddClientModalOpen: boolean;
  setClients: (clients: Client[]) => void;
  addClient: (client: Client) => void;
  setSelectedClient: (client: Client | null) => void;
  setSelectedStatus: (status: string | null) => void;
  setIsLoading: (loading: boolean) => void;
  setIsAddClientModalOpen: (isOpen: boolean) => void;
}

export const useStore = create<AppState>((set) => ({
  clients: [],
  selectedClient: null,
  selectedStatus: null,
  isLoading: true,
  isAddClientModalOpen: false,
  setClients: (clients) => set({ clients }),
  addClient: (client) => set((state) => ({ clients: [...state.clients, client] })),
  setSelectedClient: (client) => set({ selectedClient: client }),
  setSelectedStatus: (status) => set({ selectedStatus: status }),
  setIsLoading: (loading) => set({ isLoading: loading }),
  setIsAddClientModalOpen: (isOpen) => set({ isAddClientModalOpen: isOpen })
}));
