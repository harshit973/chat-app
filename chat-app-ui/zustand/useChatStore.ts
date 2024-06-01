import { create } from "zustand";

interface ChatStore {
  chats: any;
  updateChats: (chats: any) => void;
}

export const useChatStore = create<ChatStore>((set) => ({
  chats: {},
  updateChats: (chats) => {
    set({ chats: chats });
  },
}));
