import {
  BookOpen,
  FileText,
  FileUp,
  GraduationCap,
  Link as LinkIcon,
  Pencil,
  Plus,
  Save,
  Trash2,
  Video,
} from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import {
  createTutorialCategory,
  createTutorialContent,
  createTutorialLesson,
  deleteTutorialContent,
  deleteTutorialLesson,
  listTutorials,
  type TutorialCategory,
  type TutorialContent,
  type TutorialContentType,
  type TutorialLesson,
  updateTutorialContent,
  updateTutorialLesson,
  uploadTutorialDocument,
} from "../../features/tutorial/api";
import PageHeader from "../../shared/ui/PageHeader";
import { LexicalEditor } from "../../shared/ui/lexical/lexical-editor";

type LessonDialog = "edit" | "delete";
type ContentDialogMode = "create" | "edit" | "detail";
type ContentDialogState = {
  mode: ContentDialogMode;
  type: TutorialContentType;
  content?: TutorialContent;
};

const EMPTY_LESSON: TutorialLesson = {
  id: "",
  sectionId: "",
  title: "",
  summary: "",
  content: "",
  videoUrl: "",
  videoTitle: "",
  documentUrl: "",
  documentTitle: "",
  orderIdx: 0,
  createdAt: "",
  updatedAt: "",
  contents: [],
};

const INITIAL_CATEGORIES: TutorialCategory[] = [
  {
    id: "spring",
    userId: "",
    title: "Spring Boot 서버",
    summary: "서버를 만들고 주문 API를 연결합니다.",
    orderIdx: 0,
    createdAt: "",
    updatedAt: "",
    sections: [{
      id: "spring-start",
      categoryId: "spring",
      title: "처음 시작하기",
      summary: "프로젝트를 만들고 첫 API를 실행합니다.",
      orderIdx: 0,
      createdAt: "",
      updatedAt: "",
      lessons: [
        { ...EMPTY_LESSON, id: "spring-1", title: "첫 번째 API 만들기", summary: "Spring Boot로 주문 조회 API를 만듭니다." },
        { ...EMPTY_LESSON, id: "spring-2", title: "Postgres 연결하기", summary: "주문 데이터를 저장하고 다시 읽습니다." },
      ],
    }],
  },
  {
    id: "react",
    userId: "",
    title: "React 화면",
    summary: "사용자가 주문하고 배송을 확인하는 화면을 만듭니다.",
    orderIdx: 1,
    createdAt: "",
    updatedAt: "",
    sections: [{
      id: "react-screen",
      categoryId: "react",
      title: "화면 만들기",
      summary: "목록, 상세, 주문 화면을 만듭니다.",
      orderIdx: 0,
      createdAt: "",
      updatedAt: "",
      lessons: [{ ...EMPTY_LESSON, id: "react-1", title: "상품 목록 만들기", summary: "상품을 카드 목록으로 보여줍니다." }],
    }],
  },
  {
    id: "commerce",
    userId: "",
    title: "후원+구매 실습",
    summary: "물품 구매부터 배송 추적까지 직접 연결합니다.",
    orderIdx: 2,
    createdAt: "",
    updatedAt: "",
    sections: [{
      id: "commerce-flow",
      categoryId: "commerce",
      title: "주문 흐름",
      summary: "주문·후원·배송 상태를 이어 붙입니다.",
      orderIdx: 0,
      createdAt: "",
      updatedAt: "",
      lessons: [{ ...EMPTY_LESSON, id: "commerce-1", title: "물건 주문하고 배송 보기", summary: "후원 물품을 주문하고 배송 번호를 확인합니다." }],
    }],
  },
];

function isYouTubeUrl(value: string) {
  return /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([A-Za-z0-9_-]{11})/.test(value.trim());
}

function getYouTubeId(value: string) {
  return value.trim().match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([A-Za-z0-9_-]{11})/)?.[1] ?? null;
}

function contentLabel(type: TutorialContentType) {
  return type === "lexical" ? "Lexical 문서" : type === "youtube" ? "YouTube 영상" : "실제 문서";
}

function contentIcon(type: TutorialContentType) {
  if (type === "lexical") return <Pencil className="size-4" />;
  if (type === "youtube") return <Video className="size-4" />;
  return <FileText className="size-4" />;
}

