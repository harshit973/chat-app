import { InvitationList as InvitationListType } from "@/types/InvitationList";
import { useAuthStore } from "@/zustand/useAuthStore";
import { useInvitationStore } from "@/zustand/useInvitationStore";
import React, { useEffect, useState } from "react";

const InvitationList = ({ relationSocket }: InvitationListType) => {
  const [incommingRequests, setIncommingRequests] = useState<any[] | null>(
    null
  );
  const [outgoingRequests, setOutgoingRequests] = useState<any[] | null>(null);
  const {
    incommingInvitations,
    outgoingInvitations,
  } = useInvitationStore();
  const { authName } = useAuthStore();

  useEffect(() => {
    setIncommingRequests(incommingInvitations);
  }, [incommingInvitations]);

  useEffect(() => {
    setOutgoingRequests(outgoingInvitations);
  }, [outgoingInvitations]);

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
                      {req?.sender === authName ? req?.receiver : req?.sender}
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
                            true
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
        {!incommingRequests}
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
        {!outgoingRequests}
      </>
    </div>
  );
};

export default InvitationList;
