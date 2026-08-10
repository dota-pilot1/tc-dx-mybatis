import { apiRequest, getToken } from "../../shared/api/client";

export type AiProvider = "openai";
export type AiKeyStatus = {
  provider: AiProvider;
  configured: boolean;
  keyHint: string;
  updatedAt: string;
};

const request = <T>(path: string, options: Parameters<typeof apiRequest<T>>[1] = {}) =>
  apiRequest<T>(path, { ...options, token: getToken() });

export function listAiKeyStatuses() {
  return request<AiKeyStatus[]>("/user/ai-keys", { errorMessage: "AI 설정을 불러오지 못했습니다." });
}

export function saveAiKey(provider: AiProvider, apiKey: string) {
  return request<AiKeyStatus>(`/user/ai-keys/${provider}`, {
    method: "PUT",
    body: { apiKey },
    errorMessage: "AI API 키를 저장하지 못했습니다.",
  });
}

export function removeAiKey(provider: AiProvider) {
  return request<{ success: boolean }>(`/user/ai-keys/${provider}`, {
    method: "DELETE",
    errorMessage: "AI API 키를 삭제하지 못했습니다.",
  });
}

export function testAiKey(provider: AiProvider) {
  return request<{ success: boolean; provider: AiProvider }>(`/user/ai-keys/${provider}/test`, {
    method: "POST",
    errorMessage: "AI API 연결 테스트에 실패했습니다.",
  });
}
