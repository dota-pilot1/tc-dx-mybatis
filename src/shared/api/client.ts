// 공용 API 클라이언트 (Tauri HTTP 플러그인 → 브라우저 CORS 우회)
import { fetch as tauriFetch } from "@tauri-apps/plugin-http";

const LOCAL_API_BASE = "http://localhost:3000/api";
const DEPLOY_API_BASE = "https://api.hibot-docu.com/api";
const API_TARGET_KEY = "towercrane.apiTarget";
export type ApiTarget = "local" | "deploy";

function isApiTarget(value: string | null): value is ApiTarget {
  return value === "local" || value === "deploy";
}

export function getApiTarget(): ApiTarget {
  const saved = localStorage.getItem(API_TARGET_KEY);
  if (isApiTarget(saved)) return saved;
  return import.meta.env.DEV ? "local" : "deploy";
}

export function setApiTarget(target: ApiTarget) {
  localStorage.setItem(API_TARGET_KEY, target);
}

export function getApiBase() {
  return getApiTarget() === "local" ? LOCAL_API_BASE : DEPLOY_API_BASE;
}

// 다른 모듈 호환용 (앱 시작 시점 값)
export const API_BASE = getApiBase();

// 웹 프론트 오리진 (개발도구 등 web 화면 임베드/새 창용). dev=vite front(5174), prod=운영
export const WEB_BASE = import.meta.env.DEV
  ? "http://localhost:5174"
  : "https://hibot-docu.com";

const TOKEN_KEY = "towercrane.token";

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string | null) {
  if (token) localStorage.setItem(TOKEN_KEY, token);
  else localStorage.removeItem(TOKEN_KEY);
}

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

type RequestOptions = {
  method?: string;
  body?: unknown;
  token?: string | null;
  errorMessage?: string;
  timeoutMs?: number;
};

export async function apiRequest<T>(path: string, opts: RequestOptions = {}): Promise<T> {
  const headers: Record<string, string> = {};
  if (opts.body !== undefined) headers["Content-Type"] = "application/json";
  if (opts.token) headers.Authorization = `Bearer ${opts.token}`;

  const controller = opts.timeoutMs ? new AbortController() : undefined;
  const timeoutId = opts.timeoutMs && controller
    ? window.setTimeout(() => controller.abort(), opts.timeoutMs)
    : undefined;
  const request = {
    method: opts.method ?? "GET",
    headers,
    body: opts.body !== undefined ? JSON.stringify(opts.body) : undefined,
    signal: controller?.signal,
  };
  const url = `${getApiBase()}${path}`;
  let res: Response;
  try {
    res = "__TAURI_INTERNALS__" in window
      ? await tauriFetch(url, request)
      : await globalThis.fetch(url, request);
  } catch (reason) {
    if (controller?.signal.aborted) {
      throw new ApiError("AI 응답 시간이 초과되었습니다. 문서를 나눠서 다시 시도해 주세요.", 408);
    }
    throw reason;
  } finally {
    if (timeoutId !== undefined) window.clearTimeout(timeoutId);
  }

  const text = await res.text();

  if (!res.ok) {
    let message = opts.errorMessage ?? "요청에 실패했습니다.";
    try {
      const data = JSON.parse(text) as { message?: string | string[] };
      if (data?.message) {
        message = Array.isArray(data.message) ? data.message.join("\n") : data.message;
      }
    } catch {
      // 본문이 JSON이 아니면 기본 메시지 사용
    }
    throw new ApiError(message, res.status);
  }

  return (text ? JSON.parse(text) : undefined) as T;
}
