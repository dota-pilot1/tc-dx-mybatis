import { useEffect, useRef, useState, type ChangeEvent, type ReactNode } from "react";
import { openUrl } from "@tauri-apps/plugin-opener";
import {
  ArrowDown,
  ArrowUp,
  Check,
  Download,
  FileSpreadsheet,
  FolderKanban,
  FolderOpen,
  Loader2,
  Pencil,
  Plus,
  RefreshCw,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import PageHeader from "../../shared/ui/PageHeader";
import { toast } from "../../shared/ui/Toast";
import { useAppSettingsStore } from "../../shared/lib/app-settings-store";
import { useColumnResize } from "../../shared/lib/useColumnResize";
import { uploadApiExcelFile, apiExcelApi } from "../../features/api-excel/api";
import type { ApiExcelFile, ApiExcelProject } from "../../features/api-excel/types";

type Props = { isAdmin: boolean };
type TitleDialog = {
  kind: "project" | "category";
  mode: "edit" | "delete";
  id: string;
  name: string;
};

const INPUT_CLASS =
  "ui-input h-9 min-w-0 flex-1 bg-surface-raised text-xs";

function getErrorMessage(reason: unknown, fallback: string) {
  return reason instanceof Error ? reason.message : fallback;
}

function formatBytes(bytes: number) {
  if (!bytes) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  const unit = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  return `${(bytes / 1024 ** unit).toFixed(unit === 0 ? 0 : 1)} ${units[unit]}`;
}

function ApiExcelModule({ isAdmin }: Props) {
  const [projects, setProjects] = useState<ApiExcelProject[]>([]);
  const [projectId, setProjectId] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [drafts, setDrafts] = useState({ project: "", category: "" });
  const [adding, setAdding] = useState<"project" | "category" | null>(null);
  const [dialog, setDialog] = useState<TitleDialog | null>(null);
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const projectWidth = useAppSettingsStore((state) => state.apiExcelProjectWidth);
  const categoryWidth = useAppSettingsStore((state) => state.apiExcelCategoryWidth);
  const setProjectWidth = useAppSettingsStore((state) => state.setApiExcelProjectWidth);
  const setCategoryWidth = useAppSettingsStore((state) => state.setApiExcelCategoryWidth);
  const onProjectResizeStart = useColumnResize(projectWidth, setProjectWidth, { min: 220, max: 480 });
  const onCategoryResizeStart = useColumnResize(categoryWidth, setCategoryWidth, { min: 240, max: 520 });

  const project = projects.find((item) => item.id === projectId) ?? projects[0];
  const categories = project?.categories ?? [];
  const category = categories.find((item) => item.id === categoryId) ?? categories[0];
  const files = category?.files ?? [];

  async function load(nextProjectId?: string, nextCategoryId?: string) {
    setLoading(true);
    try {
      const items = await apiExcelApi.list();
      const nextProject = items.find((item) => item.id === nextProjectId) ?? items[0];
      const nextCategory = nextProject?.categories.find((item) => item.id === nextCategoryId) ?? nextProject?.categories[0];
      setProjects(items);
      setProjectId(nextProject?.id ?? "");
      setCategoryId(nextCategory?.id ?? "");
      setError("");
    } catch (reason: unknown) {
      const message = getErrorMessage(reason, "Excel 문서를 불러오지 못했습니다.");
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  async function createTitle(kind: "project" | "category") {
    const name = drafts[kind].trim();
    if (!name || (kind === "category" && !project)) return;
    setBusy(true);
    try {
      if (kind === "project") {
        await apiExcelApi.createProject(name);
        setDrafts((current) => ({ ...current, project: "" }));
        await load();
      } else if (project) {
        await apiExcelApi.createCategory(project.id, name);
        setDrafts((current) => ({ ...current, category: "" }));
        await load(project.id);
      }
      setAdding(null);
      toast.success(`${kind === "project" ? "프로젝트" : "2차 분류"}를 추가했습니다.`);
    } catch (reason: unknown) {
      toast.error(getErrorMessage(reason, "추가하지 못했습니다."));
    } finally {
      setBusy(false);
    }
  }

  function openTitleDialog(next: TitleDialog) {
    setDialog(next);
  }

  async function saveTitleDialog() {
    if (!dialog) return;
    if (dialog.mode === "edit" && !dialog.name.trim()) return;
    setBusy(true);
    try {
      if (dialog.mode === "edit") {
        if (dialog.kind === "project") await apiExcelApi.updateProject(dialog.id, dialog.name.trim());
        else await apiExcelApi.updateCategory(dialog.id, dialog.name.trim());
        toast.success("이름을 수정했습니다.");
      } else if (dialog.kind === "project") {
        await apiExcelApi.deleteProject(dialog.id);
        toast.success("프로젝트를 삭제했습니다.");
      } else {
        await apiExcelApi.deleteCategory(dialog.id);
        toast.success("2차 분류를 삭제했습니다.");
      }
      await load(project?.id, category?.id);
      setDialog(null);
    } catch (reason: unknown) {
      toast.error(getErrorMessage(reason, "저장하지 못했습니다."));
    } finally {
      setBusy(false);
    }
  }

  async function handleUpload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file || !category) return;
    setBusy(true);
    try {
      await uploadApiExcelFile(file, category.id);
      await load(project?.id, category.id);
      toast.success(`${file.name}을(를) 추가했습니다.`);
    } catch (reason: unknown) {
      toast.error(getErrorMessage(reason, "Excel 파일을 추가하지 못했습니다."));
    } finally {
      setBusy(false);
    }
  }

  async function deleteFile(file: ApiExcelFile) {
    if (!window.confirm(`${file.name}을(를) 목록에서 삭제할까요?`)) return;
    setBusy(true);
    try {
      await apiExcelApi.deleteFile(file.id);
      await load(project?.id, category?.id);
      toast.success("Excel 파일을 삭제했습니다.");
    } catch (reason: unknown) {
      toast.error(getErrorMessage(reason, "파일을 삭제하지 못했습니다."));
    } finally {
      setBusy(false);
    }
  }

  async function moveFile(file: ApiExcelFile, direction: "up" | "down") {
    setBusy(true);
    try {
      await apiExcelApi.reorderFile(file.id, direction);
      await load(project?.id, category?.id);
    } catch (reason: unknown) {
      toast.error(getErrorMessage(reason, "파일 순서를 바꾸지 못했습니다."));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex min-w-0 flex-1 flex-col">
      <PageHeader>
        <FileSpreadsheet className="size-4 text-brand-primary" />
        <span className="text-[14px] font-bold tracking-tight text-text-primary">API Excel 문서</span>
      </PageHeader>

      <div className="min-h-0 flex-1 overflow-y-auto bg-surface-muted p-5">
        {error && (
          <div className="mx-auto mb-4 max-w-[1600px] rounded-md border border-[var(--destructive)] bg-danger-glass px-4 py-3 text-xs font-bold text-[var(--destructive)]">
            {error}
          </div>
        )}
        <main className="mx-auto flex min-h-[720px] w-full max-w-[1600px] gap-4">
          <Panel
            width={projectWidth}
            onResizeStart={onProjectResizeStart}
            title="1차 프로젝트"
            count={projects.length}
            adding={adding === "project"}
            draft={drafts.project}
            placeholder="프로젝트 이름"
            disabled={!isAdmin || busy}
            onToggle={() => setAdding((current) => (current === "project" ? null : "project"))}
            onDraft={(value) => setDrafts((current) => ({ ...current, project: value }))}
            onSubmit={() => void createTitle("project")}
            onCancel={() => setAdding(null)}
          >
            {loading ? <LoadingState /> : projects.length === 0 ? <EmptyState text="프로젝트를 추가하세요." /> : projects.map((item) => (
              <TitleRow
                key={item.id}
                title={item.name}
                active={item.id === project?.id}
                icon={<FolderKanban className="size-4 shrink-0 text-brand-primary" />}
                onClick={() => void load(item.id)}
                onEdit={isAdmin ? () => openTitleDialog({ kind: "project", mode: "edit", id: item.id, name: item.name }) : undefined}
                onDelete={isAdmin ? () => openTitleDialog({ kind: "project", mode: "delete", id: item.id, name: item.name }) : undefined}
              />
            ))}
          </Panel>

          <Panel
            width={categoryWidth}
            onResizeStart={onCategoryResizeStart}
            title="2차 API 분류"
            count={categories.length}
            adding={adding === "category"}
            draft={drafts.category}
            placeholder="서비스 또는 기능명"
            disabled={!isAdmin || busy || !project}
            onToggle={() => setAdding((current) => (current === "category" ? null : "category"))}
            onDraft={(value) => setDrafts((current) => ({ ...current, category: value }))}
            onSubmit={() => void createTitle("category")}
            onCancel={() => setAdding(null)}
          >
            {!project ? <EmptyState text="먼저 1차 프로젝트를 추가하세요." /> : loading ? <LoadingState /> : categories.length === 0 ? <EmptyState text="2차 분류를 추가하세요." /> : categories.map((item) => (
              <TitleRow
                key={item.id}
                title={item.name}
                active={item.id === category?.id}
                icon={<FolderOpen className="size-4 shrink-0 text-brand-primary" />}
                onClick={() => void load(project.id, item.id)}
                onEdit={isAdmin ? () => openTitleDialog({ kind: "category", mode: "edit", id: item.id, name: item.name }) : undefined}
                onDelete={isAdmin ? () => openTitleDialog({ kind: "category", mode: "delete", id: item.id, name: item.name }) : undefined}
              />
            ))}
          </Panel>

          <section className="flex min-h-0 flex-col rounded-md border border-surface-border bg-surface-raised shadow-sm">
            <header className="flex items-center justify-between gap-3 border-b border-surface-border px-5 py-4">
              <div className="min-w-0">
                <p className="truncate text-[10px] font-black uppercase tracking-[0.14em] text-brand-primary">
                  {project?.name ?? "프로젝트"} &gt; {category?.name ?? "2차 분류"}
                </p>
                <h1 className="mt-1 truncate text-lg font-black text-text-primary">Excel 문서 목록</h1>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <button type="button" onClick={() => void load(project?.id, category?.id)} className="ui-icon-button h-9 w-9" title="새로고침" disabled={loading || busy}>
                  <RefreshCw className={`size-4 ${loading ? "animate-spin" : ""}`} />
                </button>
                {isAdmin && (
                  <>
                    <input ref={fileInputRef} type="file" accept=".xlsx,.xls,.csv" className="hidden" onChange={(event) => void handleUpload(event)} />
                    <button type="button" disabled={!category || busy} onClick={() => fileInputRef.current?.click()} className="inline-flex h-9 items-center gap-1.5 rounded-md border border-brand-border bg-brand-glass px-3 text-xs font-black text-brand-primary transition hover:brightness-95 disabled:pointer-events-none disabled:opacity-40">
                      <Upload className="size-3.5" />Excel 추가
                    </button>
                  </>
                )}
              </div>
            </header>
            <div className="min-h-0 flex-1 overflow-y-auto p-5">
              {!category ? <div className="grid min-h-48 place-items-center text-sm font-semibold text-text-muted">2차 분류를 선택하세요.</div> : files.length === 0 ? <div className="grid min-h-48 place-items-center rounded-md border border-dashed border-surface-border-soft text-sm font-semibold text-text-muted">Excel 파일을 추가하세요.</div> : <div className="overflow-hidden rounded-md border border-surface-border-soft divide-y divide-[var(--surface-border-soft)]">
                {files.map((file, index) => <FileRow key={file.id} file={file} index={index} total={files.length} busy={busy} isAdmin={isAdmin} onOpen={() => void openUrl(file.publicUrl)} onMove={(direction) => void moveFile(file, direction)} onDelete={() => void deleteFile(file)} />)}
              </div>}
            </div>
          </section>
        </main>
      </div>

      {dialog && <TitleDialog state={dialog} busy={busy} onName={(name) => setDialog((current) => current ? { ...current, name } : current)} onClose={() => setDialog(null)} onSave={() => void saveTitleDialog()} />}
    </div>
  );
}

function Panel({ title, count, adding, draft, placeholder, disabled, onToggle, onDraft, onSubmit, onCancel, width, onResizeStart, children }: { title: string; count: number; adding: boolean; draft: string; placeholder: string; disabled: boolean; onToggle: () => void; onDraft: (value: string) => void; onSubmit: () => void; onCancel: () => void; width: number; onResizeStart: (event: React.MouseEvent) => void; children: ReactNode }) {
  function submit() {
    if (draft.trim()) onSubmit();
  }
  return <aside style={{ width }} className="relative flex min-h-0 shrink-0 flex-col rounded-md border border-surface-border bg-surface-raised shadow-sm">
    <div onMouseDown={onResizeStart} className="absolute -right-2 top-0 z-10 h-full w-1 cursor-col-resize rounded-full bg-transparent transition-colors hover:bg-brand-border active:bg-brand-border" title="패널 넓이 조절" />
    <div className="flex min-h-12 items-center justify-between gap-3 border-b border-surface-border px-4">
      <h2 className="text-sm font-black text-text-primary">{title}</h2>
      <div className="flex items-center gap-2"><span className="grid size-7 place-items-center rounded-md bg-surface-muted text-[11px] font-black text-text-muted">{count}</span>{<button type="button" onClick={onToggle} disabled={disabled} className="grid size-7 place-items-center rounded-md border border-brand-border bg-brand-glass text-brand-primary disabled:opacity-40" title={adding ? "추가 닫기" : `${title} 추가`}>{adding ? <X className="size-4" /> : <Plus className="size-4" />}</button>}</div>
    </div>
    <div className="min-h-0 flex-1 space-y-2 overflow-y-auto p-3">
      {children}
      {adding && <div className="flex gap-2 rounded-md border border-dashed border-brand-border bg-brand-glass p-2"><input value={draft} onChange={(event) => onDraft(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter") submit(); if (event.key === "Escape") onCancel(); }} placeholder={placeholder} className={INPUT_CLASS} autoFocus /><button type="button" onClick={submit} disabled={!draft.trim() || disabled} className="grid size-9 shrink-0 place-items-center rounded-md border border-brand-border bg-brand-glass text-brand-primary disabled:opacity-40" title="저장"><Check className="size-4" /></button><button type="button" onClick={onCancel} className="ui-icon-button h-9 w-9 shrink-0" title="취소"><X className="size-4" /></button></div>}
    </div>
  </aside>;
}

function TitleRow({ title, icon, active, onClick, onEdit, onDelete }: { title: string; icon: ReactNode; active: boolean; onClick: () => void; onEdit?: () => void; onDelete?: () => void }) {
  return <div className={`flex items-center gap-1 rounded-md p-2 ${active ? "bg-brand-glass" : "bg-surface-muted"}`}><button type="button" onClick={onClick} className="flex min-w-0 flex-1 items-center gap-2 p-1 text-left"><span>{icon}</span><span className="truncate text-sm font-black text-text-primary">{title}</span></button>{onEdit && <button type="button" onClick={onEdit} className="ui-icon-button h-8 w-8 shrink-0" title="수정"><Pencil className="size-3.5" /></button>}{onDelete && <button type="button" onClick={onDelete} className="ui-icon-button h-8 w-8 shrink-0 text-[var(--destructive)]" title="삭제"><Trash2 className="size-3.5" /></button>}</div>;
}

function FileRow({ file, index, total, busy, isAdmin, onOpen, onMove, onDelete }: { file: ApiExcelFile; index: number; total: number; busy: boolean; isAdmin: boolean; onOpen: () => void; onMove: (direction: "up" | "down") => void; onDelete: () => void }) {
  return <div className="flex items-center gap-3 bg-surface-raised px-4 py-3 transition hover:bg-brand-glass/50"><button type="button" onClick={onOpen} className="flex min-w-0 flex-1 items-center gap-3 text-left"><span className="grid size-9 shrink-0 place-items-center rounded-md bg-brand-glass text-brand-primary"><FileSpreadsheet className="size-5" /></span><span className="min-w-0"><span className="block truncate text-sm font-black text-text-primary">{file.name}</span><span className="mt-1 block text-[11px] font-semibold text-text-muted">v{file.version} · 시트 {file.sheetCount} · API {file.apiCount} · {formatBytes(file.sizeBytes)}</span></span></button><button type="button" onClick={onOpen} className="ui-icon-button h-8 w-8" title="파일 열기"><Download className="size-3.5" /></button>{isAdmin && <><button type="button" disabled={busy || index === 0} onClick={() => onMove("up")} className="ui-icon-button h-8 w-8 disabled:opacity-30" title="위로"><ArrowUp className="size-3.5" /></button><button type="button" disabled={busy || index === total - 1} onClick={() => onMove("down")} className="ui-icon-button h-8 w-8 disabled:opacity-30" title="아래로"><ArrowDown className="size-3.5" /></button><button type="button" disabled={busy} onClick={onDelete} className="ui-icon-button h-8 w-8 text-[var(--destructive)] disabled:opacity-30" title="삭제"><Trash2 className="size-3.5" /></button></>}</div>;
}

function LoadingState() {
  return <div className="grid min-h-24 place-items-center text-text-muted"><Loader2 className="size-5 animate-spin" /></div>;
}

function EmptyState({ text }: { text: string }) {
  return <div className="grid min-h-24 place-items-center px-3 text-center text-xs font-semibold text-text-muted">{text}</div>;
}

function TitleDialog({ state, busy, onName, onClose, onSave }: { state: TitleDialog; busy: boolean; onName: (name: string) => void; onClose: () => void; onSave: () => void }) {
  const deleting = state.mode === "delete";
  return <div className="fixed inset-0 z-40 grid place-items-center bg-[color-mix(in_srgb,var(--background)_72%,transparent)] p-4"><div className="w-full max-w-md rounded-xl border border-surface-border bg-surface-raised p-5 shadow-2xl"><div className="flex items-center justify-between"><h2 className="text-lg font-black text-text-primary">{deleting ? `${state.kind === "project" ? "프로젝트" : "2차 분류"} 삭제` : `${state.kind === "project" ? "프로젝트" : "2차 분류"} 수정`}</h2><button type="button" onClick={onClose} className="ui-icon-button h-8 w-8 rounded-full"><X className="size-4" /></button></div><div className="mt-5">{deleting ? <p className="text-sm font-semibold leading-6 text-text-secondary"><strong className="text-text-primary">{state.name}</strong>을(를) 삭제할까요? 하위 Excel 목록도 함께 화면에서 사라집니다.</p> : <label className="block text-xs font-black text-text-secondary">이름<input value={state.name} onChange={(event) => onName(event.target.value)} className="ui-input mt-1 h-10 text-sm" autoFocus onKeyDown={(event) => { if (event.key === "Enter") onSave(); }} /></label>}<div className="mt-5 flex justify-end gap-2"><button type="button" onClick={onClose} className="rounded-md px-3 py-2 text-xs font-black text-text-secondary">취소</button><button type="button" onClick={onSave} disabled={busy || (!deleting && !state.name.trim())} className={`inline-flex items-center gap-1.5 rounded-md px-3 py-2 text-xs font-black text-text-on-brand disabled:opacity-40 ${deleting ? "bg-[var(--destructive)]" : "bg-brand-primary"}`}>{busy ? <Loader2 className="size-3.5 animate-spin" /> : deleting ? <Trash2 className="size-3.5" /> : <Check className="size-3.5" />}{deleting ? "삭제" : "저장"}</button></div></div></div></div>;
}

export default ApiExcelModule;
