"use client";

import { SignUpUser } from "@/Services/SignUpUser";
import CompanyLogo from "@/components/CompanyLogo";
import { routes } from "@/utils/Constant/Routes";
import { RouteHandler } from "@/utils/RouteHandler";
import { usePopupStore } from "@/zustand/usePopupStore";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useState } from "react";

const Signup = () => {
  const [userName, setUserName] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const router = useRouter();
  const [navigator, setNavigator] = useState<RouteHandler>(
    new RouteHandler(router)
  );
  const { showPopup } = usePopupStore();

  const register = async (e: any) => {
    e?.preventDefault();
    try {
      setLoading(true);
      await SignUpUser(userName, password);
      navigator?.replaceCurrentAndNavigateTo(routes.chatHome);
    } catch (e: any) {
      showPopup("Unable to signup!", [
        { type: "body", text: `${e?.message ?? "Unknown error"}`, html: true },
        { text: "Ok", type: "button" },
      ]);
    } finally {
      setLoading(false);
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
          <CompanyLogo />
          {process.env.NEXT_PUBLIC_COMPANY_NAME}
        </a>
        <div className="w-full bg-white rounded-lg shadow dark:border md:mt-0 sm:max-w-md xl:p-0 dark:bg-gray-800 dark:border-gray-700">
          <div className="p-6 space-y-4 md:space-y-6 sm:p-8">
            <h1 className="text-xl font-bold leading-tight tracking-tight text-gray-900 md:text-2xl dark:text-white">
              Create and account
            </h1>
            <form
              onSubmit={register}
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
              <div>
                <label
                  htmlFor="confirm-password"
                  className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                >
                  Confirm password
                </label>
                <input
                  type="confirm-password"
                  name="confirm-password"
                  id="confirm-password"
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e?.target?.value);
                  }}
                  placeholder="••••••••"
                  className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                  required
                />
              </div>
              <button
                type="submit"
                className="w-full text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800"
                disabled={
                  !userName ||
                  !password ||
                  !confirmPassword ||
                  password !== confirmPassword
                }
              >
                {loading ? "Please wait....." : "Create an account"}
              </button>
              <p className="text-sm font-light text-gray-500 dark:text-gray-400">
                Already have an account?
                <Link
                  href="/signin"
                  className="font-medium text-primary-600 hover:underline dark:text-primary-500"
                >
                  Login here
                </Link>
              </p>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Signup;
