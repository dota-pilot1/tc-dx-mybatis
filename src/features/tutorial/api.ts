import { apiRequest, getToken } from "../../shared/api/client";
import { fetch as tauriFetch } from "@tauri-apps/plugin-http";

export type TutorialLesson = {
  id: string;
  sectionId: string;
  title: string;
  summary: string;
  content: string;
  videoUrl: string;
  videoTitle: string;
  documentUrl: string;
  documentTitle: string;
  orderIdx: number;
  createdAt: string;
  updatedAt: string;
  contents: TutorialContent[];
};

export type TutorialContentType = "lexical" | "youtube" | "document";

export type TutorialContent = {
  id: string;
  lessonId: string;
  type: TutorialContentType;
  title: string;
  content: string;
  url: string;
  orderIdx: number;
  createdAt: string;
  updatedAt: string;
};

export type TutorialSection = {
  id: string;
  categoryId: string;
  title: string;
  summary: string;
  orderIdx: number;
  createdAt: string;
  updatedAt: string;
  lessons: TutorialLesson[];
};

export type TutorialCategory = {
  id: string;
  userId: string;
  title: string;
  summary: string;
  orderIdx: number;
  createdAt: string;
  updatedAt: string;
  sections: TutorialSection[];
};

export type SaveTutorialLessonPayload = Omit<
  TutorialLesson,
  "id" | "sectionId" | "orderIdx" | "createdAt" | "updatedAt" | "contents"
>;

export type SaveTutorialContentPayload = {
  type: TutorialContentType;
  title: string;
  content?: string;
  url?: string;
};

function token() {
  return getToken();
}

export function listTutorials(): Promise<TutorialCategory[]> {
  return apiRequest<TutorialCategory[]>("/tutorial", {
    token: token(),
    errorMessage: "튜토리얼을 불러오지 못했습니다.",
  });
}

export function createTutorialCategory(body: { title: string; summary?: string }) {
  return apiRequest<TutorialCategory>("/tutorial/categories", {
    method: "POST",
    body,
    token: token(),
    errorMessage: "튜토리얼 카테고리를 만들지 못했습니다.",
  });
}

export function updateTutorialCategory(categoryId: string, body: { title: string }) {
  return apiRequest<TutorialCategory | undefined>(`/tutorial/categories/${categoryId}`, {
    method: "PATCH",
    body,
    token: token(),
    errorMessage: "카테고리를 수정하지 못했습니다.",
  });
}

export function deleteTutorialCategory(categoryId: string) {
  return apiRequest<{ success: boolean }>(`/tutorial/categories/${categoryId}`, {
    method: "DELETE",
    token: token(),
    errorMessage: "카테고리를 삭제하지 못했습니다.",
  });
}

export function createTutorialLesson(
  sectionId: string,
  body: SaveTutorialLessonPayload,
) {
  return apiRequest<TutorialCategory | undefined>(
    `/tutorial/sections/${sectionId}/lessons`,
    {
      method: "POST",
      body,
      token: token(),
      errorMessage: "튜토리얼을 만들지 못했습니다.",
    },
  );
}

export function updateTutorialLesson(
  lessonId: string,
  body: Partial<SaveTutorialLessonPayload>,
) {
  return apiRequest<TutorialCategory | undefined>(
    `/tutorial/lessons/${lessonId}`,
    {
      method: "PATCH",
      body,
      token: token(),
      errorMessage: "튜토리얼을 저장하지 못했습니다.",
    },
  );
}

export function deleteTutorialLesson(lessonId: string) {
  return apiRequest<{ success: boolean }>(`/tutorial/lessons/${lessonId}`, {
    method: "DELETE",
    token: token(),
    errorMessage: "튜토리얼을 삭제하지 못했습니다.",
  });
}

export function createTutorialContent(
  lessonId: string,
  body: SaveTutorialContentPayload,
) {
  return apiRequest<TutorialCategory | undefined>(
    `/tutorial/lessons/${lessonId}/contents`,
    {
      method: "POST",
      body,
      token: token(),
      errorMessage: "강의 자료를 추가하지 못했습니다.",
    },
  );
}

export function updateTutorialContent(
  contentId: string,
  body: Partial<SaveTutorialContentPayload>,
) {
  return apiRequest<TutorialCategory | undefined>(
    `/tutorial/contents/${contentId}`,
    {
      method: "PATCH",
      body,
      token: token(),
      errorMessage: "강의 자료를 저장하지 못했습니다.",
    },
  );
}

export function deleteTutorialContent(contentId: string) {
  return apiRequest<{ success: boolean }>(`/tutorial/contents/${contentId}`, {
    method: "DELETE",
    token: token(),
    errorMessage: "강의 자료를 삭제하지 못했습니다.",
  });
}

type PresignedUrlResponse = {
  presignedUrl: string;
  publicUrl: string;
};

export async function uploadTutorialDocument(file: File): Promise<string> {
  const contentType = file.type || "application/octet-stream";
  const presign = await apiRequest<PresignedUrlResponse>("/upload/presign", {
    method: "POST",
    body: { filename: file.name, contentType },
    token: token(),
    errorMessage: "문서 업로드를 준비하지 못했습니다.",
  });
  const response = await tauriFetch(presign.presignedUrl, {
    method: "PUT",
    headers: { "Content-Type": contentType },
    body: file,
  });
  if (!response.ok) throw new Error("문서 업로드에 실패했습니다.");
  return presign.publicUrl;
}
