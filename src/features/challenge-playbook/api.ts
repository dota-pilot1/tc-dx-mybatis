import { apiRequest, getToken } from "../../shared/api/client";

export type ChallengeCategory = {
  id: string;
  workspaceId: string;
  name: string;
  summary?: string | null;
  orderIdx: number;
};

export type ChallengeTopic = {
  id: string;
  categoryId: string;
  title: string;
  summary?: string | null;
  orderIdx: number;
};

export type ChallengeBlock = {
  id: string;
  assignmentId: string;
  blockType: "NOTE" | "MMD" | "CHECKLIST" | "GITHUB" | "FIGMA" | "FILE" | "DBTABLE";
  title?: string | null;
  content: string;
  orderIdx: number;
};

export type ChallengeDocument = {
  id: string;
  sectionId: string;
  title: string;
  summary?: string | null;
  difficulty: string;
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED";
  orderIdx: number;
  blocks?: ChallengeBlock[];
};

export type ChallengeSubmission = {
  id: string;
  assignmentId: string;
  userId: string;
  comment: string;
  githubUrl?: string | null;
  status: "SUBMITTED" | "NEEDS_CHANGES" | "APPROVED" | "REJECTED";
  score: number;
  maxScore: number;
  checkedItems: string[];
  createdAt: string;
  updatedAt: string;
};

export type ChallengeComment = {
  id: string;
  submissionId: string;
  userId: string;
  content: string;
  authorName: string;
  createdAt: string;
  updatedAt: string;
};

export const CHALLENGE_WORKSPACE_ID = "dev-challenge-workspace-default";

const token = () => getToken();
const request = <T>(path: string, options: Parameters<typeof apiRequest<T>>[1] = {}) =>
  apiRequest<T>(path, { ...options, token: token() });

export function listChallengeCategories() {
  return request<ChallengeCategory[]>(
    `/challenge-playbook/workspaces/${CHALLENGE_WORKSPACE_ID}/categories`,
    { errorMessage: "챌린지 영역을 불러오지 못했습니다." },
  );
}

export function createChallengeCategory(name: string) {
  return request<ChallengeCategory>(
    `/challenge-playbook/workspaces/${CHALLENGE_WORKSPACE_ID}/categories`,
    { method: "POST", body: { name }, errorMessage: "챌린지 영역을 만들지 못했습니다." },
  );
}

export function listChallengeTopics(categoryId: string) {
  return request<ChallengeTopic[]>(`/challenge-playbook/categories/${categoryId}/sections`, {
    errorMessage: "챌린지 주제를 불러오지 못했습니다.",
  });
}

export function createChallengeTopic(categoryId: string, title: string) {
  return request<ChallengeTopic>("/challenge-playbook/sections", {
    method: "POST",
    body: { categoryId, title },
    errorMessage: "챌린지 주제를 만들지 못했습니다.",
  });
}

export function listChallengeDocuments(topicId: string) {
  return request<ChallengeDocument[]>(`/challenge-playbook/sections/${topicId}/assignments`, {
    errorMessage: "챌린지 문서를 불러오지 못했습니다.",
  });
}

export function getChallengeDocument(documentId: string) {
  return request<ChallengeDocument>(`/challenge-playbook/assignments/${documentId}`, {
    errorMessage: "챌린지 문서를 불러오지 못했습니다.",
  });
}

export function createChallengeDocument(
  topicId: string,
  body: { title: string; summary: string; content: string; checklist: string },
) {
  const checklistItems = body.checklist
    .split("\n")
    .map((label, index) => ({ id: `item-${index + 1}`, label: label.trim() }))
    .filter((item) => item.label);
  return request<ChallengeDocument>("/challenge-playbook/assignments", {
    method: "POST",
    body: {
      sectionId: topicId,
      title: body.title,
      summary: body.summary,
      difficulty: "BASIC",
      status: "PUBLISHED",
      noteContent: body.content,
      checklistItems,
    },
    errorMessage: "챌린지 문서를 만들지 못했습니다.",
  });
}

export function getMyChallengeSubmission(documentId: string) {
  return request<ChallengeSubmission | null>(
    `/challenge-playbook/assignments/${documentId}/submissions/my`,
    { errorMessage: "내 제출을 불러오지 못했습니다." },
  );
}

export function saveChallengeSubmission(
  documentId: string,
  submissionId: string | undefined,
  body: { comment: string; githubUrl?: string },
) {
  const path = submissionId
    ? `/challenge-playbook/submissions/${submissionId}`
    : "/challenge-playbook/submissions";
  return request<ChallengeSubmission>(path, {
    method: submissionId ? "PATCH" : "POST",
    body: { assignmentId: documentId, ...body, checkedItems: [] },
    errorMessage: "챌린지 제출을 저장하지 못했습니다.",
  });
}

export function listChallengeComments(submissionId: string) {
  return request<ChallengeComment[]>(
    `/challenge-playbook/submissions/${submissionId}/comments`,
    { errorMessage: "제출 댓글을 불러오지 못했습니다." },
  );
}

export function createChallengeComment(submissionId: string, content: string) {
  return request<ChallengeComment>(
    `/challenge-playbook/submissions/${submissionId}/comments`,
    { method: "POST", body: { content }, errorMessage: "댓글을 등록하지 못했습니다." },
  );
}
