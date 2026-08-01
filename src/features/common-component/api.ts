import { apiRequest, getToken } from '../../shared/api/client';

export type CommonComponentPreviewKind = 'input' | 'button' | 'card' | 'filter-tabs';
export type CommonComponentProps = Record<string, unknown>;

export type CommonComponentExample = {
  id: string;
  title: string;
  summary: string;
  previewKind: CommonComponentPreviewKind;
  previewVariant: string;
  code: string;
  props?: CommonComponentProps;
  orderIdx: number;
};

export type CommonComponentTemplate = {
  id: string;
  title: string;
  summary: string;
  category: string;
  style: string;
  previewKind: CommonComponentPreviewKind;
  componentName: string;
  tags: string[];
  examples?: CommonComponentExample[];
  code: string;
  notes: string;
  createdBy: string | null;
  createdByName: string;
  createdAt: string;
  updatedAt: string;
  canEdit: boolean;
  canDelete: boolean;
};

export function listCommonComponentTemplates(query?: {
  q?: string;
  category?: string;
  style?: string;
}): Promise<CommonComponentTemplate[]> {
  const params = new URLSearchParams();
  if (query?.q) params.set('q', query.q);
  if (query?.category) params.set('category', query.category);
  if (query?.style) params.set('style', query.style);
  const suffix = params.toString() ? `?${params.toString()}` : '';
  return apiRequest<CommonComponentTemplate[]>(`/common-component-templates${suffix}`, {
    token: getToken(),
    errorMessage: '공통 컴포넌트를 불러오지 못했습니다.',
  });
}

export function updateCommonComponentTemplate(
  id: string,
  payload: Pick<CommonComponentTemplate, 'code'>,
): Promise<CommonComponentTemplate> {
  return apiRequest<CommonComponentTemplate>(
    `/common-component-templates/${id}`,
    {
      method: 'PATCH',
      token: getToken(),
      body: payload,
      errorMessage: '공통 컴포넌트 코드를 업데이트하지 못했습니다.',
    },
  );
}

export function createCommonComponentExample(
  templateId: string,
  payload: Omit<CommonComponentExample, 'id' | 'orderIdx'>,
): Promise<CommonComponentTemplate> {
  return apiRequest<CommonComponentTemplate>(
    `/common-component-templates/${templateId}/examples`,
    {
      method: 'POST',
      token: getToken(),
      body: payload,
      errorMessage: '공통 컴포넌트 예제를 추가하지 못했습니다.',
    },
  );
}

export function updateCommonComponentExample(
  templateId: string,
  exampleId: string,
  payload: Partial<Omit<CommonComponentExample, 'id' | 'orderIdx'>>,
): Promise<CommonComponentTemplate> {
  return apiRequest<CommonComponentTemplate>(
    `/common-component-templates/${templateId}/examples/${exampleId}`,
    {
      method: 'PATCH',
      token: getToken(),
      body: payload,
      errorMessage: '공통 컴포넌트 예제를 업데이트하지 못했습니다.',
    },
  );
}
