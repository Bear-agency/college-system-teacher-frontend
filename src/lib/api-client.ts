import axios, { type AxiosError } from "axios";
import { getAuthJwtCookie, removeAuthJwtCookie } from "@/src/lib/auth-token-cookie";

const baseURL = process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:3000";

export const apiClient = axios.create({
  baseURL,
  headers: { "Content-Type": "application/json" },
});

apiClient.interceptors.request.use((config) => {
  const token = getAuthJwtCookie();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<{ message?: string | string[] }>) => {
    if (error.response?.status === 401 && typeof window !== "undefined") {
      removeAuthJwtCookie();
      void import("@/src/store/useAuthStore").then(({ useAuthStore }) => {
        useAuthStore.getState().clearAuthState();
      });
      if (!window.location.pathname.startsWith("/login")) {
        window.location.assign("/login?reason=session-expired");
      }
    }
    return Promise.reject(error);
  },
);

export function getApiErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data;
    if (data && typeof data === "object" && "message" in data) {
      const msg = (data as { message?: string | string[] }).message;
      if (Array.isArray(msg)) return msg.join(", ");
      if (typeof msg === "string") return msg;
    }
    return error.message || "Request failed";
  }
  return "Something went wrong";
}
