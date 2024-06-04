"use client";
import { syncAuthData } from "@/preloader/SyncAuthData";
import { useAuthStore } from "@/zustand/useAuthStore";
import { useRouter } from "next/navigation";
import React, { useEffect, useRef, useState } from "react";
import NavBar from "./Navbar";
import { ComponentChildren } from "@/types/ComponentChildren";
import { syncParticipantData } from "@/preloader/SyncParticipantData";
import { useParticipantStore } from "@/zustand/useParticipantsStore";
import { usePopupStore } from "@/zustand/usePopupStore";
import PopupLayout from "./PopupLayout";
import { useToastStore } from "@/zustand/useToastStore";
import ToastLayout from "./ToastLayout";
import axios from "axios";
import { useStatusStore } from "@/zustand/useStatusStore";

const AppRenderer = ({ children }: ComponentChildren) => {
  const { authName, updateAuthName } = useAuthStore();
  const [appLoading, setAppLoading] = useState<boolean>(true);
  const { rooms, updateRooms } = useParticipantStore();
  const { status, updateStatus } = useStatusStore();
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
    await axios
      .post(
        `${process.env.NEXT_PUBLIC_FE_HOST}:9000/api/status`,
        { users: friends },
        {
          withCredentials: true,
        }
      )
      .then((res) => {
        const users = res.data;
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
    }
  }, [authName]);
  useEffect(() => {
    if(Object.keys(rooms).length > 0){
      loadStatus();
    }
  }, [rooms]);
  const prefillStores = () => {
    syncAuthData()
      .then((username: any) => {
        updateAuthName(username);
      })
      .catch(() => {
        router.replace("/signin");
      })
      .finally(() => {
        setAppLoading(false);
      });
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
