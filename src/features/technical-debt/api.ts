import { apiRequest, getToken } from "../../shared/api/client";

export type TechnicalDebtPlaybookDocument = { id: string; topicId: string; title: string; content: string; orderIdx: number; createdAt: string; updatedAt: string };
export type TechnicalDebtPlaybookTopic = { id: string; categoryId: string; title: string; orderIdx: number; createdAt: string; updatedAt: string; documents: TechnicalDebtPlaybookDocument[] };
export type TechnicalDebtPlaybookCategory = { id: string; userId: string; title: string; orderIdx: number; createdAt: string; updatedAt: string; topics: TechnicalDebtPlaybookTopic[] };

const request = <T,>(path: string, options: Parameters<typeof apiRequest<T>>[1] = {}) => apiRequest<T>(path, { ...options, token: getToken() });

export const listTechnicalDebtPlaybook = () => request<TechnicalDebtPlaybookCategory[]>("/skill-analysys", { errorMessage: "Skill Analysys를 불러오지 못했습니다." });
export const createTechnicalDebtCategory = (title: string) => request<TechnicalDebtPlaybookCategory | undefined>("/skill-analysys/categories", { method: "POST", body: { title }, errorMessage: "Skill Analysys 영역을 만들지 못했습니다." });
export const updateTechnicalDebtCategory = (id: string, title: string) => request<TechnicalDebtPlaybookCategory | undefined>(`/skill-analysys/categories/${id}`, { method: "PATCH", body: { title }, errorMessage: "Skill Analysys 영역을 수정하지 못했습니다." });
export const deleteTechnicalDebtCategory = (id: string) => request<{ success: boolean }>(`/skill-analysys/categories/${id}`, { method: "DELETE", errorMessage: "Skill Analysys 영역을 삭제하지 못했습니다." });
export const createTechnicalDebtTopic = (categoryId: string, title: string) => request<TechnicalDebtPlaybookCategory | undefined>(`/skill-analysys/categories/${categoryId}/topics`, { method: "POST", body: { title }, errorMessage: "Skill Analysys 주제를 만들지 못했습니다." });
export const updateTechnicalDebtTopic = (id: string, title: string) => request<TechnicalDebtPlaybookCategory | undefined>(`/skill-analysys/topics/${id}`, { method: "PATCH", body: { title }, errorMessage: "Skill Analysys 주제를 수정하지 못했습니다." });
export const deleteTechnicalDebtTopic = (id: string) => request<{ success: boolean }>(`/skill-analysys/topics/${id}`, { method: "DELETE", errorMessage: "Skill Analysys 주제를 삭제하지 못했습니다." });
export const createTechnicalDebtDocument = (topicId: string, value: { title: string; content: string }) => request<TechnicalDebtPlaybookCategory | undefined>(`/skill-analysys/topics/${topicId}/documents`, { method: "POST", body: value, errorMessage: "Skill Analysys 문서를 만들지 못했습니다." });
export const updateTechnicalDebtDocument = (id: string, value: { title: string; content: string }) => request<TechnicalDebtPlaybookCategory | undefined>(`/skill-analysys/documents/${id}`, { method: "PATCH", body: value, errorMessage: "Skill Analysys 문서를 저장하지 못했습니다." });
export const deleteTechnicalDebtDocument = (id: string) => request<{ success: boolean }>(`/skill-analysys/documents/${id}`, { method: "DELETE", errorMessage: "Skill Analysys 문서를 삭제하지 못했습니다." });
export const moveTechnicalDebtDocument = (id: string, direction: "up" | "down") => request<TechnicalDebtPlaybookCategory[]>(`/skill-analysys/documents/${id}/reorder`, { method: "POST", body: { direction }, errorMessage: "Skill Analysys 문서 순서를 바꾸지 못했습니다." });
