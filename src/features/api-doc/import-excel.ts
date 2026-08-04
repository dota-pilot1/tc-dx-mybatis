import type {
  ApiDocImportEndpoint,
  ApiDocImportExportV2File,
  ApiDocImportWorkspace,
} from "./import-export-types";
import type { HttpMethod, KeyValueItem } from "./types";

type ExcelRow = Record<string, unknown>;
type XlsxModule = typeof import("xlsx");
type XlsxWorkbook = import("xlsx").WorkBook;

const METHOD_SET = new Set<HttpMethod>(["GET", "POST", "PUT", "PATCH", "DELETE"]);

const COLUMN_ALIASES = {
  workspace: ["workspace", "워크스페이스", "workspaceName", "워크스페이스명"],
  collection: ["collection", "컬렉션", "category", "카테고리", "collectionName", "컬렉션명"],
  title: ["title", "name", "request", "요청명", "요청", "이름", "apiName", "API명"],
  method: ["method", "메서드", "방식", "httpMethod", "HTTP Method"],
  path: ["path", "url", "경로", "주소", "요청 URL", "requestUrl"],
  description: ["description", "설명", "비고", "note", "notes"],
  headers: ["headers", "header", "헤더", "요청 헤더"],
  params: ["params", "parameters", "query", "파라미터", "쿼리", "쿼리 파라미터"],
  body: ["body", "본문", "requestBody", "요청 본문"],
  bodyType: ["bodyType", "body type", "본문 타입"],
  auth: ["auth", "authEnabled", "인증", "인증 사용", "Authorization"],
} as const;

function normalizeColumnName(value: string) {
  return value.trim().toLowerCase().replace(/[\s_-]/g, "");
}

function getCell(row: ExcelRow, aliases: readonly string[]) {
  const entries = Object.entries(row);
  const aliasSet = new Set(aliases.map(normalizeColumnName));
  const entry = entries.find(([key]) => aliasSet.has(normalizeColumnName(key)));
  return entry?.[1];
}

function text(value: unknown) {
  return value == null ? "" : String(value).trim();
}

function parseMethod(value: unknown, rowNumber: number): HttpMethod {
  const method = text(value || "GET").toUpperCase() as HttpMethod;
  if (!METHOD_SET.has(method)) {
    throw new Error(`${rowNumber}행의 메서드 '${method}'는 지원하지 않습니다.`);
  }
  return method;
}

function parseBoolean(value: unknown, fallback: boolean) {
  const normalized = text(value).toLowerCase();
  if (!normalized) return fallback;
  if (["true", "1", "yes", "y", "사용", "예", "인증"].includes(normalized)) return true;
  if (["false", "0", "no", "n", "미사용", "아니오", "없음"].includes(normalized)) return false;
  return fallback;
}

function toKeyValueItems(value: unknown, label: string, rowNumber: number): KeyValueItem[] {
  const raw = text(value);
  if (!raw) return [];

  try {
    const parsed = JSON.parse(raw) as unknown;
    if (Array.isArray(parsed)) {
      return parsed.map((item) => {
        const record = item as Partial<KeyValueItem>;
        return {
          key: text(record.key),
          value: text(record.value),
          enabled: record.enabled !== false,
          ...(record.description ? { description: text(record.description) } : {}),
        };
      });
    }
    if (parsed && typeof parsed === "object") {
      return Object.entries(parsed).map(([key, item]) => ({
        key,
        value: text(item),
        enabled: true,
      }));
    }
  } catch {
    // 아래의 줄 단위 `key: value` 형식으로 계속 처리합니다.
  }

  return raw
    .split(/\r?\n|[,;]/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const separator = line.indexOf(":");
      if (separator < 1) {
        throw new Error(`${rowNumber}행의 ${label}은 JSON 배열 또는 'key: value' 형식이어야 합니다.`);
      }
      return {
        key: line.slice(0, separator).trim(),
        value: line.slice(separator + 1).trim(),
        enabled: true,
      };
    });
}

