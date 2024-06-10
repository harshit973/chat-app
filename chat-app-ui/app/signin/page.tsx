"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { useAuthStore } from "../../zustand/useAuthStore";
import { useParticipantStore } from "../../zustand/useParticipantsStore";
import { useChatStore } from "../../zustand/useChatStore";
import { useToastStore } from "@/zustand/useToastStore";
import { routes } from "@/utils/Constant/Routes";
import { RouteHandler } from "@/utils/RouteHandler";
import { loginWithCredentials } from "@/Services/LoginWithCredentials";

const SignIn = () => {
  const [userName, setUserName] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const { updateAuthName } = useAuthStore();
  const { updateRooms } = useParticipantStore();
  const { updateChats } = useChatStore();

  const { showToast } = useToastStore();

  const router = useRouter();  
  const [navigator,setNavigator] = useState<RouteHandler>(new RouteHandler(router));

  const login = async (e: any) => {
    e?.preventDefault();
    try {
      await loginWithCredentials(userName,password)
      updateChats({});
      updateRooms([]);
      updateAuthName(userName);
      navigator?.replaceCurrentAndNavigateTo(routes.chatHome);
    } catch (e: any) {
      showToast(e?.message ?? "Unknown error");
    }
  };

  return (
    <section style={{ height: "93%" }} className="bg-gray-50 dark:bg-gray-900">
      <div
        style={{ height: "100%" }}
        className="flex flex-col items-center justify-center px-6 py-8 mx-auto lg:py-0"
      >
        <a
          href="#"
          className="flex items-center mb-6 text-2xl font-semibold text-gray-900 dark:text-white"
        >
          <img
            className="w-8 h-8 mr-2"
            src="https://flowbite.s3.amazonaws.com/blocks/marketing-ui/logo.svg"
            alt="logo"
          />
          Chat App
        </a>
        <div className="w-full bg-white rounded-lg shadow dark:border md:mt-0 sm:max-w-md xl:p-0 dark:bg-gray-800 dark:border-gray-700">
          <div className="p-6 space-y-4 md:space-y-6 sm:p-8">
            <h1 className="text-xl font-bold leading-tight tracking-tight text-gray-900 md:text-2xl dark:text-white">
              Login
            </h1>
            <form
              onSubmit={login}
              className="space-y-4 md:space-y-6"
              action="#"
            >
              <div>
                <label
                  htmlFor=""
                  className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                >
                  Username
                </label>
                <input
                  type="text"
                  name="username"
                  id="username"
                  value={userName}
                  onChange={(e) => {
                    setUserName(e?.target?.value);
                  }}
                  className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                  placeholder="harshit222"
                  required
                />
              </div>
              <div>
                <label
                  htmlFor="password"
                  className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                >
                  Password
                </label>
                <input
                  type="password"
                  name="password"
                  id="password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e?.target?.value);
                  }}
                  placeholder="••••••••"
                  className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                  required
                />
              </div>
              <button
                type="submit"
                className="w-full text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800"
                disabled={!userName || !password}
              >
                Login
              </button>
              <p className="text-sm font-light text-gray-500 dark:text-gray-400">
                Don't have an account?
                <Link
                  href="/signup"
                  className="font-medium text-primary-600 hover:underline dark:text-primary-500"
                >
                  Register here
                </Link>
              </p>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SignIn;
