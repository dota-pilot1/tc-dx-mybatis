import { useEffect, useMemo, useState } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { javascript as javascriptLanguage } from '@codemirror/lang-javascript';
import { oneDark } from '@codemirror/theme-one-dark';
import {
  Clipboard,
  Code2,
  Component,
  LayoutList,
  PanelRight,
  Plus,
  RotateCcw,
  Save,
  SlidersHorizontal,
  X,
} from 'lucide-react';
import {
  listCommonComponentTemplates,
  createCommonComponentExample,
  updateCommonComponentTemplate,
  updateCommonComponentExample,
  type CommonComponentProps,
  type CommonComponentExample,
  type CommonComponentPreviewKind,
  type CommonComponentTemplate,
} from '../../features/common-component/api';
import PageHeader from '../../shared/ui/PageHeader';
import Select from '../../shared/ui/Select';
import { Input } from '../../shared/ui/input';
import { SearchInput } from '../../shared/ui/search-input';
import { Textarea } from '../../shared/ui/textarea';
import { toast } from '../../shared/ui/Toast';

function javascript(options: { jsx?: boolean; typescript?: boolean; json?: boolean } = {}) {
  return javascriptLanguage({ jsx: options.jsx, typescript: options.typescript });
}

const LOCAL_TEMPLATES: CommonComponentTemplate[] = [
  {
    id: 'local-input', title: '입력 필드', summary: '라벨, 도움말, 오류 상태를 한 번에 다루는 기본 입력 컴포넌트입니다.', category: '폼', style: '기본형', previewKind: 'input', componentName: 'TextField', tags: ['form', 'input', 'validation'],
    code: `type TextFieldProps = React.InputHTMLAttributes<HTMLInputElement> & {\n  label: string;\n  hint?: string;\n  error?: string;\n};\n\nexport function TextField({ label, hint, error, id, ...props }: TextFieldProps) {\n  const inputId = id ?? label.toLowerCase().replaceAll(' ', '-');\n  return (\n    <label htmlFor={inputId} className="grid gap-1.5 text-sm font-semibold text-text-primary">\n      <span>{label}</span>\n      <input id={inputId} {...props} className="ui-input" aria-invalid={Boolean(error)} />\n      <span className={error ? 'text-destructive' : 'text-text-muted'}>{error ?? hint}</span>\n    </label>\n  );\n}`,
    notes: 'ui-input 유틸을 프로젝트 공통 스타일로 유지하면 입력 필드의 포커스/오류 상태가 함께 정리됩니다.', createdBy: null, createdByName: '샘플 카탈로그', createdAt: '', updatedAt: '', canEdit: false, canDelete: false,
  },
  {
    id: 'local-button', title: '액션 버튼', summary: '주요 행동과 보조 행동을 같은 API로 표현하는 버튼 컴포넌트입니다.', category: '액션', style: '브랜드', previewKind: 'button', componentName: 'ActionButton', tags: ['button', 'action', 'loading'],
    code: `type ActionButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & { tone?: 'brand' | 'secondary' | 'danger'; loading?: boolean };\n\nexport function ActionButton({ tone = 'brand', loading, children, ...props }: ActionButtonProps) {\n  const toneClass = { brand: 'ui-icon-button-brand px-4', secondary: 'ui-icon-button px-4', danger: 'ui-icon-button-danger px-4' }[tone];\n  return <button {...props} disabled={loading || props.disabled} className={\`inline-flex h-9 items-center justify-center gap-2 rounded-md text-sm font-bold \${toneClass}\`}>{loading ? '처리 중…' : children}</button>;\n}`,
    notes: 'tone은 색상이 아니라 의미를 기준으로 사용하고, loading 상태에서는 중복 제출을 차단합니다.', createdBy: null, createdByName: '샘플 카탈로그', createdAt: '', updatedAt: '', canEdit: false, canDelete: false,
  },
  {
    id: 'local-card', title: '정보 카드', summary: '제목, 설명, 상태 배지를 조합해 목록과 대시보드에서 재사용하는 카드입니다.', category: '콘텐츠', style: '소프트', previewKind: 'card', componentName: 'InfoCard', tags: ['card', 'dashboard', 'status'],
    code: `type InfoCardProps = { eyebrow?: string; title: string; description: string; status?: string };\n\nexport function InfoCard({ eyebrow, title, description, status }: InfoCardProps) {\n  return <article className="ui-panel-soft grid gap-3 p-4"><div className="flex items-center justify-between gap-3">{eyebrow && <span className="text-[11px] font-black uppercase tracking-[0.12em] text-brand-primary">{eyebrow}</span>}{status && <span className="rounded-full bg-brand-glass px-2 py-1 text-[11px] font-bold text-brand-primary">{status}</span>}</div><h3 className="text-base font-black text-text-primary">{title}</h3><p className="text-sm leading-6 text-text-secondary">{description}</p></article>;\n}`,
    notes: 'status 표현이 반복되면 문자열 대신 도메인 상태 타입으로 확장하세요.', createdBy: null, createdByName: '샘플 카탈로그', createdAt: '', updatedAt: '', canEdit: false, canDelete: false,
  },
  {
    id: 'local-tabs', title: '필터 / 탭', summary: '목록 상단에서 현재 분류를 전환하고 선택 상태를 명확하게 보여주는 탭입니다.', category: '내비게이션', style: '컴팩트', previewKind: 'filter-tabs', componentName: 'FilterTabs', tags: ['filter', 'tabs', 'navigation'],
    code: `type FilterTabsProps = { items: Array<{ id: string; label: string }>; value: string; onChange: (value: string) => void };\n\nexport function FilterTabs({ items, value, onChange }: FilterTabsProps) {\n  return <div role="tablist" className="flex flex-wrap gap-2">{items.map((item) => <button key={item.id} type="button" role="tab" aria-selected={value === item.id} onClick={() => onChange(item.id)} className={value === item.id ? 'rounded-full bg-brand-primary px-3 py-1.5 text-xs font-bold text-text-on-brand' : 'rounded-full border border-surface-border-soft bg-surface-raised px-3 py-1.5 text-xs font-bold text-text-secondary'}>{item.label}</button>)}</div>;\n}`,
    notes: '탭은 색상 하나로만 구분하지 않고 aria-selected와 대비되는 배경을 함께 제공합니다.', createdBy: null, createdByName: '샘플 카탈로그', createdAt: '', updatedAt: '', canEdit: false, canDelete: false,
  },
];