function parseBody(value: unknown, bodyTypeValue: unknown, method: HttpMethod, rowNumber: number) {
  const content = text(value);
  if (!content) return { type: "none" as const, content: "" };

  const explicitType = text(bodyTypeValue).toLowerCase();
  if (explicitType === "none" || explicitType === "없음") {
    return { type: "none" as const, content: "" };
  }
  if (explicitType === "raw" || explicitType === "text" || explicitType === "문자열") {
    return { type: "raw" as const, content };
  }
  if (explicitType === "json" || explicitType === "json body") {
    try {
      JSON.parse(content);
    } catch {
      throw new Error(`${rowNumber}행의 본문이 올바른 JSON이 아닙니다.`);
    }
    return { type: "json" as const, content };
  }

  if (method === "GET" || method === "DELETE") {
    return { type: "raw" as const, content };
  }
  try {
    JSON.parse(content);
    return { type: "json" as const, content };
  } catch {
    return { type: "raw" as const, content };
  }
}

function getPath(value: unknown, rowNumber: number) {
  const path = text(value);
  if (!path) throw new Error(`${rowNumber}행에 경로 또는 URL이 없습니다.`);
  return path;
}

function toEndpoint(row: ExcelRow, sheetName: string, rowNumber: number): ApiDocImportEndpoint {
  const method = parseMethod(getCell(row, COLUMN_ALIASES.method), rowNumber);
  const path = getPath(getCell(row, COLUMN_ALIASES.path), rowNumber);
  const title = text(getCell(row, COLUMN_ALIASES.title)) || `${method} ${path}`;
  const headers = toKeyValueItems(getCell(row, COLUMN_ALIASES.headers), "헤더", rowNumber);
  const params = toKeyValueItems(getCell(row, COLUMN_ALIASES.params), "파라미터", rowNumber);

  return {
    title,
    method,
    path,
    request: {
      method,
      url: path.startsWith("http") || path.startsWith("{{") ? path : `{{API_BASE}}${path.startsWith("/") ? path : `/${path}`}`,
      authEnabled: parseBoolean(getCell(row, COLUMN_ALIASES.auth), !path.startsWith("/auth/")),
      headers,
      params,
      body: parseBody(getCell(row, COLUMN_ALIASES.body), getCell(row, COLUMN_ALIASES.bodyType), method, rowNumber),
      description: [text(getCell(row, COLUMN_ALIASES.description)), `출처: ${sheetName} 시트 ${rowNumber}행`]
        .filter(Boolean)
        .join("\n"),
    },
  };
}

function getRows(XLSX: XlsxModule, workbook: XlsxWorkbook) {
  return workbook.SheetNames.flatMap((sheetName) => {
    const sheet = workbook.Sheets[sheetName];
    const rows = XLSX.utils.sheet_to_json<ExcelRow>(sheet, { defval: "", raw: false });
    return rows.map((row) => ({ sheetName, row }));
  });
}

export async function parseExcelApiFile(file: File): Promise<ApiDocImportExportV2File> {
  const XLSX = await import("xlsx");
  const workbook = XLSX.read(await file.arrayBuffer(), { type: "array" });
  const rows = getRows(XLSX, workbook);
  if (rows.length === 0) throw new Error("엑셀 파일에 API 데이터가 없습니다.");

  const workspaceMap = new Map<string, Map<string, ApiDocImportEndpoint[]>>();
  rows.forEach(({ sheetName, row }, index) => {
    const rowNumber = index + 2;
    const path = text(getCell(row, COLUMN_ALIASES.path));
    if (!path) return;
    const workspaceName = text(getCell(row, COLUMN_ALIASES.workspace)) || "tc-dx-mybatis API";
    const collectionName = text(getCell(row, COLUMN_ALIASES.collection)) || sheetName || "Imported APIs";
    const collections = workspaceMap.get(workspaceName) ?? new Map<string, ApiDocImportEndpoint[]>();
    const endpoints = collections.get(collectionName) ?? [];
    endpoints.push(toEndpoint(row, sheetName, rowNumber));
    collections.set(collectionName, endpoints);
    workspaceMap.set(workspaceName, collections);
  });

  if (workspaceMap.size === 0) throw new Error("경로 또는 URL이 있는 행을 찾지 못했습니다.");

  const workspaces: ApiDocImportWorkspace[] = Array.from(workspaceMap.entries()).map(
    ([name, collections]) => ({
      name,
      description: "Excel 파일에서 가져온 API 요청",
      icon: "FileSpreadsheet",
      emoji: "📊",
      collections: Array.from(collections.entries()).map(([collectionName, endpoints]) => ({
        name: collectionName,
        icon: "Folder",
        emoji: "📁",
        endpoints,
      })),
    }),
  );

  return {
    version: 2,
    source: "towercrane-api-spec",
    exportedAt: new Date().toISOString(),
    workspaces,
  };
}
