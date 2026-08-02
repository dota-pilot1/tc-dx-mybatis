import {
  Check,
  CircleHelp,
  FileText,
  FileUp,
  GraduationCap,
  Link as LinkIcon,
  Pencil,
  Plus,
  Save,
  Trash2,
  Video,
  X,
} from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import {
  createTutorialContent,
  createTutorialLesson,
  createTutorialCategory,
  deleteTutorialCategory,
  deleteTutorialContent,
  deleteTutorialLesson,
  listTutorials,
  type TutorialCategory,
  type TutorialContent,
  type TutorialContentType,
  type TutorialLesson,
  updateTutorialContent,
  updateTutorialCategory,
  updateTutorialLesson,
  uploadTutorialDocument,
} from "../../features/tutorial/api";
import PageHeader from "../../shared/ui/PageHeader";
import { LexicalEditor } from "../../shared/ui/lexical/lexical-editor";

type LessonDialog = "edit" | "delete";
type CategoryDialog = "edit" | "delete";
type ContentMode = "create" | "detail" | "edit";
type ContentDialog = { mode: ContentMode; type: TutorialContentType; content?: TutorialContent };
type ContentDraft = { type: TutorialContentType; title: string; content: string; url: string };

function isYouTubeUrl(value: string) {
  return /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([A-Za-z0-9_-]{11})/.test(value.trim());
}

function youtubeId(value: string) {
  return value.trim().match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([A-Za-z0-9_-]{11})/)?.[1] ?? null;
}

function typeLabel(type: TutorialContentType) {
  return type === "lexical" ? "Lexical 문서" : type === "youtube" ? "YouTube 영상" : "실제 문서";
}

function typeIcon(type: TutorialContentType) {
  return type === "lexical" ? <Pencil className="size-4" /> : type === "youtube" ? <Video className="size-4" /> : <FileText className="size-4" />;
}

function flattenLessons(category: TutorialCategory) {
  return category.sections.flatMap((section) => section.lessons.map((lesson) => ({ section, lesson })));
}

