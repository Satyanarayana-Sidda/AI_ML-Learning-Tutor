import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import { useAuthStore } from "@/stores/authStore";

const apiBaseUrl = import.meta.env.VITE_API_URL || "";

export const api = axios.create({
  baseURL: `${apiBaseUrl}/api/v1`,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = useAuthStore.getState().accessToken;
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

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
          .post(`${apiBaseUrl}/api/v1/auth/refresh`, { refresh_token: refreshToken })
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

export async function streamChatMessage(
  conversationId: string,
  content: string,
  onToken: (token: string) => void,
  onDone: (citations: unknown) => void
) {
  let token = useAuthStore.getState().accessToken;
  let response = await fetch(`${apiBaseUrl}/api/v1/conversations/${conversationId}/messages`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ content }),
  });

  if (response.status === 401) {
    const refreshToken = useAuthStore.getState().refreshToken;
    if (refreshToken) {
      const refreshResponse = await axios.post(`${apiBaseUrl}/api/v1/auth/refresh`, {
        refresh_token: refreshToken,
      });
      token = refreshResponse.data.access_token as string;
      useAuthStore.getState().setAccessToken(token);
      response = await fetch(`${apiBaseUrl}/api/v1/conversations/${conversationId}/messages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ content }),
      });
    }
  }

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

  const processEvent = (part: string) => {
    if (!part.startsWith("data: ")) return;
    try {
      const json = JSON.parse(part.slice(6));
      if (json.token) onToken(json.token);
      if (json.error) {
        onToken(`\n\n_${json.error}_`);
        onDone(json.citations);
      } else if (json.done) {
        onDone(json.citations);
      }
    } catch (error) {
      console.error("Invalid chat stream event", error);
      onDone(undefined);
    }
  };

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const parts = buffer.split("\n\n");
    buffer = parts.pop() || "";
    parts.forEach(processEvent);
  }

  if (buffer) processEvent(buffer);
}
