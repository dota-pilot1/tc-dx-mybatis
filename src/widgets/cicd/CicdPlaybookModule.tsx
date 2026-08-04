import { Check, CircleHelp, CloudCog, FileText, Pencil, Plus, RefreshCw, Save, Trash2, X } from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import { LexicalEditor } from "../../shared/ui/lexical/lexical-editor";
import PageHeader from "../../shared/ui/PageHeader";
import DocumentDrawer from "../../shared/ui/DocumentDrawer";
import OrderControls from "../../shared/ui/OrderControls";
import {
  createCicdCategory, createCicdDocument, createCicdTopic, deleteCicdCategory, deleteCicdDocument, deleteCicdTopic,
  listCicdPlaybook, moveCicdDocument, updateCicdCategory, updateCicdDocument, updateCicdTopic,
  type CicdPlaybookCategory, type CicdPlaybookDocument, type CicdPlaybookTopic,
} from "../../features/cicd-playbook/api";

type TitleTarget = CicdPlaybookCategory | CicdPlaybookTopic;
type DocumentDialog = { mode: "create" | "edit" | "delete"; target?: CicdPlaybookDocument };

function CicdPlaybookModule() {
  const [categories, setCategories] = useState<CicdPlaybookCategory[]>([]);
  const [categoryId, setCategoryId] = useState("");
  const [topicId, setTopicId] = useState("");
  const [documentId, setDocumentId] = useState("");
  const [documentDialog, setDocumentDialog] = useState<DocumentDialog | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{ kind: "category" | "topic"; target: TitleTarget } | null>(null);
  const [detail, setDetail] = useState<{ id: string; title: string; content: string } | null>(null);
  const [helpOpen, setHelpOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [draft, setDraft] = useState({ category: "", topic: "" });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const category = categories.find((item) => item.id === categoryId) ?? categories[0];
  const topics = category?.topics ?? [];
  const topic = topics.find((item) => item.id === topicId) ?? topics[0];
  const documents = topic?.documents ?? [];
  const document = documents.find((item) => item.id === documentId) ?? documents[0];

  async function load(nextCategoryId?: string, nextTopicId?: string, nextDocumentId?: string) {
    try {
      const items = await listCicdPlaybook();
      const nextCategory = items.find((item) => item.id === nextCategoryId) ?? items[0];
      const nextTopic = nextCategory?.topics.find((item) => item.id === nextTopicId) ?? nextCategory?.topics[0];
      const nextDocument = nextTopic?.documents.find((item) => item.id === nextDocumentId) ?? nextTopic?.documents[0];
      setCategories(items); setCategoryId(nextCategory?.id ?? ""); setTopicId(nextTopic?.id ?? ""); setDocumentId(nextDocument?.id ?? ""); setError("");
    } catch (reason: unknown) { setError(reason instanceof Error ? reason.message : "CI/CD 플레이북을 불러오지 못했습니다."); }
  }
  useEffect(() => { void load(); }, []);

  function openDocumentDialog(state: DocumentDialog) { setDocumentDialog(state); setTitle(state.target?.title ?? ""); setBody(state.target?.content ?? ""); }
  async function createInline(kind: "category" | "topic") {
    const nextTitle = draft[kind].trim(); if (!nextTitle || (kind === "topic" && !category)) return; setBusy(true);
    try {
      if (kind === "category") { const next = await createCicdCategory(nextTitle); setDraft((current) => ({ ...current, category: "" })); await load(next?.id ?? category?.id); }
      else if (category) { const next = await createCicdTopic(category.id, nextTitle); const created = next?.topics.find((item) => item.title === nextTitle); setDraft((current) => ({ ...current, topic: "" })); await load(category.id, created?.id ?? topic?.id); }
    } catch (reason: unknown) { setError(reason instanceof Error ? reason.message : "추가하지 못했습니다."); } finally { setBusy(false); }
  }
  async function saveTitle(target: TitleTarget, kind: "category" | "topic", nextTitle: string) {
    if (!nextTitle.trim() || busy) return; setBusy(true);
    try { if (kind === "category") await updateCicdCategory(target.id, nextTitle.trim()); else await updateCicdTopic(target.id, nextTitle.trim()); await load(category?.id, topic?.id, document?.id); }
    catch (reason: unknown) { setError(reason instanceof Error ? reason.message : "저장하지 못했습니다."); throw reason; } finally { setBusy(false); }
  }
  async function saveDocumentTitle(target: CicdPlaybookDocument, nextTitle: string) {
    if (!nextTitle.trim() || busy) return; setBusy(true);
    try { await updateCicdDocument(target.id, { title: nextTitle.trim() }); setDetail((current) => current?.id === target.id ? { ...current, title: nextTitle.trim() } : current); await load(category?.id, topic?.id, target.id); }
    catch (reason: unknown) { setError(reason instanceof Error ? reason.message : "문서 제목을 저장하지 못했습니다."); throw reason; } finally { setBusy(false); }
  }
  async function deleteTitle() {
    if (!deleteTarget) return; setBusy(true);
    try { if (deleteTarget.kind === "category") await deleteCicdCategory(deleteTarget.target.id); else await deleteCicdTopic(deleteTarget.target.id); await load(category?.id); setDeleteTarget(null); }
    catch (reason: unknown) { setError(reason instanceof Error ? reason.message : "삭제하지 못했습니다."); } finally { setBusy(false); }
  }
  async function saveDocument() {
    if (!documentDialog || !title.trim() || !topic) return; setBusy(true);
    try { if (documentDialog.mode === "edit" && documentDialog.target) await updateCicdDocument(documentDialog.target.id, { title: title.trim(), content: body }); else await createCicdDocument(topic.id, { title: title.trim(), content: body }); await load(category?.id, topic.id, documentDialog.target?.id); setDocumentDialog(null); }
    catch (reason: unknown) { setError(reason instanceof Error ? reason.message : "Lexical 문서를 저장하지 못했습니다."); } finally { setBusy(false); }
  }
  async function deleteDocument() {
    if (!documentDialog?.target) return; setBusy(true);
    try { await deleteCicdDocument(documentDialog.target.id); await load(category?.id, topic?.id); setDocumentDialog(null); setDetail(null); }
    catch (reason: unknown) { setError(reason instanceof Error ? reason.message : "Lexical 문서를 삭제하지 못했습니다."); } finally { setBusy(false); }
  }
  async function moveDocument(item: CicdPlaybookDocument, direction: "up" | "down") {
    setBusy(true); try { await moveCicdDocument(item.id, direction); await load(category?.id, topic?.id, item.id); } catch (reason: unknown) { setError(reason instanceof Error ? reason.message : "문서 순서를 바꾸지 못했습니다."); } finally { setBusy(false); }
  }

  return <div className="flex min-w-0 flex-1 flex-col">
    <PageHeader><CloudCog className="size-4 text-brand-primary" /><span className="text-[14px] font-bold tracking-tight text-text-primary">CI/CD Playbook</span><button type="button" onClick={() => setHelpOpen(true)} className="ui-icon-button ml-2 h-7 w-7" title="사용 방법"><CircleHelp className="size-4" /></button></PageHeader>
    <div className="min-h-0 flex-1 overflow-y-auto bg-surface-muted p-5">
      {error && <div className="mx-auto mb-4 max-w-[1600px] rounded-md border border-[var(--destructive)] bg-danger-glass px-4 py-3 text-xs font-bold text-[var(--destructive)]">{error}</div>}
      <main className="mx-auto grid min-h-[720px] w-full max-w-[1600px] gap-1 xl:grid-cols-[minmax(280px,400px)_minmax(280px,400px)_minmax(0,1fr)]">
        <Panel title="1차 CI/CD 영역" count={categories.length} placeholder="새 CI/CD 영역" draft={draft.category} onDraftChange={(value) => setDraft((current) => ({ ...current, category: value }))} onSubmit={() => void createInline("category")}>
          {categories.map((item) => <TitleRow key={item.id} title={item.title} active={item.id === category?.id} busy={busy} onClick={() => void load(item.id)} onSave={(value) => saveTitle(item, "category", value)} onDelete={() => setDeleteTarget({ kind: "category", target: item })} />)}
        </Panel>
        <Panel title="2차 CI/CD 주제" count={topics.length} placeholder="새 CI/CD 주제" draft={draft.topic} onDraftChange={(value) => setDraft((current) => ({ ...current, topic: value }))} onSubmit={category ? () => void createInline("topic") : undefined}>
          {topics.map((item) => <TitleRow key={item.id} title={item.title} active={item.id === topic?.id} busy={busy} icon onClick={() => void load(category?.id, item.id)} onSave={(value) => saveTitle(item, "topic", value)} onDelete={() => setDeleteTarget({ kind: "topic", target: item })} />)}
        </Panel>
        <section className="flex min-h-0 flex-col rounded-md border border-surface-border bg-surface-raised shadow-sm">
          <header className="flex items-center justify-between gap-3 border-b border-surface-border px-5 py-4"><div className="min-w-0"><p className="truncate text-[10px] font-black uppercase tracking-[0.14em] text-brand-primary">{category?.title ?? "CI/CD 영역"} &gt; {topic?.title ?? "CI/CD 주제"}</p><h1 className="mt-1 truncate text-lg font-black text-text-primary">{topic?.title ?? "주제를 선택하세요"}</h1></div><div className="flex shrink-0 items-center gap-2">{topic && <button type="button" onClick={() => openDocumentDialog({ mode: "create" })} className="inline-flex h-9 items-center gap-1.5 rounded-md border border-brand-border bg-brand-glass px-3 text-xs font-black text-brand-primary"><Plus className="size-3.5" />문서 추가</button>}<button type="button" onClick={() => void load(category?.id, topic?.id, document?.id)} className="ui-icon-button h-9 w-9" title="새로고침"><RefreshCw className="size-4" /></button></div></header>
          <div className="min-h-0 flex-1 overflow-y-auto p-5">{documents.length ? <div className="space-y-2">{documents.map((item, index) => <DocumentRow key={item.id} item={item} index={index} total={documents.length} active={item.id === document?.id} busy={busy} onOpen={() => { setDocumentId(item.id); setDetail(item); }} onSave={(value) => saveDocumentTitle(item, value)} onDelete={() => openDocumentDialog({ mode: "delete", target: item })} onMove={(direction) => void moveDocument(item, direction)} />)}</div> : <div className="grid min-h-48 place-items-center text-sm font-semibold text-text-muted">Lexical 문서를 추가하세요.</div>}</div>
        </section>
      </main>
    </div>
    {deleteTarget && <DialogFrame title={`${deleteTarget.kind === "category" ? "CI/CD 영역" : "CI/CD 주제"} 삭제`} onClose={() => setDeleteTarget(null)}><p className="text-sm font-semibold text-text-secondary">이 항목을 삭제할까요?</p><Actions busy={busy} deleting onClose={() => setDeleteTarget(null)} onSave={() => void deleteTitle()} /></DialogFrame>}
    {documentDialog && <DocumentDialog state={documentDialog} title={title} body={body} busy={busy} onTitle={setTitle} onBody={setBody} onClose={() => setDocumentDialog(null)} onSave={documentDialog.mode === "delete" ? deleteDocument : saveDocument} />}
    {detail && <DocumentDrawer document={detail} previous={documents[documents.findIndex((item) => item.id === detail.id) - 1]} next={documents[documents.findIndex((item) => item.id === detail.id) + 1]} onNavigate={(nextDocument) => { setDocumentId(nextDocument.id); setDetail(nextDocument); }} onClose={() => setDetail(null)} />}
    {helpOpen && <DialogFrame title="CI/CD Playbook" onClose={() => setHelpOpen(false)}><p className="text-sm font-semibold leading-6 text-text-secondary">소스, 빌드, 테스트, 릴리즈, 배포, 검증과 롤백 절차를 1차 영역과 2차 주제 아래 Lexical 문서로 정리합니다.</p></DialogFrame>}
  </div>;
}

function Panel({ title, count, placeholder, draft, onDraftChange, onSubmit, children }: { title: string; count: number; placeholder: string; draft: string; onDraftChange: (value: string) => void; onSubmit?: () => void; children: ReactNode }) { const [adding, setAdding] = useState(false); function close() { onDraftChange(""); setAdding(false); } function submit() { if (!draft.trim() || !onSubmit) return; onSubmit(); setAdding(false); } return <aside className="flex min-h-0 flex-col rounded-md border border-surface-border bg-surface-raised shadow-sm"><div className="flex min-h-12 items-center justify-between gap-3 border-b border-surface-border px-4"><h2 className="text-sm font-black text-text-primary">{title}</h2><div className="flex items-center gap-2"><span className="grid size-7 place-items-center rounded-md bg-surface-muted text-[11px] font-black text-text-muted">{count}</span>{onSubmit && <button type="button" onClick={() => setAdding((current) => !current)} className="grid size-7 place-items-center rounded-md border border-brand-border bg-brand-glass text-brand-primary" title={adding ? "추가 닫기" : `${title} 추가`}>{adding ? <X className="size-4" /> : <Plus className="size-4" />}</button>}</div></div><div className="min-h-0 flex-1 space-y-2 overflow-y-auto p-3">{children}{adding && onSubmit && <div className="flex gap-2 rounded-md border border-dashed border-brand-border bg-brand-glass p-2"><input value={draft} onChange={(event) => onDraftChange(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter") submit(); if (event.key === "Escape") close(); }} placeholder={placeholder} className="ui-input h-9 min-w-0 flex-1 bg-surface-raised text-xs" autoFocus /><button type="button" onClick={submit} disabled={!draft.trim()} className="grid size-9 shrink-0 place-items-center rounded-md border border-brand-border bg-brand-glass text-brand-primary disabled:opacity-40"><Check className="size-4" /></button><button type="button" onClick={close} className="ui-icon-button h-9 w-9 shrink-0"><X className="size-4" /></button></div>}</div></aside>; }

function TitleRow({ title, active, icon, busy, onClick, onSave, onDelete, extraActions }: { title: string; active?: boolean; icon?: boolean; busy: boolean; onClick: () => void; onSave: (value: string) => Promise<void>; onDelete: () => void; extraActions?: ReactNode }) { const [editing, setEditing] = useState(false); const [draft, setDraft] = useState(title); const [saving, setSaving] = useState(false); useEffect(() => { if (!editing) setDraft(title); }, [editing, title]); async function submit() { const value = draft.trim(); if (!value || saving || busy) return; if (value === title) { setEditing(false); return; } setSaving(true); try { await onSave(value); setEditing(false); } catch { /* 상위에서 오류를 표시한다. */ } finally { setSaving(false); } } return <div className={`flex items-center gap-1 rounded-md p-2 ${active ? "bg-brand-glass" : "bg-surface-muted"}`}>{editing ? <div className="flex min-w-0 flex-1 gap-1"><input value={draft} onChange={(event) => setDraft(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter") void submit(); if (event.key === "Escape") setEditing(false); }} className="ui-input h-8 min-w-0 flex-1 text-sm font-bold" autoFocus /><button type="button" onClick={() => void submit()} className="ui-icon-button h-8 w-8"><Check className="size-3.5" /></button></div> : <><button type="button" onClick={onClick} className="flex min-w-0 flex-1 items-center gap-2 p-1 text-left">{icon && <FileText className="size-3.5 shrink-0 text-brand-primary" />}<span className="truncate text-sm font-black text-text-primary">{title}</span></button>{extraActions}<button type="button" onClick={() => setEditing(true)} disabled={busy} className="ui-icon-button h-8 w-8"><Pencil className="size-3.5" /></button><button type="button" onClick={onDelete} disabled={busy} className="ui-icon-button h-8 w-8 text-[var(--destructive)]"><Trash2 className="size-3.5" /></button></>}</div>; }

function DocumentRow({ item, index, total, active, busy, onOpen, onSave, onDelete, onMove }: { item: CicdPlaybookDocument; index: number; total: number; active: boolean; busy: boolean; onOpen: () => void; onSave: (value: string) => Promise<void>; onDelete: () => void; onMove: (direction: "up" | "down") => void }) { return <TitleRow title={item.title} active={active} icon busy={busy} onClick={onOpen} onSave={onSave} onDelete={onDelete} extraActions={<OrderControls itemLabel={item.title} busy={busy} upDisabled={index === 0} downDisabled={index === total - 1} onMoveUp={() => onMove("up")} onMoveDown={() => onMove("down")} />} />; }

function DocumentDialog({ state, title, body, busy, onTitle, onBody, onClose, onSave }: { state: DocumentDialog; title: string; body: string; busy: boolean; onTitle: (value: string) => void; onBody: (value: string) => void; onClose: () => void; onSave: () => void }) { const deleting = state.mode === "delete"; return <DialogFrame title={deleting ? "Lexical 문서 삭제" : `Lexical 문서 ${state.mode === "create" ? "추가" : "수정"}`} onClose={onClose}>{deleting ? <p className="text-sm font-semibold text-text-secondary">이 문서를 삭제할까요?</p> : <><label className="block text-xs font-black text-text-secondary">문서 제목<input value={title} onChange={(event) => onTitle(event.target.value)} className="ui-input mt-1 h-10 text-sm" autoFocus /></label><div className="mt-4 overflow-hidden rounded-md border border-surface-border-soft"><div className="border-b border-surface-border-soft bg-surface-muted px-4 py-3"><h3 className="text-sm font-black text-text-primary">본문</h3></div><div className="p-3"><LexicalEditor initialState={body} onChange={onBody} minHeight="420px" /></div></div></>}<Actions busy={busy} deleting={deleting} onClose={onClose} onSave={onSave} /></DialogFrame>; }
function Actions({ busy, deleting, onClose, onSave }: { busy: boolean; deleting: boolean; onClose: () => void; onSave: () => void }) { return <div className="mt-5 flex justify-end gap-2"><button type="button" onClick={onClose} className="rounded-md px-3 py-2 text-xs font-black text-text-secondary">취소</button><button type="button" onClick={onSave} disabled={busy} className={`inline-flex items-center gap-1.5 rounded-md px-3 py-2 text-xs font-black text-text-on-brand ${deleting ? "bg-[var(--destructive)]" : "bg-brand-primary"}`}>{deleting ? <Trash2 className="size-3.5" /> : <Save className="size-3.5" />}{deleting ? "삭제" : "저장"}</button></div>; }
function DialogFrame({ title, onClose, children }: { title: string; onClose: () => void; children: ReactNode }) { return <div className="fixed inset-0 z-40 grid place-items-center bg-[color-mix(in_srgb,var(--background)_72%,transparent)] p-4"><div className="w-full max-w-3xl rounded-xl border border-surface-border bg-surface-raised p-5 shadow-2xl"><div className="flex items-center justify-between"><h2 className="text-lg font-black text-text-primary">{title}</h2><button type="button" onClick={onClose} className="ui-icon-button h-8 w-8 rounded-full"><X className="size-4" /></button></div><div className="mt-5">{children}</div></div></div>; }

export default CicdPlaybookModule;