function TutoringModuleSimple() {
  const [categories, setCategories] = useState<TutorialCategory[]>([]);
  const [categoryId, setCategoryId] = useState("");
  const [lessonId, setLessonId] = useState("");
  const [draftTitle, setDraftTitle] = useState("");
  const [editingTitle, setEditingTitle] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);
  const [lessonDialog, setLessonDialog] = useState<LessonDialog | null>(null);
  const [dialogLesson, setDialogLesson] = useState<TutorialLesson | null>(null);
  const [categoryDialog, setCategoryDialog] = useState<CategoryDialog | null>(null);
  const [dialogCategory, setDialogCategory] = useState<TutorialCategory | null>(null);
  const [categoryTitle, setCategoryTitle] = useState("");
  const [inlineCategoryTitle, setInlineCategoryTitle] = useState("");
  const [inlineLessonTitle, setInlineLessonTitle] = useState("");
  const [addingCategory, setAddingCategory] = useState(false);
  const [addingLesson, setAddingLesson] = useState(false);
  const [contentDialog, setContentDialog] = useState<ContentDialog | null>(null);
  const [contentDraft, setContentDraft] = useState<ContentDraft>({ type: "lexical", title: "", content: "", url: "" });
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [helpOpen, setHelpOpen] = useState(false);

  const category = categories.find((item) => item.id === categoryId) ?? categories[0];
  const locations = category ? flattenLessons(category) : [];
  const selected = locations.find((item) => item.lesson.id === lessonId) ?? locations[0];
  const lesson = selected?.lesson;

  useEffect(() => {
    void listTutorials()
      .then((items) => {
        setCategories(items);
        const firstCategory = items[0];
        const first = firstCategory ? flattenLessons(firstCategory)[0] : undefined;
        setCategoryId(firstCategory?.id ?? "");
        setLessonId(first?.lesson.id ?? "");
        setDraftTitle(first?.lesson.title ?? "");
      })
      .catch((reason: unknown) => setError(reason instanceof Error ? reason.message : "튜토리얼을 불러오지 못했습니다."));
  }, []);

  function replaceCategory(nextCategory: TutorialCategory | undefined) {
    if (!nextCategory) return;
    setCategories((current) => current.map((item) => item.id === nextCategory.id ? nextCategory : item));
  }

  function selectCategory(nextCategory: TutorialCategory) {
    const first = flattenLessons(nextCategory)[0];
    setCategoryId(nextCategory.id);
    setLessonId(first?.lesson.id ?? "");
    setDraftTitle(first?.lesson.title ?? "");
    setEditingTitle(false);
  }

  function selectLesson(nextLesson: TutorialLesson) {
    setLessonId(nextLesson.id);
    setDraftTitle(nextLesson.title);
    setEditingTitle(false);
  }

  async function copyTopicLink() {
    if (!category || !lesson) return;
    const url = new URL(window.location.href);
    url.searchParams.set("view", "tutoring");
    url.searchParams.set("tutorialCategoryId", category.id);
    url.searchParams.set("tutorialLessonId", lesson.id);
    try {
      await navigator.clipboard.writeText(url.toString());
      setLinkCopied(true);
      window.setTimeout(() => setLinkCopied(false), 1600);
    } catch (reason: unknown) {
      setError(reason instanceof Error ? reason.message : "주제 링크를 복사하지 못했습니다.");
    }
  }

  function startTitleEdit() {
    if (!lesson) return;
    setDraftTitle(lesson.title);
    setEditingTitle(true);
  }

  function cancelTitleEdit() {
    setDraftTitle(lesson?.title ?? "");
    setEditingTitle(false);
  }

  async function saveInlineTitle() {
    if (!lesson || !draftTitle.trim()) return;
    setBusy(true);
    try {
      const nextCategory = await updateTutorialLesson(lesson.id, { title: draftTitle.trim() });
      replaceCategory(nextCategory);
      setEditingTitle(false);
      setError("");
    } catch (reason: unknown) {
      setError(reason instanceof Error ? reason.message : "튜토리얼 제목을 저장하지 못했습니다.");
    } finally {
      setBusy(false);
    }
  }

  async function createLesson() {
    const targetSection = category?.sections[0];
    if (!targetSection) return;
    setBusy(true);
    try {
      const nextCategory = await createTutorialLesson(targetSection.id, { title: "새 튜토리얼", summary: "", content: "", videoUrl: "", videoTitle: "", documentUrl: "", documentTitle: "" });
      replaceCategory(nextCategory);
      const nextLessons = nextCategory ? flattenLessons(nextCategory) : [];
      const next = nextLessons[nextLessons.length - 1];
      setLessonId(next?.lesson.id ?? "");
      setDraftTitle(next?.lesson.title ?? "");
    } catch (reason: unknown) {
      setError(reason instanceof Error ? reason.message : "튜토리얼을 만들지 못했습니다.");
    } finally {
      setBusy(false);
    }
  }

  async function createInlineCategory() {
    const title = inlineCategoryTitle.trim();
    if (!title) return;
    setBusy(true);
    try {
      const created = await createTutorialCategory({ title });
      const items = await listTutorials();
      setCategories(items);
      const nextCategory = items.find((item) => item.id === created?.id) ?? items[items.length - 1];
      if (nextCategory) selectCategory(nextCategory);
      setInlineCategoryTitle("");
      setAddingCategory(false);
      setError("");
    } catch (reason: unknown) {
      setError(reason instanceof Error ? reason.message : "카테고리를 만들지 못했습니다.");
    } finally {
      setBusy(false);
    }
  }

  async function createInlineLesson() {
    const targetSection = category?.sections[0];
    const title = inlineLessonTitle.trim();
    if (!targetSection || !title) return;
    setBusy(true);
    try {
      const nextCategory = await createTutorialLesson(targetSection.id, { title, summary: "", content: "", videoUrl: "", videoTitle: "", documentUrl: "", documentTitle: "" });
      replaceCategory(nextCategory);
      const nextLessons = nextCategory ? flattenLessons(nextCategory) : [];
      const next = nextLessons[nextLessons.length - 1];
      setLessonId(next?.lesson.id ?? "");
      setDraftTitle(next?.lesson.title ?? "");
      setInlineLessonTitle("");
      setAddingLesson(false);
      setError("");
    } catch (reason: unknown) {
      setError(reason instanceof Error ? reason.message : "튜토리얼을 만들지 못했습니다.");
    } finally {
      setBusy(false);
    }
  }

  function openLessonDialog(mode: LessonDialog, target: TutorialLesson) {
    setLessonDialog(mode);
    setDialogLesson(target);
    setDraftTitle(target.title);
  }

  function openCategoryDialog(mode: CategoryDialog, target?: TutorialCategory) {
    setCategoryDialog(mode);
    setDialogCategory(target ?? null);
    setCategoryTitle(target?.title ?? "");
  }

  async function saveCategoryDialog() {
    if (!categoryTitle.trim()) return;
    setBusy(true);
    try {
      if (!dialogCategory) return;
      const nextCategory = await updateTutorialCategory(dialogCategory.id, { title: categoryTitle.trim() });
      if (nextCategory) {
        replaceCategory(nextCategory);
        if (dialogCategory.id === category?.id) setCategoryId(nextCategory.id);
      }
      setCategoryDialog(null);
      setDialogCategory(null);
    } catch (reason: unknown) {
      setError(reason instanceof Error ? reason.message : "카테고리를 저장하지 못했습니다.");
    } finally {
      setBusy(false);
    }
  }

  async function removeCategory() {
    if (!dialogCategory) return;
    setBusy(true);
    try {
      await deleteTutorialCategory(dialogCategory.id);
      const items = await listTutorials();
      const nextCategory = items[0];
      const next = nextCategory ? flattenLessons(nextCategory)[0] : undefined;
      setCategories(items);
      setCategoryId(nextCategory?.id ?? "");
      setLessonId(next?.lesson.id ?? "");
      setDraftTitle(next?.lesson.title ?? "");
      setCategoryDialog(null);
      setDialogCategory(null);
    } catch (reason: unknown) {
      setError(reason instanceof Error ? reason.message : "카테고리를 삭제하지 못했습니다.");
    } finally {
      setBusy(false);
    }
  }

  async function saveLessonDialog() {
    if (!dialogLesson || !draftTitle.trim()) return;
    setBusy(true);
    try {
      const nextCategory = await updateTutorialLesson(dialogLesson.id, { title: draftTitle.trim() });
      replaceCategory(nextCategory);
      setLessonDialog(null);
      setDialogLesson(null);
      setError("");
    } catch (reason: unknown) {
      setError(reason instanceof Error ? reason.message : "튜토리얼을 수정하지 못했습니다.");
    } finally {
      setBusy(false);
    }
  }

  async function removeLesson() {
    if (!dialogLesson) return;
    setBusy(true);
    try {
      await deleteTutorialLesson(dialogLesson.id);
      const items = await listTutorials();
      const nextCategory = items.find((item) => item.id === category?.id) ?? items[0];
      const next = nextCategory ? flattenLessons(nextCategory)[0] : undefined;
      setCategories(items);
      setCategoryId(nextCategory?.id ?? "");
      setLessonId(next?.lesson.id ?? "");
      setDraftTitle(next?.lesson.title ?? "");
      setLessonDialog(null);
      setDialogLesson(null);
    } catch (reason: unknown) {
      setError(reason instanceof Error ? reason.message : "튜토리얼을 삭제하지 못했습니다.");
    } finally {
      setBusy(false);
    }
  }

  function openContent(mode: ContentMode, type: TutorialContentType, content?: TutorialContent) {
    setContentDialog({ mode, type, content });
    setContentDraft({ type, title: content?.title ?? "", content: content?.content ?? "", url: content?.url ?? "" });
  }

  async function saveContent() {
    if (!lesson || !contentDraft.title.trim()) return;
    setBusy(true);
    try {
      const nextCategory = contentDialog?.mode === "edit" && contentDialog.content
        ? await updateTutorialContent(contentDialog.content.id, contentDraft)
        : await createTutorialContent(lesson.id, contentDraft);
      replaceCategory(nextCategory);
      setContentDialog(null);
      setError("");
    } catch (reason: unknown) {
      setError(reason instanceof Error ? reason.message : "강의 자료를 저장하지 못했습니다.");
    } finally {
      setBusy(false);
    }
  }

  async function removeContent() {
    if (!contentDialog?.content) return;
    setBusy(true);
    try {
      await deleteTutorialContent(contentDialog.content.id);
      const items = await listTutorials();
      setCategories(items);
      setContentDialog(null);
    } catch (reason: unknown) {
      setError(reason instanceof Error ? reason.message : "강의 자료를 삭제하지 못했습니다.");
    } finally {
      setBusy(false);
    }
  }

  async function uploadDocument(file: File) {
    setUploading(true);
    try {
      const url = await uploadTutorialDocument(file);
      setContentDraft((current) => ({ ...current, url, title: current.title || file.name }));
    } catch (reason: unknown) {
      setError(reason instanceof Error ? reason.message : "문서를 업로드하지 못했습니다.");
    } finally {
      setUploading(false);
    }
  }

  return <div className="flex min-w-0 flex-1 flex-col"><PageHeader><GraduationCap className="size-4 text-brand-primary" /><span className="text-[14px] font-bold tracking-tight text-text-primary">Tutoring</span><span className="ml-1 text-[12px] font-semibold text-text-muted">튜토리얼 관리</span><button type="button" onClick={() => setHelpOpen(true)} className="ui-icon-button ml-2 h-7 w-7" title="사용 방법"><CircleHelp className="size-4" /></button></PageHeader><div className="min-h-0 flex-1 overflow-y-auto bg-surface-muted p-5">{error && <div className="mx-auto mb-4 max-w-[1600px] rounded-md border border-[var(--destructive)] bg-danger-glass px-4 py-3 text-xs font-bold text-[var(--destructive)]">{error}</div>}<main className="mx-auto grid min-h-[720px] w-full max-w-[1600px] gap-4 xl:grid-cols-[320px_420px_minmax(0,1fr)]"><aside className="flex min-h-0 flex-col rounded-md border border-surface-border bg-surface-raised shadow-sm"><PanelHeader title="1차 카테고리" count={categories.length} onAdd={() => setAddingCategory((current) => !current)} adding={addingCategory} /><div className="min-h-0 flex-1 space-y-2 overflow-y-auto p-3">{categories.map((item) => <div key={item.id} className={`flex items-center gap-1 rounded-md border-l-2 p-2 ${item.id === category?.id ? "border-brand-primary bg-brand-glass" : "border-transparent bg-surface-muted"}`}><button type="button" onClick={() => selectCategory(item)} className="flex min-w-0 flex-1 flex-col p-1 text-left"><span className="block truncate text-sm font-black text-text-primary">{item.title}</span><span className="mt-2 text-[10px] font-black text-brand-primary">{flattenLessons(item).length}개 자료</span></button><button type="button" onClick={() => openCategoryDialog("edit", item)} className="ui-icon-button h-8 w-8 shrink-0" title="카테고리 수정"><Pencil className="size-3.5" /></button><button type="button" onClick={() => openCategoryDialog("delete", item)} className="ui-icon-button h-8 w-8 shrink-0 text-[var(--destructive)]" title="카테고리 삭제"><Trash2 className="size-3.5" /></button></div>)}{addingCategory && <InlineAddRow placeholder="새 카테고리" value={inlineCategoryTitle} onChange={setInlineCategoryTitle} onSubmit={() => void createInlineCategory()} onCancel={() => { setInlineCategoryTitle(""); setAddingCategory(false); }} busy={busy} />}</div></aside><aside className="flex min-h-0 flex-col rounded-md border border-surface-border bg-surface-raised shadow-sm"><PanelHeader title="2차 주제" count={locations.length} onAdd={category ? () => setAddingLesson((current) => !current) : undefined} adding={addingLesson} /><div className="min-h-0 flex-1 overflow-y-auto p-3"><div className="space-y-1.5">{locations.map(({ lesson: item }) => <div key={item.id} className={`flex items-center gap-1 rounded-md border px-2 py-1.5 ${item.id === lesson?.id ? "border-brand-border bg-brand-glass" : "border-transparent bg-surface-muted hover:border-surface-border-soft"}`}><button type="button" onClick={() => selectLesson(item)} className="flex min-w-0 flex-1 items-center gap-2 p-1 text-left"><FileText className="size-3.5 shrink-0 text-brand-primary" /><span className="min-w-0 truncate text-[12px] font-black text-text-primary">{item.title}</span></button><button type="button" onClick={() => openLessonDialog("edit", item)} className="ui-icon-button h-7 w-7 shrink-0" title="수정"><Pencil className="size-3.5" /></button><button type="button" onClick={() => openLessonDialog("delete", item)} className="ui-icon-button h-7 w-7 shrink-0 text-[var(--destructive)]" title="삭제"><Trash2 className="size-3.5" /></button></div>)}{addingLesson && <InlineAddRow placeholder="새 튜토리얼" value={inlineLessonTitle} onChange={setInlineLessonTitle} onSubmit={() => void createInlineLesson()} onCancel={() => { setInlineLessonTitle(""); setAddingLesson(false); }} busy={busy} />}</div></div></aside><section className="flex min-h-0 flex-col rounded-md border border-surface-border bg-surface-raised shadow-sm">{lesson ? <><header className="flex flex-wrap items-center justify-between gap-3 border-b border-surface-border px-5 py-4"><div className="min-w-0"><p className="truncate text-[10px] font-black uppercase tracking-[0.14em] text-brand-primary">{category.title} &gt; {lesson.title}</p>{editingTitle ? <input value={draftTitle} onChange={(event) => setDraftTitle(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter") void saveInlineTitle(); if (event.key === "Escape") cancelTitleEdit(); }} className="ui-input mt-1 h-9 max-w-xl text-lg font-black" autoFocus /> : <h1 className="mt-1 truncate text-lg font-black text-text-primary">{lesson.title}</h1>}</div><div className="flex shrink-0 items-center gap-2"><button type="button" onClick={() => void copyTopicLink()} className="ui-icon-button h-9 w-9" title={linkCopied ? "링크 복사됨" : "2차 주제 링크 복사"} aria-label={linkCopied ? "링크 복사됨" : "2차 주제 링크 복사"}><LinkIcon className="size-4" /></button>{editingTitle ? <><button type="button" onClick={cancelTitleEdit} disabled={busy} className="ui-icon-button h-9 w-9" title="취소" aria-label="취소"><X className="size-4" /></button><button type="button" onClick={() => void saveInlineTitle()} disabled={busy || !draftTitle.trim()} className="ui-icon-button-brand h-9 w-9" title="제목 저장" aria-label="제목 저장"><Check className="size-4" /></button></> : <button type="button" onClick={startTitleEdit} disabled={busy} className="ui-icon-button-brand h-9 w-9" title="강의 제목 바로 수정" aria-label="강의 제목 바로 수정"><Pencil className="size-4" /></button>}</div></header><div className="min-h-0 flex-1 overflow-y-auto p-5"><ContentList contents={lesson.contents} onAdd={(type) => openContent("create", type)} onOpen={(content) => openContent("detail", content.type, content)} /></div></> : <EmptyLesson onCreate={createLesson} />}</section></main>{categoryDialog && <CategoryDialog mode={categoryDialog} title={categoryTitle} busy={busy} onTitleChange={setCategoryTitle} onClose={() => { if (!busy) setCategoryDialog(null); }} onSave={saveCategoryDialog} onDelete={removeCategory} />}{lessonDialog && dialogLesson && <LessonDialog mode={lessonDialog} title={draftTitle} busy={busy} onTitleChange={setDraftTitle} onClose={() => { if (!busy) { setLessonDialog(null); setDialogLesson(null); } }} onSave={saveLessonDialog} onDelete={removeLesson} />}{contentDialog && <ContentDialog state={contentDialog} draft={contentDraft} busy={busy} uploading={uploading} onDraftChange={setContentDraft} onClose={() => { if (!busy && !uploading) setContentDialog(null); }} onEdit={() => { if (contentDialog.content) openContent("edit", contentDialog.type, contentDialog.content); }} onSave={saveContent} onDelete={removeContent} onUpload={uploadDocument} />}{helpOpen && <DialogShell title="튜토리얼 관리" onClose={() => setHelpOpen(false)}><p className="text-sm font-semibold leading-6 text-text-secondary">1차 카테고리와 2차 주제 아래에 튜토리얼을 만들고, 본문에서 Lexical 문서·YouTube 영상·실제 문서를 자료로 추가합니다.</p></DialogShell>}</div></div>;
}

function PanelHeader({ title, count, onAdd, adding = false }: { title: string; count: number; onAdd?: () => void; adding?: boolean }) {
  return <div className="flex min-h-12 items-center justify-between gap-3 border-b border-surface-border px-4"><h2 className="text-sm font-black text-text-primary">{title}</h2><div className="flex items-center gap-2"><span className="grid size-7 place-items-center rounded-md bg-surface-muted text-[11px] font-black text-text-muted">{count}</span>{onAdd && <button type="button" onClick={onAdd} className="grid size-7 place-items-center rounded-md border border-brand-border bg-brand-glass text-brand-primary" title={adding ? "추가 닫기" : `${title} 추가`}>{adding ? <X className="size-4" /> : <Plus className="size-4" />}</button>}</div></div>;
}

function InlineAddRow({ placeholder, value, onChange, onSubmit, onCancel, busy }: { placeholder: string; value: string; onChange: (value: string) => void; onSubmit: () => void; onCancel: () => void; busy: boolean }) {
  return <div className="flex gap-2 rounded-md border border-dashed border-brand-border bg-brand-glass p-2"><input value={value} onChange={(event) => onChange(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter") onSubmit(); if (event.key === "Escape") onCancel(); }} placeholder={placeholder} className="ui-input h-9 min-w-0 flex-1 bg-surface-raised text-xs" autoFocus /><button type="button" onClick={onSubmit} disabled={busy || !value.trim()} className="grid size-9 shrink-0 place-items-center rounded-md border border-brand-border bg-brand-glass text-brand-primary disabled:opacity-40" title="저장"><Check className="size-4" /></button><button type="button" onClick={onCancel} disabled={busy} className="ui-icon-button h-9 w-9 shrink-0" title="취소"><X className="size-4" /></button></div>;
}

function ContentList({ contents, onAdd, onOpen }: { contents: TutorialContent[]; onAdd: (type: TutorialContentType) => void; onOpen: (content: TutorialContent) => void }) {
  return <section className="rounded-md border border-surface-border-soft bg-surface-muted p-4"><div className="flex flex-wrap items-center justify-between gap-3"><h2 className="text-sm font-black text-text-primary">강의 자료</h2><div className="flex flex-wrap gap-2"><AddButton icon={<Pencil className="size-3.5" />} label="Lexical 문서" onClick={() => onAdd("lexical")} /><AddButton icon={<Video className="size-3.5" />} label="YouTube 영상" onClick={() => onAdd("youtube")} /><AddButton icon={<FileUp className="size-3.5" />} label="실제 문서" onClick={() => onAdd("document")} /></div></div><div className="mt-4 space-y-2">{contents.length === 0 ? <div className="grid min-h-32 place-items-center rounded-md border border-dashed border-surface-border-soft text-xs font-semibold text-text-muted">강의 자료 없음</div> : contents.map((content) => <button key={content.id} type="button" onClick={() => onOpen(content)} className="flex w-full items-center gap-3 rounded-md border border-surface-border-soft bg-surface-raised px-3 py-3 text-left hover:border-brand-border"><span className="grid size-9 shrink-0 place-items-center rounded-md bg-brand-glass text-brand-primary">{typeIcon(content.type)}</span><span className="min-w-0 flex-1"><strong className="block truncate text-sm font-black text-text-primary">{content.title}</strong><span className="mt-1 block text-[11px] font-semibold text-text-muted">{typeLabel(content.type)}</span></span></button>)}</div></section>;
}

function AddButton({ icon, label, onClick }: { icon: ReactNode; label: string; onClick: () => void }) {
  return <button type="button" onClick={onClick} className="inline-flex items-center gap-1.5 rounded-md border border-brand-border bg-brand-glass px-2.5 py-2 text-[11px] font-black text-brand-primary">{icon}{label}</button>;
}

function CategoryDialog({ mode, title, busy, onTitleChange, onClose, onSave, onDelete }: { mode: CategoryDialog; title: string; busy: boolean; onTitleChange: (value: string) => void; onClose: () => void; onSave: () => void; onDelete: () => void }) {
  const deleting = mode === "delete";
  return <DialogShell title={deleting ? "카테고리 삭제" : "카테고리 수정"} onClose={onClose}><>{deleting ? <p className="text-sm font-semibold text-text-secondary">이 카테고리와 포함된 튜토리얼을 삭제할까요?</p> : <label className="block text-xs font-black text-text-secondary">제목<input value={title} onChange={(event) => onTitleChange(event.target.value)} className="ui-input mt-1 h-10 text-sm" autoFocus /></label>}<div className="mt-5 flex justify-end gap-2"><button type="button" onClick={onClose} disabled={busy} className="rounded-md px-3 py-2 text-xs font-black text-text-secondary">취소</button><button type="button" onClick={deleting ? onDelete : onSave} disabled={busy || (!deleting && !title.trim())} className={`inline-flex items-center gap-1.5 rounded-md px-3 py-2 text-xs font-black text-text-on-brand ${deleting ? "bg-[var(--destructive)]" : "bg-brand-primary"}`}>{deleting ? <Trash2 className="size-3.5" /> : <Save className="size-3.5" />}{busy ? "처리 중..." : deleting ? "삭제" : "저장"}</button></div></></DialogShell>;
}

function LessonDialog({ mode, title, busy, onTitleChange, onClose, onSave, onDelete }: { mode: LessonDialog; title: string; busy: boolean; onTitleChange: (value: string) => void; onClose: () => void; onSave: () => void; onDelete: () => void }) {
  const deleting = mode === "delete";
  return <DialogShell title={deleting ? "튜토리얼 삭제" : "튜토리얼 수정"} onClose={onClose}><>{deleting ? <p className="text-sm font-semibold text-text-secondary">이 튜토리얼을 삭제할까요?</p> : <label className="block text-xs font-black text-text-secondary">제목<input value={title} onChange={(event) => onTitleChange(event.target.value)} className="ui-input mt-1 h-10 text-sm" autoFocus /></label>}<div className="mt-5 flex justify-end gap-2"><button type="button" onClick={onClose} disabled={busy} className="rounded-md px-3 py-2 text-xs font-black text-text-secondary">취소</button><button type="button" onClick={deleting ? onDelete : onSave} disabled={busy || (!deleting && !title.trim())} className={`inline-flex items-center gap-1.5 rounded-md px-3 py-2 text-xs font-black text-text-on-brand ${deleting ? "bg-[var(--destructive)]" : "bg-brand-primary"}`}>{deleting ? <Trash2 className="size-3.5" /> : <Save className="size-3.5" />}{busy ? "처리 중..." : deleting ? "삭제" : "저장"}</button></div></></DialogShell>;
}

function ContentDialog({ state, draft, busy, uploading, onDraftChange, onClose, onEdit, onSave, onDelete, onUpload }: { state: ContentDialog; draft: ContentDraft; busy: boolean; uploading: boolean; onDraftChange: (value: ContentDraft) => void; onClose: () => void; onEdit: () => void; onSave: () => void; onDelete: () => void; onUpload: (file: File) => Promise<void> }) {
  const detail = state.mode === "detail";
  const type = state.content?.type ?? draft.type;
  return <DialogShell title={detail ? state.content?.title ?? "강의 자료" : state.mode === "create" ? `${typeLabel(type)} 추가` : `${typeLabel(type)} 수정`} onClose={onClose} wide>{detail ? <ContentDetail content={state.content!} /> : <div className="space-y-3"><label className="block text-xs font-black text-text-secondary">자료 제목<input value={draft.title} onChange={(event) => onDraftChange({ ...draft, title: event.target.value })} className="ui-input mt-1 h-10 text-sm" autoFocus /></label>{type === "lexical" && <div className="overflow-hidden rounded-md border border-surface-border-soft"><LexicalEditor key={state.content?.id ?? "new"} initialState={draft.content} onChange={(content) => onDraftChange({ ...draft, content })} minHeight="320px" /></div>}{type === "youtube" && <label className="block text-xs font-black text-text-secondary">YouTube URL<input value={draft.url} onChange={(event) => onDraftChange({ ...draft, url: event.target.value })} placeholder="https://youtu.be/..." className="ui-input mt-1 h-10 text-sm" /></label>}{type === "document" && <><label className="block text-xs font-black text-text-secondary">문서 URL<input value={draft.url} onChange={(event) => onDraftChange({ ...draft, url: event.target.value })} placeholder="https://..." className="ui-input mt-1 h-10 text-sm" /></label><label className="flex h-10 cursor-pointer items-center justify-center rounded-md border border-dashed border-brand-border bg-brand-glass text-xs font-black text-brand-primary"><input type="file" accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt" className="sr-only" disabled={uploading} onChange={(event) => { const file = event.target.files?.[0]; if (file) void onUpload(file); event.currentTarget.value = ""; }} />{uploading ? "업로드 중..." : "실제 문서 업로드"}</label></>}</div>}<div className="mt-5 flex justify-end gap-2"><button type="button" onClick={onClose} disabled={busy || uploading} className="inline-flex items-center gap-1.5 rounded-md border border-surface-border-soft bg-surface-muted px-3 py-2 text-xs font-black text-text-secondary hover:border-surface-border hover:text-text-primary"><X className="size-3.5" />닫기</button>{detail ? <><button type="button" onClick={onDelete} disabled={busy} className="inline-flex items-center gap-1.5 rounded-md border border-[var(--destructive)] px-3 py-2 text-xs font-black text-[var(--destructive)]"><Trash2 className="size-3.5" />삭제</button><button type="button" onClick={onEdit} className="inline-flex items-center gap-1.5 rounded-md bg-brand-primary px-3 py-2 text-xs font-black text-text-on-brand"><Pencil className="size-3.5" />수정</button></> : <button type="button" onClick={onSave} disabled={busy || uploading || !draft.title.trim() || (type === "youtube" && !isYouTubeUrl(draft.url))} className="inline-flex items-center gap-1.5 rounded-md bg-brand-primary px-3 py-2 text-xs font-black text-text-on-brand"><Save className="size-3.5" />저장</button>}</div></DialogShell>;
}

function ContentDetail({ content }: { content: TutorialContent }) {
  if (content.type === "lexical") return <div className="overflow-hidden rounded-md border border-surface-border-soft"><LexicalEditor initialState={content.content} onChange={() => undefined} readOnly minHeight="360px" /></div>;
  if (content.type === "youtube") return <div className="overflow-hidden rounded-md border border-surface-border-soft">{isYouTubeUrl(content.url) ? <iframe className="aspect-video w-full" src={`https://www.youtube.com/embed/${youtubeId(content.url)}`} title={content.title} allowFullScreen /> : <p className="p-5 text-sm text-text-muted">YouTube URL 없음</p>}</div>;
  return <a href={content.url} target="_blank" rel="noreferrer" className="flex min-h-32 items-center justify-center gap-2 rounded-md border border-dashed border-brand-border bg-brand-glass px-4 text-sm font-black text-brand-primary"><LinkIcon className="size-5" />{content.title} 열기</a>;
}

function DialogShell({ title, children, onClose, wide = false }: { title: string; children: ReactNode; onClose: () => void; wide?: boolean }) {
  return <div className="fixed inset-0 z-40 grid place-items-center bg-[color-mix(in_srgb,var(--background)_72%,transparent)] p-4" role="presentation"><div className={`max-h-[90vh] w-full overflow-y-auto rounded-xl border border-surface-border bg-surface-raised p-5 shadow-2xl ${wide ? "max-w-3xl" : "max-w-md"}`} role="dialog" aria-modal="true"><div className="flex items-start justify-between gap-4"><h2 className="text-lg font-black text-text-primary">{title}</h2><button type="button" onClick={onClose} className="ui-icon-button h-8 w-8 rounded-full" aria-label="닫기" title="닫기"><X className="size-4" /></button></div><div className="mt-5">{children}</div></div></div>;
}

function EmptyLesson({ onCreate }: { onCreate: () => void }) {
  return <div className="grid min-h-[500px] place-items-center"><button type="button" onClick={onCreate} className="inline-flex items-center gap-2 rounded-md border border-brand-border bg-brand-glass px-3 py-2 text-sm font-black text-brand-primary"><Plus className="size-4" />튜토리얼 추가</button></div>;
}

export default TutoringModuleSimple;
