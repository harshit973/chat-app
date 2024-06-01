import { InvitationList as InvitationListType } from "@/types/InvitationList";
import { useAuthStore } from "@/zustand/useAuthStore";
import { useParticipantStore } from "@/zustand/useParticipantsStore";
import { useToastStore } from "@/zustand/useToastStore";
import axios from "axios";
import React, { useEffect, useRef, useState } from "react";

const InvitationList = ({ relationSocket }: InvitationListType) => {
  const [incommingRequests, setIncommingRequests] = useState<any[] | null>(
    null
  );
  const [outgoingRequests, setOutgoingRequests] = useState<any[] | null>(null);
  const { authName } = useAuthStore();
  const { showToast } = useToastStore();
  const { rooms, updateRooms } = useParticipantStore();
  const roomsRef = useRef(rooms ?? {});
  const outgoingRef = useRef(outgoingRequests);
  const incommingRef = useRef(incommingRequests);
  useEffect(() => {
    if (authName) {
      axios
        .get(
          `${process.env.NEXT_PUBLIC_FE_HOST}:9000/api/conversationRequest?receiver=${authName}`,
          {
            withCredentials: true,
          }
        )
        .then((res) => {
          setIncommingRequests(res?.data ?? []);
        });
      axios
        .get(
          `${process.env.NEXT_PUBLIC_FE_HOST}:9000/api/conversationRequest?sender=${authName}`,
          {
            withCredentials: true,
          }
        )
        .then((res) => {
          setOutgoingRequests(res?.data ?? []);
        });
    }
  }, []);
  const updateRequest = (
    rId: string,
    sender: string,
    receiver: string,
    status: boolean
  ) => {
    const payload = {
      rId: rId,
      sender: sender,
      receiver: receiver,
      status: status,
    };
    if (status == true) {
      relationSocket?.emit("friend_request_accept", payload);
    } else if (status == false) {
      relationSocket?.emit("friend_request_reject", payload);
    }
  };

  useEffect(() => {
    outgoingRef.current = outgoingRequests;
  }, [outgoingRequests]);

  useEffect(() => {
    incommingRef.current = incommingRequests;
  }, [incommingRequests]);

  useEffect(() => {
    roomsRef.current = rooms;
  }, [rooms]);

  useEffect(() => {
    const outRequests = outgoingRef.current;
    const inRequests = incommingRef.current;
    outRequests?.map((req, idx) => {
      const receiver = req?.receiver;
      relationSocket?.on(
        `friend_request_accept_${receiver}`,
        async (reqObj) => {
          const room = reqObj?.room;
          if (room) {
            const newRooms = { ...rooms, [room?._id]: room };
            updateRooms(newRooms);
            if (outRequests) {
              if (outRequests?.[idx]?.rId === reqObj?.rId) {
                outRequests[idx].status = true;
              }
            }
            showToast(`${receiver} has accepted your request`);
          }
        }
      );
      relationSocket?.on(
        `friend_request_reject_${req?.receiver}`,
        async (reqObj) => {
          if (inRequests) {
            inRequests[idx].status = false;
          }
          showToast(`${receiver} has rejected your request`);
        }
      );
    });
  }, [outgoingRequests]);

  useEffect(() => {
    if (relationSocket) {
      relationSocket?.on("friend_request", async (request) => {
        const sender = request?.sender;
        const outRequests = outgoingRef?.current;
        const inRequests = incommingRef?.current;
        if (sender === authName) {
          if (!outRequests) {
            setOutgoingRequests([request]);
          } else {
            setOutgoingRequests([request, ...outRequests]);
          }
        } else {
          if (!inRequests) {
            setIncommingRequests([request]);
          } else {
            setIncommingRequests([request, ...inRequests]);
          }
        }
      });
      relationSocket?.on(
        `friend_request_accept_acknowledgement`,
        async (reqObj) => {
          const room = reqObj?.room;
          if (room) {
            updateRooms({ ...roomsRef.current, [room?._id]: room });
          }
        }
      );
    }
  }, [relationSocket]);

  const getLoader = () => {
    return (
      <div role="status">
        <svg
          aria-hidden="true"
          className="w-8 h-8 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600"
          viewBox="0 0 100 101"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
            fill="currentColor"
          />
          <path
            d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
            fill="currentFill"
          />
        </svg>
        <span className="sr-only">Loading...</span>
      </div>
    );
  };

  const getReqList = (reqList: any[], setter: any) => {
    return (
      <div>
        {reqList
          ?.filter((req) => req?.status === null)
          ?.map((req, idx) => (
            <ul
              style={{ width: "90%" }}
              className="divide-y divide-gray-200 dark:divide-gray-700"
            >
              <li className="pb-3 sm:pb-4">
                <div className="flex items-center space-x-4 rtl:space-x-reverse">
                  <div className="flex-shrink-0">
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
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate dark:text-white">
                      {req?.sender}
                    </p>
                  </div>
                  {req?.sender !== authName && (
                    <div className="inline-flex items-center text-base font-semibold text-gray-900 dark:text-white">
                      <p
                        className={"cursor-pointer me-2"}
                        onClick={(e) => {
                          updateRequest(
                            req?.rId,
                            req?.sender,
                            req?.receiver,
                            true
                          );
                          let reqListCopy = [...reqList];
                          reqListCopy[idx].status = true;
                          setter(reqListCopy);
                        }}
                      >
                        Accept
                      </p>
                      <p
                        className={"cursor-pointer"}
                        onClick={(e) => {
                          updateRequest(
                            req?.rId,
                            req?.sender,
                            req?.receiver,
                            false
                          );
                          let reqListCopy = [...reqList];
                          reqListCopy[idx].status = false;
                          setter(reqListCopy);
                        }}
                      >
                        Reject
                      </p>
                    </div>
                  )}
                </div>
              </li>
            </ul>
          ))}
      </div>
    );
  };

  return (
    <div className={" p-4"}>
      <>
        {incommingRequests && (
          <>
            <p
              style={{ borderBottom: "1px solid #bcbcbc" }}
              className={" mb-5"}
            >
              Incomming requests
            </p>
            {getReqList(incommingRequests ?? [], (reqList: any) => {
              setIncommingRequests(reqList);
            })}
          </>
        )}
        {!incommingRequests && getLoader()}
        {outgoingRequests && (
          <>
            <p style={{ borderBottom: "1px solid #bcbcbc" }} className={"mb-4"}>
              Outgoing requests
            </p>
            {getReqList(outgoingRequests ?? [], (reqList: any) => {
              setOutgoingRequests(reqList);
            })}
          </>
        )}
        {!outgoingRequests && getLoader()}
      </>
    </div>
  );
};

export default InvitationList;
