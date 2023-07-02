"use server";
import {axiosInstance} from "@/lib/api";
import {cookies} from "next/headers";

export const loginAction = async (email: string, password: string) => {
  const res = await axiosInstance.post("/authentication/local", {email, password});
  // cookies().set({
  //     name: 'accessToken',
  //     value: res.data.accessToken as string,
  //     httpOnly: true,
  //     path: '/'
  // })
  cookies().set('accessToken', res.data.accessToken)
  cookies().set('refreshToken', res.data.refreshToken)
  return res.data;
}
export const refresh = async () => {
  const refreshToken = cookies().get('refreshToken');
  if (!refreshToken) return false;
  const res = await axiosInstance.post("/authentication/renew");
  cookies().set('accessToken', res.data.accessToken)
  cookies().set('refreshToken', res.data.refreshToken)
  return true;
}
export const logout = async () => {
  const res = await axiosInstance.post("/authentication/logout");
  return res.data;
}

export const getUser = async () => {
  return await getUserRequest().catch(() => {return null});
};

export const getUserRequest = async () => {
  const res = await axiosInstance.get("/authentication/user");
  return res.data;
}
