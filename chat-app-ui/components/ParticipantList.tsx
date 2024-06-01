"use client";
import React, { useRef, useState } from "react";
import { useParticipantStore } from "../zustand/useParticipantsStore";
import { useAuthStore } from "../zustand/useAuthStore";
import { useStatusStore } from "../zustand/useStatusStore";
import { useRouter } from "next/navigation";
import { syncParticipantData } from "@/preloader/SyncParticipantData";

interface ParticipantListParams {
  style?: any;
  params: any;
  onBeforeCreateInvitation: () => void;
  onBeforeAddGroup: () => void;
}

const ParticipantList: React.FC<ParticipantListParams> = ({
  style,
  params,
  onBeforeCreateInvitation,
  onBeforeAddGroup,
}) => {
  const [searchText, setSearchText] = useState<string>("");
  const { updateRooms,rooms } =
    useParticipantStore();
  const { status } = useStatusStore();
  const { authName } = useAuthStore();
  const router = useRouter();

  const onSearch = (searchText: string) => {
    syncParticipantData(authName,searchText).then((participants:any)=>{
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
    })
  };

  const getReceiverName = (room: any) => {
    if (room?.name) {
      return room?.name;
    }
    return room?.participants[0] === authName
      ? room?.participants[1]
      : room?.participants[0];
  };

  const getConversationId = (params:any) => {
    return params?.conversationId?.[0];
  }

  const onShowInvitations = () => {
    router.push("/chat")
  }

  return (
    <section style={style}>
      <div className={"flex justify-end mb-4 mt-4"}>
        <svg 
          onClick={onShowInvitations}
          className="w-10 h-10 ml-2 me-2 text-gray-800 dark:text-white"
          aria-hidden="true"
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          fill="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            fill-rule="evenodd"
            d="M7 2a2 2 0 0 0-2 2v1a1 1 0 0 0 0 2v1a1 1 0 0 0 0 2v1a1 1 0 1 0 0 2v1a1 1 0 1 0 0 2v1a1 1 0 1 0 0 2v1a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H7Zm3 8a3 3 0 1 1 6 0 3 3 0 0 1-6 0Zm-1 7a3 3 0 0 1 3-3h2a3 3 0 0 1 3 3 1 1 0 0 1-1 1h-6a1 1 0 0 1-1-1Z"
            clip-rule="evenodd"
          />
        </svg>

        <svg
          onClick={onBeforeCreateInvitation}
          className="w-10 h-10 ml-2 me-2 text-gray-800 dark:text-white"
          aria-hidden="true"
          xmlns="http://www.w3.org/2000/svg"
          fill="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            fill-rule="evenodd"
            d="M9 4a4 4 0 1 0 0 8 4 4 0 0 0 0-8Zm-2 9a4 4 0 0 0-4 4v1a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2v-1a4 4 0 0 0-4-4H7Zm8-1a1 1 0 0 1 1-1h1v-1a1 1 0 1 1 2 0v1h1a1 1 0 1 1 0 2h-1v1a1 1 0 1 1-2 0v-1h-1a1 1 0 0 1-1-1Z"
            clip-rule="evenodd"
          />
        </svg>
        <svg
          onClick={onBeforeAddGroup}
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="w-10 h-10 ml-2 me-2"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m.94 3.198.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0 1 12 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 0 1 6 18.719m12 0a5.971 5.971 0 0 0-.941-3.197m0 0A5.995 5.995 0 0 0 12 12.75a5.995 5.995 0 0 0-5.058 2.772m0 0a3 3 0 0 0-4.681 2.72 8.986 8.986 0 0 0 3.74.477m.94-3.197a5.971 5.971 0 0 0-.94 3.197M15 6.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm6 3a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Zm-13.5 0a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Z"
          />
        </svg>
      </div>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          onSearch(searchText);
        }}
        className="max-w-md mx-auto mb-2"
      >
        <label
          htmlFor="default-search"
          className="mb-2 text-sm font-medium text-gray-900 sr-only dark:text-white"
        >
          Search
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
            <svg
              className="w-4 h-4 text-gray-500 dark:text-gray-400"
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 20 20"
            >
              <path
                stroke="currentColor"
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"
              />
            </svg>
          </div>
          <input
            type="search"
            id="default-search"
            onChange={(e) => {
              setSearchText(e.currentTarget.value ?? "");
            }}
            className="block w-full p-3 ps-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
            placeholder="Search..."
          />
          <button
            type="submit"
            className="text-white absolute top-0 end-0 bottom-0 bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-4 py-2 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
          >
            Search
          </button>
        </div>
      </form>

      {Object.keys(rooms)?.map((roomId) => {
        const room = rooms?.[roomId]
        return (
          <div
            style={{ border: "1px solid grey" }}
            className={`relative p-2 mb-2 rounded-md ${
              roomId === getConversationId(params)
                ? "bg-gray-50 text-black"
                : "bg-slate-800 text-white"
            }`}
            onClick={() => {
              router.push(`/chat/${roomId ?? ''}`);
            }}
          >
            <p>{room?.name ?? getReceiverName(room)}</p>
            {!room?.name && (
              <div
                className={"absolute bottom-1 right-1"}
                style={{
                  padding: "5px",
                  borderRadius: "0.5rem",
                  backgroundColor: `${
                    status?.[getReceiverName(room)] === 1 ? "green" : "red"
                  }`,
                }}
              ></div>
            )}
          </div>
        );
      })}
    </section>
  );
};

export default ParticipantList;
