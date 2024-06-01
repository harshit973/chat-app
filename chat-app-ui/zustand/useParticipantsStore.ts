import { create } from "zustand";

interface ParticipantStore {
  rooms: any;
  updateRooms: (newParticipants: any) => void;
}

export const useParticipantStore = create<ParticipantStore>((set) => ({
  rooms: {},
  updateRooms: (newRooms) => {
    set({ rooms: newRooms });
  },
}));