const KIND_LABEL: Record<CommonComponentPreviewKind, string> = {
  input: '입력', button: '액션', card: '콘텐츠', 'filter-tabs': '내비게이션',
};

const VARIANT_OPTIONS: Record<CommonComponentPreviewKind, Array<{ value: string; label: string }>> = {
  input: [{ value: 'default', label: '기본형' }, { value: 'error', label: '오류 상태' }, { value: 'disabled', label: '비활성 상태' }],
  button: [{ value: 'primary', label: '주요 액션' }, { value: 'secondary', label: '보조 액션' }, { value: 'danger', label: '위험 액션' }],
  card: [{ value: 'default', label: '기본 카드' }, { value: 'highlighted', label: '상태 강조 카드' }, { value: 'empty', label: '빈 상태 카드' }],
  'filter-tabs': [{ value: 'default', label: '전체 선택' }, { value: 'active', label: '진행 중 선택' }, { value: 'done', label: '완료 선택' }],
};

function getDefaultProps(kind: CommonComponentPreviewKind, variant: string): CommonComponentProps {
  if (kind === 'input') return {
    label: '프로젝트 이름', placeholder: '예: RocketBanchan', hint: variant === 'disabled' ? '비활성화된 입력 필드입니다.' : '화면에서 바로 입력해 볼 수 있습니다.', error: variant === 'error' ? '프로젝트 이름을 입력해주세요.' : '', disabled: variant === 'disabled',
  };
  if (kind === 'button') return {
    children: variant === 'danger' ? '삭제하기' : variant === 'secondary' ? '취소하기' : '저장하기', tone: variant === 'danger' ? 'danger' : variant === 'secondary' ? 'secondary' : 'brand', loading: false, disabled: false,
  };
  if (kind === 'card') return {
    eyebrow: 'Component', title: '주문 처리 현황', description: '반복되는 정보 묶음을 카드 하나로 정리하면 목록 화면의 밀도를 낮출 수 있습니다.', status: variant === 'highlighted' ? '주의' : '활성',
  };
  return { items: [{ id: 'all', label: '전체' }, { id: 'active', label: '진행 중' }, { id: 'done', label: '완료' }], value: variant === 'active' ? 'active' : variant === 'done' ? 'done' : 'all' };
}

function getExampleProps(template: Pick<CommonComponentTemplate, 'previewKind'>, example: Pick<CommonComponentExample, 'previewVariant' | 'props'>) {
  return { ...getDefaultProps(template.previewKind, example.previewVariant), ...(example.props ?? {}) };
}

function propsToJson(props: CommonComponentProps) {
  return JSON.stringify(props, null, 2);
}

function parsePropsJson(value: string): CommonComponentProps | null {
  try {
    const parsed: unknown = JSON.parse(value);
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed)
      ? parsed as CommonComponentProps
      : null;
  } catch {
    return null;
  }
}

function usageValue(value: unknown) {
  if (typeof value === 'string') return JSON.stringify(value);
  return `{${JSON.stringify(value)}}`;
}

function buildUsageCode(template: CommonComponentTemplate, props: CommonComponentProps) {
  const entries = Object.entries(props).filter(([name, value]) => name !== 'children' && value !== '' && value !== undefined);
  const attributes = entries.map(([name, value]) => `  ${name}=${usageValue(value)}`).join('\n');
  const children = typeof props.children === 'string' ? props.children : '';
  return children
    ? `<${template.componentName}\n${attributes}\n>${children}</${template.componentName}>`
    : `<${template.componentName}${attributes ? `\n${attributes}\n` : ''} />`;
}

function getExamples(template: CommonComponentTemplate): CommonComponentExample[] {
  if (template.examples?.length) {
    return [...template.examples].sort((a, b) => a.orderIdx - b.orderIdx);
  }
  const variants = template.previewKind === 'input'
    ? [['기본형', 'default'], ['오류 상태', 'error'], ['비활성 상태', 'disabled']]
    : template.previewKind === 'button'
      ? [['주요 액션', 'primary'], ['보조 액션', 'secondary'], ['위험 액션', 'danger']]
      : template.previewKind === 'card'
        ? [['기본 카드', 'default'], ['상태 강조 카드', 'highlighted'], ['빈 상태 카드', 'empty']]
        : [['전체 선택', 'default'], ['진행 중 선택', 'active'], ['완료 선택', 'done']];
  return variants.map(([title, previewVariant], index) => ({
    id: `${template.id}-example-${index + 1}`,
    title,
    summary: `${title} 예제`,
    previewKind: template.previewKind,
    previewVariant,
    code: template.code,
    props: getDefaultProps(template.previewKind, previewVariant),
    orderIdx: index,
  }));
}

