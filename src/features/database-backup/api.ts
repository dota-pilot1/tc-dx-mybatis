import { fetch as tauriFetch } from "@tauri-apps/plugin-http";
import { getApiBase, getToken } from "../../shared/api/client";

export async function downloadDatabaseBackup(): Promise<void> {
  const token = getToken();
  if (!token) throw new Error("로그인이 필요합니다.");

  const url = `${getApiBase()}/admin/database-backup`;
  const request = {
    method: "GET",
    headers: { Authorization: `Bearer ${token}` },
  };
  const response = "__TAURI_INTERNALS__" in window
    ? await tauriFetch(url, request)
    : await globalThis.fetch(url, request);

  if (!response.ok) {
    throw new Error(response.status === 403 ? "관리자만 DB 백업을 받을 수 있습니다." : "DB 백업을 만들지 못했습니다.");
  }

  const blob = new Blob([await response.arrayBuffer()], { type: "application/vnd.sqlite3" });
  const objectUrl = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = objectUrl;
  link.download = `towercrane-catalog-${new Date().toISOString().replace(/[:.]/g, "-")}.sqlite`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(objectUrl);
}
