import { apiRequest, getToken } from "../../shared/api/client";

export type DebuggingPlaybookDocument = { id: string; topicId: string; title: string; content: string; orderIdx: number; createdAt: string; updatedAt: string };
export type DebuggingPlaybookTopic = { id: string; categoryId: string; title: string; orderIdx: number; createdAt: string; updatedAt: string; documents: DebuggingPlaybookDocument[] };
export type DebuggingPlaybookCategory = { id: string; userId: string; title: string; orderIdx: number; createdAt: string; updatedAt: string; topics: DebuggingPlaybookTopic[] };

const request = <T,>(path: string, options: Parameters<typeof apiRequest<T>>[1] = {}) => apiRequest<T>(path, { ...options, token: getToken() });

export const listDebuggingPlaybook = () => request<DebuggingPlaybookCategory[]>("/debugging-playbook", { errorMessage: "디버깅 플레이북을 불러오지 못했습니다." });
export const createDebuggingCategory = (title: string) => request<DebuggingPlaybookCategory | undefined>("/debugging-playbook/categories", { method: "POST", body: { title }, errorMessage: "디버깅 영역을 만들지 못했습니다." });
export const updateDebuggingCategory = (id: string, title: string) => request<DebuggingPlaybookCategory | undefined>(`/debugging-playbook/categories/${id}`, { method: "PATCH", body: { title }, errorMessage: "디버깅 영역을 수정하지 못했습니다." });
export const deleteDebuggingCategory = (id: string) => request<{ success: boolean }>(`/debugging-playbook/categories/${id}`, { method: "DELETE", errorMessage: "디버깅 영역을 삭제하지 못했습니다." });
export const createDebuggingTopic = (categoryId: string, title: string) => request<DebuggingPlaybookCategory | undefined>(`/debugging-playbook/categories/${categoryId}/topics`, { method: "POST", body: { title }, errorMessage: "디버깅 주제를 만들지 못했습니다." });
export const updateDebuggingTopic = (id: string, title: string) => request<DebuggingPlaybookCategory | undefined>(`/debugging-playbook/topics/${id}`, { method: "PATCH", body: { title }, errorMessage: "디버깅 주제를 수정하지 못했습니다." });
export const deleteDebuggingTopic = (id: string) => request<{ success: boolean }>(`/debugging-playbook/topics/${id}`, { method: "DELETE", errorMessage: "디버깅 주제를 삭제하지 못했습니다." });
export const createDebuggingDocument = (topicId: string, value: { title: string; content: string }) => request<DebuggingPlaybookCategory | undefined>(`/debugging-history/topics/${topicId}/documents`, { method: "POST", body: value, errorMessage: "디버깅 문서를 만들지 못했습니다." });
export const updateDebuggingDocument = (id: string, value: { title: string; content: string }) => request<DebuggingPlaybookCategory | undefined>(`/debugging-history/documents/${id}`, { method: "PATCH", body: value, errorMessage: "디버깅 문서를 저장하지 못했습니다." });
export const deleteDebuggingDocument = (id: string) => request<{ success: boolean }>(`/debugging-history/documents/${id}`, { method: "DELETE", errorMessage: "디버깅 문서를 삭제하지 못했습니다." });
export const moveDebuggingDocument = (id: string, direction: "up" | "down") => request<DebuggingPlaybookCategory[]>(`/debugging-history/documents/${id}/reorder`, { method: "POST", body: { direction }, errorMessage: "디버깅 문서 순서를 바꾸지 못했습니다." });