function CommonComponentModule() {
  const [templates, setTemplates] = useState<CommonComponentTemplate[]>(LOCAL_TEMPLATES);
  const [selectedId, setSelectedId] = useState(LOCAL_TEMPLATES[0].id);
  const [selectedExampleId, setSelectedExampleId] = useState('');
  const [detailTab, setDetailTab] = useState<'preview' | 'props' | 'code'>('preview');
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('전체');
  const [style, setStyle] = useState('전체');
  const [copied, setCopied] = useState(false);
  const [usageCopied, setUsageCopied] = useState(false);
  const [draftCode, setDraftCode] = useState(LOCAL_TEMPLATES[0].code);
  const [draftProps, setDraftProps] = useState<CommonComponentProps>({});
  const [draftPropsText, setDraftPropsText] = useState('{}');
  const [saving, setSaving] = useState(false);
  const [savingProps, setSavingProps] = useState(false);
  const [loading, setLoading] = useState(true);
  const [exampleDrawerOpen, setExampleDrawerOpen] = useState(false);
  const [addingExample, setAddingExample] = useState(false);
  const [newExampleTitle, setNewExampleTitle] = useState('새 예제');
  const [newExampleSummary, setNewExampleSummary] = useState('');
  const [newExampleVariant, setNewExampleVariant] = useState('default');
  const [newExampleProps, setNewExampleProps] = useState<CommonComponentProps>({});
  const [newExamplePropsText, setNewExamplePropsText] = useState('{}');
  const [newExampleCode, setNewExampleCode] = useState('');

  useEffect(() => {
    let mounted = true;
    listCommonComponentTemplates()
      .then((data) => {
        if (!mounted || data.length === 0) return;
        setTemplates(data);
        setSelectedId(data[0].id);
      })
      .catch(() => {
        // 서버가 아직 재시작되지 않은 개발 환경에서도 카탈로그를 먼저 사용할 수 있습니다.
      })
      .finally(() => mounted && setLoading(false));
    return () => { mounted = false; };
  }, []);

  const categories = useMemo(() => ['전체', ...new Set(templates.map((item) => item.category))], [templates]);
  const styles = useMemo(() => ['전체', ...new Set(templates.map((item) => item.style))], [templates]);
  const filteredTemplates = useMemo(() => templates.filter((item) => {
    const keyword = query.trim().toLowerCase();
    const matchesQuery = !keyword || [item.title, item.summary, item.componentName, ...item.tags].join(' ').toLowerCase().includes(keyword);
    return matchesQuery && (category === '전체' || item.category === category) && (style === '전체' || item.style === style);
  }), [category, query, style, templates]);
  const selected =
    templates.find((item) => item.id === selectedId) ??
    filteredTemplates[0] ??
    templates[0];
  const examples = selected ? getExamples(selected) : [];
  const selectedExample =
    examples.find((example) => example.id === selectedExampleId) ?? examples[0];

  useEffect(() => {
    if (selected && !filteredTemplates.some((item) => item.id === selected.id)) setSelectedId(filteredTemplates[0]?.id ?? '');
  }, [filteredTemplates, selected]);

  useEffect(() => {
    if (selected) {
      setSelectedExampleId(getExamples(selected)[0]?.id ?? '');
      setDetailTab('preview');
    }
  }, [selected?.id]);

  useEffect(() => {
    if (selectedExample) {
      setDraftCode(
        localStorage.getItem(`common-component-template-draft:${selected.id}`) ?? selected.code,
      );
      const nextProps = selected ? getExampleProps(selected, selectedExample) : {};
      setDraftProps(nextProps);
      setDraftPropsText(propsToJson(nextProps));
      setCopied(false);
      setUsageCopied(false);
    }
  }, [selected?.id, selectedExample?.id]);

  function updateDraftCode(value: string) {
    setDraftCode(value);
    if (selected) localStorage.setItem(`common-component-template-draft:${selected.id}`, value);
  }

  function resetDraftCode() {
    if (!selected) return;
    localStorage.removeItem(`common-component-template-draft:${selected.id}`);
    setDraftCode(selected.code);
  }

  function resetDraftProps() {
    if (!selected || !selectedExample) return;
    const nextProps = getExampleProps(selected, selectedExample);
    setDraftProps(nextProps);
    setDraftPropsText(propsToJson(nextProps));
  }

  function updateDraftPropsText(value: string) {
    setDraftPropsText(value);
    const parsed = parsePropsJson(value);
    if (parsed) setDraftProps(parsed);
  }

  async function saveDraftCode() {
    if (!selected || !selected.canEdit || draftCode === selected.code) return;
    setSaving(true);
    try {
      const updated = await updateCommonComponentTemplate(selected.id, { code: draftCode });
      setTemplates((current) =>
        current.map((item) => (item.id === updated.id ? updated : item)),
      );
      localStorage.removeItem(`common-component-template-draft:${selected.id}`);
      setDraftCode(updated.code);
      toast.success('컴포넌트 본체 코드를 업데이트했습니다.');
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : '컴포넌트 본체 코드를 업데이트하지 못했습니다.',
      );
    } finally {
      setSaving(false);
    }
  }

  async function saveDraftProps() {
    const parsed = parsePropsJson(draftPropsText);
    if (!selected || !selectedExample || !selected.canEdit || !parsed) return;
    setSavingProps(true);
    try {
      const updated = await updateCommonComponentExample(selected.id, selectedExample.id, { props: parsed });
      setTemplates((current) => current.map((item) => (item.id === updated.id ? updated : item)));
      setDraftProps(parsed);
      setDraftPropsText(propsToJson(parsed));
      toast.success('예제 props를 업데이트했습니다.');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : '예제 props를 업데이트하지 못했습니다.');
    } finally {
      setSavingProps(false);
    }
  }

  function openExampleDrawer() {
    if (!selected || !selected.canEdit) return;
    const previewVariant = 'default';
    setNewExampleTitle('새 예제');
    setNewExampleSummary('새 상태를 확인하는 예제입니다.');
    setNewExampleVariant(previewVariant);
    const nextProps = getDefaultProps(selected.previewKind, previewVariant);
    setNewExampleProps(nextProps);
    setNewExamplePropsText(propsToJson(nextProps));
    setNewExampleCode(draftCode || selected.code);
    setExampleDrawerOpen(true);
  }

  function updateNewExamplePropsText(value: string) {
    setNewExamplePropsText(value);
    const parsed = parsePropsJson(value);
    if (parsed) setNewExampleProps(parsed);
  }

  async function addExample() {
    const parsedProps = parsePropsJson(newExamplePropsText);
    if (!selected || !selected.canEdit || !newExampleTitle.trim() || !parsedProps) return;
    setAddingExample(true);
    try {
      let sourceTemplate = selected;
      if (newExampleCode !== selected.code) {
        sourceTemplate = await updateCommonComponentTemplate(selected.id, { code: newExampleCode });
        setTemplates((current) => current.map((item) => item.id === sourceTemplate.id ? sourceTemplate : item));
        setDraftCode(sourceTemplate.code);
      }
      const updated = await createCommonComponentExample(selected.id, {
        title: newExampleTitle.trim(),
        summary: newExampleSummary.trim(),
        previewKind: selected.previewKind,
        previewVariant: newExampleVariant,
        code: newExampleCode,
        props: parsedProps,
      });
      setTemplates((current) => current.map((item) => item.id === updated.id ? updated : item));
      const nextExamples = getExamples(updated);
      setSelectedExampleId(nextExamples[nextExamples.length - 1]?.id ?? '');
      setExampleDrawerOpen(false);
      toast.success('예제를 추가했습니다.');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : '예제를 추가하지 못했습니다.');
    } finally {
      setAddingExample(false);
    }
  }

  async function copyCode() {
    if (!selected) return;
    await navigator.clipboard.writeText(draftCode);
    setCopied(true);
    toast.success('React + Tailwind 코드가 클립보드에 복사되었습니다.');
    window.setTimeout(() => setCopied(false), 1600);
  }

  async function copyUsageCode() {
    if (!selected) return;
    await navigator.clipboard.writeText(buildUsageCode(selected, draftProps));
    setUsageCopied(true);
    toast.success('컴포넌트 사용 코드가 클립보드에 복사되었습니다.');
    window.setTimeout(() => setUsageCopied(false), 1600);
  }

  return (
    <div className="flex min-w-0 flex-1 flex-col">
      <PageHeader>
        <Component className="size-4 text-brand-primary" />
        <span className="text-[14px] font-bold tracking-tight text-text-primary">공통 컴퍼넌트</span>
      </PageHeader>
      <div className="min-h-0 flex-1 bg-surface-muted p-5">
        <main className="grid h-full min-h-0 gap-4 lg:grid-cols-[minmax(230px,260px)_minmax(220px,280px)_minmax(0,1fr)]">
          <aside className="flex min-h-0 flex-col overflow-hidden rounded-md border border-surface-border bg-surface-raised shadow-sm">
            <div className="flex min-h-12 items-center justify-between gap-2 border-b border-surface-border px-4">
              <div className="flex items-center gap-2"><LayoutList className="size-4 text-brand-primary" /><h2 className="text-sm font-black text-text-primary">목록</h2></div>
              <span className="text-[11px] font-bold text-text-muted">{filteredTemplates.length}개</span>
            </div>
            <div className="grid gap-2 border-b border-surface-border-soft p-3">
              <SearchInput value={query} onChange={(event) => setQuery(event.target.value)} placeholder="컴포넌트 검색" aria-label="컴포넌트 검색" />
              <div className="flex items-center gap-2">
                <Select size="sm" block className="min-w-0 flex-1" aria-label="분류 필터" value={category} onChange={(event) => setCategory(event.target.value)}><option>전체</option>{categories.slice(1).map((item) => <option key={item}>{item}</option>)}</Select>
                <Select size="sm" block className="min-w-0 flex-1" aria-label="스타일 필터" value={style} onChange={(event) => setStyle(event.target.value)}><option>전체</option>{styles.slice(1).map((item) => <option key={item}>{item}</option>)}</Select>
              </div>
            </div>
            <div className="min-h-0 flex-1 space-y-2 overflow-y-auto p-3">
              {loading && <p className="px-2 py-3 text-xs font-semibold text-text-muted">서버 카탈로그 확인 중…</p>}
              {filteredTemplates.map((item, index) => <button key={item.id} type="button" onClick={() => setSelectedId(item.id)} className={"flex min-h-14 w-full items-center gap-3 rounded-md border px-3 text-left transition " + (selected?.id === item.id ? 'border-brand-border bg-brand-glass text-text-primary' : 'border-surface-border-soft bg-surface-muted text-text-secondary hover:border-brand-border hover:text-text-primary')}><span className="grid size-7 shrink-0 place-items-center rounded-md bg-surface-raised text-xs font-black text-brand-primary">{index + 1}</span><span className="min-w-0"><span className="block truncate text-sm font-black">{item.title}</span><span className="mt-0.5 block truncate text-[11px] font-semibold text-text-muted">{item.category} · {item.style}</span></span></button>)}
              {!filteredTemplates.length && <p className="p-5 text-center text-xs font-semibold text-text-muted">조건에 맞는 컴포넌트가 없습니다.</p>}
            </div>
          </aside>
          <aside className="flex min-h-0 flex-col overflow-hidden rounded-md border border-surface-border bg-surface-raised shadow-sm">
            <div className="flex min-h-12 items-center justify-between gap-2 border-b border-surface-border px-4">
              <div className="flex items-center gap-2"><Component className="size-4 text-brand-primary" /><h2 className="text-sm font-black text-text-primary">예제</h2></div>
              <span className="text-[11px] font-bold text-text-muted">{examples.length}개</span>
            </div>
            <div className="flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto p-3">
              {selected && examples.map((example, index) => <button key={example.id} type="button" onClick={() => { setSelectedExampleId(example.id); setDetailTab('preview'); }} className={"flex min-h-14 w-full items-center gap-3 rounded-md border px-3 text-left transition " + (selectedExample?.id === example.id ? 'border-brand-border bg-brand-glass text-text-primary' : 'border-surface-border-soft bg-surface-muted text-text-secondary hover:border-brand-border hover:text-text-primary')}><span className="grid size-7 shrink-0 place-items-center rounded-md bg-surface-raised text-xs font-black text-brand-primary">{index + 1}</span><span className="min-w-0"><span className="block truncate text-sm font-black">{example.title}</span><span className="mt-0.5 block truncate text-[11px] font-semibold text-text-muted">{example.summary}</span></span></button>)}
              {selected && <button type="button" onClick={openExampleDrawer} disabled={!selected.canEdit} className="mt-auto flex min-h-11 w-full items-center justify-center gap-1.5 rounded-md border border-dashed border-brand-border bg-brand-glass px-3 text-xs font-black text-brand-primary transition hover:bg-surface-muted disabled:cursor-not-allowed disabled:opacity-40"><Plus className="size-3.5" />예제 추가</button>}
            </div>
          </aside>
          <section className="flex min-h-0 flex-col overflow-hidden rounded-md border border-surface-border bg-surface-raised shadow-sm">
            <div className="flex min-h-12 items-center justify-between gap-3 border-b border-surface-border px-4"><div className="flex items-center gap-2"><PanelRight className="size-4 text-brand-primary" /><h2 className="text-sm font-black text-text-primary">상세</h2></div>{selected && <span className="rounded-full bg-brand-glass px-2.5 py-1 text-[11px] font-black text-brand-primary">실시간 반영</span>}</div>
            {selected && selectedExample ? <div className="min-h-0 flex-1 overflow-hidden p-4"><div className="mb-4 rounded-md border border-brand-border bg-brand-glass p-4"><div className="flex flex-wrap items-center gap-2"><span className="text-[11px] font-black uppercase tracking-[0.14em] text-brand-primary">React · Tailwind</span><span className="rounded-full bg-surface-raised px-2 py-1 text-[11px] font-bold text-text-secondary">{selected.category}</span><span className="rounded-full bg-surface-raised px-2 py-1 text-[11px] font-bold text-text-secondary">{selected.style}</span></div><h1 className="mt-2 text-xl font-black text-text-primary">{selected.title} · {selectedExample.title}</h1><p className="mt-2 max-w-3xl text-sm font-semibold leading-6 text-text-secondary">{selectedExample.summary || selected.summary}</p></div><div className="flex min-h-0 h-[calc(100%-136px)] flex-col overflow-hidden rounded-md border border-surface-border-soft bg-surface-raised"><div className="flex min-h-12 shrink-0 items-center gap-1 border-b border-surface-border-soft px-3"><button type="button" onClick={() => setDetailTab('preview')} className={"inline-flex items-center gap-1.5 rounded-md px-3 py-2 text-xs font-black transition " + (detailTab === 'preview' ? 'bg-brand-glass text-brand-primary' : 'text-text-muted hover:bg-surface-muted hover:text-text-primary')}><Component className="size-3.5" />미리보기</button><button type="button" onClick={() => setDetailTab('props')} className={"inline-flex items-center gap-1.5 rounded-md px-3 py-2 text-xs font-black transition " + (detailTab === 'props' ? 'bg-brand-glass text-brand-primary' : 'text-text-muted hover:bg-surface-muted hover:text-text-primary')}><SlidersHorizontal className="size-3.5" />Props 편집</button><button type="button" onClick={() => setDetailTab('code')} className={"inline-flex items-center gap-1.5 rounded-md px-3 py-2 text-xs font-black transition " + (detailTab === 'code' ? 'bg-brand-glass text-brand-primary' : 'text-text-muted hover:bg-surface-muted hover:text-text-primary')}><Code2 className="size-3.5" />코드 편집</button></div><div className="min-h-0 flex-1 overflow-y-auto p-4">{detailTab === 'preview' ? <PreviewPanel template={selected} example={selectedExample} code={draftCode} props={draftProps} /> : detailTab === 'props' ? <PropsPanel propsText={draftPropsText} propsValid={Boolean(parsePropsJson(draftPropsText))} saving={savingProps} canSave={selected.canEdit} onChange={updateDraftPropsText} onReset={resetDraftProps} onSave={() => void saveDraftProps()} usageCode={buildUsageCode(selected, draftProps)} usageCopied={usageCopied} onCopyUsage={() => void copyUsageCode()} /> : <CodePanel code={draftCode} copied={copied} saving={saving} canSave={selected.canEdit && draftCode !== selected.code} onChange={updateDraftCode} onReset={resetDraftCode} onSave={() => void saveDraftCode()} onCopy={() => void copyCode()} />}</div></div></div> : <div className="grid flex-1 place-items-center text-sm font-semibold text-text-muted">왼쪽 목록에서 컴포넌트와 예제를 선택하세요.</div>}
          </section>
        </main>
            {exampleDrawerOpen && selected && <ExampleCreateDrawer template={selected} title={newExampleTitle} summary={newExampleSummary} variant={newExampleVariant} props={newExampleProps} propsText={newExamplePropsText} propsValid={Boolean(parsePropsJson(newExamplePropsText))} code={newExampleCode} adding={addingExample} onTitleChange={setNewExampleTitle} onSummaryChange={setNewExampleSummary} onVariantChange={(value) => { const nextProps = getDefaultProps(selected.previewKind, value); setNewExampleVariant(value); setNewExampleProps(nextProps); setNewExamplePropsText(propsToJson(nextProps)); }} onPropsChange={updateNewExamplePropsText} onCodeChange={setNewExampleCode} onClose={() => setExampleDrawerOpen(false)} onSubmit={() => void addExample()} />}
      </div>
    </div>
  );
}

