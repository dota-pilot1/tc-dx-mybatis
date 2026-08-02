import { apiRequest, getToken } from "../../shared/api/client";

export type TestPlaybookStatus = "draft" | "running" | "review" | "approved";
export type TestPlaybookStep = { id: string; title: string; description: string; command: string; artifact: string; result: string; done: boolean };
export type TestPlaybookContent = { id: string; documentId: string; title: string; content: string; orderIdx: number; createdAt: string; updatedAt: string };
export type TestPlaybookDocument = { id: string; categoryId: string; title: string; summary: string; content: string; steps: TestPlaybookStep[]; githubUrl: string; reviewNotes: string; status: TestPlaybookStatus; orderIdx: number; createdAt: string; updatedAt: string; contents: TestPlaybookContent[] };
export type TestPlaybookCategory = { id: string; userId: string; title: string; orderIdx: number; createdAt: string; updatedAt: string; documents: TestPlaybookDocument[] };
export type TestPlaybookDocumentPayload = Omit<TestPlaybookDocument, "id" | "categoryId" | "orderIdx" | "createdAt" | "updatedAt">;

const token = () => getToken();
export function listTestPlaybook() { return apiRequest<TestPlaybookCategory[]>("/test-playbook", { token: token(), errorMessage: "테스트 플레이북을 불러오지 못했습니다." }); }
export function createTestPlaybookCategory(title: string) { return apiRequest<TestPlaybookCategory | undefined>("/test-playbook/categories", { method: "POST", body: { title }, token: token(), errorMessage: "테스트 영역을 만들지 못했습니다." }); }
export function updateTestPlaybookCategory(id: string, title: string) { return apiRequest<TestPlaybookCategory | undefined>(`/test-playbook/categories/${id}`, { method: "PATCH", body: { title }, token: token(), errorMessage: "테스트 영역을 수정하지 못했습니다." }); }
export function deleteTestPlaybookCategory(id: string) { return apiRequest<{ success: boolean }>(`/test-playbook/categories/${id}`, { method: "DELETE", token: token(), errorMessage: "테스트 영역을 삭제하지 못했습니다." }); }
export function createTestPlaybookDocument(categoryId: string, body: TestPlaybookDocumentPayload) { return apiRequest<TestPlaybookCategory | undefined>(`/test-playbook/categories/${categoryId}/documents`, { method: "POST", body, token: token(), errorMessage: "테스트 문서를 만들지 못했습니다." }); }
export function updateTestPlaybookDocument(id: string, body: Partial<TestPlaybookDocumentPayload>) { return apiRequest<TestPlaybookCategory | undefined>(`/test-playbook/documents/${id}`, { method: "PATCH", body, token: token(), errorMessage: "테스트 문서를 저장하지 못했습니다." }); }
export function deleteTestPlaybookDocument(id: string) { return apiRequest<{ success: boolean }>(`/test-playbook/documents/${id}`, { method: "DELETE", token: token(), errorMessage: "테스트 문서를 삭제하지 못했습니다." }); }
export function createTestPlaybookContent(documentId: string, body: { title: string; content: string }) { return apiRequest<TestPlaybookCategory | undefined>(`/test-playbook/documents/${documentId}/contents`, { method: "POST", body, token: token(), errorMessage: "Lexical 문서를 만들지 못했습니다." }); }
export function updateTestPlaybookContent(id: string, body: { title: string; content: string }) { return apiRequest<TestPlaybookCategory | undefined>(`/test-playbook/contents/${id}`, { method: "PATCH", body, token: token(), errorMessage: "Lexical 문서를 저장하지 못했습니다." }); }
export function deleteTestPlaybookContent(id: string) { return apiRequest<{ success: boolean }>(`/test-playbook/contents/${id}`, { method: "DELETE", token: token(), errorMessage: "Lexical 문서를 삭제하지 못했습니다." }); }
export function moveTestPlaybookContent(id: string, direction: "up" | "down") { return apiRequest<TestPlaybookCategory | undefined>(`/test-playbook/contents/${id}/reorder`, { method: "POST", body: { direction }, token: token(), errorMessage: "문서 순서를 바꾸지 못했습니다." }); }
