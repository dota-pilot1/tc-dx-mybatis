import { apiRequest, getToken } from "../../shared/api/client";

export type SqlPlaybookDocument = { id: string; topicId: string; title: string; content: string; orderIdx: number; createdAt: string; updatedAt: string };
export type SqlPlaybookTopic = { id: string; categoryId: string; title: string; orderIdx: number; createdAt: string; updatedAt: string; documents: SqlPlaybookDocument[] };
export type SqlPlaybookCategory = { id: string; userId: string; title: string; orderIdx: number; createdAt: string; updatedAt: string; topics: SqlPlaybookTopic[] };

const request = <T,>(path: string, options: Parameters<typeof apiRequest<T>>[1] = {}) => apiRequest<T>(path, { ...options, token: getToken() });

export const listSqlPlaybook = () => request<SqlPlaybookCategory[]>("/sql-playbook", { errorMessage: "SQL 플레이북을 불러오지 못했습니다." });
export const createSqlCategory = (title: string) => request<SqlPlaybookCategory | undefined>("/sql-playbook/categories", { method: "POST", body: { title }, errorMessage: "SQL 영역을 만들지 못했습니다." });
export const updateSqlCategory = (id: string, title: string) => request<SqlPlaybookCategory | undefined>(`/sql-playbook/categories/${id}`, { method: "PATCH", body: { title }, errorMessage: "SQL 영역을 수정하지 못했습니다." });
export const deleteSqlCategory = (id: string) => request<{ success: boolean }>(`/sql-playbook/categories/${id}`, { method: "DELETE", errorMessage: "SQL 영역을 삭제하지 못했습니다." });
export const createSqlTopic = (categoryId: string, title: string) => request<SqlPlaybookCategory | undefined>(`/sql-playbook/categories/${categoryId}/topics`, { method: "POST", body: { title }, errorMessage: "SQL 주제를 만들지 못했습니다." });
export const updateSqlTopic = (id: string, title: string) => request<SqlPlaybookCategory | undefined>(`/sql-playbook/topics/${id}`, { method: "PATCH", body: { title }, errorMessage: "SQL 주제를 수정하지 못했습니다." });
export const deleteSqlTopic = (id: string) => request<{ success: boolean }>(`/sql-playbook/topics/${id}`, { method: "DELETE", errorMessage: "SQL 주제를 삭제하지 못했습니다." });
export const createSqlDocument = (topicId: string, value: { title: string; content: string }) => request<SqlPlaybookCategory | undefined>(`/sql-playbook/topics/${topicId}/documents`, { method: "POST", body: value, errorMessage: "SQL 문서를 만들지 못했습니다." });
export const updateSqlDocument = (id: string, value: { title: string; content: string }) => request<SqlPlaybookCategory | undefined>(`/sql-playbook/documents/${id}`, { method: "PATCH", body: value, errorMessage: "SQL 문서를 저장하지 못했습니다." });
export const deleteSqlDocument = (id: string) => request<{ success: boolean }>(`/sql-playbook/documents/${id}`, { method: "DELETE", errorMessage: "SQL 문서를 삭제하지 못했습니다." });
export const moveSqlDocument = (id: string, direction: "up" | "down") => request<SqlPlaybookCategory[]>(`/sql-playbook/documents/${id}/reorder`, { method: "POST", body: { direction }, errorMessage: "SQL 문서 순서를 바꾸지 못했습니다." });
