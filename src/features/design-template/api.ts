import { fetch as tauriFetch } from "@tauri-apps/plugin-http";
import { apiRequest, getToken } from "../../shared/api/client";

export type DesignTemplateFile = {
  id: string;
  name: string;
  url: string;
  fileType: string;
  fileSize: number;
  purpose?: "source" | "convention" | "asset";
};

export type DesignTemplate = {
  id: string;
  title: string;
  summary: string;
  category: string;
  tags: string[];
  coverImageUrl: string | null;
  previewImageUrls: string[];
  files: DesignTemplateFile[];
  conventionFiles: DesignTemplateFile[];
  designRules: string;
  aiPrompt: string;
  createdBy: string | null;
  createdByName: string;
  createdAt: string;
  updatedAt: string;
  canEdit: boolean;
  canDelete: boolean;
};

export type DesignTemplatePayload = {
  title: string;
  summary: string;
  category: string;
  tags?: string[];
  coverImageUrl?: string | null;
  previewImageUrls?: string[];
  files?: DesignTemplateFile[];
  conventionFiles?: DesignTemplateFile[];
  designRules?: string;
  aiPrompt?: string;
};

export type DesignReference = {
  id: string;
  title: string;
  category: string;
  description: string;
  url: string;
  sortOrder: number;
  createdBy: string | null;
  createdByName: string;
  createdAt: string;
  updatedAt: string;
  canEdit: boolean;
  canDelete: boolean;
};

export type DesignReferencePayload = {
  title: string;
  category: string;
  description: string;
  url: string;
  sortOrder?: number;
};

type PresignedUrlResponse = {
  presignedUrl: string;
  publicUrl: string;
  key: string;
};

export function listDesignTemplates(): Promise<DesignTemplate[]> {
  return apiRequest<DesignTemplate[]>("/design-templates", {
    token: getToken(),
    errorMessage: "디자인 템플릿을 불러오지 못했습니다.",
  });
}

export function createDesignTemplate(
  payload: DesignTemplatePayload,
): Promise<DesignTemplate> {
  return apiRequest<DesignTemplate>("/design-templates", {
    method: "POST",
    token: getToken(),
    body: payload,
    errorMessage: "디자인 템플릿을 추가하지 못했습니다.",
  });
}

export function updateDesignTemplate(
  id: string,
  payload: Partial<DesignTemplatePayload>,
): Promise<DesignTemplate> {
  return apiRequest<DesignTemplate>(`/design-templates/${id}`, {
    method: "PATCH",
    token: getToken(),
    body: payload,
    errorMessage: "디자인 템플릿을 수정하지 못했습니다.",
  });
}

export function deleteDesignTemplate(id: string): Promise<{ success: boolean; id: string }> {
  return apiRequest<{ success: boolean; id: string }>(`/design-templates/${id}`, {
    method: "DELETE",
    token: getToken(),
    errorMessage: "디자인 템플릿을 삭제하지 못했습니다.",
  });
}

export function listDesignReferences(): Promise<DesignReference[]> {
  return apiRequest<DesignReference[]>("/design-templates/references", {
    token: getToken(),
    errorMessage: "디자인 레퍼런스를 불러오지 못했습니다.",
  });
}

export function createDesignReference(
  payload: DesignReferencePayload,
): Promise<DesignReference> {
  return apiRequest<DesignReference>("/design-templates/references", {
    method: "POST",
    token: getToken(),
    body: payload,
    errorMessage: "디자인 레퍼런스를 추가하지 못했습니다.",
  });
}

export function updateDesignReference(
  id: string,
  payload: Partial<DesignReferencePayload>,
): Promise<DesignReference> {
  return apiRequest<DesignReference>(`/design-templates/references/${id}`, {
    method: "PATCH",
    token: getToken(),
    body: payload,
    errorMessage: "디자인 레퍼런스를 수정하지 못했습니다.",
  });
}

export function deleteDesignReference(id: string): Promise<{ success: boolean; id: string }> {
  return apiRequest<{ success: boolean; id: string }>(
    `/design-templates/references/${id}`,
    {
      method: "DELETE",
      token: getToken(),
      errorMessage: "디자인 레퍼런스를 삭제하지 못했습니다.",
    },
  );
}

export async function uploadDesignTemplateAsset(file: File): Promise<string> {
  const contentType = file.type || "application/octet-stream";
  const presign = await apiRequest<PresignedUrlResponse>("/upload/presign", {
    method: "POST",
    token: getToken(),
    body: { filename: file.name, contentType },
    errorMessage: "파일 업로드를 준비하지 못했습니다.",
  });

  const putResponse = await tauriFetch(presign.presignedUrl, {
    method: "PUT",
    headers: { "Content-Type": contentType },
    body: file,
  });

  if (!putResponse.ok) {
    throw new Error("파일 업로드에 실패했습니다.");
  }

  return presign.publicUrl;
}