function TutoringModule() {
  const [categories, setCategories] = useState<TutorialCategory[]>(INITIAL_CATEGORIES);
  const [selectedCategoryId, setSelectedCategoryId] = useState(INITIAL_CATEGORIES[0].id);
  const [selectedSectionId, setSelectedSectionId] = useState(INITIAL_CATEGORIES[0].sections[0].id);
  const [selectedLessonId, setSelectedLessonId] = useState(INITIAL_CATEGORIES[0].sections[0].lessons[0].id);
  const [draft, setDraft] = useState<TutorialLesson>(INITIAL_CATEGORIES[0].sections[0].lessons[0]);
  const [categoryDraftOpen, setCategoryDraftOpen] = useState(false);
  const [newCategoryTitle, setNewCategoryTitle] = useState("");
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [lessonDialog, setLessonDialog] = useState<LessonDialog | null>(null);
  const [dialogLesson, setDialogLesson] = useState<TutorialLesson | null>(null);
  const [dialogTitle, setDialogTitle] = useState("");
  const [dialogSummary, setDialogSummary] = useState("");
  const [dialogBusy, setDialogBusy] = useState(false);
  const [contentDialog, setContentDialog] = useState<ContentDialogState | null>(null);
  const [contentDraft, setContentDraft] = useState({ type: "lexical" as TutorialContentType, title: "", content: "", url: "" });
  const [contentBusy, setContentBusy] = useState(false);
  const [uploadingDocument, setUploadingDocument] = useState(false);

  const category = categories.find((item) => item.id === selectedCategoryId) ?? categories[0];
  const lessonLocations = category.sections.flatMap((section) => section.lessons.map((lesson) => ({ section, lesson })));
  const selectedLocation = lessonLocations.find((item) => item.lesson.id === selectedLessonId);
  const section = selectedLocation?.section ?? category.sections.find((item) => item.id === selectedSectionId) ?? category.sections[0];
  const lesson = selectedLocation?.lesson ?? section?.lessons[0] ?? null;
  const lessons = lessonLocations.map((item) => item.lesson);

  useEffect(() => {
    let mounted = true;
    void listTutorials()
      .then((items) => {
        if (!mounted || items.length === 0) return;
        const nextCategory = items[0];
        const nextLocation = nextCategory.sections.flatMap((item) => item.lessons.map((lessonItem) => ({ section: item, lesson: lessonItem })))[0];
        setCategories(items);
        setSelectedCategoryId(nextCategory.id);
        setSelectedSectionId(nextLocation?.section.id ?? "");
        setSelectedLessonId(nextLocation?.lesson.id ?? "");
        setDraft(nextLocation?.lesson ?? EMPTY_LESSON);
      })
      .catch((reason: unknown) => {
        if (mounted) setError(reason instanceof Error ? reason.message : "튜토리얼을 불러오지 못했습니다.");
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => { mounted = false; };
  }, []);

  function replaceCategory(nextCategory: TutorialCategory | undefined) {
    if (!nextCategory) return;
    setCategories((current) => current.map((item) => item.id === nextCategory.id ? nextCategory : item));
  }

  function selectCategory(nextCategory: TutorialCategory) {
    const nextLocation = nextCategory.sections.flatMap((item) => item.lessons.map((lessonItem) => ({ section: item, lesson: lessonItem })))[0];
    setSelectedCategoryId(nextCategory.id);
    setSelectedSectionId(nextLocation?.section.id ?? "");
    setSelectedLessonId(nextLocation?.lesson.id ?? "");
    setDraft(nextLocation?.lesson ?? EMPTY_LESSON);
  }

  function selectLesson(nextLesson: TutorialLesson) {
    const parentSection = category.sections.find((item) => item.lessons.some((lessonItem) => lessonItem.id === nextLesson.id));
    setSelectedSectionId(parentSection?.id ?? "");
    setSelectedLessonId(nextLesson.id);
    setDraft(nextLesson);
    setSaved(false);
  }

  function updateDraft<K extends keyof TutorialLesson>(key: K, value: TutorialLesson[K]) {
    setDraft((current) => ({ ...current, [key]: value }));
    setSaved(false);
  }

  async function saveLesson() {
    if (!draft.title.trim() || !section) return;
    try {
      const nextCategory = await updateTutorialLesson(draft.id, { title: draft.title.trim(), summary: draft.summary.trim() });
      replaceCategory(nextCategory);
      setDraft((current) => ({ ...current, title: current.title.trim(), summary: current.summary.trim() }));
      setSaved(true);
      setError("");
    } catch (reason: unknown) {
      setError(reason instanceof Error ? reason.message : "튜토리얼을 저장하지 못했습니다.");
    }
  }

  async function createCategory() {
    const title = newCategoryTitle.trim();
    if (!title) return;
    try {
      const created = await createTutorialCategory({ title, summary: "새 튜토리얼 카테고리입니다." });
      setCategories((current) => [...current, created]);
      setNewCategoryTitle("");
      setCategoryDraftOpen(false);
      selectCategory(created);
    } catch (reason: unknown) {
      setError(reason instanceof Error ? reason.message : "카테고리를 만들지 못했습니다.");
    }
  }

  async function createLesson() {
    if (!section) return;
    try {
      const nextCategory = await createTutorialLesson(section.id, { title: "새 튜토리얼", summary: "튜토리얼 설명을 입력하세요.", content: "", videoUrl: "", videoTitle: "", documentUrl: "", documentTitle: "" });
      replaceCategory(nextCategory);
      const nextSection = nextCategory?.sections.find((item) => item.id === section.id);
      const nextLesson = nextSection?.lessons[nextSection.lessons.length - 1];
      if (!nextLesson) return;
      setSelectedLessonId(nextLesson.id);
      setDraft(nextLesson);
    } catch (reason: unknown) {
      setError(reason instanceof Error ? reason.message : "튜토리얼을 만들지 못했습니다.");
    }
  }

  function openLessonDialog(mode: LessonDialog, nextLesson: TutorialLesson) {
    setLessonDialog(mode);
    setDialogLesson(nextLesson);
    setDialogTitle(nextLesson.title);
    setDialogSummary(nextLesson.summary);
  }

  async function saveLessonMeta() {
    if (!dialogLesson || !dialogTitle.trim()) return;
    setDialogBusy(true);
    try {
      const nextCategory = await updateTutorialLesson(dialogLesson.id, { title: dialogTitle.trim() });
      replaceCategory(nextCategory);
      if (nextCategory) {
        const updated = nextCategory.sections.flatMap((item) => item.lessons).find((item) => item.id === dialogLesson.id);
        if (updated) setDraft(updated);
      }
      setLessonDialog(null);
      setDialogLesson(null);
    } catch (reason: unknown) {
      setError(reason instanceof Error ? reason.message : "튜토리얼 정보를 수정하지 못했습니다.");
    } finally {
      setDialogBusy(false);
    }
  }

  async function removeLesson() {
    if (!dialogLesson) return;
    setDialogBusy(true);
    try {
      await deleteTutorialLesson(dialogLesson.id);
      const items = await listTutorials();
      const nextCategory = items.find((item) => item.id === category.id) ?? items[0];
      const nextLocation = nextCategory?.sections.flatMap((item) => item.lessons.map((lessonItem) => ({ section: item, lesson: lessonItem })))[0];
      setCategories(items);
      setSelectedCategoryId(nextCategory?.id ?? "");
      setSelectedSectionId(nextLocation?.section.id ?? "");
      setSelectedLessonId(nextLocation?.lesson.id ?? "");
      setDraft(nextLocation?.lesson ?? EMPTY_LESSON);
      setLessonDialog(null);
      setDialogLesson(null);
    } catch (reason: unknown) {
      setError(reason instanceof Error ? reason.message : "튜토리얼을 삭제하지 못했습니다.");
    } finally {
      setDialogBusy(false);
    }
  }

  function openContentDialog(mode: ContentDialogMode, type: TutorialContentType, content?: TutorialContent) {
    setContentDialog({ mode, type, content });
    setContentDraft({ type, title: content?.title ?? "", content: content?.content ?? "", url: content?.url ?? "" });
  }

  async function saveContent() {
    if (!lesson || !contentDraft.title.trim()) return;
    setContentBusy(true);
    try {
      const nextCategory = contentDialog?.mode === "edit" && contentDialog.content
        ? await updateTutorialContent(contentDialog.content.id, { type: contentDraft.type, title: contentDraft.title.trim(), content: contentDraft.content, url: contentDraft.url })
        : await createTutorialContent(lesson.id, { type: contentDraft.type, title: contentDraft.title.trim(), content: contentDraft.content, url: contentDraft.url });
      replaceCategory(nextCategory);
      setContentDialog(null);
      setError("");
    } catch (reason: unknown) {
      setError(reason instanceof Error ? reason.message : "강의 자료를 저장하지 못했습니다.");
    } finally {
      setContentBusy(false);
    }
  }

  async function removeContent() {
    if (!contentDialog?.content) return;
    setContentBusy(true);
    try {
      await deleteTutorialContent(contentDialog.content.id);
      const items = await listTutorials();
      setCategories(items);
      setContentDialog(null);
    } catch (reason: unknown) {
      setError(reason instanceof Error ? reason.message : "강의 자료를 삭제하지 못했습니다.");
    } finally {
      setContentBusy(false);
    }
  }

  async function handleDocumentUpload(file: File) {
    setUploadingDocument(true);
    try {
      const url = await uploadTutorialDocument(file);
      setContentDraft((current) => ({ ...current, url, title: current.title || file.name }));
    } catch (reason: unknown) {
      setError(reason instanceof Error ? reason.message : "문서를 업로드하지 못했습니다.");
    } finally {
      setUploadingDocument(false);
    }
  }

  return (
    <div className="flex min-w-0 flex-1 flex-col">
      <PageHeader>
        <GraduationCap className="size-4 text-brand-primary" />
        <span className="text-[14px] font-bold tracking-tight text-text-primary">Tutoring</span>
        <span className="ml-1 text-[12px] font-semibold text-text-muted">튜토리얼 관리</span>
      </PageHeader>

      <div className="min-h-0 flex-1 overflow-y-auto bg-surface-muted p-5">
        {loading && <Notice>튜토리얼을 불러오는 중입니다...</Notice>}
        {error && <Notice danger>{error}</Notice>}
        <main className="mx-auto grid min-h-[720px] w-full max-w-[1600px] gap-4 xl:grid-cols-[250px_360px_minmax(0,1fr)]">
          <aside className="flex min-h-0 flex-col rounded-md border border-surface-border bg-surface-raised shadow-sm">
            <PanelHeader title="1차 카테고리" count={categories.length} onAdd={() => setCategoryDraftOpen((open) => !open)} />
            {categoryDraftOpen && <div className="border-b border-brand-border bg-brand-glass p-3"><input value={newCategoryTitle} onChange={(event) => setNewCategoryTitle(event.target.value)} placeholder="카테고리 이름" className="ui-input h-9 text-xs font-bold" autoFocus /><div className="mt-2 flex justify-end gap-2"><button type="button" onClick={() => setCategoryDraftOpen(false)} className="rounded-md px-2 py-1 text-[11px] font-black text-text-muted">취소</button><button type="button" onClick={createCategory} className="rounded-md bg-brand-primary px-2.5 py-1 text-[11px] font-black text-text-on-brand">추가</button></div></div>}
            <div className="min-h-0 flex-1 space-y-2 overflow-y-auto p-3">
              {categories.map((item) => <button key={item.id} type="button" onClick={() => selectCategory(item)} className={`w-full rounded-md border-l-2 p-3 text-left transition ${item.id === category.id ? "border-brand-primary bg-brand-glass" : "border-transparent bg-surface-muted hover:border-brand-border"}`}><span className="block text-sm font-black text-text-primary">{item.title}</span><span className="mt-2 block text-[10px] font-black text-brand-primary">{item.sections.reduce((total, itemSection) => total + itemSection.lessons.length, 0)}개 자료</span></button>)}
            </div>
          </aside>

          <aside className="flex min-h-0 flex-col rounded-md border border-surface-border bg-surface-raised shadow-sm">
            <div className="flex min-h-12 items-center justify-between gap-3 border-b border-surface-border px-4"><div className="flex min-w-0 items-center gap-2"><BookOpen className="size-4 text-brand-primary" /><h2 className="truncate text-sm font-black text-text-primary">2차 주제</h2></div><span className="grid size-7 place-items-center rounded-md bg-surface-muted text-[11px] font-black text-text-muted">{lessons.length}</span></div>
            <div className="min-h-0 flex-1 overflow-y-auto p-3"><p className="mb-3 rounded-md bg-surface-muted p-3 text-[11px] font-semibold leading-5 text-text-secondary">{category.title}<br />{category.summary}</p><div className="space-y-1.5">{lessons.map((lessonItem) => <div key={lessonItem.id} className={`flex items-center gap-1 rounded-md border px-2 py-1.5 transition ${lessonItem.id === lesson?.id ? "border-brand-border bg-brand-glass" : "border-transparent bg-surface-muted hover:border-surface-border-soft hover:bg-surface-raised"}`}><button type="button" onClick={() => selectLesson(lessonItem)} className="flex min-w-0 flex-1 items-start gap-2 p-1 text-left"><FileText className="mt-0.5 size-3.5 shrink-0 text-brand-primary" /><span className="min-w-0"><span className="block truncate text-[12px] font-black text-text-primary">{lessonItem.title}</span><span className="mt-0.5 block truncate text-[10px] font-semibold text-text-muted">{lessonItem.summary}</span></span></button><button type="button" onClick={() => openLessonDialog("edit", lessonItem)} className="ui-icon-button h-7 w-7 shrink-0" title="2차 주제 수정"><Pencil className="size-3.5" /></button><button type="button" onClick={() => openLessonDialog("delete", lessonItem)} className="ui-icon-button h-7 w-7 shrink-0 text-[var(--destructive)]" title="2차 주제 삭제"><Trash2 className="size-3.5" /></button></div>)}<button type="button" onClick={createLesson} className="mt-2 flex w-full items-center gap-2 rounded-md border border-dashed border-brand-border px-3 py-2.5 text-[11px] font-black text-brand-primary hover:bg-surface-raised"><Plus className="size-3.5" />튜토리얼 추가</button></div></div>
          </aside>

          <section className="flex min-h-0 flex-col rounded-md border border-surface-border bg-surface-raised shadow-sm">
            {!lesson ? <EmptyLesson onCreate={createLesson} /> : <>
              <header className="flex flex-wrap items-center justify-between gap-3 border-b border-surface-border px-5 py-4"><div className="min-w-0"><p className="text-[10px] font-black uppercase tracking-[0.14em] text-brand-primary">{category.title} / {draft.title || "튜토리얼"}</p><h1 className="mt-1 truncate text-lg font-black text-text-primary">{draft.title || "새 튜토리얼"}</h1></div><button type="button" onClick={saveLesson} className="inline-flex min-h-9 items-center gap-2 rounded-md border border-brand-border bg-brand-glass px-3 text-sm font-black text-brand-primary hover:bg-surface-muted"><Save className="size-4" />{saved ? "저장됨" : "강의 정보 저장"}</button></header>
              <div className="min-h-0 flex-1 overflow-y-auto p-5"><div className="mx-auto max-w-4xl space-y-4"><input value={draft.title} onChange={(event) => updateDraft("title", event.target.value)} placeholder="튜토리얼 제목" className="ui-input h-11 text-base font-black" /><ContentList contents={lesson.contents} onAdd={(type) => openContentDialog("create", type)} onOpen={(content) => openContentDialog("detail", content.type, content)} /></div></div>
            </>}
          </section>
        </main>

        {lessonDialog && dialogLesson && <LessonDialogView mode={lessonDialog} title={dialogTitle} summary={dialogSummary} busy={dialogBusy} onTitleChange={setDialogTitle} onSummaryChange={setDialogSummary} onClose={() => { if (!dialogBusy) { setLessonDialog(null); setDialogLesson(null); } }} onSave={saveLessonMeta} onDelete={removeLesson} />}
        {contentDialog && <ContentDialogView state={contentDialog} draft={contentDraft} busy={contentBusy} uploading={uploadingDocument} onDraftChange={setContentDraft} onClose={() => { if (!contentBusy && !uploadingDocument) setContentDialog(null); }} onEdit={() => { if (contentDialog.content) { setContentDialog({ mode: "edit", type: contentDialog.type, content: contentDialog.content }); setContentDraft({ type: contentDialog.type, title: contentDialog.content.title, content: contentDialog.content.content, url: contentDialog.content.url }); } }} onSave={saveContent} onDelete={removeContent} onUpload={handleDocumentUpload} />}
      </div>
    </div>
  );
}

function ContentList({ contents, onAdd, onOpen }: { contents: TutorialContent[]; onAdd: (type: TutorialContentType) => void; onOpen: (content: TutorialContent) => void }) {
  return <section className="rounded-md border border-surface-border-soft bg-surface-muted p-4"><div className="flex flex-wrap items-center justify-between gap-3"><div><h2 className="text-sm font-black text-text-primary">강의 자료</h2><p className="mt-1 text-[11px] font-semibold text-text-muted">버튼으로 자료를 추가하고, 목록을 눌러 상세 내용을 확인하세요.</p></div><div className="flex flex-wrap gap-2"><AddContentButton icon={<Pencil className="size-3.5" />} label="Lexical 문서" onClick={() => onAdd("lexical")} /><AddContentButton icon={<Video className="size-3.5" />} label="YouTube 영상" onClick={() => onAdd("youtube")} /><AddContentButton icon={<FileUp className="size-3.5" />} label="실제 문서" onClick={() => onAdd("document")} /></div></div><div className="mt-4 space-y-2">{contents.length === 0 ? <div className="grid min-h-32 place-items-center rounded-md border border-dashed border-surface-border-soft text-xs font-semibold text-text-muted">아직 강의 자료가 없습니다. 위 버튼으로 추가하세요.</div> : contents.map((content) => <button key={content.id} type="button" onClick={() => onOpen(content)} className="flex w-full items-center gap-3 rounded-md border border-surface-border-soft bg-surface-raised px-3 py-3 text-left transition hover:border-brand-border hover:bg-brand-glass"><span className="grid size-9 shrink-0 place-items-center rounded-md bg-brand-glass text-brand-primary">{contentIcon(content.type)}</span><span className="min-w-0 flex-1"><strong className="block truncate text-sm font-black text-text-primary">{content.title}</strong><span className="mt-1 block text-[11px] font-semibold text-text-muted">{contentLabel(content.type)}</span></span><span className="text-xs font-black text-brand-primary">상세 보기 →</span></button>)}</div></section>;
}

function AddContentButton({ icon, label, onClick }: { icon: ReactNode; label: string; onClick: () => void }) {
  return <button type="button" onClick={onClick} className="inline-flex items-center gap-1.5 rounded-md border border-brand-border bg-brand-glass px-2.5 py-2 text-[11px] font-black text-brand-primary hover:bg-surface-raised">{icon}{label}</button>;
}

function ContentDialogView({ state, draft, busy, uploading, onDraftChange, onClose, onEdit, onSave, onDelete, onUpload }: { state: ContentDialogState; draft: { type: TutorialContentType; title: string; content: string; url: string }; busy: boolean; uploading: boolean; onDraftChange: (value: { type: TutorialContentType; title: string; content: string; url: string }) => void; onClose: () => void; onEdit: () => void; onSave: () => void; onDelete: () => void; onUpload: (file: File) => Promise<void> }) {
  const detail = state.mode === "detail";
  const type = state.content?.type ?? draft.type;
  const title = state.content?.title ?? draft.title;
  return <div className="fixed inset-0 z-40 grid place-items-center bg-[color-mix(in_srgb,var(--background)_72%,transparent)] p-4" role="presentation"><div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-xl border border-surface-border bg-surface-raised p-5 shadow-2xl" role="dialog" aria-modal="true" aria-labelledby="content-dialog-title"><div className="flex items-start justify-between gap-4"><div><p className="text-[10px] font-black uppercase tracking-[0.14em] text-brand-primary">강의 자료 · {contentLabel(type)}</p><h2 id="content-dialog-title" className="mt-1 text-lg font-black text-text-primary">{detail ? title : state.mode === "create" ? `${contentLabel(type)} 추가` : `${contentLabel(type)} 수정`}</h2></div><button type="button" onClick={onClose} disabled={busy || uploading} className="ui-icon-button" aria-label="자료 다이어로그 닫기">×</button></div>{detail ? <ContentDetail content={state.content!} /> : <div className="mt-5 space-y-3"><label className="block text-xs font-black text-text-secondary">자료 제목<input value={draft.title} onChange={(event) => onDraftChange({ ...draft, title: event.target.value })} className="ui-input mt-1 h-10 text-sm" autoFocus /></label>{type === "lexical" && <div className="overflow-hidden rounded-md border border-surface-border-soft"><LexicalEditor key={state.content?.id ?? "new-content"} initialState={draft.content} onChange={(content) => onDraftChange({ ...draft, content })} placeholder="문서 내용을 작성하세요..." minHeight="300px" /></div>}{type === "youtube" && <><label className="block text-xs font-black text-text-secondary">YouTube 주소<input value={draft.url} onChange={(event) => onDraftChange({ ...draft, url: event.target.value })} placeholder="https://youtu.be/..." className="ui-input mt-1 h-10 text-sm" /></label>{draft.url && !isYouTubeUrl(draft.url) && <p className="text-xs font-bold text-[var(--destructive)]">YouTube 링크를 입력해 주세요.</p>}</>}{type === "document" && <><label className="block text-xs font-black text-text-secondary">문서 주소<input value={draft.url} onChange={(event) => onDraftChange({ ...draft, url: event.target.value })} placeholder="https://..." className="ui-input mt-1 h-10 text-sm" /></label><label className={`flex h-10 cursor-pointer items-center justify-center rounded-md border border-dashed border-brand-border bg-brand-glass text-xs font-black text-brand-primary hover:bg-surface-muted ${uploading ? "pointer-events-none opacity-60" : ""}`}><input type="file" accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt" className="sr-only" disabled={uploading} onChange={(event) => { const file = event.target.files?.[0]; if (file) void onUpload(file); event.currentTarget.value = ""; }} />{uploading ? "업로드 중..." : "실제 문서 파일 업로드"}</label></>}</div>}<div className="mt-5 flex justify-end gap-2"><button type="button" onClick={onClose} disabled={busy || uploading} className="rounded-md px-3 py-2 text-xs font-black text-text-secondary hover:bg-surface-muted">닫기</button>{detail ? <><button type="button" onClick={() => onDelete()} disabled={busy} className="inline-flex items-center gap-1.5 rounded-md border border-[var(--destructive)] px-3 py-2 text-xs font-black text-[var(--destructive)]"><Trash2 className="size-3.5" />삭제</button><button type="button" onClick={onEdit} disabled={busy} className="inline-flex items-center gap-1.5 rounded-md bg-brand-primary px-3 py-2 text-xs font-black text-text-on-brand"><Pencil className="size-3.5" />수정</button></> : <button type="button" onClick={onSave} disabled={busy || uploading || !draft.title.trim() || (type === "youtube" && !isYouTubeUrl(draft.url))} className="inline-flex items-center gap-1.5 rounded-md bg-brand-primary px-3 py-2 text-xs font-black text-text-on-brand"><Save className="size-3.5" />{busy ? "저장 중..." : "저장"}</button>}</div></div></div>;
}

function ContentDetail({ content }: { content: TutorialContent }) {
  if (content.type === "lexical") return <div className="mt-5 overflow-hidden rounded-md border border-surface-border-soft"><LexicalEditor key={content.id} initialState={content.content} onChange={() => undefined} readOnly minHeight="360px" /></div>;
  if (content.type === "youtube") return <div className="mt-5 overflow-hidden rounded-md border border-surface-border-soft bg-surface-muted">{isYouTubeUrl(content.url) ? <iframe className="aspect-video w-full" src={`https://www.youtube.com/embed/${getYouTubeId(content.url)}`} title={content.title} allowFullScreen /> : <p className="p-5 text-sm font-semibold text-text-muted">유효한 YouTube 주소가 없습니다.</p>}</div>;
  return <div className="mt-5"><a href={content.url} target="_blank" rel="noreferrer" className="flex min-h-32 items-center justify-center gap-2 rounded-md border border-dashed border-brand-border bg-brand-glass px-4 text-center text-sm font-black text-brand-primary hover:underline"><LinkIcon className="size-5" />{content.title} 문서 열기</a></div>;
}

function LessonDialogView({ mode, title, summary, busy, onTitleChange, onSummaryChange, onClose, onSave, onDelete }: { mode: LessonDialog; title: string; summary: string; busy: boolean; onTitleChange: (value: string) => void; onSummaryChange: (value: string) => void; onClose: () => void; onSave: () => void; onDelete: () => void }) {
  const isDelete = mode === "delete";
  return <div className="fixed inset-0 z-40 grid place-items-center bg-[color-mix(in_srgb,var(--background)_72%,transparent)] p-4" role="presentation"><div className="w-full max-w-md rounded-xl border border-surface-border bg-surface-raised p-5 shadow-2xl" role="dialog" aria-modal="true" aria-labelledby="lesson-dialog-title"><p className="text-[10px] font-black uppercase tracking-[0.14em] text-brand-primary">2차 주제</p><h2 id="lesson-dialog-title" className="mt-1 text-lg font-black text-text-primary">{isDelete ? "튜토리얼 삭제" : "튜토리얼 수정"}</h2>{isDelete ? <p className="mt-5 rounded-md bg-danger-glass p-3 text-sm font-semibold leading-6 text-text-secondary"><strong className="text-text-primary">{title}</strong> 튜토리얼을 삭제할까요?<br />강의 자료도 함께 삭제됩니다.</p> : <div className="mt-5 space-y-3"><label className="block text-xs font-black text-text-secondary">제목<input value={title} onChange={(event) => onTitleChange(event.target.value)} className="ui-input mt-1 h-10 text-sm" autoFocus /></label><label className="block text-xs font-black text-text-secondary">설명<textarea value={summary} onChange={(event) => onSummaryChange(event.target.value)} className="ui-input mt-1 min-h-24 resize-none py-2 text-sm" /></label></div>}<div className="mt-5 flex justify-end gap-2"><button type="button" onClick={onClose} disabled={busy} className="rounded-md px-3 py-2 text-xs font-black text-text-secondary hover:bg-surface-muted">취소</button>{isDelete ? <button type="button" onClick={onDelete} disabled={busy} className="inline-flex items-center gap-1.5 rounded-md bg-[var(--destructive)] px-3 py-2 text-xs font-black text-text-on-brand">{busy ? "삭제 중..." : "삭제"}</button> : <button type="button" onClick={onSave} disabled={busy || !title.trim()} className="inline-flex items-center gap-1.5 rounded-md bg-brand-primary px-3 py-2 text-xs font-black text-text-on-brand"><Save className="size-3.5" />{busy ? "저장 중..." : "저장"}</button>}</div></div></div>;
}

function Notice({ children, danger = false }: { children: ReactNode; danger?: boolean }) {
  return <div className={`mx-auto mb-4 max-w-[1600px] rounded-md border px-4 py-3 text-xs font-bold ${danger ? "border-[var(--destructive)] bg-danger-glass text-[var(--destructive)]" : "border-brand-border bg-brand-glass text-brand-primary"}`}>{children}</div>;
}

function PanelHeader({ title, count, onAdd }: { title: string; count: number; onAdd: () => void }) {
  return <div className="flex min-h-12 items-center justify-between gap-3 border-b border-surface-border px-4"><div className="flex items-center gap-2"><BookOpen className="size-4 text-brand-primary" /><h2 className="text-sm font-black text-text-primary">{title}</h2></div><div className="flex items-center gap-2"><span className="grid size-7 place-items-center rounded-md bg-surface-muted text-[11px] font-black text-text-muted">{count}</span><button type="button" onClick={onAdd} className="grid size-7 place-items-center rounded-md border border-brand-border bg-brand-glass text-brand-primary hover:bg-surface-muted" title={`${title} 추가`}><Plus className="size-4" /></button></div></div>;
}

function EmptyLesson({ onCreate }: { onCreate: () => void }) {
  return <div className="grid min-h-[500px] place-items-center p-8 text-center"><div><div className="mx-auto grid size-14 place-items-center rounded-2xl bg-brand-glass text-brand-primary"><BookOpen className="size-7" /></div><h2 className="mt-4 text-base font-black text-text-primary">튜토리얼을 선택하세요</h2><p className="mt-2 text-sm font-semibold leading-6 text-text-secondary">가운데 목록에서 튜토리얼을 고르거나 새 튜토리얼을 추가하세요.</p><button type="button" onClick={onCreate} className="mt-4 inline-flex items-center gap-2 rounded-md border border-brand-border bg-brand-glass px-3 py-2 text-sm font-black text-brand-primary"><Plus className="size-4" />새 튜토리얼</button></div></div>;
}

export default TutoringModule;
