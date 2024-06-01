"use client";

import { Message } from "@/types/Message";
import { useAuthStore } from "@/zustand/useAuthStore";
import { useParticipantStore } from "@/zustand/useParticipantsStore";
import { useStatusStore } from "@/zustand/useStatusStore";
import React, { useEffect, useRef, useState } from "react";
import { Socket } from "socket.io-client";
import "./Chat.css";
import axios from "axios";
import { useChatStore } from "@/zustand/useChatStore";
import Search from "./Search";
import { useToastStore } from "@/zustand/useToastStore";
import { usePopupStore } from "@/zustand/usePopupStore";
import { generateRandomId } from "@/Utility";

const ConversationRoom = ({ conversationId, chatSocket }: any) => {
  const [messages, setMessages] = useState<any[]>([]);
  const [socket, setSocket] = useState<Socket | null>(null);
  const { rooms } = useParticipantStore();
  const { showPrompt } = usePopupStore();
  const msgMap = useRef(new Map());
  const [msg, setMsg] = useState<Message | null>(null);
  const [msgToBeDeleted, setMsgToBeDeleted] = useState<any>(null);
  const { authName } = useAuthStore();
  const { chats, updateChats } = useChatStore();

  const rendering = useRef(false);

  useEffect(() => {
    if (!rendering.current) {
      if (!chats?.[conversationId] || chats?.[conversationId]?.length === 0) {
        getMsgs();
      }
      rendering.current = true;
    }
  }, []);

  useEffect(() => {
    setSocket(chatSocket);
  }, [chatSocket]);

  useEffect(() => {
    if (msgToBeDeleted) {
      showPrompt(
        "Do you want to delete this message",
        (e) => {
          deleteMsg(msgToBeDeleted);
          setMsgToBeDeleted(null);
        },
        [
          { type: "button", text: "Yes" },
          { type: "button", text: "No" },
        ]
      );
    }
  }, [msgToBeDeleted]);

  useEffect(() => {
    setMessages(chats?.[conversationId] ?? []);
  }, [chats]);

  const deleteMsg = (text: any) => {
    if (text?.receiver === "-1") {
      socket?.emit("delete group msg", text);
    } else {
      socket?.emit("delete msg", text);
    }
    const currentConversation = chats?.[text?.cId] ?? [];
    const newConversation = currentConversation.filter(
      (msg: Message) => msg.mId !== text?.mId
    );
    updateChats({ ...chats, [text?.cId]: newConversation });
  };

  const getMsgs = async (searchText = "") => {
    const receiver = rooms?.[conversationId];
    const res = await axios.get(
      `${process.env.NEXT_PUBLIC_FE_HOST}:9000/api/${
        receiver?.name ? "groupConversations" : "conversations"
      }/${conversationId}/messages?search=${searchText}`,
      {
        withCredentials: true,
      }
    );

    if (res.data.length !== 0) {
      const msgs = res.data?.map((msg: any) => {
        return {
          text: msg.text,
          mId: msg?._id,
          cId: conversationId,
          receiver: receiver?.name ? "-1" : getReceiverName(receiver),
          sender: msg?.sender,
          isSender: msg?.sender === authName,
        };
      });
      updateChats({
        ...chats,
        [conversationId]: msgs,
      });
    } else {
      updateChats({
        ...chats,
        [conversationId]: [],
      });
    }
  };

  const getReceiverName = (room: any) => {
    if (room?.name) {
      return room?.name;
    }
    return room?.participants[0] === authName
      ? room?.participants[1]
      : room?.participants[0];
  };

  const sendMsg = (e: any) => {
    e.preventDefault();
    if (socket && msg && msg.text) {
      const receiverPayload = { ...msg, isSender: false };
      const senderPayload = { ...msg, isSender: true };
      const cId = msg?.cId;
      const currentConversation = [...(chats?.[cId] ?? []), senderPayload];
      updateChats({ ...chats, [cId]: currentConversation });
      socket.emit("msg", receiverPayload);
      setMsg(null);
    }
  };

  const broadcastMsg = (e: any) => {
    e.preventDefault();
    if (socket && msg && msg.text) {
      const receiverPayload = { ...msg, isSender: false };
      const senderPayload = { ...msg, isSender: true };
      const cId = msg?.cId;
      const currentConversation = [...(chats?.[cId] ?? []), senderPayload];
      updateChats({ ...chats, [cId]: currentConversation });
      socket.emit("broadcast msg", receiverPayload);      
      setMsg(null);
    }
  };

  return (
    <div className={"relative w-full"} style={{ height: "100%" }}>
      <div
        style={{
          width: "82%",
          height: "100%",
          position: "relative",
        }}
      >
        {conversationId && (
          <>
            <Search
              onSearch={getMsgs}
              style={{ width: "100%", padding: "10px" }}
              placeholder="Search messages...."
            />
            <div
              style={{
                position: "absolute",
                top: 70,
                left: 0,
                right: 0,
                bottom: 120,
                overflowY: "auto",
                padding: 10,
              }}
              className="max-w-screen-xl mx-auto"
            >
              <div>
                {messages?.map((text: any) => {
                  if (
                    text &&
                    text?.text &&
                    text?.mId &&
                    (text?.isSender === true || text?.isSender === false)
                  )
                    return (
                      <div
                        style={{
                          display: "grid",
                        }}
                        onMouseLeave={(e: any) => {
                          if (msgMap.current.has(text?.mId)) {
                            msgMap.current
                              .get(text?.mId)
                              ?.classList?.add("hidden");
                          }
                        }}
                        onMouseEnter={(e: any) => {
                          if (msgMap.current.has(text?.mId)) {
                            msgMap.current
                              .get(text?.mId)
                              ?.classList?.remove("hidden");
                          }
                        }}
                      >
                        <div
                          className={`chat-box chat-box-${
                            text?.isSender ? "sender" : "receiver"
                          }`}
                        >
                          {text?.isSender && text?.mId && (
                            <svg
                              ref={(ele: any) => {
                                msgMap.current.set(text?.mId, ele);
                              }}
                              onClick={async (e: any) => {
                                setMsgToBeDeleted(text);
                              }}
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                              strokeWidth={1.5}
                              stroke="currentColor"
                              className={`w-6 h-12 text-black hidden`}
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"
                              />
                            </svg>
                          )}
                          <div
                            className={`chat-${
                              text?.isSender ? "sender" : "receiver"
                            }-msg`}
                          >
                            {!text?.isSender && text?.receiver === "-1" ? (
                              <span style={{ fontSize: "14px" }}>
                                {text?.sender}
                              </span>
                            ) : (
                              <></>
                            )}
                            <p style={{ fontSize: "20px" }}>{text?.text}</p>
                          </div>
                        </div>
                      </div>
                    );
                })}
              </div>
            </div>

            <footer
              style={{ boxSizing: "content-box" }}
              className="bg-white absolute bottom-0 rounded-lg shadow p-2 dark:bg-gray-800 left-0 right-0"
            >
              <div className="w-full mx-auto md:flex md:items-center md:justify-between">
                <form
                  onSubmit={(e) => {
                    msg?.receiver === "-1" ? broadcastMsg(e) : sendMsg(e);
                  }}
                  className="mx-auto w-full"
                >
                  <div
                    style={{ justifyContent: "space-between" }}
                    className="flex items-center"
                  >
                    <textarea
                      id="message"
                      rows={4}
                      value={msg?.text || ""}
                      style={{ width: "90%", outline: "none", maxHeight: 200 }}
                      className="block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                      placeholder="Leave a message..."
                      onChange={(e) => {
                        const room = rooms?.[conversationId];
                        const msg = {
                          text: e.currentTarget.value,
                          sender: authName,
                          cId: conversationId,
                          receiver: room?.name ? "-1" : getReceiverName(room),
                          isSender: true,
                          tempTag: generateRandomId(),
                        };
                        setMsg(msg);
                      }}
                    ></textarea>
                    <button
                      style={{ margin: "0 2px" }}
                      type="submit"
                      className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800"
                      disabled={!msg || !msg.text}
                    >
                      Send
                    </button>
                  </div>
                </form>
              </div>
            </footer>
          </>
        )}
      </div>
      <div
        style={{
          position: "absolute",
          right: 0,
          bottom: 0,
          top: 0,
          width: "18%",
          borderLeft: "1px solid #d3d3d3",
        }}
      >
        {conversationId &&
          rooms?.[conversationId]?.participants?.map((participant: any) => {
            return (
              <div
                className={"p-2 flex align-middle justify-start"}
                style={{ borderBottom: "1px solid #d3d3d3" }}
              >
                <svg
                  className="w-6 h-6 text-gray-800 dark:text-white"
                  aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    fill-rule="evenodd"
                    d="M4 4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2H4Zm10 5a1 1 0 0 1 1-1h3a1 1 0 1 1 0 2h-3a1 1 0 0 1-1-1Zm0 3a1 1 0 0 1 1-1h3a1 1 0 1 1 0 2h-3a1 1 0 0 1-1-1Zm0 3a1 1 0 0 1 1-1h3a1 1 0 1 1 0 2h-3a1 1 0 0 1-1-1Zm-8-5a3 3 0 1 1 6 0 3 3 0 0 1-6 0Zm1.942 4a3 3 0 0 0-2.847 2.051l-.044.133-.004.012c-.042.126-.055.167-.042.195.006.013.02.023.038.039.032.025.08.064.146.155A1 1 0 0 0 6 17h6a1 1 0 0 0 .811-.415.713.713 0 0 1 .146-.155c.019-.016.031-.026.038-.04.014-.027 0-.068-.042-.194l-.004-.012-.044-.133A3 3 0 0 0 10.059 14H7.942Z"
                    clip-rule="evenodd"
                  />
                </svg>
                <p className={" ps-2"}>{participant}</p>
              </div>
            );
          })}
      </div>
    </div>
  );
};

export default ConversationRoom;
