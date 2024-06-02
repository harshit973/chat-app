"use client";

import ConversationRoom from "@/components/ConversationRoom";
import InvitationList from "@/components/InvitationList";
import ParticipantList from "@/components/ParticipantList";
import { ChatRoom } from "@/types/ChatRoom";
import { Message } from "@/types/Message";
import { useAuthStore } from "@/zustand/useAuthStore";
import { useChatStore } from "@/zustand/useChatStore";
import { useParticipantStore } from "@/zustand/useParticipantsStore";
import { usePopupStore } from "@/zustand/usePopupStore";
import { useStatusStore } from "@/zustand/useStatusStore";
import { useToastStore } from "@/zustand/useToastStore";
import React, { useEffect, useRef, useState } from "react";
import { Socket, io } from "socket.io-client";

const page = ({ params }: ChatRoom) => {
  const rendered = useRef<boolean>(false);
  const { authName } = useAuthStore();
  const { showPrompt } = usePopupStore();
  const { rooms, updateRooms } = useParticipantStore();
  const [chatSocket, setChatSocket] = useState<Socket | null>(null);
  const [groupChatSocket, setGroupChatSocket] = useState<Socket | null>(null);
  const [relationSocket, setRelationSocket] = useState<Socket | null>(null);
  const { status, updateStatus } = useStatusStore();
  const { chats, updateChats } = useChatStore();
  const { showToast } = useToastStore();
  const chatStoreRef = useRef(chats);
  const roomsRef = useRef(rooms);
  const NotTypingEventRef = useRef<any>(null);

  useEffect(() => {
    if (!rendered.current) {
      const chatSocket: any = io(`${process.env.NEXT_PUBLIC_CHAT_HOST}`, {
        query: {
          username: authName,
        },
      });
      const groupChatSocket: any = io(
        `${process.env.NEXT_PUBLIC_GROUP_CHAT_HOST}`,
        {
          query: {
            username: authName,
          },
        }
      );
      const relationSocket: any = io(
        `${process.env.NEXT_PUBLIC_RELATION_HOST}`,
        {
          query: {
            username: authName,
          },
        }
      );
      setChatSocket(chatSocket);
      setGroupChatSocket(groupChatSocket);
      setRelationSocket(relationSocket);
      rendered.current = true;
    }
    return () => {
      chatSocket?.close();
      relationSocket?.close();
    };
  }, []);

  useEffect(() => {
    chatStoreRef.current = chats;
  }, [chats]);

  useEffect(() => {
    roomsRef.current = rooms;
  }, [rooms]);

  useEffect(() => {
    initializeChatWebSocket();
  }, [chatSocket]);

  useEffect(() => {
    initializeGroupChatWebSocket();
  }, [groupChatSocket]);

  const getConversationIdFromParams = (params: any) => {
    return params?.conversationId?.[0];
  };

  const manageDMTypingEvent = () => {
    if (chatSocket) {
      const conversationId = getConversationIdFromParams(params);
      chatSocket.on("typing msg", (typingMsg: any) => {
        const sender = typingMsg?.sender;
        if (typingMsg?.cId === conversationId && sender) {
          let roomDetails = roomsRef.current?.[conversationId] ?? {};
          const typingUsers = roomDetails?.typingUsers ?? new Set();
          typingUsers.add(sender);
          roomDetails = { ...roomDetails, typingUsers: typingUsers };
          updateRooms({ ...roomsRef.current, [conversationId]: roomDetails });
          const notTypingEvent = NotTypingEventRef.current;
          const currentNotTypingEvent = notTypingEvent?.[sender];
          if (currentNotTypingEvent) {
            clearTimeout(currentNotTypingEvent);
            delete NotTypingEventRef.current?.[sender];
          }
          const timer = setTimeout(() => {
            let roomDetails = roomsRef.current[conversationId];
            const typingUsers = roomDetails.typingUsers;
            typingUsers.delete(sender);
            updateRooms({
              ...roomsRef.current,
              [conversationId]: { ...roomDetails, typingUsers: typingUsers },
            });
          }, 2000);
          NotTypingEventRef.current = { ...notTypingEvent, [sender]: timer };
        }
      });
    }
  };

  const manageGroupTypingEvent = () => {
    if (groupChatSocket) {
      const conversationId = getConversationIdFromParams(params);
      groupChatSocket.on("typing msg", (typingMsg: any) => {
        const sender = typingMsg?.sender;
        if (typingMsg?.cId === conversationId && sender) {
          let roomDetails = roomsRef.current?.[conversationId] ?? {};
          const typingUsers = roomDetails?.typingUsers ?? new Set();
          typingUsers.add(sender);
          roomDetails = { ...roomDetails, typingUsers: typingUsers };
          updateRooms({ ...roomsRef.current, [conversationId]: roomDetails });
          const notTypingEvent = NotTypingEventRef.current;
          const currentNotTypingEvent = notTypingEvent?.[sender];
          if (currentNotTypingEvent) {
            clearTimeout(currentNotTypingEvent);
          }
          const timer = setTimeout(() => {
            let roomDetails = roomsRef.current[conversationId];
            const typingUsers = roomDetails.typingUsers;
            typingUsers.delete(sender);
            updateRooms({
              ...roomsRef.current,
              [conversationId]: { ...roomDetails, typingUsers: typingUsers },
            });
          }, 2000);
          NotTypingEventRef.current = { ...notTypingEvent, [sender]: timer };
        }
      });
    }
  };

  const initializeGroupChatWebSocket = () => {
    if (!groupChatSocket) {
      return;
    }
    manageGroupTypingEvent();
    groupChatSocket.on("receive msg", (msg: Message) => {
      const cId = msg?.cId;
      const roomDetails = roomsRef.current?.[cId];
      const receiver =
        msg?.receiver === "-1" ? `${roomDetails?.name ?? ""} group` : "DM";
      const currentConversation = [...(chatStoreRef.current?.[cId] ?? []), msg];
      updateChats({ ...chatStoreRef.current, [cId]: currentConversation });
      if (!isMessageForCurrentConversation(msg) && msg?.sender && receiver) {
        showToast(`${msg?.sender} sent a message for you in ${receiver}`);
      }
    });
    groupChatSocket.on("member added", (member) => {
      const conversationId = member?.conversationId;
      const roomDetails = roomsRef.current?.[conversationId];
      roomDetails.participants = [...roomDetails?.participants, member?.member];
      updateRooms({ ...roomsRef.current, [conversationId]: roomDetails });
      showToast(`${member?.member} joined ${roomDetails?.name}`);
    });
    groupChatSocket.on("added to group", (group) => {
      updateRooms({ ...roomsRef.current, [group?._id]: group });
    });
    groupChatSocket.on("delete msg", (msg: Message) => {
      const cId = msg?.cId;
      const roomDetails = roomsRef.current?.[cId];
      const receiver =
        msg?.receiver === "-1" ? `${roomDetails?.name ?? ""} group` : "DM";
      const currentConversation = [...(chatStoreRef.current?.[cId] ?? [])];
      const newConversations = currentConversation.filter(
        (existingMsg: Message) => existingMsg?.mId !== msg?.mId
      );
      updateChats({ ...chatStoreRef.current, [cId]: newConversations });
      if (!isMessageForCurrentConversation(msg)) {
        showToast(`${msg?.sender} deleted a message in ${receiver}`);
      }
    });
    groupChatSocket.on("sender msg", (msg: Message) => {
      const cId = msg?.cId;
      const currentConversation = [...(chatStoreRef.current?.[cId] ?? [])];
      const updatedConversation = currentConversation?.map((existingMsg) => {
        return existingMsg?.tempTag === msg?.tempTag
          ? { ...existingMsg, mId: msg?.mId, createdOn: new Date(msg?.createdOn ?? "") }
          : existingMsg;
      });
      updateChats({ ...chatStoreRef.current, [cId]: updatedConversation });
    });
    setChatSocket(chatSocket);
  };

  const initializeChatWebSocket = () => {
    if (!chatSocket) {
      return;
    }
    manageDMTypingEvent();
    chatSocket.on("receive msg", (msg: Message) => {
      const cId = msg?.cId;
      const roomDetails = roomsRef.current?.[cId];
      const receiver =
        msg?.receiver === "-1" ? `${roomDetails?.name ?? ""} group` : "DM";
      const currentConversation = [...(chatStoreRef.current?.[cId] ?? []), msg];
      updateChats({ ...chatStoreRef.current, [cId]: currentConversation });
      if (!isMessageForCurrentConversation(msg) && msg?.sender && receiver) {
        showToast(`${msg?.sender} sent a message for you in ${receiver}`);
      }
    });
    chatSocket.on("status msg", (msg: any) => {
      updateStatus({ ...status, [msg?.username]: msg?.status });
    });
    chatSocket.on("delete msg", (msg: Message) => {
      const cId = msg?.cId;
      const roomDetails = roomsRef.current?.[cId];
      const receiver =
        msg?.receiver === "-1" ? `${roomDetails?.name ?? ""} group` : "DM";
      const currentConversation = [...(chatStoreRef.current?.[cId] ?? [])];
      const newConversations = currentConversation.filter(
        (existingMsg: Message) => existingMsg?.mId !== msg?.mId
      );
      updateChats({ ...chatStoreRef.current, [cId]: newConversations });
      if (!isMessageForCurrentConversation(msg)) {
        showToast(`${msg?.sender} deleted a message in ${receiver}`);
      }
    });
    chatSocket.on("sender msg", (msg: Message) => {
      const cId = msg?.cId;
      const currentConversation = [...(chatStoreRef.current?.[cId] ?? [])];
      const updatedConversation = currentConversation?.map((existingMsg) => {
        return existingMsg?.tempTag === msg?.tempTag
          ? { ...existingMsg, mId: msg?.mId, createdOn: new Date(msg?.createdOn ?? "") }
          : existingMsg;
      });
      updateChats({ ...chatStoreRef.current, [cId]: updatedConversation });
    });
    setChatSocket(chatSocket);
  };

  const isMessageForCurrentConversation = (msg: Message) => {
    return msg?.cId === getConversationIdFromParams(params);
  };

  const sendInvitation = async (friendName: any) => {
    relationSocket?.emit("friend_request", {
      sender: authName,
      status: null,
      receiver: friendName,
    });
  };

  const getMembers = () => {
    return Object.values(rooms)
      ?.filter((room: any) => !room?.name)
      ?.map((room: any) => getReceiverName(room));
  };
  const getReceiverName = (room: any) => {
    if (room?.name) {
      return room?.name;
    }
    return room?.participants[0] === authName
      ? room?.participants[1]
      : room?.participants[0];
  };

  const getConversationSocket = () => {
    const room = rooms?.[getConversationIdFromParams(params)];
    if (!room) {
      return null;
    }
    return room?.name ? groupChatSocket : chatSocket;
  };

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        height: "87.9%",
        padding: "0 0 0 312px",
        borderTop: "1px solid #d3d3d3",
      }}
    >
      <ParticipantList
        params={params}
        style={{
          position: "absolute",
          left: 0,
          bottom: 0,
          top: 0,
          padding: 20,
          borderRight: "1px solid #d3d3d3",
        }}
        onBeforeCreateInvitation={() => {
          showPrompt(
            "Add Friend",
            (valueMap: any) => {
              sendInvitation(valueMap?.["Username"]);
            },
            [
              { label: "Username", type: "text", value: "" },
              { text: "Send request", type: "button" },
            ]
          );
        }}
        onBeforeAddGroup={() => {
          showPrompt(
            "Add Group",
            (valueMap: any) => {
              const payload = {
                name: valueMap?.["Group Name"],
                participants: [authName, ...(valueMap?.["Members"] ?? [])],
              };
              chatSocket?.emit("add group", payload);
            },
            [
              { label: "Group Name", type: "text", value: "" },
              {
                label: "Members",
                multiple: true,
                type: "select",
                options: getMembers(),
                value: "",
              },
              { text: "Create Group", type: "button" },
            ]
          );
        }}
      />
      {params?.conversationId &&
      rooms?.[getConversationIdFromParams(params)] ? (
        <ConversationRoom
          chatSocket={getConversationSocket()}
          conversationId={getConversationIdFromParams(params)}
        />
      ) : (
        <div>{<InvitationList relationSocket={relationSocket} />}</div>
      )}
    </div>
  );
};

export default page;