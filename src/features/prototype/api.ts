import { apiRequest, getToken } from "../../shared/api/client";

export type PrototypeStatus = "draft" | "building" | "ready";
export type PrototypeVisibility = "public" | "private";

export type PrototypeWorkspaceRole = "owner" | "editor" | "member" | "viewer";

export type PrototypeWorkspace = {
  id: string;
  name: string;
  description: string | null;
  icon: string | null;
  color: string | null;
  orderIdx: number;
  createdBy: string | null;
  createdAt: string;
  updatedAt: string;
  role: PrototypeWorkspaceRole | null;
  categoryCount: number;
  prototypeCount: number;
};

export type SavePrototypeWorkspacePayload = {
  name: string;
  description?: string | null;
  icon?: string | null;
  color?: string | null;
};

export type CatalogPrototype = {
  id: string;
  categoryId: string;
  title: string;
  repoUrl: string;
  demoUrl: string | null;
  figmaUrl: string | null;
  summary: string;
  status: PrototypeStatus;
  visibility: PrototypeVisibility;
  tags: string[];
  checklist: string[];
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  images: string[];
};

export type CatalogCategory = {
  id: string;
  workspaceId: string | null;
  userId: string;
  title: string;
  summary: string;
  group: string;
  iconKey: string;
  tags: string[];
  checklist: string[];
  orderIdx: number;
  createdAt: string;
  updatedAt: string;
  prototypes: CatalogPrototype[];
};

function token() {
  return getToken();
}

export function listPrototypeWorkspaces(): Promise<PrototypeWorkspace[]> {
  return apiRequest<PrototypeWorkspace[]>("/catalog/workspaces", {
    token: token(),
    errorMessage: "프로토타입 워크스페이스를 불러오지 못했습니다.",
  });
}

export function createPrototypeWorkspace(
  body: SavePrototypeWorkspacePayload,
): Promise<PrototypeWorkspace> {
  return apiRequest<PrototypeWorkspace>("/catalog/workspaces", {
    method: "POST",
    body,
    token: token(),
    errorMessage: "프로토타입 워크스페이스를 만들지 못했습니다.",
  });
}

export function updatePrototypeWorkspace(
  workspaceId: string,
  body: SavePrototypeWorkspacePayload,
): Promise<PrototypeWorkspace> {
  return apiRequest<PrototypeWorkspace>(`/catalog/workspaces/${workspaceId}`, {
    method: "PATCH",
    body,
    token: token(),
    errorMessage: "프로토타입 워크스페이스를 수정하지 못했습니다.",
  });
}

export function deletePrototypeWorkspace(
  workspaceId: string,
): Promise<{ success: boolean }> {
  return apiRequest<{ success: boolean }>(`/catalog/workspaces/${workspaceId}`, {
    method: "DELETE",
    token: token(),
    errorMessage: "프로토타입 워크스페이스를 삭제하지 못했습니다.",
  });
}

export function listWorkspaceCategories(
  workspaceId: string,
): Promise<CatalogCategory[]> {
  return apiRequest<CatalogCategory[]>(
    `/catalog/workspaces/${workspaceId}/categories`,
    {
      token: token(),
      errorMessage: "프로토타입 카테고리를 불러오지 못했습니다.",
    },
  );
}