function ExampleCreateDrawer({ template, title, summary, variant, props, propsText, code, adding, propsValid, onTitleChange, onSummaryChange, onVariantChange, onPropsChange, onCodeChange, onClose, onSubmit }: { template: CommonComponentTemplate; title: string; summary: string; variant: string; props: CommonComponentProps; propsText: string; code: string; adding: boolean; propsValid: boolean; onTitleChange: (value: string) => void; onSummaryChange: (value: string) => void; onVariantChange: (value: string) => void; onPropsChange: (value: string) => void; onCodeChange: (value: string) => void; onClose: () => void; onSubmit: () => void }) {
  const [editorTab, setEditorTab] = useState<'props' | 'code'>('props');
  return <div className="fixed inset-0 z-50 flex items-center justify-center p-4"><button type="button" aria-label="예제 추가 닫기" onClick={onClose} className="absolute inset-0 cursor-default bg-[color-mix(in_srgb,var(--background)_34%,transparent)]" /><section className="relative flex h-[min(92vh,900px)] w-full max-w-6xl flex-col overflow-hidden rounded-md border border-surface-border bg-surface-raised shadow-2xl"><div className="flex min-h-14 items-center justify-between border-b border-surface-border px-5"><div><p className="text-[11px] font-black uppercase tracking-[0.12em] text-brand-primary">{template.componentName}</p><h2 className="mt-1 text-base font-black text-text-primary">예제 추가</h2></div><button type="button" onClick={onClose} className="grid size-8 place-items-center rounded-md text-text-muted hover:bg-surface-muted hover:text-text-primary"><X className="size-4" /></button></div><div className="grid min-h-0 flex-1 lg:grid-cols-[minmax(0,1.15fr)_minmax(340px,0.85fr)]"><div className="min-h-0 overflow-y-auto border-r border-surface-border p-5"><div className="grid gap-4"><div className="grid gap-4 sm:grid-cols-2"><label className="grid gap-1.5"><span className="text-xs font-black text-text-primary">예제 이름</span><Input value={title} onChange={(event) => onTitleChange(event.target.value)} autoFocus /></label><label className="grid gap-1.5"><span className="text-xs font-black text-text-primary">미리보기 상태</span><Select block value={variant} onChange={(event) => onVariantChange(event.target.value)}>{VARIANT_OPTIONS[template.previewKind].map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</Select></label></div><label className="grid gap-1.5"><span className="text-xs font-black text-text-primary">설명</span><Textarea value={summary} onChange={(event) => onSummaryChange(event.target.value)} rows={2} /></label><div className="overflow-hidden rounded-md border border-surface-border-soft"><div className="flex min-h-12 items-center gap-1 border-b border-surface-border-soft bg-surface-muted px-3"><button type="button" onClick={() => setEditorTab('props')} className={"rounded-md px-3 py-2 text-xs font-black transition " + (editorTab === 'props' ? 'bg-brand-glass text-brand-primary' : 'text-text-muted hover:text-text-primary')}>Props JSON</button><button type="button" onClick={() => setEditorTab('code')} className={"rounded-md px-3 py-2 text-xs font-black transition " + (editorTab === 'code' ? 'bg-brand-glass text-brand-primary' : 'text-text-muted hover:text-text-primary')}>코드</button><span className="ml-auto pr-2 text-[11px] font-bold text-text-muted">{editorTab === 'props' && !propsValid ? 'JSON 오류' : '저장 가능'}</span></div>{editorTab === 'props' ? <div className="p-3"><CodeMirror value={propsText} height="520px" theme={oneDark} extensions={[javascript()]} onChange={onPropsChange} basicSetup={{ lineNumbers: true, foldGutter: true, highlightActiveLine: true, bracketMatching: true, closeBrackets: true }} className="rounded-md border border-surface-border-soft text-[12px]" /></div> : <div className="p-3"><CodeMirror value={code} height="520px" theme={oneDark} extensions={[javascript({ jsx: true, typescript: true })]} onChange={onCodeChange} basicSetup={{ lineNumbers: true, foldGutter: true, highlightActiveLine: true, bracketMatching: true, closeBrackets: true }} className="rounded-md border border-surface-border-soft text-[12px]" /></div>}</div></div></div><div className="min-h-0 overflow-y-auto bg-surface-muted p-5"><div className="grid gap-4"><div><h3 className="text-sm font-black text-text-primary">미리보기</h3><p className="mt-1 text-xs font-semibold text-text-muted">Props와 코드를 수정하면 즉시 반영됩니다.</p></div><div className="rounded-md border border-surface-border-soft bg-surface-raised p-5"><RenderedComponent kind={template.previewKind} variant={variant} code={code} props={props} /></div><div className="rounded-md border border-surface-border-soft bg-surface-raised p-4"><h3 className="text-sm font-black text-text-primary">사용 코드</h3><p className="mt-1 text-xs font-semibold text-text-muted">현재 Props 기준으로 생성됩니다.</p><pre className="mt-3 overflow-x-auto rounded-md bg-surface-muted p-3 text-[11px] leading-5 text-text-secondary">{buildUsageCode(template, props)}</pre></div></div></div></div><div className="flex items-center justify-end gap-2 border-t border-surface-border px-5 py-4"><button type="button" onClick={onClose} className="rounded-md border border-surface-border-soft bg-surface-muted px-4 py-2 text-xs font-black text-text-secondary hover:text-text-primary">취소</button><button type="button" onClick={onSubmit} disabled={adding || !title.trim() || !code.trim() || !propsValid} className="inline-flex items-center gap-1.5 rounded-md border border-brand-border bg-brand-glass px-4 py-2 text-xs font-black text-brand-primary hover:bg-surface-muted disabled:cursor-not-allowed disabled:opacity-40">{adding ? '추가 중…' : '예제 추가'}</button></div></section></div>;
}

function PreviewPanel({ template, example, code, props }: { template: CommonComponentTemplate; example: CommonComponentExample; code: string; props: CommonComponentProps }) {
  return <div className="grid gap-4"><div className="flex items-center justify-between"><div><h3 className="text-sm font-black text-text-primary">미리보기</h3><p className="mt-1 text-xs font-semibold text-text-muted">{template.componentName} · {KIND_LABEL[template.previewKind]} · {example.title}</p></div><span className="rounded-full bg-brand-glass px-2.5 py-1 text-[11px] font-black text-brand-primary">실시간</span></div><div className="rounded-md border border-surface-border-soft bg-surface-muted p-5"><RenderedComponent kind={template.previewKind} variant={example.previewVariant} code={code} props={props} /></div><div className="rounded-md border border-surface-border-soft bg-surface-raised p-4"><div className="flex items-center justify-between gap-2"><div><h4 className="text-xs font-black text-text-primary">사용 코드</h4><p className="mt-1 text-[11px] font-semibold text-text-muted">현재 예제 props로 생성된 JSX입니다.</p></div></div><pre className="mt-3 overflow-x-auto rounded-md bg-surface-muted p-3 text-[11px] leading-5 text-text-secondary">{buildUsageCode(template, props)}</pre></div></div>;
}

function PropsPanel({ propsText, propsValid, saving, canSave, onChange, onReset, onSave, usageCode, usageCopied, onCopyUsage }: { propsText: string; propsValid: boolean; saving: boolean; canSave: boolean; onChange: (value: string) => void; onReset: () => void; onSave: () => void; usageCode: string; usageCopied: boolean; onCopyUsage: () => void }) {
  return <div className="grid gap-4"><div className="flex items-center justify-between gap-2"><div><h3 className="text-sm font-black text-text-primary">Props JSON 편집</h3><p className="mt-1 text-xs font-semibold text-text-muted">원문 JSON을 수정하고 저장합니다. 중첩 객체와 배열도 그대로 보존됩니다.</p></div><div className="flex shrink-0 items-center gap-1.5"><button type="button" onClick={onReset} className="inline-flex items-center gap-1.5 rounded-md border border-surface-border-soft bg-surface-muted px-3 py-2 text-xs font-black text-text-secondary hover:border-brand-border hover:text-brand-primary"><RotateCcw className="size-3.5" />초기화</button><button type="button" onClick={onSave} disabled={!canSave || saving || !propsValid} className="inline-flex items-center gap-1.5 rounded-md border border-brand-border bg-brand-glass px-3 py-2 text-xs font-black text-brand-primary transition hover:bg-surface-muted disabled:cursor-not-allowed disabled:opacity-40"><Save className="size-3.5" />{saving ? '저장 중…' : 'Props 저장'}</button></div></div><div className="rounded-md border border-surface-border-soft bg-[color-mix(in_srgb,var(--background)_84%,var(--foreground))]"><div className="flex items-center justify-between border-b border-surface-border-soft px-3 py-2"><span className="text-[11px] font-bold text-text-muted">JSON object</span>{!propsValid && <span className="text-[11px] font-black text-destructive">JSON 형식을 확인하세요.</span>}</div><CodeMirror value={propsText} height="430px" theme={oneDark} extensions={[javascript({ json: true })]} onChange={onChange} basicSetup={{ lineNumbers: true, foldGutter: true, highlightActiveLine: true, bracketMatching: true, closeBrackets: true }} className="text-[12px]" /></div><div className="rounded-md border border-surface-border-soft bg-surface-muted p-4"><div className="flex items-center justify-between gap-2"><div><h4 className="text-xs font-black text-text-primary">사용 코드</h4><p className="mt-1 text-[11px] font-semibold text-text-muted">Props에서 자동 생성됩니다.</p></div><button type="button" onClick={onCopyUsage} className="inline-flex items-center gap-1.5 rounded-md border border-surface-border-soft bg-surface-raised px-3 py-2 text-xs font-black text-text-secondary hover:border-brand-border hover:text-brand-primary"><Clipboard className="size-3.5" />{usageCopied ? '복사됨' : '사용 코드 복사'}</button></div><pre className="mt-3 overflow-x-auto rounded-md border border-surface-border-soft bg-surface-raised p-3 text-[11px] leading-5 text-text-secondary">{usageCode}</pre></div></div>;
}

function extractClassNames(code: string) {
  const classNames = [...code.matchAll(/className\s*=\s*(?:"([^"]+)"|'([^']+)'|\{`([^`]+)`\}|\{["']([^"']+)["']\})/g)]
    .map((match) => match.slice(1).find(Boolean) ?? '')
    .map((value) => value.replace(/\$\{toneClass\}/g, 'ui-icon-button-brand px-4').replace(/\s+/g, ' ').trim())
    .filter(Boolean);
  return classNames;
}

function RenderedComponent({ kind, variant, code, props }: { kind: CommonComponentPreviewKind; variant: string; code: string; props: CommonComponentProps }) {
  const [tab, setTab] = useState(variant === 'active' ? 'active' : variant === 'done' ? 'done' : 'all');
  const [value, setValue] = useState('');
  const classNames = extractClassNames(code);
  if (kind === 'input') {
    const label = typeof props.label === 'string' ? props.label : '프로젝트 이름';
    const placeholder = typeof props.placeholder === 'string' ? props.placeholder : '예: RocketBanchan';
    const hint = typeof props.hint === 'string' ? props.hint : '화면에서 바로 입력해 볼 수 있습니다.';
    const error = typeof props.error === 'string' ? props.error : '';
    const disabled = props.disabled === true || variant === 'disabled';
    return <div className="mx-auto max-w-md"><label className={classNames[0] ?? 'grid gap-1.5 text-sm font-semibold text-text-primary'}><span>{label}</span><input disabled={disabled} value={value} onChange={(event) => setValue(event.target.value)} placeholder={placeholder} className={(error || variant === 'error' ? `${classNames[1] ?? 'ui-input'} border-destructive` : classNames[1] ?? 'ui-input')} /><span className={error || variant === 'error' ? 'text-destructive' : 'text-text-muted'}>{error || (disabled ? '비활성화된 입력 필드입니다.' : hint)}</span></label></div>;
  }
  if (kind === 'button') {
    const buttonClass = classNames.find((item) => item.includes('inline-flex')) ?? 'inline-flex h-10 items-center justify-center gap-2 rounded-md text-sm font-bold ui-icon-button-brand px-4';
    const tone = typeof props.tone === 'string' ? props.tone : variant === 'danger' ? 'danger' : variant === 'secondary' ? 'secondary' : 'brand';
    const toneClass = tone === 'danger' ? 'ui-icon-button-danger' : tone === 'secondary' ? 'ui-icon-button' : buttonClass;
    const label = typeof props.children === 'string' ? props.children : '저장하기';
    const loading = props.loading === true;
    const disabled = props.disabled === true || loading;
    return <div className="flex flex-wrap items-center justify-center gap-2"><button type="button" disabled={disabled} className={toneClass} onClick={() => toast.success(`${label} 액션을 눌렀습니다.`)}>{loading ? '처리 중…' : label}</button></div>;
  }
  if (kind === 'filter-tabs') {
    const activeClass = code.match(/['"]([^'"]*bg-brand-primary[^'"]*)['"]/)?.[1] ?? 'rounded-full bg-brand-primary px-3 py-1.5 text-xs font-bold text-text-on-brand';
    const inactiveClass = code.match(/['"]([^'"]*border-surface-border-soft[^'"]*)['"]/)?.[1] ?? 'rounded-full border border-surface-border-soft bg-surface-raised px-3 py-1.5 text-xs font-bold text-text-secondary';
    const items = Array.isArray(props.items) ? props.items.filter((item): item is { id: string; label: string } => typeof item === 'object' && item !== null && typeof item.id === 'string' && typeof item.label === 'string') : [{ id: 'all', label: '전체' }, { id: 'active', label: '진행 중' }, { id: 'done', label: '완료' }];
    const selectedValue = typeof props.value === 'string' ? props.value : tab;
    return <div className="flex flex-wrap justify-center gap-2">{items.map((item) => <button key={item.id} type="button" onClick={() => setTab(item.id)} className={selectedValue === item.id ? activeClass : inactiveClass}>{item.label}</button>)}</div>;
  }
  const cardClass = classNames.find((item) => item.includes('ui-panel-soft')) ?? 'ui-panel-soft grid gap-3 p-4';
  if (variant === 'empty') return <article className={cardClass}><span className="text-[11px] font-black uppercase tracking-[0.12em] text-brand-primary">Empty state</span><h3 className="text-base font-black text-text-primary">아직 주문이 없습니다.</h3><p className="text-sm leading-6 text-text-secondary">첫 주문이 생성되면 이 영역에 정보가 표시됩니다.</p></article>;
  const eyebrow = typeof props.eyebrow === 'string' ? props.eyebrow : 'Component';
  const title = typeof props.title === 'string' ? props.title : '주문 처리 현황';
  const description = typeof props.description === 'string' ? props.description : '반복되는 정보 묶음을 카드 하나로 정리하면 목록 화면의 밀도를 낮출 수 있습니다.';
  const status = typeof props.status === 'string' ? props.status : variant === 'highlighted' ? '주의' : '활성';
  return <article className={cardClass}><div className="flex items-center justify-between gap-3"><span className="text-[11px] font-black uppercase tracking-[0.12em] text-brand-primary">{eyebrow}</span><span className="rounded-full bg-brand-glass px-2 py-1 text-[11px] font-bold text-brand-primary">{status}</span></div><h3 className="text-base font-black text-text-primary">{title}</h3><p className="text-sm leading-6 text-text-secondary">{description}</p></article>;
}

function CodePanel({ code, copied, saving, canSave, onChange, onReset, onSave, onCopy }: { code: string; copied: boolean; saving: boolean; canSave: boolean; onChange: (value: string) => void; onReset: () => void; onSave: () => void; onCopy: () => void }) {
  return <div className="flex min-h-full flex-col gap-3"><div className="flex items-center justify-between gap-2"><div><h3 className="text-sm font-black text-text-primary">컴포넌트 본체 코드</h3><p className="mt-1 text-xs font-semibold text-text-muted">모든 예제가 이 본체 코드를 기준으로 렌더링됩니다.</p></div><div className="flex shrink-0 items-center gap-1.5"><button type="button" onClick={onReset} title="원본 코드로 되돌리기" className="grid size-8 place-items-center rounded-md border border-surface-border-soft text-text-muted hover:bg-surface-muted hover:text-text-primary"><RotateCcw className="size-3.5" /></button><button type="button" onClick={onCopy} className="inline-flex items-center gap-1.5 rounded-md border border-surface-border-soft bg-surface-muted px-3 py-2 text-xs font-black text-text-secondary hover:border-brand-border hover:text-brand-primary"><Clipboard className="size-3.5" />{copied ? '복사됨' : '복사'}</button><button type="button" onClick={onSave} disabled={!canSave || saving} className="inline-flex items-center gap-1.5 rounded-md border border-brand-border bg-brand-glass px-3 py-2 text-xs font-black text-brand-primary transition hover:bg-surface-muted disabled:cursor-not-allowed disabled:opacity-40"><Save className="size-3.5" />{saving ? '업데이트 중…' : '업데이트'}</button></div></div><div className="min-h-[420px] flex-1 overflow-hidden rounded-md border border-surface-border-soft bg-[color-mix(in_srgb,var(--background)_84%,var(--foreground))]"><CodeMirror value={code} height="100%" minHeight="420px" theme={oneDark} extensions={[javascript({ jsx: true, typescript: true })]} onChange={onChange} basicSetup={{ lineNumbers: true, foldGutter: true, highlightActiveLine: true, bracketMatching: true, closeBrackets: true }} className="h-full text-[12px]" /></div></div>;
}

export default CommonComponentModule;
