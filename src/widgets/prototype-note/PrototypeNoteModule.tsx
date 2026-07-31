import { useEffect, useMemo, useRef, useState, type PointerEvent } from "react";
import {
  Boxes,
  FileText,
  Pencil,
  Plus,
  RefreshCw,
  Trash2,
} from "lucide-react";
import PrototypeReferenceCard from "../../features/prototype/PrototypeReferenceCard";
import {
  createPrototypeNoteEntry,
  createPrototypeNoteSection,
  deletePrototypeNoteSection,
  getPrototypeNote,
  listPrototypeWorkspaces,
  listWorkspaceCategories,
  updatePrototypeNoteSection,
  type CatalogCategory,
  type CatalogPrototype,
  type PrototypeNoteEntry,
  type PrototypeNoteSection,
  type PrototypeNoteTopic,
  type PrototypeWorkspace,
} from "../../features/prototype/api";
import { ApiError } from "../../shared/api/client";
import PageHeader from "../../shared/ui/PageHeader";
import { LexicalEditor } from "../../shared/ui/lexical/lexical-editor";

type Props = {
  targetPrototypeId?: string | null;
  onOpenPrototype: () => void;
};

type PrototypeEntry = {
  category: CatalogCategory;
  prototype: CatalogPrototype;
};

function applyPrototypeNoteTopic(
  categories: CatalogCategory[],
  prototypeId: string,
  noteTopic: PrototypeNoteTopic,
) {
  return categories.map((category) => ({
    ...category,
    prototypes: category.prototypes.map((prototype) =>
      prototype.id === prototypeId ? { ...prototype, noteTopic } : prototype,
    ),
  }));
}

