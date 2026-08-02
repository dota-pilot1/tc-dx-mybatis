import { apiRequest, getToken } from "../../shared/api/client";

export type AxPlaybookDocument = { id: string; topicId: string; title: string; content: string; orderIdx: number; createdAt: string; updatedAt: string };
export type AxPlaybookTopic = { id: string; categoryId: string; title: string; orderIdx: number; createdAt: string; updatedAt: string; documents: AxPlaybookDocument[] };
export type AxPlaybookCategory = { id: string; userId: string; title: string; orderIdx: number; createdAt: string; updatedAt: string; topics: AxPlaybookTopic[] };

const token = () => getToken();
const request = <T>(path: string, options: Parameters<typeof apiRequest<T>>[1] = {}) => apiRequest<T>(path, { ...options, token: token() });

export function listAxPlaybook() { return request<AxPlaybookCategory[]>("/ax-playbook", { errorMessage: "AX 플레이북을 불러오지 못했습니다." }); }
export function createAxPlaybookCategory(title: string) { return request<AxPlaybookCategory | undefined>("/ax-playbook/categories", { method: "POST", body: { title }, errorMessage: "AX 영역을 만들지 못했습니다." }); }
export function updateAxPlaybookCategory(id: string, title: string) { return request<AxPlaybookCategory | undefined>(`/ax-playbook/categories/${id}`, { method: "PATCH", body: { title }, errorMessage: "AX 영역을 수정하지 못했습니다." }); }
export function deleteAxPlaybookCategory(id: string) { return request<{ success: boolean }>(`/ax-playbook/categories/${id}`, { method: "DELETE", errorMessage: "AX 영역을 삭제하지 못했습니다." }); }
export function createAxPlaybookTopic(categoryId: string, title: string) { return request<AxPlaybookCategory | undefined>(`/ax-playbook/categories/${categoryId}/topics`, { method: "POST", body: { title }, errorMessage: "AX 주제를 만들지 못했습니다." }); }
export function updateAxPlaybookTopic(id: string, title: string) { return request<AxPlaybookCategory | undefined>(`/ax-playbook/topics/${id}`, { method: "PATCH", body: { title }, errorMessage: "AX 주제를 수정하지 못했습니다." }); }
export function deleteAxPlaybookTopic(id: string) { return request<{ success: boolean }>(`/ax-playbook/topics/${id}`, { method: "DELETE", errorMessage: "AX 주제를 삭제하지 못했습니다." }); }
export function createAxPlaybookDocument(topicId: string, body: { title: string; content: string }) { return request<AxPlaybookCategory | undefined>(`/ax-playbook/topics/${topicId}/documents`, { method: "POST", body, errorMessage: "AX 문서를 만들지 못했습니다." }); }
export function updateAxPlaybookDocument(id: string, body: { title?: string; content?: string }) { return request<AxPlaybookCategory | undefined>(`/ax-playbook/documents/${id}`, { method: "PATCH", body, errorMessage: "AX 문서를 저장하지 못했습니다." }); }
export function deleteAxPlaybookDocument(id: string) { return request<{ success: boolean }>(`/ax-playbook/documents/${id}`, { method: "DELETE", errorMessage: "AX 문서를 삭제하지 못했습니다." }); }
export function moveAxPlaybookDocument(id: string, direction: "up" | "down") { return request<AxPlaybookCategory[]>(`/ax-playbook/documents/${id}/reorder`, { method: "POST", body: { direction }, errorMessage: "AX 문서 순서를 바꾸지 못했습니다." }); }
