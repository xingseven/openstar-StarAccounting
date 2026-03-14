import { getAccessToken } from "./auth";

type ApiError = {
  code: number;
  message: string;
  detail?: string;
};

const API_BASE_URL = typeof window !== "undefined" 
  ? `${window.location.protocol}//${window.location.hostname}:3006` 
  : (process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3006");

export async function apiFetch<T>(path: string, init?: RequestInit) {
  const headers = new Headers(init?.headers);
  const token = getAccessToken();
  if (token) headers.set("authorization", `Bearer ${token}`);
  if (init?.body && !(init.body instanceof FormData) && !headers.has("content-type")) {
    headers.set("content-type", "application/json");
  }

  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers,
    cache: "no-store",
  });

  const json = (await res.json()) as { data?: T } | ApiError;
  if (!res.ok || !("data" in json)) {
    const msg = "detail" in json && json.detail ? json.detail : "请求失败";
    const err = new Error(msg);
    (err as { status?: number; code?: number }).status = res.status;
    if ("code" in json) (err as { code?: number }).code = json.code;
    throw err;
  }

  return json.data as T;
}
