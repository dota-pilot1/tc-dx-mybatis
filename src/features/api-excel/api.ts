import { fetch as tauriFetch } from "@tauri-apps/plugin-http";
import { apiRequest } from "../api-doc/http";
import type { ApiExcelFile, ApiExcelProject } from "./types";

type PresignResult = { presignedUrl: string; publicUrl: string; key: string };

export const apiExcelApi = {
  list() {
    return apiRequest<ApiExcelProject[]>("/api-excel");
  },
  createProject(name: string) {
    return apiRequest<ApiExcelProject>("/api-excel/projects", {
      method: "POST",
      body: JSON.stringify({ name }),
    });
  },
  updateProject(id: string, name: string) {
    return apiRequest<ApiExcelProject>(`/api-excel/projects/${id}`, {
      method: "PATCH",
      body: JSON.stringify({ name }),
    });
  },
  deleteProject(id: string) {
    return apiRequest<void>(`/api-excel/projects/${id}`, {
      method: "DELETE",
    });
  },
  createCategory(projectId: string, name: string) {
    return apiRequest<ApiExcelProject>(`/api-excel/projects/${projectId}/categories`, {
      method: "POST",
      body: JSON.stringify({ name }),
    });
  },
  updateCategory(id: string, name: string) {
    return apiRequest<ApiExcelProject>(`/api-excel/categories/${id}`, {
      method: "PATCH",
      body: JSON.stringify({ name }),
    });
  },
  deleteCategory(id: string) {
    return apiRequest<void>(`/api-excel/categories/${id}`, {
      method: "DELETE",
    });
  },
  createFile(categoryId: string, input: Omit<ApiExcelFile, "id" | "categoryId" | "version" | "orderIdx" | "createdBy" | "createdAt" | "updatedAt">) {
    return apiRequest<ApiExcelProject>(`/api-excel/categories/${categoryId}/files`, {
      method: "POST",
      body: JSON.stringify(input),
    });
  },
  deleteFile(id: string) {
    return apiRequest<void>(`/api-excel/files/${id}`, {
      method: "DELETE",
    });
  },
  reorderFile(id: string, direction: "up" | "down") {
    return apiRequest<ApiExcelProject[]>(`/api-excel/files/${id}/reorder`, {
      method: "POST",
      body: JSON.stringify({ direction }),
    });
  },
};

async function inspectExcel(file: File) {
  const XLSX = await import("xlsx");
  const workbook = XLSX.read(await file.arrayBuffer(), { type: "array" });
  const apiCount = workbook.SheetNames.reduce((total, sheetName) => {
    const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(workbook.Sheets[sheetName], { defval: "" });
    return total + rows.filter((row) => Object.entries(row).some(([key, value]) => /^(path|url|경로|주소|요청 ?url)$/i.test(key.replace(/[\s_-]/g, "")) && String(value).trim())).length;
  }, 0);
  return { sheetCount: workbook.SheetNames.length, apiCount };
}

export async function uploadApiExcelFile(file: File, categoryId: string) {
  const contentType = file.type || "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
  const stats = await inspectExcel(file);
  const presign = await apiRequest<PresignResult>("/upload/presign", {
    method: "POST",
    body: JSON.stringify({ filename: file.name, contentType }),
  });
  const bytes = new Uint8Array(await file.arrayBuffer());
  const uploadResponse = await tauriFetch(presign.presignedUrl, {
    method: "PUT",
    headers: { "Content-Type": contentType },
    body: bytes,
  });
  if (!uploadResponse.ok) throw new Error(`Excel 업로드에 실패했습니다. (${uploadResponse.status})`);

  await apiExcelApi.createFile(categoryId, {
    name: file.name,
    storageKey: presign.key,
    publicUrl: presign.publicUrl,
    mimeType: contentType,
    sizeBytes: file.size,
    ...stats,
  });
}
