import { usePopupStore } from "@/zustand/usePopupStore";
import React, { useEffect, useRef, useState } from "react";
import parse from 'html-react-parser';

const PopupLayout = ({ title, onSubmit, currentPromptInfo }: any) => {
  const [promptInfo, setPromptInfo] = useState<any[]>();

  const { closePrompt } = usePopupStore();

  const rendered = useRef(false);

  useEffect(() => {
    if (!rendered.current) {
      rendered.current = true;
      setPromptInfo(currentPromptInfo);
    }
  }, []);
  return (
    <div
      id="crud-modal"
      tabIndex={-1}
      aria-hidden="true"
      style={{ background: "#0000003d" }}
      className="flex overflow-y-auto overflow-x-hidden fixed top-0 right-0 left-0 z-50 justify-center items-center w-full md:inset-0 h-full"
    >
      <div className="relative p-4 w-full max-w-md max-h-full">
        <div className="relative bg-white rounded-lg shadow dark:bg-gray-700">
          <div className="flex items-center justify-between p-4 md:p-5 border-b rounded-t dark:border-gray-600">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {title}
            </h3>
            <button
              type="button"
              className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white"
              data-modal-toggle="crud-modal"
              onClick={() => closePrompt()}
            >
              <svg
                className="w-3 h-3"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 14 14"
              >
                <path
                  stroke="currentColor"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"
                />
              </svg>
              <span className="sr-only">Close modal</span>
            </button>
          </div>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const promptInfoCopy = [...(promptInfo ?? [])];
              promptInfoCopy.pop();
              const valueMap: any = {};
              promptInfoCopy?.forEach((input) => {
                valueMap[input?.label] = input?.value;
              });
              onSubmit(valueMap);
              closePrompt();
            }}
            className="p-4 md:p-5"
          >
            <div className={"p-2"}>
              {promptInfo?.map((promptInput, idx) => {
                return (
                  <>
                    {promptInput?.type === "body" ? (
                      <p>{promptInput?.html ? parse(promptInput?.text) : promptInput?.text}</p>
                    ) : promptInput?.type === "button" ? (
                      <button
                        style={{ width: "100%" }}
                        type="submit"
                        className="text-white my-2 bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
                      >
                        {promptInput?.text}
                      </button>
                    ) : promptInput?.type === "select" ? (
                      <select
                        multiple={promptInput?.multiple ?? false}
                        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                        onChange={(e) => {
                          const promptInfoCopy = [...promptInfo];
                          if (e?.currentTarget?.value) {
                            promptInfoCopy[idx].value = [
                              e?.currentTarget?.value,
                              ...(promptInfoCopy[idx].value ?? []),
                            ];
                          }
                          setPromptInfo(promptInfoCopy);
                        }}
                      >
                        {promptInput?.options?.map((option: any) => {
                          return <option value={option}>{option}</option>;
                        })}
                      </select>
                    ) : (
                      <div className={"my-2"}>
                        <label
                          htmlFor="name"
                          className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                        >
                          {promptInput?.label}
                        </label>
                        <input
                          onChange={(e) => {
                            const promptInfoCopy = [...promptInfo];
                            promptInfoCopy[idx].value =
                              e?.currentTarget?.value ?? "";
                            setPromptInfo(promptInfoCopy);
                          }}
                          type={promptInput?.type}
                          name="name"
                          id="name"
                          className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                          placeholder={promptInput?.placeholder}
                          required={true}
                        />
                      </div>
                    )}
                  </>
                );
              })}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default PopupLayout;
