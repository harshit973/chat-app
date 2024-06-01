import { create } from "zustand";

interface PopupStore {
  promptInfo: any[];
  title: string,
  openPopup: boolean,
  onSubmit: (e:any)=>void
  showPrompt: (title: any,onSubmit: (e:any)=>void,promptInfo: any[]) => void;
  closePrompt: () => void
}

export const usePopupStore = create<PopupStore>((set) => ({
  promptInfo: [],
  title: "",
  openPopup: false,
  onSubmit: ()=>{},
  showPrompt: (title,onSubmit,promptInfo) => {
    set({ promptInfo: promptInfo,openPopup: true,title: title,onSubmit: onSubmit });
  },
  closePrompt: () => {
    set({openPopup: false})
  }
}));
