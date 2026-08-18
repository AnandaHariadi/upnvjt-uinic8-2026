import axios, { type AxiosRequestConfig, type AxiosError } from "axios";

const _axios = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api",
  timeout: 15_000,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

/* ── Request: attach auth token ── */
_axios.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("pacul_token");
    if (token && token !== "guest_token_demo" && !token.startsWith("demo_")) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

/* ── Response: unwrap data, handle errors ── */
_axios.interceptors.response.use(
  (response) => response.data,
  (error: AxiosError<{ message?: string; errors?: Record<string, string[]> }>) => {
    const status = error.response?.status;

    if (status === 401 && typeof window !== "undefined") {
      const token = localStorage.getItem("pacul_token");
      if (!token?.startsWith("demo_") && token !== "guest_token_demo") {
        localStorage.removeItem("pacul_token");
        localStorage.removeItem("pacul-auth");
        if (!window.location.pathname.includes("/login")) {
          window.location.href = "/login";
        }
      }
    }

    // Construct a meaningful error object
    const apiError = {
      status,
      message: error.response?.data?.message || error.message || "Something went wrong",
      errors: error.response?.data?.errors || {},
    };

    return Promise.reject(apiError);
  }
);

/* ── Typed wrappers that reflect the interceptor-unwrapped response ── */
export const api = {
  get: <T>(url: string, config?: AxiosRequestConfig): Promise<T> =>
    _axios.get(url, config) as unknown as Promise<T>,
  post: <T = void>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> =>
    _axios.post(url, data, config) as unknown as Promise<T>,
  put: <T = void>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> =>
    _axios.put(url, data, config) as unknown as Promise<T>,
  patch: <T = void>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> =>
    _axios.patch(url, data, config) as unknown as Promise<T>,
  delete: <T = void>(url: string, config?: AxiosRequestConfig): Promise<T> =>
    _axios.delete(url, config) as unknown as Promise<T>,
};

/* ── Error type for consumers ── */
export interface ApiError {
  status?: number;
  message: string;
  errors: Record<string, string[]>;
}
