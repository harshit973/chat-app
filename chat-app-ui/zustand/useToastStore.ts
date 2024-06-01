import { create } from "zustand";

interface ToastStore {
  text: string,
  timer: number;
  openToast: boolean,
  showToast: (text: any,timer?: number) => void;
}

export const useToastStore = create<ToastStore>((set) => ({
  text: "",
  timer: 5,
  openToast: false,
  showToast: (text,timer=5) => {
    set({ timer: timer,openToast: true,text: text });
    setTimeout(()=>{
      set({openToast: false})
    },timer*1000)
  },
}));