function PrototypeNoteModule({ targetPrototypeId, onOpenPrototype }: Props) {
  const [, setWorkspaces] = useState<PrototypeWorkspace[]>([]);
  const [selectedWorkspaceId, setSelectedWorkspaceId] = useState<string | null>(
    null,
  );
  const [categories, setCategories] = useState<CatalogCategory[]>([]);
  const [selectedOverviewCategoryId, setSelectedOverviewCategoryId] = useState<
    string | null
  >(null);
  const [selectedPrototypeId, setSelectedPrototypeId] = useState<string | null>(
    null,
  );
  const [selectedSectionId, setSelectedSectionId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingTopics, setLoadingTopics] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sectionDraftOpen, setSectionDraftOpen] = useState(false);
  const [sectionTitle, setSectionTitle] = useState("");
  const [sectionContent, setSectionContent] = useState("");
  const [sectionError, setSectionError] = useState<string | null>(null);
  const [savingSection, setSavingSection] = useState(false);
  const [draftEditorKey, setDraftEditorKey] = useState(0);
  const [editingSectionId, setEditingSectionId] = useState<string | null>(null);
  const [editSectionTitle, setEditSectionTitle] = useState("");
  const [editSectionContent, setEditSectionContent] = useState("");
  const [savingSectionEdit, setSavingSectionEdit] = useState(false);
  const [deletingSectionId, setDeletingSectionId] = useState<string | null>(null);
  const [noteDraftOpen, setNoteDraftOpen] = useState(false);
  const [noteTitle, setNoteTitle] = useState("");
  const [noteContent, setNoteContent] = useState("");
  const [noteError, setNoteError] = useState<string | null>(null);
  const [savingNote, setSavingNote] = useState(false);
  const [noteDraftEditorKey, setNoteDraftEditorKey] = useState(0);
  const [sidebarWidth, setSidebarWidth] = useState(380);
  const [sectionSidebarWidth, setSectionSidebarWidth] = useState(340);
  const [resizing, setResizing] = useState(false);
  const [resizingSection, setResizingSection] = useState(false);
  const resizeStartRef = useRef({ x: 0, width: 380 });
  const sectionResizeStartRef = useRef({ x: 0, width: 340 });
  const previousTargetPrototypeIdRef = useRef<string | null | undefined>(
    undefined,
  );

  async function loadWorkspaces() {
    setLoading(true);
    try {
      const data = await listPrototypeWorkspaces();
      setWorkspaces(data);
      setSelectedWorkspaceId((current) =>
        current && data.some((workspace) => workspace.id === current)
          ? current
          : data[0]?.id ?? null,
      );
      setError(null);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "프로토타입 노트 워크스페이스를 불러오지 못했습니다.",
      );
    } finally {
      setLoading(false);
    }
  }

  async function loadTopics(workspaceId: string) {
    setLoadingTopics(true);
    try {
      const data = await listWorkspaceCategories(workspaceId);
      setCategories(data);
      setError(null);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "프로토타입 노트 주제를 불러오지 못했습니다.",
      );
    } finally {
      setLoadingTopics(false);
    }
  }

  useEffect(() => {
    void loadWorkspaces();
  }, []);

  useEffect(() => {
    if (!selectedWorkspaceId) {
      setCategories([]);
      setSelectedPrototypeId(null);
      setSelectedSectionId(null);
      return;
    }
    void loadTopics(selectedWorkspaceId);
  }, [selectedWorkspaceId]);

  useEffect(() => {
    if (!resizing) return;

    function handlePointerMove(event: globalThis.PointerEvent) {
      const delta = event.clientX - resizeStartRef.current.x;
      const nextWidth = resizeStartRef.current.width + delta;
      setSidebarWidth(Math.max(320, Math.min(560, nextWidth)));
    }

    function handlePointerUp() {
      setResizing(false);
    }

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);
    window.addEventListener("pointercancel", handlePointerUp);

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
      window.removeEventListener("pointercancel", handlePointerUp);
    };
  }, [resizing]);

  useEffect(() => {
    if (!resizingSection) return;

    function handlePointerMove(event: globalThis.PointerEvent) {
      const delta = event.clientX - sectionResizeStartRef.current.x;
      const nextWidth = sectionResizeStartRef.current.width + delta;
      setSectionSidebarWidth(Math.max(280, Math.min(500, nextWidth)));
    }

    function handlePointerUp() {
      setResizingSection(false);
    }

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);
    window.addEventListener("pointercancel", handlePointerUp);

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
      window.removeEventListener("pointercancel", handlePointerUp);
    };
  }, [resizingSection]);

  function startResize(event: PointerEvent<HTMLButtonElement>) {
    event.preventDefault();
    resizeStartRef.current = { x: event.clientX, width: sidebarWidth };
    setResizing(true);
  }

  function startSectionResize(event: PointerEvent<HTMLButtonElement>) {
    event.preventDefault();
    sectionResizeStartRef.current = {
      x: event.clientX,
      width: sectionSidebarWidth,
    };
    setResizingSection(true);
  }

  const allPrototypes = useMemo<PrototypeEntry[]>(
    () =>
      categories.flatMap((category) =>
        category.prototypes.map((prototype) => ({ category, prototype })),
      ),
    [categories],
  );

  useEffect(() => {
    if (!targetPrototypeId && previousTargetPrototypeIdRef.current) {
      setSelectedPrototypeId(null);
      setSelectedSectionId(null);
    }
    previousTargetPrototypeIdRef.current = targetPrototypeId;
  }, [targetPrototypeId]);

  useEffect(() => {
    if (targetPrototypeId || selectedPrototypeId) return;
    setSelectedOverviewCategoryId((current) =>
      current && categories.some((category) => category.id === current)
        ? current
        : categories[0]?.id ?? null,
    );
  }, [categories, selectedPrototypeId, targetPrototypeId]);

  useEffect(() => {
    if (targetPrototypeId) {
      const target = allPrototypes.find(
        ({ prototype }) => prototype.id === targetPrototypeId,
      );
      if (target) {
        setSelectedPrototypeId(target.prototype.id);
        setSelectedSectionId(target.prototype.noteTopic?.sections[0]?.id ?? null);
        return;
      }
    }

    if (!targetPrototypeId) {
      setSelectedPrototypeId((current) =>
        current &&
        allPrototypes.some(({ prototype }) => prototype.id === current)
          ? current
          : null,
      );
      return;
    }

    setSelectedPrototypeId((current) =>
      current &&
      allPrototypes.some(({ prototype }) => prototype.id === current)
        ? current
        : null,
    );
  }, [allPrototypes, targetPrototypeId]);

  const selectedOverviewCategory = useMemo(
    () =>
      selectedOverviewCategoryId
        ? categories.find((category) => category.id === selectedOverviewCategoryId) ??
          null
        : null,
    [categories, selectedOverviewCategoryId],
  );

  const overviewPrototypes = selectedOverviewCategory?.prototypes ?? [];

  const selectedEntry = useMemo(
    () =>
      selectedPrototypeId
        ? allPrototypes.find(
            ({ prototype }) => prototype.id === selectedPrototypeId,
          ) ?? null
        : null,
    [allPrototypes, selectedPrototypeId],
  );

  const noteSections = selectedEntry?.prototype.noteTopic?.sections ?? [];

  useEffect(() => {
    if (!selectedEntry || selectedEntry.prototype.noteTopic) return;

    let cancelled = false;
    void getPrototypeNote(selectedEntry.prototype.id)
      .then((noteTopic) => {
        if (cancelled || !noteTopic) return;
        setCategories((current) =>
          applyPrototypeNoteTopic(
            current,
            selectedEntry.prototype.id,
            noteTopic,
          ),
        );
      })
      .catch(() => {
        // 이전 서버 버전이나 오프라인 상태에서는 목록 응답만 사용한다.
      });

    return () => {
      cancelled = true;
    };
  }, [selectedEntry]);

  useEffect(() => {
    setSelectedSectionId((current) =>
      current && noteSections.some((section) => section.id === current)
        ? current
        : noteSections[0]?.id ?? null,
    );
  }, [noteSections]);

  const selectedSection = useMemo(
    () =>
      selectedSectionId
        ? noteSections.find((section) => section.id === selectedSectionId) ??
          null
        : null,
    [noteSections, selectedSectionId],
  );

  useEffect(() => {
    setSectionDraftOpen(false);
    setSectionTitle("");
    setSectionContent("");
    setSectionError(null);
    setDraftEditorKey((key) => key + 1);
    setEditingSectionId(null);
    setEditSectionTitle("");
    setEditSectionContent("");
    setNoteDraftOpen(false);
    setNoteTitle("");
    setNoteContent("");
    setNoteError(null);
    setNoteDraftEditorKey((key) => key + 1);
  }, [selectedPrototypeId]);

  async function handleCreateSection() {
    const title = sectionTitle.trim();
    const content = sectionContent.trim();
    if (!selectedEntry || (!title && !content)) return;

    setSavingSection(true);
    setSectionError(null);
    try {
      const noteTopic = await createPrototypeNoteSection(
        selectedEntry.prototype.id,
        {
          title: title || "새 주제",
          summary: content,
          content: "",
        },
      );
      setCategories((current) =>
        applyPrototypeNoteTopic(current, selectedEntry.prototype.id, noteTopic),
      );
      setSelectedSectionId(
        noteTopic.sections[noteTopic.sections.length - 1]?.id ?? null,
      );
      setSectionTitle("");
      setSectionContent("");
      setSectionDraftOpen(false);
      setDraftEditorKey((key) => key + 1);
      setError(null);
      if (selectedWorkspaceId) {
        void loadTopics(selectedWorkspaceId);
      }
    } catch (err) {
      if (err instanceof ApiError && err.status === 404) {
        setSectionError(
          "현재 연결된 API 서버에 노트 주제 추가 API가 없습니다. 로컬 API로 전환하거나 백엔드를 배포해야 합니다.",
        );
        return;
      }
      setSectionError(
        err instanceof Error ? err.message : "노트 주제를 추가하지 못했습니다.",
      );
    } finally {
      setSavingSection(false);
    }
  }

  async function handleCreateNote() {
    const title = noteTitle.trim();
    const content = noteContent.trim();
    if (!selectedEntry || !selectedSection || (!title && !content)) return;

    setSavingNote(true);
    setNoteError(null);
    try {
      const noteTopic = await createPrototypeNoteEntry(selectedSection.id, {
        title: title || "새 노트",
        content,
      });
      setCategories((current) =>
        applyPrototypeNoteTopic(current, selectedEntry.prototype.id, noteTopic),
      );
      setNoteTitle("");
      setNoteContent("");
      setNoteDraftOpen(false);
      setNoteDraftEditorKey((key) => key + 1);
      setError(null);
      if (selectedWorkspaceId) {
        void loadTopics(selectedWorkspaceId);
      }
    } catch (err) {
      if (err instanceof ApiError && err.status === 404) {
        setNoteError(
          "현재 연결된 API 서버에 노트 추가 API가 없습니다. 백엔드를 배포해야 합니다.",
        );
        return;
      }
      setNoteError(err instanceof Error ? err.message : "노트를 추가하지 못했습니다.");
    } finally {
      setSavingNote(false);
    }
  }

  function startEditSection(section: PrototypeNoteSection) {
    setEditingSectionId(section.id);
    setEditSectionTitle(section.title);
    setEditSectionContent(section.summary);
    setSectionDraftOpen(false);
    setSectionError(null);
  }

  async function handleUpdateSection(sectionId: string) {
    const title = editSectionTitle.trim();
    const summary = editSectionContent.trim();
    if (!selectedEntry || !title) return;

    setSavingSectionEdit(true);
    setSectionError(null);
    try {
      const noteTopic = await updatePrototypeNoteSection(sectionId, {
        title,
        summary,
      });
      setCategories((current) =>
        applyPrototypeNoteTopic(current, selectedEntry.prototype.id, noteTopic),
      );
      setEditingSectionId(null);
      setEditSectionTitle("");
      setEditSectionContent("");
      setError(null);
      if (selectedWorkspaceId) {
        void loadTopics(selectedWorkspaceId);
      }
    } catch (err) {
      setSectionError(
        err instanceof Error ? err.message : "노트 주제를 수정하지 못했습니다.",
      );
    } finally {
      setSavingSectionEdit(false);
    }
  }

  async function handleDeleteSection(sectionId: string) {
    if (!selectedEntry) return;
    const confirmed = window.confirm("이 노트 주제를 삭제할까요? 포함된 노트도 함께 삭제됩니다.");
    if (!confirmed) return;

    setDeletingSectionId(sectionId);
    setSectionError(null);
    try {
      const noteTopic = await deletePrototypeNoteSection(sectionId);
      setCategories((current) =>
        applyPrototypeNoteTopic(current, selectedEntry.prototype.id, noteTopic),
      );
      setSelectedSectionId(noteTopic.sections[0]?.id ?? null);
      setEditingSectionId(null);
      setEditSectionTitle("");
      setEditSectionContent("");
      setError(null);
      if (selectedWorkspaceId) {
        void loadTopics(selectedWorkspaceId);
      }
    } catch (err) {
      setSectionError(
        err instanceof Error ? err.message : "노트 주제를 삭제하지 못했습니다.",
      );
    } finally {
      setDeletingSectionId(null);
    }
  }

  return (
    <div className="flex min-w-0 flex-1 flex-col">
      <PageHeader>
        <span className="text-[14px] font-bold tracking-tight text-text-primary">
          프로토타입 노트
        </span>
      </PageHeader>

      <section className="flex min-h-12 items-center justify-between gap-4 border-b border-surface-border-soft bg-surface-raised px-4">
        <div className="flex min-w-0 items-center gap-2">
          <span className="grid size-8 place-items-center rounded-md border border-brand-border bg-brand-glass">
            <FileText className="size-4 text-brand-primary" />
          </span>
          <div className="min-w-0">
            <h1 className="truncate text-base font-black text-text-primary">
              프로토타입 연관 노트
            </h1>
            <p className="truncate text-xs font-semibold text-text-secondary">
              프로토타입별 노트 주제와 노트 내용을 관리합니다.
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => void loadWorkspaces()}
          className="grid size-9 shrink-0 place-items-center rounded-md border border-surface-border-soft bg-surface-muted text-text-secondary hover:border-brand-border hover:text-brand-primary"
          title="새로고침"
        >
          <RefreshCw className="size-4" />
        </button>
      </section>

      <main className="min-h-0 flex-1 overflow-hidden bg-surface-strong p-5">
        {error ? (
          <EmptyState title="불러오지 못했습니다" description={error} />
        ) : loading || loadingTopics ? (
          <EmptyState
            title="프로토타입 노트를 불러오는 중"
            description="서버의 프로토타입과 연관 노트 구조를 확인하고 있습니다."
          />
        ) : allPrototypes.length === 0 ? (
          <EmptyState
            title="연결할 프로토타입이 없습니다"
            description="프로토타입을 등록하면 연관 노트 주제가 자동으로 생성됩니다."
          />
        ) : !selectedEntry ? (
          <PrototypeNoteOverview
            categories={categories}
            selectedCategory={selectedOverviewCategory}
            selectedCategoryId={selectedOverviewCategoryId}
            prototypes={overviewPrototypes}
            onSelectCategory={setSelectedOverviewCategoryId}
            onOpenNotes={(prototypeId) => {
              const target = allPrototypes.find(
                ({ prototype }) => prototype.id === prototypeId,
              );
              setSelectedPrototypeId(prototypeId);
              setSelectedSectionId(
                target?.prototype.noteTopic?.sections[0]?.id ?? null,
              );
            }}
          />
        ) : (
          <div
            className={
              "grid h-full min-h-0 gap-0 overflow-hidden rounded-md border border-surface-border bg-surface-raised shadow-sm " +
              (resizing || resizingSection ? "select-none" : "")
            }
            style={{
              gridTemplateColumns: `${sidebarWidth}px 8px minmax(0,1fr)`,
            }}
          >
            <aside className="min-h-0 overflow-y-auto border-r border-surface-border p-3">
              <CurrentPrototypeCard
                entry={selectedEntry}
                onOpenPrototype={onOpenPrototype}
              />
            </aside>

            <button
              type="button"
              aria-label="노트 사이드바 폭 조절"
              onPointerDown={startResize}
              className={
                "cursor-col-resize border-r border-surface-border bg-surface-border-soft transition-colors hover:bg-brand-border " +
                (resizing ? "bg-brand-border" : "")
              }
              title="사이드바 폭 조절"
            />

            <PrototypeNoteDetail
              entry={selectedEntry}
              section={selectedSection}
              sections={noteSections}
              onSelectSection={(sectionId) => {
                setSelectedSectionId(sectionId);
                setSectionDraftOpen(false);
                setSectionTitle("");
                setSectionContent("");
                setSectionError(null);
                setDraftEditorKey((key) => key + 1);
                setEditingSectionId(null);
                setEditSectionTitle("");
                setEditSectionContent("");
                setNoteDraftOpen(false);
                setNoteTitle("");
                setNoteContent("");
                setNoteError(null);
                setNoteDraftEditorKey((key) => key + 1);
              }}
              sectionSidebarWidth={sectionSidebarWidth}
              resizingSection={resizingSection}
              onStartSectionResize={startSectionResize}
              sectionDraftOpen={sectionDraftOpen}
              sectionTitle={sectionTitle}
              sectionContent={sectionContent}
              sectionError={sectionError}
              draftEditorKey={draftEditorKey}
              savingSection={savingSection}
              onToggleSectionDraft={() => {
                setEditingSectionId(null);
                setEditSectionTitle("");
                setEditSectionContent("");
                setSectionDraftOpen((open) => {
                  const nextOpen = !open;
                  if (!nextOpen) {
                    setSectionTitle("");
                    setSectionContent("");
                    setDraftEditorKey((key) => key + 1);
                  }
                  return nextOpen;
                });
                setSectionError(null);
              }}
              onSectionTitleChange={setSectionTitle}
              onSectionContentChange={setSectionContent}
              onCreateSection={() => void handleCreateSection()}
              editingSectionId={editingSectionId}
              editSectionTitle={editSectionTitle}
              editSectionContent={editSectionContent}
              savingSectionEdit={savingSectionEdit}
              deletingSectionId={deletingSectionId}
              onStartEditSection={startEditSection}
              onCancelEditSection={() => {
                setEditingSectionId(null);
                setEditSectionTitle("");
                setEditSectionContent("");
                setSectionError(null);
              }}
              onEditSectionTitleChange={setEditSectionTitle}
              onEditSectionContentChange={setEditSectionContent}
              onUpdateSection={(sectionId) => void handleUpdateSection(sectionId)}
              onDeleteSection={(sectionId) => void handleDeleteSection(sectionId)}
              noteDraftOpen={noteDraftOpen}
              noteTitle={noteTitle}
              noteContent={noteContent}
              noteError={noteError}
              noteDraftEditorKey={noteDraftEditorKey}
              savingNote={savingNote}
              onToggleNoteDraft={() => {
                setNoteDraftOpen((open) => {
                  const nextOpen = !open;
                  if (!nextOpen) {
                    setNoteTitle("");
                    setNoteContent("");
                    setNoteDraftEditorKey((key) => key + 1);
                  }
                  return nextOpen;
                });
                setNoteError(null);
              }}
              onNoteTitleChange={setNoteTitle}
              onNoteContentChange={setNoteContent}
              onCreateNote={() => void handleCreateNote()}
            />
          </div>
        )}
      </main>
    </div>
  );
}

