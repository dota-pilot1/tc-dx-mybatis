import { apiRequest, getToken } from "../../shared/api/client";

export type DbPlaybookDocument = { id: string; topicId: string; title: string; content: string; orderIdx: number; createdAt: string; updatedAt: string };
export type DbPlaybookTopic = { id: string; categoryId: string; title: string; orderIdx: number; createdAt: string; updatedAt: string; documents: DbPlaybookDocument[] };
export type DbPlaybookCategory = { id: string; userId: string; title: string; orderIdx: number; createdAt: string; updatedAt: string; topics: DbPlaybookTopic[] };

const token = () => getToken();
const request = <T>(path: string, options: Parameters<typeof apiRequest<T>>[1] = {}) => apiRequest<T>(path, { ...options, token: token() });
export function listDbPlaybook() { return request<DbPlaybookCategory[]>("/db-playbook", { errorMessage: "DB 플레이북을 불러오지 못했습니다." }); }
export function createDbCategory(title: string) { return request<DbPlaybookCategory | undefined>("/db-playbook/categories", { method: "POST", body: { title }, errorMessage: "DB 영역을 만들지 못했습니다." }); }
export function updateDbCategory(id: string, title: string) { return request<DbPlaybookCategory | undefined>(`/db-playbook/categories/${id}`, { method: "PATCH", body: { title }, errorMessage: "DB 영역을 수정하지 못했습니다." }); }
export function deleteDbCategory(id: string) { return request<{ success: boolean }>(`/db-playbook/categories/${id}`, { method: "DELETE", errorMessage: "DB 영역을 삭제하지 못했습니다." }); }
export function createDbTopic(categoryId: string, title: string) { return request<DbPlaybookCategory | undefined>(`/db-playbook/categories/${categoryId}/topics`, { method: "POST", body: { title }, errorMessage: "DB 주제를 만들지 못했습니다." }); }
export function updateDbTopic(id: string, title: string) { return request<DbPlaybookCategory | undefined>(`/db-playbook/topics/${id}`, { method: "PATCH", body: { title }, errorMessage: "DB 주제를 수정하지 못했습니다." }); }
export function deleteDbTopic(id: string) { return request<{ success: boolean }>(`/db-playbook/topics/${id}`, { method: "DELETE", errorMessage: "DB 주제를 삭제하지 못했습니다." }); }
export function createDbDocument(topicId: string, body: { title: string; content: string }) { return request<DbPlaybookCategory | undefined>(`/db-playbook/topics/${topicId}/documents`, { method: "POST", body, errorMessage: "DB 문서를 만들지 못했습니다." }); }
export function updateDbDocument(id: string, body: { title?: string; content?: string }) { return request<DbPlaybookCategory | undefined>(`/db-playbook/documents/${id}`, { method: "PATCH", body, errorMessage: "DB 문서를 저장하지 못했습니다." }); }
export function deleteDbDocument(id: string) { return request<{ success: boolean }>(`/db-playbook/documents/${id}`, { method: "DELETE", errorMessage: "DB 문서를 삭제하지 못했습니다." }); }
export function moveDbDocument(id: string, direction: "up" | "down") { return request<DbPlaybookCategory[]>(`/db-playbook/documents/${id}/reorder`, { method: "POST", body: { direction }, errorMessage: "DB 문서 순서를 바꾸지 못했습니다." }); }

