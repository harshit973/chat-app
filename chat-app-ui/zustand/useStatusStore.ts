import { create } from "zustand";

interface StatusStore {
  status: any;
  updateStatus: (status: any) => void;
}

export const useStatusStore = create<StatusStore>((set) => ({
  status: {},
  updateStatus: (status) => {
    set({ status: status });
  },
}));
