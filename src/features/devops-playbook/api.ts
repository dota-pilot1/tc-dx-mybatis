import { apiRequest, getToken } from "../../shared/api/client";

export type DevopsPlaybookDocument = { id: string; topicId: string; title: string; content: string; orderIdx: number; createdAt: string; updatedAt: string };
export type DevopsPlaybookTopic = { id: string; categoryId: string; title: string; orderIdx: number; createdAt: string; updatedAt: string; documents: DevopsPlaybookDocument[] };
export type DevopsPlaybookCategory = { id: string; userId: string; title: string; orderIdx: number; createdAt: string; updatedAt: string; topics: DevopsPlaybookTopic[] };

const token = () => getToken();
const request = <T>(path: string, options: Parameters<typeof apiRequest<T>>[1] = {}) => apiRequest<T>(path, { ...options, token: token() });
export function listDevopsPlaybook() { return request<DevopsPlaybookCategory[]>("/devops-playbook", { errorMessage: "DevOps 플레이북을 불러오지 못했습니다." }); }
export function createDevopsCategory(title: string) { return request<DevopsPlaybookCategory | undefined>("/devops-playbook/categories", { method: "POST", body: { title }, errorMessage: "DevOps 영역을 만들지 못했습니다." }); }
export function updateDevopsCategory(id: string, title: string) { return request<DevopsPlaybookCategory | undefined>(`/devops-playbook/categories/${id}`, { method: "PATCH", body: { title }, errorMessage: "DevOps 영역을 수정하지 못했습니다." }); }
export function deleteDevopsCategory(id: string) { return request<{ success: boolean }>(`/devops-playbook/categories/${id}`, { method: "DELETE", errorMessage: "DevOps 영역을 삭제하지 못했습니다." }); }
export function createDevopsTopic(categoryId: string, title: string) { return request<DevopsPlaybookCategory | undefined>(`/devops-playbook/categories/${categoryId}/topics`, { method: "POST", body: { title }, errorMessage: "DevOps 주제를 만들지 못했습니다." }); }
export function updateDevopsTopic(id: string, title: string) { return request<DevopsPlaybookCategory | undefined>(`/devops-playbook/topics/${id}`, { method: "PATCH", body: { title }, errorMessage: "DevOps 주제를 수정하지 못했습니다." }); }
export function deleteDevopsTopic(id: string) { return request<{ success: boolean }>(`/devops-playbook/topics/${id}`, { method: "DELETE", errorMessage: "DevOps 주제를 삭제하지 못했습니다." }); }
export function createDevopsDocument(topicId: string, body: { title: string; content: string }) { return request<DevopsPlaybookCategory | undefined>(`/devops-playbook/topics/${topicId}/documents`, { method: "POST", body, errorMessage: "DevOps 문서를 만들지 못했습니다." }); }
export function updateDevopsDocument(id: string, body: { title?: string; content?: string }) { return request<DevopsPlaybookCategory | undefined>(`/devops-playbook/documents/${id}`, { method: "PATCH", body, errorMessage: "DevOps 문서를 저장하지 못했습니다." }); }
export function deleteDevopsDocument(id: string) { return request<{ success: boolean }>(`/devops-playbook/documents/${id}`, { method: "DELETE", errorMessage: "DevOps 문서를 삭제하지 못했습니다." }); }
export function moveDevopsDocument(id: string, direction: "up" | "down") { return request<DevopsPlaybookCategory[]>(`/devops-playbook/documents/${id}/reorder`, { method: "POST", body: { direction }, errorMessage: "DevOps 문서 순서를 바꾸지 못했습니다." }); }
