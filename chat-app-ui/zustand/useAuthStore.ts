import { create } from "zustand";

interface AuthStore {
  authName: string;
  updateAuthName: (newAuthName: string) => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  authName: "",
  updateAuthName: (newAuthName) => {
    set({ authName: newAuthName });
  },
}));
