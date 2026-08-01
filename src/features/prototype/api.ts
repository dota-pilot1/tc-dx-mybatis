import { ApiError, apiRequest, getToken } from "../../shared/api/client";

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

export type SaveCatalogCategoryPayload = {
  title: string;
  summary: string;
  group?: string;
  iconKey?: string;
  tags?: string[];
  checklist?: string[];
};

export type SaveCatalogPrototypePayload = Partial<{
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
  images: string[];
}>;

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
  noteTopic?: PrototypeNoteTopic | null;
};

export type PrototypeNoteSection = {
  id: string;
  topicId: string;
  title: string;
  summary: string;
  content: string;
  orderIdx: number;
  createdAt: string;
  updatedAt: string;
  notes: PrototypeNoteEntry[];
};

export type PrototypeNoteEntry = {
  id: string;
  sectionId: string;
  title: string;
  content: string;
  orderIdx: number;
  createdAt: string;
  updatedAt: string;
};

export type PrototypeNoteTopic = {
  id: string;
  prototypeId: string;
  title: string;
  summary: string;
  orderIdx: number;
  createdAt: string;
  updatedAt: string;
  sections: PrototypeNoteSection[];
};

export type SavePrototypeNoteSectionPayload = {
  title: string;
  summary?: string;
  content?: string;
};

export type SavePrototypeNoteEntryPayload = {
  title: string;
  content?: string;
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
  const requestOptions = {
    token: token(),
    errorMessage: "프로토타입 주제를 불러오지 못했습니다.",
  };

  return apiRequest<CatalogCategory[]>(
    `/catalog/workspaces/${workspaceId}/topics`,
    requestOptions,
  ).catch((err) => {
    if (err instanceof ApiError && err.status === 404) {
      return apiRequest<CatalogCategory[]>(
        `/catalog/workspaces/${workspaceId}/categories`,
        requestOptions,
      );
    }
    throw err;
  });
}

export function createWorkspaceCategory(
  workspaceId: string,
  body: SaveCatalogCategoryPayload,
): Promise<CatalogCategory> {
  const requestOptions = {
    method: "POST",
    body,
    token: token(),
    errorMessage: "프로토타입 주제를 만들지 못했습니다.",
  };

  return apiRequest<CatalogCategory>(
    `/catalog/workspaces/${workspaceId}/topics`,
    requestOptions,
  ).catch((err) => {
    if (err instanceof ApiError && err.status === 404) {
      return apiRequest<CatalogCategory>(
        `/catalog/workspaces/${workspaceId}/categories`,
        requestOptions,
      );
    }
    throw err;
  });
}

export function updateCatalogCategory(
  categoryId: string,
  body: Partial<SaveCatalogCategoryPayload>,
): Promise<CatalogCategory> {
  const requestOptions = {
    method: "PATCH",
    body,
    token: token(),
    errorMessage: "프로토타입 주제를 수정하지 못했습니다.",
  };

  return apiRequest<CatalogCategory>(
    `/catalog/topics/${categoryId}`,
    requestOptions,
  ).catch((err) => {
    if (err instanceof ApiError && err.status === 404) {
      return apiRequest<CatalogCategory>(
        `/catalog/categories/${categoryId}`,
        requestOptions,
      );
    }
    throw err;
  });
}

export function deleteCatalogCategory(
  categoryId: string,
): Promise<{ success: boolean; categoryId: string }> {
  const requestOptions = {
    method: "DELETE",
    token: token(),
    errorMessage: "프로토타입 주제를 삭제하지 못했습니다.",
  };

  return apiRequest<{ success: boolean; categoryId: string }>(
    `/catalog/topics/${categoryId}`,
    requestOptions,
  ).catch((err) => {
    if (err instanceof ApiError && err.status === 404) {
      return apiRequest<{ success: boolean; categoryId: string }>(
        `/catalog/categories/${categoryId}`,
        requestOptions,
      );
    }
    throw err;
  });
}

export function reorderWorkspaceCategories(
  workspaceId: string,
  items: Array<{ id: string; orderIdx: number }>,
): Promise<CatalogCategory[]> {
  const requestOptions = {
    method: "POST",
    body: { items },
    token: token(),
    errorMessage: "프로토타입 주제 순서를 저장하지 못했습니다.",
  };

  return apiRequest<CatalogCategory[]>(
    `/catalog/workspaces/${workspaceId}/topics/reorder`,
    requestOptions,
  ).catch((err) => {
    if (err instanceof ApiError && err.status === 404) {
      return apiRequest<CatalogCategory[]>(
        `/catalog/workspaces/${workspaceId}/categories/reorder`,
        requestOptions,
      );
    }
    throw err;
  });
}

export function updateCatalogPrototype(
  categoryId: string,
  prototypeId: string,
  body: SaveCatalogPrototypePayload,
): Promise<CatalogCategory> {
  const requestOptions = {
    method: "PATCH",
    body,
    token: token(),
    errorMessage: "프로토타입을 수정하지 못했습니다.",
  };

  return apiRequest<CatalogCategory>(
    `/catalog/topics/${categoryId}/prototypes/${prototypeId}`,
    requestOptions,
  ).catch((err) => {
    if (err instanceof ApiError && err.status === 404) {
      return apiRequest<CatalogCategory>(
        `/catalog/categories/${categoryId}/prototypes/${prototypeId}`,
        requestOptions,
      );
    }
    throw err;
  });
}

export function getPrototypeNote(
  prototypeId: string,
): Promise<PrototypeNoteTopic | null> {
  return apiRequest<PrototypeNoteTopic | null>(
    `/catalog/prototypes/${prototypeId}/note`,
    {
      token: token(),
      errorMessage: "프로토타입 노트를 불러오지 못했습니다.",
    },
  );
}

export function createPrototypeNoteSection(
  prototypeId: string,
  body: SavePrototypeNoteSectionPayload,
): Promise<PrototypeNoteTopic> {
  return apiRequest<PrototypeNoteTopic>(
    `/catalog/prototypes/${prototypeId}/note/sections`,
    {
      method: "POST",
      body,
      token: token(),
      errorMessage: "노트 주제를 추가하지 못했습니다.",
    },
  );
}

export function createPrototypeNoteEntry(
  sectionId: string,
  body: SavePrototypeNoteEntryPayload,
): Promise<PrototypeNoteTopic> {
  return apiRequest<PrototypeNoteTopic>(
    `/catalog/prototype-note-sections/${sectionId}/notes`,
    {
      method: "POST",
      body,
      token: token(),
      errorMessage: "노트를 추가하지 못했습니다.",
    },
  );
}

export function updatePrototypeNoteSection(
  sectionId: string,
  body: Partial<SavePrototypeNoteSectionPayload>,
): Promise<PrototypeNoteTopic> {
  return apiRequest<PrototypeNoteTopic>(
    `/catalog/prototype-note-sections/${sectionId}`,
    {
      method: "PATCH",
      body,
      token: token(),
      errorMessage: "노트 주제를 수정하지 못했습니다.",
    },
  );
}

export function deletePrototypeNoteSection(
  sectionId: string,
): Promise<PrototypeNoteTopic> {
  return apiRequest<PrototypeNoteTopic>(
    `/catalog/prototype-note-sections/${sectionId}`,
    {
      method: "DELETE",
      token: token(),
      errorMessage: "노트 주제를 삭제하지 못했습니다.",
    },
  );
}
