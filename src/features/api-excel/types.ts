export type ApiExcelFile = {
  id: string;
  categoryId: string;
  name: string;
  storageKey: string;
  publicUrl: string;
  mimeType: string;
  sizeBytes: number;
  sheetCount: number;
  apiCount: number;
  version: number;
  orderIdx: number;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
};

export type ApiExcelCategory = {
  id: string;
  projectId: string;
  name: string;
  orderIdx: number;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  files: ApiExcelFile[];
};

export type ApiExcelProject = {
  id: string;
  name: string;
  description: string | null;
  orderIdx: number;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  categories: ApiExcelCategory[];
};
