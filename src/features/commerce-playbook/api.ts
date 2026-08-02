import { apiRequest, getToken } from "../../shared/api/client";

export type CommercePlaybookDocument = { id: string; topicId: string; title: string; content: string; orderIdx: number; createdAt: string; updatedAt: string };
export type CommercePlaybookTopic = { id: string; categoryId: string; title: string; orderIdx: number; createdAt: string; updatedAt: string; documents: CommercePlaybookDocument[] };
export type CommercePlaybookCategory = { id: string; userId: string; title: string; orderIdx: number; createdAt: string; updatedAt: string; topics: CommercePlaybookTopic[] };

const token = () => getToken();
const request = <T>(path: string, options: Parameters<typeof apiRequest<T>>[1] = {}) => apiRequest<T>(path, { ...options, token: token() });
export function listCommercePlaybook() { return request<CommercePlaybookCategory[]>("/commerce-playbook", { errorMessage: "Commerce 플레이북을 불러오지 못했습니다." }); }
export function createCommerceCategory(title: string) { return request<CommercePlaybookCategory | undefined>("/commerce-playbook/categories", { method: "POST", body: { title }, errorMessage: "Commerce 영역을 만들지 못했습니다." }); }
export function updateCommerceCategory(id: string, title: string) { return request<CommercePlaybookCategory | undefined>(`/commerce-playbook/categories/${id}`, { method: "PATCH", body: { title }, errorMessage: "Commerce 영역을 수정하지 못했습니다." }); }
export function deleteCommerceCategory(id: string) { return request<{ success: boolean }>(`/commerce-playbook/categories/${id}`, { method: "DELETE", errorMessage: "Commerce 영역을 삭제하지 못했습니다." }); }
export function createCommerceTopic(categoryId: string, title: string) { return request<CommercePlaybookCategory | undefined>(`/commerce-playbook/categories/${categoryId}/topics`, { method: "POST", body: { title }, errorMessage: "Commerce 주제를 만들지 못했습니다." }); }
export function updateCommerceTopic(id: string, title: string) { return request<CommercePlaybookCategory | undefined>(`/commerce-playbook/topics/${id}`, { method: "PATCH", body: { title }, errorMessage: "Commerce 주제를 수정하지 못했습니다." }); }
export function deleteCommerceTopic(id: string) { return request<{ success: boolean }>(`/commerce-playbook/topics/${id}`, { method: "DELETE", errorMessage: "Commerce 주제를 삭제하지 못했습니다." }); }
export function createCommerceDocument(topicId: string, body: { title: string; content: string }) { return request<CommercePlaybookCategory | undefined>(`/commerce-playbook/topics/${topicId}/documents`, { method: "POST", body, errorMessage: "Commerce 문서를 만들지 못했습니다." }); }
export function updateCommerceDocument(id: string, body: { title?: string; content?: string }) { return request<CommercePlaybookCategory | undefined>(`/commerce-playbook/documents/${id}`, { method: "PATCH", body, errorMessage: "Commerce 문서를 저장하지 못했습니다." }); }
export function deleteCommerceDocument(id: string) { return request<{ success: boolean }>(`/commerce-playbook/documents/${id}`, { method: "DELETE", errorMessage: "Commerce 문서를 삭제하지 못했습니다." }); }
export function moveCommerceDocument(id: string, direction: "up" | "down") { return request<CommercePlaybookCategory[]>(`/commerce-playbook/documents/${id}/reorder`, { method: "POST", body: { direction }, errorMessage: "Commerce 문서 순서를 바꾸지 못했습니다." }); }

