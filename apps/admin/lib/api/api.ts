"use server";
import axios, {AxiosInstance} from "axios";
import {cookies} from "next/headers";

export const axiosInstance: AxiosInstance = (() => {
  let instance: AxiosInstance;
  instance = axios.create({
    baseURL: process.env.API_BASE_URL,
    withCredentials: true,
    timeout: 50000, // request timeout in milliseconds
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
  });
  instance.interceptors.request.use(
    (config) => {
      if (config.headers.Authorization) return config;
      if (config.url === "/authentication/renew") {
        config.headers.Authorization = `Bearer ${
          cookies().get("refreshToken")?.value
        }`;
      } else {

        config.headers.Authorization = `Bearer ${
          cookies().get("accessToken")?.value
        }`;
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );
  return instance;
})();
