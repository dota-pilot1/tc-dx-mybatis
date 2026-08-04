import { apiRequest, getToken } from "../../shared/api/client";

export type CicdPlaybookDocument = { id: string; topicId: string; title: string; content: string; orderIdx: number; createdAt: string; updatedAt: string };
export type CicdPlaybookTopic = { id: string; categoryId: string; title: string; orderIdx: number; createdAt: string; updatedAt: string; documents: CicdPlaybookDocument[] };
export type CicdPlaybookCategory = { id: string; userId: string; title: string; orderIdx: number; createdAt: string; updatedAt: string; topics: CicdPlaybookTopic[] };

const request = <T>(path: string, options: Parameters<typeof apiRequest<T>>[1] = {}) => apiRequest<T>(path, { ...options, token: getToken() });
export function listCicdPlaybook() { return request<CicdPlaybookCategory[]>("/cicd-playbook", { errorMessage: "CI/CD 플레이북을 불러오지 못했습니다." }); }
export function createCicdCategory(title: string) { return request<CicdPlaybookCategory | undefined>("/cicd-playbook/categories", { method: "POST", body: { title }, errorMessage: "CI/CD 영역을 만들지 못했습니다." }); }
export function updateCicdCategory(id: string, title: string) { return request<CicdPlaybookCategory | undefined>(`/cicd-playbook/categories/${id}`, { method: "PATCH", body: { title }, errorMessage: "CI/CD 영역을 수정하지 못했습니다." }); }
export function deleteCicdCategory(id: string) { return request<{ success: boolean }>(`/cicd-playbook/categories/${id}`, { method: "DELETE", errorMessage: "CI/CD 영역을 삭제하지 못했습니다." }); }
export function createCicdTopic(categoryId: string, title: string) { return request<CicdPlaybookCategory | undefined>(`/cicd-playbook/categories/${categoryId}/topics`, { method: "POST", body: { title }, errorMessage: "CI/CD 주제를 만들지 못했습니다." }); }
export function updateCicdTopic(id: string, title: string) { return request<CicdPlaybookCategory | undefined>(`/cicd-playbook/topics/${id}`, { method: "PATCH", body: { title }, errorMessage: "CI/CD 주제를 수정하지 못했습니다." }); }
export function deleteCicdTopic(id: string) { return request<{ success: boolean }>(`/cicd-playbook/topics/${id}`, { method: "DELETE", errorMessage: "CI/CD 주제를 삭제하지 못했습니다." }); }
export function createCicdDocument(topicId: string, body: { title: string; content: string }) { return request<CicdPlaybookCategory | undefined>(`/cicd-playbook/topics/${topicId}/documents`, { method: "POST", body, errorMessage: "CI/CD 문서를 만들지 못했습니다." }); }
export function updateCicdDocument(id: string, body: { title?: string; content?: string }) { return request<CicdPlaybookCategory | undefined>(`/cicd-playbook/documents/${id}`, { method: "PATCH", body, errorMessage: "CI/CD 문서를 저장하지 못했습니다." }); }
export function deleteCicdDocument(id: string) { return request<{ success: boolean }>(`/cicd-playbook/documents/${id}`, { method: "DELETE", errorMessage: "CI/CD 문서를 삭제하지 못했습니다." }); }
export function moveCicdDocument(id: string, direction: "up" | "down") { return request<CicdPlaybookCategory[]>(`/cicd-playbook/documents/${id}/reorder`, { method: "POST", body: { direction }, errorMessage: "문서 순서를 바꾸지 못했습니다." }); }
