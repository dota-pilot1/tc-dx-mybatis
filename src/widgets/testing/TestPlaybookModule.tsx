import { ArrowDown, ArrowUp, CircleHelp, FileText, FlaskConical, Pencil, Plus, RefreshCw, Save, Trash2, X } from "lucide-react";
import { useEffect, useState } from "react";
import PageHeader from "../../shared/ui/PageHeader";
import { LexicalEditor } from "../../shared/ui/lexical/lexical-editor";
import {
  createTestPlaybookCategory,
  createTestPlaybookContent,
  createTestPlaybookDocument,
  deleteTestPlaybookCategory,
  deleteTestPlaybookContent,
  deleteTestPlaybookDocument,
  listTestPlaybook,
  moveTestPlaybookContent,
  updateTestPlaybookCategory,
  updateTestPlaybookContent,
  updateTestPlaybookDocument,
  type TestPlaybookCategory,
  type TestPlaybookContent,
  type TestPlaybookDocument,
} from "../../features/test-playbook/api";

type TitleDialogState = { kind: "category" | "document"; mode: "create" | "edit" | "delete"; target?: TestPlaybookCategory | TestPlaybookDocument };
type ContentDialogState = { mode: "create" | "edit" | "delete"; target?: TestPlaybookContent };

function TestPlaybookModule() {
  const [categories, setCategories] = useState<TestPlaybookCategory[]>([]);
  const [categoryId, setCategoryId] = useState("");
  const [documentId, setDocumentId] = useState("");
  const [contentId, setContentId] = useState("");
  const [titleDialog, setTitleDialog] = useState<TitleDialogState | null>(null);
  const [contentDialog, setContentDialog] = useState<ContentDialogState | null>(null);
  const [detailContent, setDetailContent] = useState<TestPlaybookContent | null>(null);
  const [helpOpen, setHelpOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [contentTitle, setContentTitle] = useState("");
  const [contentBody, setContentBody] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const category = categories.find((item) => item.id === categoryId) ?? categories[0];
  const documents = category?.documents ?? [];
  const document = documents.find((item) => item.id === documentId) ?? documents[0];
  const contents = document?.contents ?? [];
  const selectedContent = contents.find((item) => item.id === contentId) ?? contents[0];

  async function load(nextCategoryId?: string, nextDocumentId?: string, nextContentId?: string) {
    try {
      const items = await listTestPlaybook();
      const nextCategory = items.find((item) => item.id === nextCategoryId) ?? items[0];
      const nextDocument = nextCategory?.documents.find((item) => item.id === nextDocumentId) ?? nextCategory?.documents[0];
      const nextContent = nextDocument?.contents.find((item) => item.id === nextContentId) ?? nextDocument?.contents[0];
      setCategories(items);
      setCategoryId(nextCategory?.id ?? "");
      setDocumentId(nextDocument?.id ?? "");
      setContentId(nextContent?.id ?? "");
      setError("");
    } catch (reason: unknown) {
      setError(reason instanceof Error ? reason.message : "테스트 플레이북을 불러오지 못했습니다.");
    }
  }

  useEffect(() => { void load(); }, []);

  function selectCategory(next: TestPlaybookCategory) {
    const nextDocument = next.documents[0];
    setCategoryId(next.id);
    setDocumentId(nextDocument?.id ?? "");
    setContentId(nextDocument?.contents[0]?.id ?? "");
  }

  function selectDocument(next: TestPlaybookDocument) {
    setDocumentId(next.id);
    setContentId(next.contents[0]?.id ?? "");
  }

  function openTitleDialog(state: TitleDialogState) {
    setTitleDialog(state);
    setTitle(state.target?.title ?? "");
  }

  function openContentDialog(state: ContentDialogState) {
    setContentDialog(state);
    setContentTitle(state.target?.title ?? "");
    setContentBody(state.target?.content ?? "");
  }

  async function saveTitleDialog() {
    if (!titleDialog || !title.trim()) return;
    setBusy(true);
    try {
      if (titleDialog.kind === "category") {
        const next = titleDialog.mode === "edit" && titleDialog.target && "documents" in titleDialog.target
          ? await updateTestPlaybookCategory(titleDialog.target.id, title.trim())
          : await createTestPlaybookCategory(title.trim());
        await load(next?.id ?? category?.id);
      } else if (titleDialog.mode === "edit" && titleDialog.target && "categoryId" in titleDialog.target) {
        const next = await updateTestPlaybookDocument(titleDialog.target.id, { title: title.trim() });
        await load(next?.id ?? category?.id, titleDialog.target.id);
      } else if (category) {
        const next = await createTestPlaybookDocument(category.id, { title: title.trim(), summary: "", content: "", steps: [], githubUrl: "", reviewNotes: "", status: "draft" });
        const created = next?.documents.find((item) => item.title === title.trim());
        await load(category.id, created?.id);
      }
      setTitleDialog(null);
    } catch (reason: unknown) {
      setError(reason instanceof Error ? reason.message : "저장하지 못했습니다.");
    } finally {
      setBusy(false);
    }
  }

  async function deleteTitleDialog() {
    if (!titleDialog?.target) return;
    setBusy(true);
    try {
      if (titleDialog.kind === "category" && "documents" in titleDialog.target) await deleteTestPlaybookCategory(titleDialog.target.id);
      if (titleDialog.kind === "document" && "categoryId" in titleDialog.target) await deleteTestPlaybookDocument(titleDialog.target.id);
      await load(category?.id);
      setTitleDialog(null);
    } catch (reason: unknown) {
      setError(reason instanceof Error ? reason.message : "삭제하지 못했습니다.");
    } finally {
      setBusy(false);
    }
  }

  async function saveContentDialog() {
    if (!contentDialog || !contentTitle.trim() || !document) return;
    setBusy(true);
    try {
      if (contentDialog.mode === "edit" && contentDialog.target) {
        const next = await updateTestPlaybookContent(contentDialog.target.id, { title: contentTitle.trim(), content: contentBody });
        await load(next?.id ?? category?.id, document.id, contentDialog.target.id);
      } else {
        const next = await createTestPlaybookContent(document.id, { title: contentTitle.trim(), content: contentBody });
        const createdDocument = next?.documents.find((item) => item.id === document.id);
        const created = createdDocument?.contents.find((item) => item.title === contentTitle.trim());
        await load(category?.id, document.id, created?.id);
      }
      setContentDialog(null);
    } catch (reason: unknown) {
      setError(reason instanceof Error ? reason.message : "Lexical 문서를 저장하지 못했습니다.");
    } finally {
      setBusy(false);
    }
  }

  async function deleteContentDialog() {
    if (!contentDialog?.target) return;
    setBusy(true);
    try {
      await deleteTestPlaybookContent(contentDialog.target.id);
      await load(category?.id, document?.id);
      setContentDialog(null);
    } catch (reason: unknown) {
      setError(reason instanceof Error ? reason.message : "Lexical 문서를 삭제하지 못했습니다.");
    } finally {
      setBusy(false);
    }
  }

  async function moveContent(item: TestPlaybookContent, direction: "up" | "down") {
    setBusy(true);
    try {
      await moveTestPlaybookContent(item.id, direction);
      await load(category?.id, document?.id, item.id);
    } catch (reason: unknown) {
      setError(reason instanceof Error ? reason.message : "문서 순서를 바꾸지 못했습니다.");
    } finally {
      setBusy(false);
    }
  }

  return <div className="flex min-w-0 flex-1 flex-col">
    <PageHeader><FlaskConical className="size-4 text-brand-primary" /><span className="text-[14px] font-bold tracking-tight text-text-primary">테스트 플레이북</span><button type="button" onClick={() => setHelpOpen(true)} className="ui-icon-button ml-2 h-7 w-7" title="사용 방법"><CircleHelp className="size-4" /></button></PageHeader>
    <div className="min-h-0 flex-1 overflow-y-auto bg-surface-muted p-5">
      {error && <div className="mx-auto mb-4 max-w-[1600px] rounded-md border border-[var(--destructive)] bg-danger-glass px-4 py-3 text-xs font-bold text-[var(--destructive)]">{error}</div>}
      <main className="mx-auto grid min-h-[720px] w-full max-w-[1600px] gap-4 xl:grid-cols-[320px_420px_minmax(0,1fr)]">
        <CategoryPanel categories={categories} selected={category} onSelect={selectCategory} onAdd={() => openTitleDialog({ kind: "category", mode: "create" })} onEdit={(item) => openTitleDialog({ kind: "category", mode: "edit", target: item })} onDelete={(item) => openTitleDialog({ kind: "category", mode: "delete", target: item })} />
        <DocumentPanel documents={documents} selected={document} onSelect={selectDocument} onAdd={category ? () => openTitleDialog({ kind: "document", mode: "create" }) : undefined} onEdit={(item) => openTitleDialog({ kind: "document", mode: "edit", target: item })} onDelete={(item) => openTitleDialog({ kind: "document", mode: "delete", target: item })} />
        <section className="flex min-h-0 flex-col rounded-md border border-surface-border bg-surface-raised shadow-sm">
          {document ? <><header className="flex items-center justify-between gap-3 border-b border-surface-border px-5 py-4"><div className="min-w-0"><p className="truncate text-[10px] font-black uppercase tracking-[0.14em] text-brand-primary">{category?.title} &gt; {document.title}</p><h1 className="mt-1 truncate text-lg font-black text-text-primary">{document.title}</h1></div><button type="button" onClick={() => void load(category?.id, document.id, selectedContent?.id)} className="ui-icon-button h-9 w-9" title="새로고침"><RefreshCw className="size-4" /></button></header><div className="min-h-0 flex-1 overflow-y-auto p-5"><section className="overflow-hidden rounded-md border border-surface-border-soft"><div className="flex items-center justify-between gap-3 border-b border-surface-border-soft bg-surface-muted px-4 py-3"><h2 className="text-sm font-black text-text-primary">문서 목록</h2><button type="button" onClick={() => openContentDialog({ mode: "create" })} className="inline-flex items-center gap-1 text-xs font-black text-brand-primary"><Plus className="size-3.5" />문서 추가</button></div>{contents.length ? <div className="divide-y divide-[var(--surface-border-soft)]">{contents.map((item, index) => <div key={item.id} className={`flex items-center gap-2 px-4 py-3 ${item.id === selectedContent?.id ? "bg-brand-glass" : "bg-surface-raised"}`}><button type="button" onClick={() => { setContentId(item.id); setDetailContent(item); }} className="flex min-w-0 flex-1 items-center gap-2 text-left"><FileText className="size-4 shrink-0 text-brand-primary" /><span className="min-w-0 flex-1 truncate text-sm font-black text-text-primary">{item.title}</span></button><div className="flex shrink-0 items-center gap-1"><button type="button" onClick={() => void moveContent(item, "up")} disabled={busy || index === 0} className="ui-icon-button h-7 w-7 disabled:opacity-30" title="위로 이동"><ArrowUp className="size-3.5" /></button><button type="button" onClick={() => void moveContent(item, "down")} disabled={busy || index === contents.length - 1} className="ui-icon-button h-7 w-7 disabled:opacity-30" title="아래로 이동"><ArrowDown className="size-3.5" /></button><button type="button" onClick={() => openContentDialog({ mode: "edit", target: item })} className="ui-icon-button h-7 w-7" title="문서 수정"><Pencil className="size-3.5" /></button><button type="button" onClick={() => openContentDialog({ mode: "delete", target: item })} className="ui-icon-button h-7 w-7 shrink-0 text-[var(--destructive)]" title="문서 삭제"><Trash2 className="size-3.5" /></button></div></div>)}</div> : <div className="grid min-h-48 place-items-center text-sm font-semibold text-text-muted">문서를 추가하세요.</div>}</section></div></> : <div className="grid min-h-[500px] place-items-center"><button type="button" onClick={() => openTitleDialog({ kind: "document", mode: "create" })} className="inline-flex items-center gap-2 rounded-md border border-brand-border bg-brand-glass px-3 py-2 text-sm font-black text-brand-primary"><Plus className="size-4" />2차 문서 추가</button></div>}
        </section>
      </main>
    </div>
    {titleDialog && <TitleDialog state={titleDialog} title={title} busy={busy} onTitleChange={setTitle} onClose={() => setTitleDialog(null)} onSave={saveTitleDialog} onDelete={deleteTitleDialog} />}
    {contentDialog && <ContentDialog state={contentDialog} title={contentTitle} content={contentBody} busy={busy} onTitleChange={setContentTitle} onContentChange={setContentBody} onClose={() => setContentDialog(null)} onSave={saveContentDialog} onDelete={deleteContentDialog} />}
    {detailContent && <ContentDetailDialog content={detailContent} onClose={() => setDetailContent(null)} onEdit={() => { setDetailContent(null); openContentDialog({ mode: "edit", target: detailContent }); }} />}
    {helpOpen && <HelpDialog onClose={() => setHelpOpen(false)} />}
  </div>;
}

function CategoryPanel({ categories, selected, onSelect, onAdd, onEdit, onDelete }: { categories: TestPlaybookCategory[]; selected?: TestPlaybookCategory; onSelect: (item: TestPlaybookCategory) => void; onAdd: () => void; onEdit: (item: TestPlaybookCategory) => void; onDelete: (item: TestPlaybookCategory) => void }) { return <aside className="flex min-h-0 flex-col rounded-md border border-surface-border bg-surface-raised shadow-sm"><PanelHeader title="1차 테스트 영역" count={categories.length} onAdd={onAdd} /><div className="min-h-0 flex-1 space-y-2 overflow-y-auto p-3">{categories.map((item) => <div key={item.id} className={`flex items-center gap-1 rounded-md p-2 ${item.id === selected?.id ? "bg-brand-glass" : "bg-surface-muted"}`}><button type="button" onClick={() => onSelect(item)} className="min-w-0 flex-1 truncate p-1 text-left text-sm font-black text-text-primary">{item.title}</button><button type="button" onClick={() => onEdit(item)} className="ui-icon-button h-8 w-8 shrink-0" title="영역 수정"><Pencil className="size-3.5" /></button><button type="button" onClick={() => onDelete(item)} className="ui-icon-button h-8 w-8 shrink-0 text-[var(--destructive)]" title="영역 삭제"><Trash2 className="size-3.5" /></button></div>)}</div></aside>; }
function DocumentPanel({ documents, selected, onSelect, onAdd, onEdit, onDelete }: { documents: TestPlaybookDocument[]; selected?: TestPlaybookDocument; onSelect: (item: TestPlaybookDocument) => void; onAdd?: () => void; onEdit: (item: TestPlaybookDocument) => void; onDelete: (item: TestPlaybookDocument) => void }) { return <aside className="flex min-h-0 flex-col rounded-md border border-surface-border bg-surface-raised shadow-sm"><PanelHeader title="2차 테스트 주제" count={documents.length} onAdd={onAdd} /><div className="min-h-0 flex-1 overflow-y-auto p-3"><div className="space-y-1.5">{documents.map((item) => <div key={item.id} className={`flex items-center gap-1 rounded-md border px-2 py-1.5 ${item.id === selected?.id ? "border-brand-border bg-brand-glass" : "border-transparent bg-surface-muted"}`}><button type="button" onClick={() => onSelect(item)} className="flex min-w-0 flex-1 items-center gap-2 p-1 text-left"><FileText className="size-3.5 shrink-0 text-brand-primary" /><span className="min-w-0 flex-1 truncate text-[12px] font-black text-text-primary">{item.title}</span></button><button type="button" onClick={() => onEdit(item)} className="ui-icon-button h-7 w-7 shrink-0" title="주제 수정"><Pencil className="size-3.5" /></button><button type="button" onClick={() => onDelete(item)} className="ui-icon-button h-7 w-7 shrink-0 text-[var(--destructive)]" title="주제 삭제"><Trash2 className="size-3.5" /></button></div>)}</div></div></aside>; }
function PanelHeader({ title, count, onAdd }: { title: string; count: number; onAdd?: () => void }) { return <div className="flex min-h-12 items-center justify-between gap-3 border-b border-surface-border px-4"><h2 className="text-sm font-black text-text-primary">{title}</h2><div className="flex items-center gap-2"><span className="grid size-7 place-items-center rounded-md bg-surface-muted text-[11px] font-black text-text-muted">{count}</span>{onAdd && <button type="button" onClick={onAdd} className="grid size-7 place-items-center rounded-md border border-brand-border bg-brand-glass text-brand-primary" title={`${title} 추가`}><Plus className="size-4" /></button>}</div></div>; }

function TitleDialog({ state, title, busy, onTitleChange, onClose, onSave, onDelete }: { state: TitleDialogState; title: string; busy: boolean; onTitleChange: (value: string) => void; onClose: () => void; onSave: () => void; onDelete: () => void }) { const deleting = state.mode === "delete"; const label = state.kind === "category" ? "테스트 영역" : "2차 테스트 주제"; return <div className="fixed inset-0 z-40 grid place-items-center bg-[color-mix(in_srgb,var(--background)_72%,transparent)] p-4"><div className="w-full max-w-md rounded-xl border border-surface-border bg-surface-raised p-5 shadow-2xl"><div className="flex items-center justify-between"><h2 className="text-lg font-black text-text-primary">{deleting ? `${label} 삭제` : `${label} ${state.mode === "create" ? "추가" : "수정"}`}</h2><button type="button" onClick={onClose} className="ui-icon-button h-8 w-8 rounded-full"><X className="size-4" /></button></div>{deleting ? <p className="mt-5 text-sm font-semibold text-text-secondary">이 항목을 삭제할까요?</p> : <label className="mt-5 block text-xs font-black text-text-secondary">제목<input value={title} onChange={(event) => onTitleChange(event.target.value)} className="ui-input mt-1 h-10 text-sm" autoFocus /></label>}<DialogActions busy={busy} deleting={deleting} onClose={onClose} onSave={deleting ? onDelete : onSave} /></div></div>; }
function ContentDialog({ state, title, content, busy, onTitleChange, onContentChange, onClose, onSave, onDelete }: { state: ContentDialogState; title: string; content: string; busy: boolean; onTitleChange: (value: string) => void; onContentChange: (value: string) => void; onClose: () => void; onSave: () => void; onDelete: () => void }) { const deleting = state.mode === "delete"; return <div className="fixed inset-0 z-40 grid place-items-center bg-[color-mix(in_srgb,var(--background)_72%,transparent)] p-4"><div className="w-full max-w-3xl rounded-xl border border-surface-border bg-surface-raised p-5 shadow-2xl"><div className="flex items-center justify-between"><h2 className="text-lg font-black text-text-primary">{deleting ? "Lexical 문서 삭제" : `Lexical 문서 ${state.mode === "create" ? "추가" : "수정"}`}</h2><button type="button" onClick={onClose} className="ui-icon-button h-8 w-8 rounded-full"><X className="size-4" /></button></div>{deleting ? <p className="mt-5 text-sm font-semibold text-text-secondary">이 문서를 삭제할까요?</p> : <><label className="mt-5 block text-xs font-black text-text-secondary">문서 제목<input value={title} onChange={(event) => onTitleChange(event.target.value)} className="ui-input mt-1 h-10 text-sm" autoFocus /></label><div className="mt-4 overflow-hidden rounded-md border border-surface-border-soft"><div className="border-b border-surface-border-soft bg-surface-muted px-4 py-3"><h3 className="text-sm font-black text-text-primary">본문</h3></div><div className="p-3"><LexicalEditor initialState={content} onChange={onContentChange} minHeight="420px" /></div></div></>}<DialogActions busy={busy} deleting={deleting} onClose={onClose} onSave={deleting ? onDelete : onSave} /></div></div>; }
function DialogActions({ busy, deleting, onClose, onSave }: { busy: boolean; deleting: boolean; onClose: () => void; onSave: () => void }) { return <div className="mt-5 flex justify-end gap-2"><button type="button" onClick={onClose} className="rounded-md px-3 py-2 text-xs font-black text-text-secondary">취소</button><button type="button" onClick={onSave} disabled={busy} className={`inline-flex items-center gap-1.5 rounded-md px-3 py-2 text-xs font-black text-text-on-brand ${deleting ? "bg-[var(--destructive)]" : "bg-brand-primary"}`}>{deleting ? <Trash2 className="size-3.5" /> : <Save className="size-3.5" />}{deleting ? "삭제" : "저장"}</button></div>; }
function HelpDialog({ onClose }: { onClose: () => void }) { return <div className="fixed inset-0 z-40 grid place-items-center bg-[color-mix(in_srgb,var(--background)_72%,transparent)] p-4"><div className="w-full max-w-md rounded-xl border border-surface-border bg-surface-raised p-5 shadow-2xl"><div className="flex items-center justify-between"><h2 className="text-lg font-black text-text-primary">테스트 플레이북</h2><button type="button" onClick={onClose} className="ui-icon-button h-8 w-8 rounded-full"><X className="size-4" /></button></div><div className="mt-5 space-y-3 text-sm font-semibold leading-6 text-text-secondary"><p>1차 영역 아래에 2차 테스트 주제를 만들고, 주제마다 여러 Lexical 문서를 추가합니다.</p><p>개발 환경 설정부터 테스트 실행과 결과까지 문서별로 자유롭게 작성합니다.</p></div><div className="mt-5 flex justify-end"><button type="button" onClick={onClose} className="rounded-md bg-brand-primary px-3 py-2 text-xs font-black text-text-on-brand">확인</button></div></div></div>; }

function ContentDetailDialog({ content, onClose, onEdit }: { content: TestPlaybookContent; onClose: () => void; onEdit: () => void }) { return <div className="fixed inset-0 z-40 grid place-items-center bg-[color-mix(in_srgb,var(--background)_72%,transparent)] p-4"><div className="flex max-h-[90vh] w-full max-w-4xl flex-col rounded-xl border border-surface-border bg-surface-raised p-5 shadow-2xl"><div className="flex items-center justify-between gap-3"><h2 className="truncate text-lg font-black text-text-primary">{content.title}</h2><button type="button" onClick={onClose} className="ui-icon-button h-8 w-8 rounded-full" title="닫기"><X className="size-4" /></button></div><div className="mt-4 min-h-0 overflow-y-auto rounded-md border border-surface-border-soft p-3"><LexicalEditor key={content.id} initialState={content.content} onChange={() => undefined} readOnly minHeight="480px" /></div><div className="mt-4 flex justify-end gap-2"><button type="button" onClick={onClose} className="rounded-md px-3 py-2 text-xs font-black text-text-secondary">닫기</button><button type="button" onClick={onEdit} className="inline-flex items-center gap-1.5 rounded-md bg-brand-primary px-3 py-2 text-xs font-black text-text-on-brand"><Pencil className="size-3.5" />수정</button></div></div></div>; }

export default TestPlaybookModule;
