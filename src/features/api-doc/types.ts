import { API_BASE_URL } from "./http";

export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
export type BodyType = "none" | "json" | "raw";

export type ApiDocTeam = {
  id: string;
  name: string;
  description?: string | null;
  icon?: string | null;
  emoji?: string | null;
  orderIdx: number;
  createdBy?: string | null;
  createdAt: string;
  updatedAt: string;
  categoryCount?: number;
  endpointCount?: number;
};

export type ApiDocCategory = {
  id: string;
  teamId?: string | null;
  name: string;
  icon?: string | null;
  emoji?: string | null;
  orderIdx: number;
  createdBy?: string | null;
  createdAt: string;
  updatedAt: string;
};

export type ApiDocEndpoint = {
  id: string;
  categoryId: string;
  title: string;
  method: HttpMethod;
  path: string;
  orderIdx: number;
  createdBy?: string | null;
  createdAt: string;
  updatedAt: string;
};

export type ApiDocBlock = {
  id?: string;
  endpointId?: string;
  blockType: "API";
  content: string;
  orderIdx?: number;
  createdAt?: string;
  updatedAt?: string;
};

export type KeyValueItem = {
  key: string;
  value: string;
  enabled: boolean;
  description?: string;
};

export type ApiResponse = {
  status: number;
  statusText: string;
  headers: Record<string, string>;
  body: string;
  durationMs: number;
  timestamp: string;
};

export type ApiBlockContent = {
  method: HttpMethod;
  url: string;
  authEnabled: boolean;
  headers: KeyValueItem[];
  params: KeyValueItem[];
  body: {
    type: BodyType;
    content: string;
  };
  description?: string;
  lastResponse?: ApiResponse | null;
};

export type ApiEnvironmentVariable = {
  key: string;
  value: string;
  description?: string;
};

export type ApiEnvironment = {
  id: string;
  name: string;
  variables: ApiEnvironmentVariable[];
};

export type CreateApiDocTeamRequest = {
  name: string;
  description?: string | null;
  icon?: string | null;
  emoji?: string | null;
};

export type UpdateApiDocTeamRequest = Partial<CreateApiDocTeamRequest>;

export type CreateApiDocCategoryRequest = {
  teamId?: string | null;
  name: string;
  icon?: string | null;
  emoji?: string | null;
};

export type UpdateApiDocCategoryRequest = Partial<CreateApiDocCategoryRequest>;

export type CreateApiDocEndpointRequest = {
  categoryId: string;
  title: string;
  method: HttpMethod;
  path: string;
};

export type UpdateApiDocEndpointRequest = Partial<CreateApiDocEndpointRequest>;

export function getApiBaseOrigin() {
  return API_BASE_URL.replace(/\/api\/?$/, "");
}

export function createDefaultApiBlockContent(
  endpoint?: Pick<ApiDocEndpoint, "method" | "path"> | null,
): ApiBlockContent {
  const path = endpoint?.path?.trim();
  const method = endpoint?.method ?? "GET";
  // POST/PUT/PATCH는 실무에서 거의 항상 JSON 바디를 쓰므로 처음부터 json 탭 + 빈 오브젝트로 시작.
  const hasBody = method === "POST" || method === "PUT" || method === "PATCH";
  return {
    method,
    url: path
      ? path.startsWith("http") || path.startsWith("{{")
        ? path
        : `{{API_BASE}}${path.startsWith("/") ? path : `/${path}`}`
      : "{{API_BASE}}/endpoint",
    authEnabled: true,
    headers: [
      { key: "Content-Type", value: "application/json", enabled: true },
    ],
    params: [],
    body: hasBody ? { type: "json", content: "{\n  \n}" } : { type: "none", content: "" },
    description: "",
    lastResponse: null,
  };
}

export function parseApiBlockContent(
  blocks: ApiDocBlock[],
  endpoint?: Pick<ApiDocEndpoint, "method" | "path"> | null,
) {
  const block = blocks.find((item) => item.blockType === "API");
  if (!block) return createDefaultApiBlockContent(endpoint);

  try {
    const parsed = JSON.parse(block.content) as Partial<ApiBlockContent>;
    return {
      ...createDefaultApiBlockContent(endpoint),
      ...parsed,
      body: {
        ...createDefaultApiBlockContent(endpoint).body,
        ...parsed.body,
      },
    };
  } catch {
    return createDefaultApiBlockContent(endpoint);
  }
}

export function resolveEnvVars(text: string, envVars: Record<string, string>) {
  return text.replace(
    /\{\{(\w+)\}\}/g,
    (_, key: string) => envVars[key] ?? `{{${key}}}`,
  );
}

function normalizeParamName(name: string) {
  return name.replace(/[^a-z0-9]/gi, "").toLowerCase();
}

/**
 * Builds the URL that will actually be sent for an API request.
 *
 * Params are query parameters by default. If an unresolved URL variable
 * matches a param name (for example `{{id}}` or `{{POST_ID}}` + `id`), use
 * that value as a path parameter and don't append it to the query string.
 */
export function buildApiRequestUrl(
  rawUrl: string,
  params: KeyValueItem[],
  envVars: Record<string, string>,
) {
  let resolvedUrl = resolveEnvVars(rawUrl, envVars);
  const consumedPathParams = new Set<number>();
  const pathVariables = [...resolvedUrl.matchAll(/\{\{(\w+)\}\}/g)];

  pathVariables.forEach(([token, variableName]) => {
    const normalizedVariable = normalizeParamName(variableName);
    const paramIndex = params.findIndex((param, index) => {
      if (consumedPathParams.has(index) || !param.enabled || !param.key.trim()) {
        return false;
      }

      const normalizedKey = normalizeParamName(param.key);
      return (
        normalizedVariable === normalizedKey ||
        normalizedVariable.endsWith(normalizedKey)
      );
    });

    if (paramIndex === -1) return;

    const value = resolveEnvVars(params[paramIndex].value, envVars);
    if (!value.trim()) return;

    resolvedUrl = resolvedUrl.replace(token, encodeURIComponent(value));
    consumedPathParams.add(paramIndex);
  });

  const url = new URL(resolvedUrl);
  params
    .filter(
      (param, index) =>
        param.enabled && param.key.trim() && !consumedPathParams.has(index),
    )
    .forEach((param) => {
      url.searchParams.append(param.key, resolveEnvVars(param.value, envVars));
    });

  return url.toString();
}

export function isJsonString(text: string) {
  try {
    JSON.parse(text);
    return true;
  } catch {
    return false;
  }
}

export function prettyJson(text: string) {
  try {
    return JSON.stringify(JSON.parse(text), null, 2);
  } catch {
    return text;
  }
}
