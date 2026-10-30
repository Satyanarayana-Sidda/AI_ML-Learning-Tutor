import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import { useAuthStore } from "@/stores/authStore";

export const api = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL || ""}/api/v1`,
  headers: { "Content-Type": "application/json" },
});

// Attach access token to every outgoing request.
api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = useAuthStore.getState().accessToken;
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// On 401, try refreshing the access token once, then retry the original request.
// This is what keeps a user logged in across the 30-minute access token expiry
// without forcing a re-login every half hour.
let refreshPromise: Promise<string | null> | null = null;

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const refreshToken = useAuthStore.getState().refreshToken;
      if (!refreshToken) {
        useAuthStore.getState().logout();
        return Promise.reject(error);
      }

      if (!refreshPromise) {
        refreshPromise = axios
          .post("/api/v1/auth/refresh", { refresh_token: refreshToken })
          .then((res) => {
            const newAccessToken = res.data.access_token as string;
            useAuthStore.getState().setAccessToken(newAccessToken);
            return newAccessToken;
          })
          .catch(() => {
            useAuthStore.getState().logout();
            return null;
          })
          .finally(() => {
            refreshPromise = null;
          });
      }

      const newToken = await refreshPromise;
      if (newToken && originalRequest.headers) {
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return api(originalRequest);
      }
    }
    return Promise.reject(error);
  }
);

/**
 * Consumes a Server-Sent Events stream from the AI Tutor endpoint.
 * fetch + ReadableStream is used instead of EventSource because
 * EventSource can't send an Authorization header.
 */
export async function streamChatMessage(
  conversationId: string,
  content: string,
  onToken: (token: string) => void,
  onDone: (citations: unknown) => void
) {
  const token = useAuthStore.getState().accessToken;
  const apiBaseUrl = import.meta.env.VITE_API_URL || "";
  const response = await fetch(`${apiBaseUrl}/api/v1/conversations/${conversationId}/messages`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ content }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Chat request failed (${response.status}): ${errorText}`);
  }

  if (!response.body) {
    throw new Error("Chat response did not contain a readable stream");
  }
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });

    const parts = buffer.split("\n\n");
    buffer = parts.pop() || "";

    for (const part of parts) {
      if (!part.startsWith("data: ")) continue;
      const json = JSON.parse(part.slice(6));
      if (json.token) onToken(json.token);
      if (json.done) onDone(json.citations);
      if (json.error) onToken(`\n\n_${json.error}_`);
    }
  }

  if (buffer.startsWith("data: ")) {
    const json = JSON.parse(buffer.slice(6));
    if (json.token) onToken(json.token);
    if (json.done) onDone(json.citations);
    if (json.error) onToken(`\n\n_${json.error}_`);
  }
}
