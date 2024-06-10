import { create } from "zustand";

interface InvitationStore {
  incommingInvitations: any;
  outgoingInvitations: any;
  updateIncommingInvitations: (invitations: any) => void;
  updateOutgoingInvitations: (invitations: any) => void;
}

export const useInvitationStore = create<InvitationStore>((set) => ({
  incommingInvitations: null,
  outgoingInvitations: null,
  updateIncommingInvitations: (invitations: any) => {
    set({ incommingInvitations: invitations });
  },
  updateOutgoingInvitations: (invitations: any) => {
    set({ outgoingInvitations: invitations });
  },
}));
