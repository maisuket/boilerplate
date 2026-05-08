import axios, { type AxiosError, type AxiosInstance, type InternalAxiosRequestConfig } from "axios";

import { clearTokens, getAccessToken, getRefreshToken, setTokens } from "./auth";
import { ROUTES } from "@/constants/routes";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api/v1";

// Track if a token refresh is in progress to avoid multiple refresh calls
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value: string) => void;
  reject: (reason?: unknown) => void;
}> = [];

function processQueue(error: AxiosError | null, token: string | null = null) {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error);
    } else {
      resolve(token!);
    }
  });
  failedQueue = [];
}

function createAxiosInstance(): AxiosInstance {
  const instance = axios.create({
    baseURL: API_URL,
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    timeout: 30_000,
    withCredentials: false,
  });

  // Request interceptor: attach access token
  instance.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
      const token = getAccessToken();
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error: AxiosError) => Promise.reject(error)
  );

  // Response interceptor: handle 401 and token refresh
  instance.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
      const originalRequest = error.config as InternalAxiosRequestConfig & {
        _retry?: boolean;
      };

      // Ignora o interceptor se o erro 401 vier da própria rota de login
      if (originalRequest.url?.includes("/auth/login")) {
        return Promise.reject(error);
      }

      if (error.response?.status === 401 && !originalRequest._retry) {
        const refreshToken = getRefreshToken();

        if (!refreshToken) {
          clearTokens();
          if (typeof window !== "undefined" && window.location.pathname !== ROUTES.LOGIN) {
            window.location.href = ROUTES.LOGIN;
          }
          return Promise.reject(error);
        }

        if (isRefreshing) {
          return new Promise<string>((resolve, reject) => {
            failedQueue.push({ resolve, reject });
          })
            .then((token) => {
              if (originalRequest.headers) {
                originalRequest.headers.Authorization = `Bearer ${token}`;
              }
              return instance(originalRequest);
            })
            .catch(Promise.reject);
        }

        originalRequest._retry = true;
        isRefreshing = true;

        try {
          const response = await axios.post<{ accessToken: string; refreshToken: string }>(
            `${API_URL}/auth/refresh`,
            { refreshToken }
          );

          const accessToken = response.data.accessToken || (response.data as any).access_token;
          const newRefreshToken =
            response.data.refreshToken || (response.data as any).refresh_token;
          setTokens(accessToken, newRefreshToken);

          if (instance.defaults.headers) {
            (instance.defaults.headers as Record<string, string>).Authorization =
              `Bearer ${accessToken}`;
          }

          processQueue(null, accessToken);

          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          }

          return instance(originalRequest);
        } catch (refreshError) {
          processQueue(refreshError as AxiosError, null);

          // Só desloga o usuário se o erro for 4xx (Client Error = Refresh token inválido/expirado)
          // Erros 5xx (Server Error) ou falhas de rede não devem deslogar o usuário.
          const status = (refreshError as AxiosError).response?.status;
          if (status && status >= 400 && status < 500) {
            clearTokens();
            if (typeof window !== "undefined" && window.location.pathname !== ROUTES.LOGIN) {
              window.location.href = ROUTES.LOGIN;
            }
          }
          return Promise.reject(refreshError);
        } finally {
          isRefreshing = false;
        }
      }

      return Promise.reject(error);
    }
  );

  return instance;
}

export const apiClient = createAxiosInstance();

export default apiClient;
