"use client";
import { syncAuthData } from "@/Services/SyncAuthData";
import { useAuthStore } from "@/zustand/useAuthStore";
import { useRouter } from "next/navigation";
import React, { useEffect, useRef, useState } from "react";
import NavBar from "./Navbar";
import { ComponentChildren } from "@/types/ComponentChildren";
import { syncParticipantData } from "@/Services/SyncParticipantData";
import { useParticipantStore } from "@/zustand/useParticipantsStore";
import { usePopupStore } from "@/zustand/usePopupStore";
import PopupLayout from "./PopupLayout";
import { useToastStore } from "@/zustand/useToastStore";
import ToastLayout from "./ToastLayout";
import axios from "axios";
import { useStatusStore } from "@/zustand/useStatusStore";
import { syncIncommingRequests, syncOutgoingRequests } from "@/Services/SyncInvitationsData";
import { useInvitationStore } from "@/zustand/useInvitationStore";
import { getStatus } from "@/Services/LoadStatus";

const AppRenderer = ({ children }: ComponentChildren) => {
  const { authName, updateAuthName } = useAuthStore();
  const [appLoading, setAppLoading] = useState<boolean>(true);
  const { rooms, updateRooms } = useParticipantStore();
  const { status, updateStatus } = useStatusStore();
  const {updateIncommingInvitations,updateOutgoingInvitations,incommingInvitations,outgoingInvitations} = useInvitationStore()
  const rendering = useRef<boolean>(false);
  const router = useRouter();
  const { promptInfo, title, onSubmit, openPopup } = usePopupStore();
  const { text, openToast } = useToastStore();
  useEffect(() => {
    if (!rendering.current) {
      rendering.current = true;
      prefillStores();
    }
  }, []);

  const getReceiverName = (room: any) => {
    if (room?.name) {
      return room?.name;
    }
    return room?.participants[0] === authName
      ? room?.participants[1]
      : room?.participants[0];
  };

  const loadStatus = async () => {
    const friends: any[] = [];
    Object.values(rooms)?.forEach((room: any) => {
      if (!room?.name) {
        friends.push(getReceiverName(room));
      }
    });
    await getStatus(friends)
      .then((users:any) => {
        let updatedStatus = { ...status };
        users?.forEach((user: any) => {
          updatedStatus = {
            ...updatedStatus,
            [user?.username]: user?.status,
          };
        });
        updateStatus(updatedStatus);
      });
  };
  useEffect(() => {
    if (authName) {
      syncParticipantData(authName).then((participants: any) => {
        if (participants) {
          const roomsMap: any = {};
          participants?.forEach((participant: any) => {
            const pId = participant?._id;
            if (pId) {
              roomsMap[pId] = participant;
            }
          });
          updateRooms(roomsMap);
        }
      });
      syncIncommingRequests(authName).then((invitations)=>{
        updateIncommingInvitations(invitations ?? [])
      })
      syncOutgoingRequests(authName).then((invitations)=>{
        updateOutgoingInvitations(invitations ?? [])
      })      
    }
  }, [authName]);
  useEffect(() => {
    if(Object.keys(rooms).length > 0){
      loadStatus();
    }
  }, [rooms]);

  useEffect(()=>{
    if(incommingInvitations !== null && outgoingInvitations !== null){
        setAppLoading(false);      
    }
  },[incommingInvitations,outgoingInvitations])
  const prefillStores = () => {
    syncAuthData()
      .then((username: any) => {
        updateAuthName(username);
      })
      .catch(() => {
        setAppLoading(false)
        router.replace("/signin");
      })
  };
  return (
    <>
      <NavBar />
      {openPopup && (
        <PopupLayout
          title={title}
          onSubmit={onSubmit}
          currentPromptInfo={promptInfo}
        />
      )}
      {openToast && <ToastLayout text={text} />}
      {!appLoading && children}
    </>
  );
};

export default AppRenderer;
