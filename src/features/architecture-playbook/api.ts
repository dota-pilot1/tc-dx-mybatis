import { apiRequest, getToken } from "../../shared/api/client";

export type ArchitecturePlaybookDocument = { id: string; topicId: string; title: string; content: string; orderIdx: number; createdAt: string; updatedAt: string };
export type ArchitecturePlaybookTopic = { id: string; categoryId: string; title: string; orderIdx: number; createdAt: string; updatedAt: string; documents: ArchitecturePlaybookDocument[] };
export type ArchitecturePlaybookCategory = { id: string; userId: string; title: string; orderIdx: number; createdAt: string; updatedAt: string; topics: ArchitecturePlaybookTopic[] };

const token = () => getToken();
const request = <T>(path: string, options: Parameters<typeof apiRequest<T>>[1] = {}) => apiRequest<T>(path, { ...options, token: token() });
export function listArchitecturePlaybook() { return request<ArchitecturePlaybookCategory[]>("/architecture-playbook", { errorMessage: "Architecture 플레이북을 불러오지 못했습니다." }); }
export function createArchitectureCategory(title: string) { return request<ArchitecturePlaybookCategory | undefined>("/architecture-playbook/categories", { method: "POST", body: { title }, errorMessage: "Architecture 영역을 만들지 못했습니다." }); }
export function updateArchitectureCategory(id: string, title: string) { return request<ArchitecturePlaybookCategory | undefined>(`/architecture-playbook/categories/${id}`, { method: "PATCH", body: { title }, errorMessage: "Architecture 영역을 수정하지 못했습니다." }); }
export function deleteArchitectureCategory(id: string) { return request<{ success: boolean }>(`/architecture-playbook/categories/${id}`, { method: "DELETE", errorMessage: "Architecture 영역을 삭제하지 못했습니다." }); }
export function createArchitectureTopic(categoryId: string, title: string) { return request<ArchitecturePlaybookCategory | undefined>(`/architecture-playbook/categories/${categoryId}/topics`, { method: "POST", body: { title }, errorMessage: "Architecture 주제를 만들지 못했습니다." }); }
export function updateArchitectureTopic(id: string, title: string) { return request<ArchitecturePlaybookCategory | undefined>(`/architecture-playbook/topics/${id}`, { method: "PATCH", body: { title }, errorMessage: "Architecture 주제를 수정하지 못했습니다." }); }
export function deleteArchitectureTopic(id: string) { return request<{ success: boolean }>(`/architecture-playbook/topics/${id}`, { method: "DELETE", errorMessage: "Architecture 주제를 삭제하지 못했습니다." }); }
export function createArchitectureDocument(topicId: string, body: { title: string; content: string }) { return request<ArchitecturePlaybookCategory | undefined>(`/architecture-playbook/topics/${topicId}/documents`, { method: "POST", body, errorMessage: "Architecture 문서를 만들지 못했습니다." }); }
export function updateArchitectureDocument(id: string, body: { title?: string; content?: string }) { return request<ArchitecturePlaybookCategory | undefined>(`/architecture-playbook/documents/${id}`, { method: "PATCH", body, errorMessage: "Architecture 문서를 저장하지 못했습니다." }); }
export function deleteArchitectureDocument(id: string) { return request<{ success: boolean }>(`/architecture-playbook/documents/${id}`, { method: "DELETE", errorMessage: "Architecture 문서를 삭제하지 못했습니다." }); }
export function moveArchitectureDocument(id: string, direction: "up" | "down") { return request<ArchitecturePlaybookCategory[]>(`/architecture-playbook/documents/${id}/reorder`, { method: "POST", body: { direction }, errorMessage: "Architecture 문서 순서를 바꾸지 못했습니다." }); }