function PrototypeNoteOverview({
  categories,
  selectedCategory,
  selectedCategoryId,
  prototypes,
  onSelectCategory,
  onOpenNotes,
}: {
  categories: CatalogCategory[];
  selectedCategory: CatalogCategory | null;
  selectedCategoryId: string | null;
  prototypes: CatalogPrototype[];
  onSelectCategory: (categoryId: string) => void;
  onOpenNotes: (prototypeId: string) => void;
}) {
  return (
    <div className="grid h-full min-h-0 gap-4 overflow-hidden rounded-md border border-surface-border bg-surface-raised p-4 shadow-sm lg:grid-cols-[300px_minmax(0,1fr)]">
      <aside className="grid min-h-0 grid-rows-[auto_minmax(0,1fr)] overflow-hidden rounded-md border border-surface-border bg-surface-muted">
        <header className="flex min-h-14 items-center justify-between gap-3 border-b border-surface-border px-4">
          <h3 className="text-sm font-black text-text-primary">
            프로토타입 주제
          </h3>
          <span className="grid size-8 place-items-center rounded-md border border-surface-border bg-surface-raised text-xs font-black text-text-muted">
            {categories.length}
          </span>
        </header>
        <div className="min-h-0 overflow-y-auto p-3">
          <div className="grid gap-2">
            {categories.map((category) => {
              const active = category.id === selectedCategoryId;
              return (
                <button
                  key={category.id}
                  type="button"
                  onClick={() => onSelectCategory(category.id)}
                  className={
                    "w-full rounded-md border p-3 text-left transition-colors " +
                    (active
                      ? "border-brand-border bg-brand-glass shadow-sm"
                      : "border-surface-border-soft bg-surface-raised hover:border-brand-border")
                  }
                >
                  <div className="flex items-start justify-between gap-3">
                    <strong className="line-clamp-1 text-sm font-black text-text-primary">
                      {category.title}
                    </strong>
                    <span className="shrink-0 text-xs font-black text-brand-primary">
                      {category.prototypes.length}
                    </span>
                  </div>
                  <p className="mt-1 line-clamp-2 text-xs font-semibold leading-5 text-text-secondary">
                    {category.description || "설명 없음"}
                  </p>
                </button>
              );
            })}
          </div>
        </div>
      </aside>

      <section className="grid min-h-0 grid-rows-[auto_minmax(0,1fr)] overflow-hidden rounded-md border border-surface-border bg-surface-raised">
        <header className="flex min-h-20 items-center justify-between gap-4 border-b border-surface-border px-5">
          <div className="min-w-0">
            <p className="text-[10px] font-black uppercase tracking-[0.16em] text-brand-primary">
              프로토타입 목록
            </p>
            <h2 className="line-clamp-1 text-xl font-black text-text-primary">
              {selectedCategory?.title ?? "주제를 선택하세요"}
            </h2>
            <p className="mt-1 line-clamp-1 text-sm font-semibold text-text-secondary">
              {selectedCategory?.description || "선택한 주제의 프로토타입 노트를 확인합니다."}
            </p>
          </div>
          <span className="grid size-10 shrink-0 place-items-center rounded-md border border-surface-border bg-surface-muted text-sm font-black text-text-primary">
            {prototypes.length}개
          </span>
        </header>

        <div className="min-h-0 overflow-y-auto p-5">
          {prototypes.length === 0 ? (
            <div className="grid min-h-[320px] place-items-center rounded-md border border-dashed border-surface-border-soft bg-surface-muted text-center">
              <div>
                <h4 className="text-sm font-black text-text-primary">
                  표시할 프로토타입이 없습니다
                </h4>
                <p className="mt-2 text-xs font-semibold text-text-secondary">
                  왼쪽에서 다른 주제를 선택하거나 프로토타입을 추가하세요.
                </p>
              </div>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-3">
              {prototypes.map((prototype) => (
                <PrototypeReferenceCard
                  key={prototype.id}
                  category={selectedCategory}
                  prototype={prototype}
                  imageClassName="h-36"
                  titleClassName="text-lg leading-7"
                  onOpenNotes={() => onOpenNotes(prototype.id)}
                />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

function CurrentPrototypeCard({
  entry,
  onOpenPrototype,
}: {
  entry: PrototypeEntry | null;
  onOpenPrototype: () => void;
}) {
  if (!entry) {
    return (
      <div className="rounded-md border border-dashed border-surface-border-soft bg-surface-muted p-4 text-sm font-bold text-text-muted">
        프로토타입을 선택하세요.
      </div>
    );
  }

  const { category, prototype } = entry;

  return (
    <PrototypeReferenceCard
      category={category}
      prototype={prototype}
      onOpenPrototype={onOpenPrototype}
      imageClassName="h-36"
      titleClassName="text-lg leading-7"
      summaryClassName="line-clamp-3"
    />
  );
}

function PrototypeNoteDetail({
  entry,
  section,
  sections,
  onSelectSection,
  sectionSidebarWidth,
  resizingSection,
  onStartSectionResize,
  sectionDraftOpen,
  sectionTitle,
  sectionContent,
  sectionError,
  draftEditorKey,
  savingSection,
  onToggleSectionDraft,
  onSectionTitleChange,
  onSectionContentChange,
  onCreateSection,
  editingSectionId,
  editSectionTitle,
  editSectionContent,
  savingSectionEdit,
  deletingSectionId,
  onStartEditSection,
  onCancelEditSection,
  onEditSectionTitleChange,
  onEditSectionContentChange,
  onUpdateSection,
  onDeleteSection,
  noteDraftOpen,
  noteTitle,
  noteContent,
  noteError,
  noteDraftEditorKey,
  savingNote,
  onToggleNoteDraft,
  onNoteTitleChange,
  onNoteContentChange,
  onCreateNote,
}: {
  entry: PrototypeEntry | null;
  section: PrototypeNoteSection | null;
  sections: PrototypeNoteSection[];
  onSelectSection: (sectionId: string) => void;
  sectionSidebarWidth: number;
  resizingSection: boolean;
  onStartSectionResize: (event: PointerEvent<HTMLButtonElement>) => void;
  sectionDraftOpen: boolean;
  sectionTitle: string;
  sectionContent: string;
  sectionError: string | null;
  draftEditorKey: number;
  savingSection: boolean;
  onToggleSectionDraft: () => void;
  onSectionTitleChange: (value: string) => void;
  onSectionContentChange: (value: string) => void;
  onCreateSection: () => void;
  editingSectionId: string | null;
  editSectionTitle: string;
  editSectionContent: string;
  savingSectionEdit: boolean;
  deletingSectionId: string | null;
  onStartEditSection: (section: PrototypeNoteSection) => void;
  onCancelEditSection: () => void;
  onEditSectionTitleChange: (value: string) => void;
  onEditSectionContentChange: (value: string) => void;
  onUpdateSection: (sectionId: string) => void;
  onDeleteSection: (sectionId: string) => void;
  noteDraftOpen: boolean;
  noteTitle: string;
  noteContent: string;
  noteError: string | null;
  noteDraftEditorKey: number;
  savingNote: boolean;
  onToggleNoteDraft: () => void;
  onNoteTitleChange: (value: string) => void;
  onNoteContentChange: (value: string) => void;
  onCreateNote: () => void;
}) {
  if (!entry) {
    return (
      <div className="grid min-h-0 place-items-center p-6 text-center">
        <div>
          <Boxes className="mx-auto size-8 text-brand-primary" />
          <h3 className="mt-3 text-sm font-black text-text-primary">
            1차 주제를 선택하세요
          </h3>
          <p className="mt-2 text-xs font-semibold text-text-secondary">
            프로토타입을 선택하면 연관 노트 주제와 노트를 보여줍니다.
          </p>
        </div>
      </div>
    );
  }

  return (
    <article
      className={
        "grid min-h-0 " + (resizingSection ? "select-none" : "")
      }
      style={{
        gridTemplateColumns: `${sectionSidebarWidth}px 8px minmax(0,1fr)`,
      }}
    >
      <aside className="grid min-h-0 grid-rows-[auto_minmax(0,1fr)] border-r border-surface-border bg-surface-raised">
        <div className="flex min-h-12 items-center justify-between border-b border-surface-border px-4">
          <h4 className="text-sm font-black text-text-primary">노트 주제</h4>
          <div className="flex items-center gap-2">
            <span className="grid size-8 place-items-center rounded-md border border-surface-border bg-surface-muted text-[10px] font-black text-text-muted">
              {sections.length}
            </span>
            <button
              type="button"
              onClick={onToggleSectionDraft}
              className="grid size-8 place-items-center rounded-md border border-brand-border bg-brand-glass text-brand-primary hover:bg-surface-muted"
              title={sectionDraftOpen ? "노트 주제 추가 닫기" : "노트 주제 추가"}
            >
              <Plus className="size-4" />
            </button>
          </div>
        </div>
        <div className="min-h-0 overflow-y-auto p-3">
          {sectionError ? (
            <div className="mb-3 rounded-md border border-[color-mix(in_srgb,var(--destructive)_45%,transparent)] bg-danger-glass px-3 py-2 text-xs font-bold leading-5 text-[var(--destructive)]">
              {sectionError}
            </div>
          ) : null}
          {sectionDraftOpen ? (
            <form
              onSubmit={(event) => {
                event.preventDefault();
                onCreateSection();
              }}
              className="mb-3 rounded-md border border-brand-border bg-brand-glass p-3"
            >
              <input
                value={sectionTitle}
                onChange={(event) => onSectionTitleChange(event.target.value)}
                placeholder="노트 주제"
                className="ui-input h-10 text-sm font-black"
                autoFocus
              />
              <textarea
                key={draftEditorKey}
                value={sectionContent}
                onChange={(event) => onSectionContentChange(event.target.value)}
                placeholder="주제 설명"
                className="ui-input mt-2 min-h-20 resize-none py-2 text-sm"
              />
              <div className="mt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={onToggleSectionDraft}
                  className="inline-flex min-h-8 items-center justify-center rounded-md border border-surface-border bg-surface-raised px-3 text-xs font-black text-text-secondary hover:border-brand-border hover:text-text-primary"
                >
                  취소
                </button>
                <button
                  type="submit"
                  disabled={
                    savingSection ||
                    (sectionTitle.trim().length === 0 &&
                      sectionContent.trim().length === 0)
                  }
                  className="inline-flex min-h-8 items-center justify-center rounded-md border border-brand-border bg-surface-raised px-3 text-xs font-black text-brand-primary hover:bg-surface-muted disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {savingSection ? "추가 중" : "추가"}
                </button>
              </div>
            </form>
          ) : null}
          <div className="space-y-2">
            {sections.map((item) => {
              const active = item.id === section?.id;
              const editing = item.id === editingSectionId;

              if (editing) {
                return (
                  <form
                    key={item.id}
                    onSubmit={(event) => {
                      event.preventDefault();
                      onUpdateSection(item.id);
                    }}
                    className="rounded-md border border-brand-border bg-brand-glass p-3"
                  >
                    <input
                      value={editSectionTitle}
                      onChange={(event) =>
                        onEditSectionTitleChange(event.target.value)
                      }
                      placeholder="노트 주제"
                      className="ui-input h-10 text-sm font-black"
                      autoFocus
                    />
                    <textarea
                      value={editSectionContent}
                      onChange={(event) =>
                        onEditSectionContentChange(event.target.value)
                      }
                      placeholder="주제 설명"
                      className="ui-input mt-2 min-h-20 resize-none py-2 text-sm"
                    />
                    <div className="mt-3 flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={onCancelEditSection}
                        className="inline-flex min-h-8 items-center justify-center rounded-md border border-surface-border bg-surface-raised px-3 text-xs font-black text-text-secondary hover:border-brand-border hover:text-text-primary"
                      >
                        취소
                      </button>
                      <button
                        type="submit"
                        disabled={savingSectionEdit || !editSectionTitle.trim()}
                        className="inline-flex min-h-8 items-center justify-center rounded-md border border-brand-border bg-surface-raised px-3 text-xs font-black text-brand-primary hover:bg-surface-muted disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {savingSectionEdit ? "저장 중" : "저장"}
                      </button>
                    </div>
                  </form>
                );
              }

              return (
                <article
                  key={item.id}
                  className={
                    "relative rounded-md border transition-colors " +
                    (active
                      ? "border-brand-border bg-brand-glass"
                      : "border-surface-border-soft bg-surface-muted hover:border-brand-border")
                  }
                >
                  <button
                    type="button"
                    onClick={() => onSelectSection(item.id)}
                    className="block w-full p-3 pr-16 text-left"
                  >
                    <strong className="line-clamp-1 text-sm font-black text-text-primary">
                      {item.title}
                    </strong>
                    <p className="mt-1 line-clamp-2 text-xs font-semibold leading-5 text-text-secondary">
                      {item.summary || "설명 없음"}
                    </p>
                    <span className="mt-2 inline-flex rounded bg-surface-raised px-1.5 py-0.5 text-[10px] font-black text-brand-primary">
                      {(item.notes ?? []).length}개 노트
                    </span>
                  </button>
                  <div className="absolute right-2 top-2 flex gap-1">
                    <button
                      type="button"
                      onClick={() => onStartEditSection(item)}
                      className="grid size-7 place-items-center rounded-md border border-surface-border bg-surface-raised text-text-secondary hover:border-brand-border hover:text-brand-primary"
                      title="노트 주제 수정"
                    >
                      <Pencil className="size-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => onDeleteSection(item.id)}
                      disabled={deletingSectionId === item.id}
                      className="grid size-7 place-items-center rounded-md border border-surface-border bg-surface-raised text-[var(--destructive)] hover:border-[color-mix(in_srgb,var(--destructive)_45%,transparent)] disabled:cursor-not-allowed disabled:opacity-60"
                      title="노트 주제 삭제"
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  </div>
                </article>
              );
            })}
            {sections.length === 0 ? (
              <div className="rounded-md border border-dashed border-surface-border-soft bg-surface-muted p-4 text-xs font-bold leading-5 text-text-muted">
                표시할 노트 주제가 없습니다.
              </div>
            ) : null}
          </div>
        </div>
      </aside>

      <button
        type="button"
        aria-label="노트 주제 사이드바 폭 조절"
        onPointerDown={onStartSectionResize}
        className={
          "cursor-col-resize border-r border-surface-border bg-surface-border-soft transition-colors hover:bg-brand-border " +
          (resizingSection ? "bg-brand-border" : "")
        }
        title="노트 주제 폭 조절"
      />

      <section className="grid min-h-0 grid-rows-[auto_minmax(0,1fr)]">
        <header className="flex min-h-14 items-center justify-between gap-3 border-b border-surface-border px-5">
          <div className="min-w-0">
            <p className="text-[10px] font-black uppercase tracking-[0.16em] text-brand-primary">
              노트 주제
            </p>
            <h3 className="line-clamp-1 text-lg font-black text-text-primary">
              {noteDraftOpen ? "새 노트" : section?.title ?? "노트 주제를 선택하세요"}
            </h3>
          </div>
          <button
            type="button"
            onClick={onToggleNoteDraft}
            disabled={!section}
            className="inline-flex min-h-9 shrink-0 items-center gap-2 rounded-md border border-brand-border bg-brand-glass px-3 text-sm font-black text-brand-primary hover:bg-surface-muted"
            title={noteDraftOpen ? "노트 추가 닫기" : "노트 추가"}
          >
            <Plus className="size-4" />
            {noteDraftOpen ? "닫기" : "노트 추가"}
          </button>
        </header>

        <div className="min-h-0 overflow-y-auto p-5">
          {noteError ? (
            <div className="mb-3 rounded-md border border-[color-mix(in_srgb,var(--destructive)_45%,transparent)] bg-danger-glass px-3 py-2 text-xs font-bold leading-5 text-[var(--destructive)]">
              {noteError}
            </div>
          ) : null}
          {!section ? (
            <div className="grid min-h-[320px] place-items-center rounded-md border border-dashed border-surface-border-soft bg-surface-muted text-center">
              <div>
                <h4 className="text-sm font-black text-text-primary">
                  노트 주제를 선택하세요
                </h4>
                <p className="mt-2 text-xs font-semibold text-text-secondary">
                  가운데에서 노트 주제를 선택하면 해당 노트 목록이 표시됩니다.
                </p>
              </div>
            </div>
          ) : noteDraftOpen ? (
            <form
              onSubmit={(event) => {
                event.preventDefault();
                onCreateNote();
              }}
              className="overflow-hidden rounded-md border border-brand-border bg-surface-raised"
            >
              <input
                value={noteTitle}
                onChange={(event) => onNoteTitleChange(event.target.value)}
                placeholder="노트 제목"
                className="h-12 w-full border-0 border-b border-surface-border bg-surface-muted px-4 text-base font-black text-text-primary outline-none placeholder:text-text-muted"
                autoFocus
              />
              <div className="border-b border-surface-border bg-surface-raised">
                <LexicalEditor
                  key={noteDraftEditorKey}
                  initialState={noteContent}
                  onChange={onNoteContentChange}
                  placeholder="노트 내용을 작성하세요..."
                  minHeight="360px"
                />
              </div>
              <div className="flex min-h-14 items-center justify-end gap-2 bg-surface-muted px-4">
                <button
                  type="button"
                  onClick={onToggleNoteDraft}
                  className="inline-flex min-h-9 items-center justify-center rounded-md border border-surface-border bg-surface-raised px-4 text-sm font-black text-text-secondary hover:border-brand-border hover:text-text-primary"
                >
                  취소
                </button>
                <button
                  type="submit"
                  disabled={
                    savingNote ||
                    (noteTitle.trim().length === 0 &&
                      noteContent.trim().length === 0)
                  }
                  className="inline-flex min-h-9 items-center justify-center rounded-md border border-brand-border bg-brand-glass px-4 text-sm font-black text-brand-primary hover:bg-surface-raised disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {savingNote ? "저장 중" : "저장"}
                </button>
              </div>
            </form>
          ) : (
            <NoteEntryList notes={section.notes ?? []} />
          )}
        </div>
      </section>
    </article>
  );
}

function NoteEntryList({ notes }: { notes: PrototypeNoteEntry[] }) {
  if (notes.length === 0) {
    return (
      <div className="grid min-h-[320px] place-items-center rounded-md border border-dashed border-surface-border-soft bg-surface-muted text-center">
        <div>
          <h4 className="text-sm font-black text-text-primary">
            아직 노트가 없습니다
          </h4>
          <p className="mt-2 text-xs font-semibold text-text-secondary">
            오른쪽 상단의 노트 추가 버튼으로 이 주제의 노트를 작성하세요.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid gap-3">
      {notes.map((note) => (
        <article
          key={note.id}
          className="overflow-hidden rounded-md border border-surface-border bg-surface-raised"
        >
          <header className="flex min-h-12 items-center justify-between gap-3 border-b border-surface-border bg-surface-muted px-4">
            <h4 className="line-clamp-1 text-sm font-black text-text-primary">
              {note.title}
            </h4>
            <span className="shrink-0 text-[10px] font-black text-text-muted">
              {new Date(note.updatedAt).toLocaleDateString("ko-KR")}
            </span>
          </header>
          <div className="p-4 text-sm font-semibold leading-7 text-text-primary">
            <NoteContent content={note.content} compact />
          </div>
        </article>
      ))}
    </div>
  );
}

function isLexicalContent(content: string) {
  try {
    const parsed = JSON.parse(content) as { root?: unknown };
    return Boolean(parsed.root);
  } catch {
    return false;
  }
}

function NoteContent({
  content,
  compact = false,
}: {
  content: string;
  compact?: boolean;
}) {
  const trimmed = content.trim();
  if (!trimmed) {
    return <span>아직 노트 내용이 없습니다.</span>;
  }

  if (isLexicalContent(trimmed)) {
    return (
      <div className={compact ? "overflow-hidden rounded-md" : "-m-5 overflow-hidden rounded-md"}>
        <LexicalEditor
          initialState={trimmed}
          onChange={() => undefined}
          readOnly
          minHeight={compact ? "120px" : "320px"}
        />
      </div>
    );
  }

  return <span>{trimmed}</span>;
}

function EmptyState({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="grid min-h-[420px] place-items-center p-6">
      <div className="flex max-w-sm flex-col items-center text-center">
        <span className="grid size-12 place-items-center rounded-md border border-surface-border-soft bg-surface-muted">
          <FileText className="size-5 text-brand-primary" />
        </span>
        <h3 className="mt-4 text-base font-black text-text-primary">{title}</h3>
        <p className="mt-2 text-sm font-semibold leading-6 text-text-secondary">
          {description}
        </p>
      </div>
    </div>
  );
}

export default PrototypeNoteModule;
