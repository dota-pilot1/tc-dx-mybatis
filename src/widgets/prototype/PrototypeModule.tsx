import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type FormEvent,
  type CSSProperties,
  type PointerEvent,
} from "react";
import {
  DndContext,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  Boxes,
  GitBranch,
  GripVertical,
  Pencil,
  Plus,
  RefreshCw,
  Search,
  Settings2,
  Trash2,
  X,
} from "lucide-react";
import PrototypeReferenceCard from "../../features/prototype/PrototypeReferenceCard";
import {
  createPrototypeWorkspace,
  createWorkspaceCategory,
  deleteCatalogCategory,
  deletePrototypeWorkspace,
  listPrototypeWorkspaces,
  listWorkspaceCategories,
  reorderWorkspaceCategories,
  updateCatalogCategory,
  updateCatalogPrototype,
  updatePrototypeWorkspace,
  type CatalogCategory,
  type CatalogPrototype,
  type PrototypeStatus,
  type PrototypeVisibility,
  type PrototypeWorkspace,
} from "../../features/prototype/api";
import PageHeader from "../../shared/ui/PageHeader";
import Select from "../../shared/ui/Select";

function PrototypeModule({
  onOpenPrototypeNote,
}: {
  onOpenPrototypeNote?: (prototypeId: string) => void;
}) {
  const [workspaces, setWorkspaces] = useState<PrototypeWorkspace[]>([]);
  const [selectedWorkspaceId, setSelectedWorkspaceId] = useState<string | null>(
    null,
  );
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(
    null,
  );
  const [categories, setCategories] = useState<CatalogCategory[]>([]);
  const [query, setQuery] = useState("");
  const [newTopicTitle, setNewTopicTitle] = useState("");
  const [editingTopicId, setEditingTopicId] = useState<string | null>(null);
  const [topicEditTitle, setTopicEditTitle] = useState("");
  const [topicEditSummary, setTopicEditSummary] = useState("");
  const [loadingWorkspaces, setLoadingWorkspaces] = useState(true);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [managerOpen, setManagerOpen] = useState(false);
  const [editingWorkspaceId, setEditingWorkspaceId] = useState<string | null>(
    null,
  );
  const [workspaceName, setWorkspaceName] = useState("");
  const [workspaceDescription, setWorkspaceDescription] = useState("");
  const [savingWorkspace, setSavingWorkspace] = useState(false);
  const [savingTopic, setSavingTopic] = useState(false);
  const [savingTopicEdit, setSavingTopicEdit] = useState(false);
  const [deletingTopicId, setDeletingTopicId] = useState<string | null>(null);
  const [managerError, setManagerError] = useState<string | null>(null);
  const [editingPrototypeEntry, setEditingPrototypeEntry] = useState<{
    category: CatalogCategory;
    prototype: CatalogPrototype;
  } | null>(null);
  const [prototypeTitle, setPrototypeTitle] = useState("");
  const [prototypeSummary, setPrototypeSummary] = useState("");
  const [prototypeRepoUrl, setPrototypeRepoUrl] = useState("");
  const [prototypeDemoUrl, setPrototypeDemoUrl] = useState("");
  const [prototypeFigmaUrl, setPrototypeFigmaUrl] = useState("");
  const [prototypeStatus, setPrototypeStatus] =
    useState<PrototypeStatus>("draft");
  const [prototypeVisibility, setPrototypeVisibility] =
    useState<PrototypeVisibility>("public");
  const [prototypeTags, setPrototypeTags] = useState("");
  const [prototypeEditError, setPrototypeEditError] = useState<string | null>(
    null,
  );
  const [savingPrototype, setSavingPrototype] = useState(false);
  const [topicSidebarWidth, setTopicSidebarWidth] = useState(350);
  const [resizingTopicSidebar, setResizingTopicSidebar] = useState(false);
  const topicResizeStartRef = useRef({ x: 0, width: 350 });
  const topicSensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 },
    }),
  );

  async function loadWorkspaces() {
    setLoadingWorkspaces(true);
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
          : "프로토타입 워크스페이스를 불러오지 못했습니다.",
      );
    } finally {
      setLoadingWorkspaces(false);
    }
  }

  async function reloadWorkspaces(nextSelectedId?: string | null) {
    const data = await listPrototypeWorkspaces();
    setWorkspaces(data);
    setSelectedWorkspaceId(
      nextSelectedId && data.some((workspace) => workspace.id === nextSelectedId)
        ? nextSelectedId
        : data[0]?.id ?? null,
    );
    return data;
  }

  async function createQuickWorkspace() {
    setSavingWorkspace(true);
    setError(null);
    try {
      const nextNumber = workspaces.length + 1;
      const saved = await createPrototypeWorkspace({
        name: `새 워크스페이스 ${nextNumber}`,
        description: "프로토타입 주제를 모아볼 새 공간입니다.",
      });
      await reloadWorkspaces(saved.id);
      setSelectedCategoryId(null);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "워크스페이스를 추가하지 못했습니다.",
      );
    } finally {
      setSavingWorkspace(false);
    }
  }

  async function loadCategories(workspaceId: string, preferredCategoryId?: string) {
    setLoadingCategories(true);
    try {
      const data = await listWorkspaceCategories(workspaceId);
      setCategories(data);
      setSelectedCategoryId((current) =>
        preferredCategoryId &&
        data.some((category) => category.id === preferredCategoryId)
          ? preferredCategoryId
          : current && data.some((category) => category.id === current)
          ? current
          : data[0]?.id ?? null,
      );
      setError(null);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "프로토타입 주제를 불러오지 못했습니다.",
      );
    } finally {
      setLoadingCategories(false);
    }
  }

  async function createQuickTopic(title?: string) {
    if (!selectedWorkspaceId) return;

    setSavingTopic(true);
    setError(null);
    try {
      const nextNumber = categories.length + 1;
      const topicTitle = title?.trim() || `새 주제 ${nextNumber}`;
      const saved = await createWorkspaceCategory(selectedWorkspaceId, {
        title: topicTitle,
        summary: `${topicTitle} 프로토타입`,
        group: "prototype",
        iconKey: "custom",
        tags: [],
        checklist: [],
      });
      setNewTopicTitle("");
      await loadCategories(selectedWorkspaceId, saved.id);
      void loadWorkspaces();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "프로토타입 주제를 추가하지 못했습니다.",
      );
    } finally {
      setSavingTopic(false);
    }
  }

  async function reorderTopics(activeId: string, overId: string) {
    if (!selectedWorkspaceId || activeId === overId) return;

    const oldIndex = categories.findIndex((category) => category.id === activeId);
    const newIndex = categories.findIndex((category) => category.id === overId);
    if (oldIndex < 0 || newIndex < 0) return;

    const previousCategories = categories;
    const nextCategories = arrayMove(categories, oldIndex, newIndex);
    setCategories(nextCategories);
    try {
      await reorderWorkspaceCategories(
        selectedWorkspaceId,
        nextCategories.map((category, orderIdx) => ({
          id: category.id,
          orderIdx,
        })),
      );
      void loadWorkspaces();
    } catch (err) {
      setCategories(previousCategories);
      setError(
        err instanceof Error
          ? err.message
          : "프로토타입 주제 순서를 저장하지 못했습니다.",
      );
    }
  }

  function handleTopicDragEnd(event: DragEndEvent) {
    if (!event.over) return;
    void reorderTopics(String(event.active.id), String(event.over.id));
  }

  function handleTopicCreateSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void createQuickTopic(newTopicTitle);
  }

  function startEditTopic(category: CatalogCategory) {
    setEditingTopicId(category.id);
    setTopicEditTitle(category.title);
    setTopicEditSummary(category.summary);
    setError(null);
  }

  function cancelEditTopic() {
    setEditingTopicId(null);
    setTopicEditTitle("");
    setTopicEditSummary("");
  }

  async function saveTopicEdit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!editingTopicId) return;

    const title = topicEditTitle.trim();
    const summary = topicEditSummary.trim();
    if (title.length < 2) {
      setError("주제 이름은 2자 이상이어야 합니다.");
      return;
    }

    setSavingTopicEdit(true);
    setError(null);
    try {
      const saved = await updateCatalogCategory(editingTopicId, {
        title,
        summary: summary || `${title} 프로토타입`,
      });
      setCategories((current) =>
        current.map((category) => (category.id === saved.id ? saved : category)),
      );
      setSelectedCategoryId(saved.id);
      cancelEditTopic();
      void loadWorkspaces();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "프로토타입 주제를 수정하지 못했습니다.",
      );
    } finally {
      setSavingTopicEdit(false);
    }
  }

  async function removeTopic(category: CatalogCategory) {
    if (category.prototypes.length > 0) {
      setError("프로토타입이 있는 주제는 먼저 프로토타입을 옮기거나 삭제해야 합니다.");
      return;
    }
    if (!window.confirm(`'${category.title}' 주제를 삭제할까요?`)) return;

    setDeletingTopicId(category.id);
    setError(null);
    try {
      await deleteCatalogCategory(category.id);
      setCategories((current) => {
        const nextCategories = current.filter((item) => item.id !== category.id);
        if (selectedCategoryId === category.id) {
          setSelectedCategoryId(nextCategories[0]?.id ?? null);
        }
        return nextCategories;
      });
      if (editingTopicId === category.id) cancelEditTopic();
      void loadWorkspaces();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "프로토타입 주제를 삭제하지 못했습니다.",
      );
    } finally {
      setDeletingTopicId(null);
    }
  }

  useEffect(() => {
    void loadWorkspaces();
  }, []);

  useEffect(() => {
    if (!selectedWorkspaceId) {
      setCategories([]);
      setSelectedCategoryId(null);
      return;
    }
    setSelectedCategoryId(null);
    void loadCategories(selectedWorkspaceId);
  }, [selectedWorkspaceId]);

  useEffect(() => {
    if (!resizingTopicSidebar) return;

    function handlePointerMove(event: globalThis.PointerEvent) {
      const delta = event.clientX - topicResizeStartRef.current.x;
      const nextWidth = topicResizeStartRef.current.width + delta;
      setTopicSidebarWidth(Math.max(320, Math.min(480, nextWidth)));
    }

    function handlePointerUp() {
      setResizingTopicSidebar(false);
    }

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);
    window.addEventListener("pointercancel", handlePointerUp);

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
      window.removeEventListener("pointercancel", handlePointerUp);
    };
  }, [resizingTopicSidebar]);

  function startTopicSidebarResize(event: PointerEvent<HTMLButtonElement>) {
    event.preventDefault();
    topicResizeStartRef.current = {
      x: event.clientX,
      width: topicSidebarWidth,
    };
    setResizingTopicSidebar(true);
  }

  const prototypes = useMemo(() => {
    const q = query.trim().toLowerCase();
    return categories
      .filter((category) => category.id === selectedCategoryId)
      .flatMap((category) =>
        category.prototypes
          .filter((prototype) => {
            if (!q) return true;
            return (
              prototype.title.toLowerCase().includes(q) ||
              prototype.summary.toLowerCase().includes(q) ||
              prototype.tags.some((tag) => tag.toLowerCase().includes(q))
            );
          })
          .map((prototype) => ({ category, prototype })),
      );
  }, [categories, query, selectedCategoryId]);

  const selectedCategory = useMemo(
    () =>
      selectedCategoryId
        ? categories.find((category) => category.id === selectedCategoryId)
        : null,
    [categories, selectedCategoryId],
  );

  function startCreateWorkspace() {
    setEditingWorkspaceId(null);
    setWorkspaceName("");
    setWorkspaceDescription("");
    setManagerError(null);
  }

  function startEditWorkspace(workspace: PrototypeWorkspace) {
    setEditingWorkspaceId(workspace.id);
    setWorkspaceName(workspace.name);
    setWorkspaceDescription(workspace.description ?? "");
    setManagerError(null);
  }

  async function saveWorkspace() {
    const name = workspaceName.trim();
    if (name.length < 2) {
      setManagerError("워크스페이스 이름은 2자 이상이어야 합니다.");
      return;
    }

    setSavingWorkspace(true);
    setManagerError(null);
    try {
      const payload = {
        name,
        description: workspaceDescription.trim() || null,
      };
      const saved = editingWorkspaceId
        ? await updatePrototypeWorkspace(editingWorkspaceId, payload)
        : await createPrototypeWorkspace(payload);
      await reloadWorkspaces(saved.id);
      startEditWorkspace(saved);
    } catch (err) {
      setManagerError(
        err instanceof Error
          ? err.message
          : "워크스페이스를 저장하지 못했습니다.",
      );
    } finally {
      setSavingWorkspace(false);
    }
  }

  async function removeWorkspace(workspace: PrototypeWorkspace) {
    if (workspace.categoryCount > 0) {
      setManagerError("주제가 있는 워크스페이스는 먼저 비워야 삭제할 수 있습니다.");
      return;
    }
    if (!window.confirm(`'${workspace.name}' 워크스페이스를 삭제할까요?`)) {
      return;
    }

    setSavingWorkspace(true);
    setManagerError(null);
    try {
      await deletePrototypeWorkspace(workspace.id);
      await reloadWorkspaces(
        selectedWorkspaceId === workspace.id ? null : selectedWorkspaceId,
      );
      if (editingWorkspaceId === workspace.id) startCreateWorkspace();
    } catch (err) {
      setManagerError(
        err instanceof Error
          ? err.message
          : "워크스페이스를 삭제하지 못했습니다.",
      );
    } finally {
      setSavingWorkspace(false);
    }
  }

  function startEditPrototype(
    category: CatalogCategory,
    prototype: CatalogPrototype,
  ) {
    setEditingPrototypeEntry({ category, prototype });
    setPrototypeTitle(prototype.title);
    setPrototypeSummary(prototype.summary);
    setPrototypeRepoUrl(prototype.repoUrl);
    setPrototypeDemoUrl(prototype.demoUrl ?? "");
    setPrototypeFigmaUrl(prototype.figmaUrl ?? "");
    setPrototypeStatus(prototype.status);
    setPrototypeVisibility(prototype.visibility);
    setPrototypeTags(prototype.tags.join(", "));
    setPrototypeEditError(null);
  }

  function closePrototypeEditor() {
    setEditingPrototypeEntry(null);
    setPrototypeEditError(null);
  }

  async function savePrototype() {
    if (!editingPrototypeEntry) return;

    const title = prototypeTitle.trim();
    const summary = prototypeSummary.trim();
    if (title.length < 2) {
      setPrototypeEditError("프로토타입 제목은 2자 이상이어야 합니다.");
      return;
    }
    if (summary.length < 2) {
      setPrototypeEditError("요약은 2자 이상이어야 합니다.");
      return;
    }

    setSavingPrototype(true);
    setPrototypeEditError(null);
    try {
      const savedCategory = await updateCatalogPrototype(
        editingPrototypeEntry.category.id,
        editingPrototypeEntry.prototype.id,
        {
          title,
          summary,
          repoUrl: prototypeRepoUrl.trim(),
          demoUrl: prototypeDemoUrl.trim() || null,
          figmaUrl: prototypeFigmaUrl.trim() || null,
          status: prototypeStatus,
          visibility: prototypeVisibility,
          tags: prototypeTags
            .split(",")
            .map((tag) => tag.trim())
            .filter(Boolean),
        },
      );
      setCategories((current) =>
        current.map((category) =>
          category.id === savedCategory.id ? savedCategory : category,
        ),
      );
      setSelectedCategoryId(savedCategory.id);
      void loadWorkspaces();
      closePrototypeEditor();
    } catch (err) {
      setPrototypeEditError(
        err instanceof Error ? err.message : "프로토타입을 저장하지 못했습니다.",
      );
    } finally {
      setSavingPrototype(false);
    }
  }

  return (
    <div className="flex min-w-0 flex-1 flex-col">
      <PageHeader>
        <span className="text-[14px] font-bold tracking-tight text-text-primary">
          프로토타입
        </span>
      </PageHeader>

      <div className="relative flex min-h-0 flex-1 flex-col bg-surface-muted">
        <section className="shrink-0 border-b border-surface-border-soft bg-surface-raised">
          <div className="flex min-h-12 items-center justify-between gap-4 border-b border-surface-border-soft px-4">
            <div className="flex min-w-0 items-center gap-2">
              <span className="grid size-8 place-items-center rounded-md border border-brand-border bg-brand-glass">
                <GitBranch className="size-4 text-brand-primary" />
              </span>
              <h1 className="truncate text-base font-black text-text-primary">
                설계 및 프로토타입 공간
              </h1>
            </div>
            <button
              type="button"
              onClick={() => setManagerOpen(true)}
              className="inline-flex h-9 shrink-0 items-center gap-2 rounded-md border border-brand-border bg-brand-glass px-3 text-sm font-black text-brand-primary hover:bg-surface-muted"
              title="워크스페이스 관리"
            >
              <Settings2 className="size-4" />
              관리
            </button>
          </div>

          <div className="flex min-h-12 items-center gap-2 px-4 py-2">
            <div className="flex min-w-0 flex-1 items-center gap-2 overflow-x-auto">
              {loadingWorkspaces ? (
                <span className="rounded-md border border-dashed border-surface-border-soft bg-surface-muted px-3 py-2 text-xs font-bold text-text-muted">
                  워크스페이스 로딩 중
                </span>
              ) : workspaces.length === 0 ? (
                <span className="rounded-md border border-dashed border-surface-border-soft bg-surface-muted px-3 py-2 text-xs font-bold text-text-muted">
                  등록된 워크스페이스 없음
                </span>
              ) : (
                workspaces.map((workspace) => {
                  const active = workspace.id === selectedWorkspaceId;
                  return (
                    <button
                      key={workspace.id}
                      type="button"
                      onClick={() => setSelectedWorkspaceId(workspace.id)}
                      className={
                        "flex h-10 shrink-0 items-center gap-2 rounded-md border px-3 text-left transition-colors " +
                        (active
                          ? "border-brand-border bg-brand-glass text-brand-primary"
                          : "border-surface-border-soft bg-surface-muted text-text-secondary hover:border-brand-border hover:text-text-primary")
                      }
                      title={workspace.description || workspace.name}
                    >
                      <span className="max-w-[220px] truncate text-sm font-black">
                        {workspace.name}
                      </span>
                      <span className="rounded bg-surface-raised px-1.5 py-0.5 text-[10px] font-black text-text-muted">
                        {workspace.categoryCount}/{workspace.prototypeCount}
                      </span>
                    </button>
                  );
                })
              )}
            </div>

            <button
              type="button"
              onClick={() => void createQuickWorkspace()}
              disabled={savingWorkspace}
              className="grid size-9 shrink-0 place-items-center rounded-md border border-brand-border bg-brand-glass text-brand-primary hover:bg-surface-muted disabled:cursor-not-allowed disabled:opacity-60"
              title="워크스페이스 바로 추가"
            >
              <Plus className="size-4" />
            </button>

            <div className="relative w-[280px] shrink-0">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-text-muted" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="프로토타입 검색"
                className="ui-input pl-9!"
              />
            </div>
            <button
              type="button"
              onClick={() => void loadWorkspaces()}
              className="grid size-9 shrink-0 place-items-center rounded-md border border-surface-border-soft bg-surface-muted text-text-secondary hover:border-brand-border hover:text-brand-primary"
              title="새로고침"
            >
              <RefreshCw className="size-4" />
            </button>
          </div>
        </section>

        <main className="min-w-0 overflow-y-auto bg-surface-strong p-5">
          <section>
            {error ? (
              <EmptyState
                title="불러오지 못했습니다"
                description={error}
                actionLabel="다시 시도"
                onAction={() =>
                  selectedWorkspaceId
                    ? void loadCategories(selectedWorkspaceId)
                    : void loadWorkspaces()
                }
              />
            ) : loadingCategories ? (
              <EmptyState
                title="프로토타입을 불러오는 중"
                description="서버의 워크스페이스 주제와 프로토타입을 확인하고 있습니다."
              />
            ) : selectedWorkspaceId && categories.length > 0 ? (
              <div
                className={
                  "prototype-topic-layout grid gap-4 " +
                  (resizingTopicSidebar ? "select-none" : "")
                }
                style={
                  {
                    "--prototype-topic-width": `${topicSidebarWidth}px`,
                  } as CSSProperties
                }
              >
                <CategoryList
                  categories={categories}
                  selectedCategoryId={selectedCategoryId}
                  onSelect={(categoryId) => setSelectedCategoryId(categoryId)}
                  newTopicTitle={newTopicTitle}
                  onNewTopicTitleChange={setNewTopicTitle}
                  onCreate={handleTopicCreateSubmit}
                  editingTopicId={editingTopicId}
                  topicEditTitle={topicEditTitle}
                  topicEditSummary={topicEditSummary}
                  onTopicEditTitleChange={setTopicEditTitle}
                  onTopicEditSummaryChange={setTopicEditSummary}
                  onTopicEditSave={saveTopicEdit}
                  onTopicEditCancel={cancelEditTopic}
                  onEditTopic={startEditTopic}
                  onDeleteTopic={(category) => void removeTopic(category)}
                  onDragEnd={handleTopicDragEnd}
                  sensors={topicSensors}
                  creating={savingTopic}
                  savingTopicEdit={savingTopicEdit}
                  deletingTopicId={deletingTopicId}
                />
                <button
                  type="button"
                  aria-label="프로토타입 주제 사이드바 폭 조절"
                  onPointerDown={startTopicSidebarResize}
                  className={
                    "prototype-topic-resizer hidden cursor-col-resize rounded bg-surface-border-soft transition-colors hover:bg-brand-border xl:block " +
                    (resizingTopicSidebar ? "bg-brand-border" : "")
                  }
                  title="사이드바 폭 조절"
                />
                <TopicPrototypePanel
                  selectedCategory={selectedCategory}
                  prototypes={prototypes}
                  onOpenNotes={(prototype) => onOpenPrototypeNote?.(prototype.id)}
                  onEditPrototype={startEditPrototype}
                />
              </div>
            ) : (
              <EmptyState
                title="표시할 프로토타입이 없습니다"
                description="서버에 프로토타입을 추가하면 이 메뉴에서 바로 확인할 수 있습니다. 다음 단계에서는 여기서 커머스 프로토타입 생성 폼을 붙이면 됩니다."
              />
            )}
          </section>
        </main>

        <WorkspaceManagerDrawer
          open={managerOpen}
          workspaces={workspaces}
          editingWorkspaceId={editingWorkspaceId}
          workspaceName={workspaceName}
          workspaceDescription={workspaceDescription}
          saving={savingWorkspace}
          error={managerError}
          onClose={() => setManagerOpen(false)}
          onCreate={startCreateWorkspace}
          onEdit={startEditWorkspace}
          onDelete={(workspace) => void removeWorkspace(workspace)}
          onNameChange={setWorkspaceName}
          onDescriptionChange={setWorkspaceDescription}
          onSave={() => void saveWorkspace()}
        />
        <PrototypeEditorDrawer
          entry={editingPrototypeEntry}
          title={prototypeTitle}
          summary={prototypeSummary}
          repoUrl={prototypeRepoUrl}
          demoUrl={prototypeDemoUrl}
          figmaUrl={prototypeFigmaUrl}
          status={prototypeStatus}
          visibility={prototypeVisibility}
          tags={prototypeTags}
          saving={savingPrototype}
          error={prototypeEditError}
          onClose={closePrototypeEditor}
          onTitleChange={setPrototypeTitle}
          onSummaryChange={setPrototypeSummary}
          onRepoUrlChange={setPrototypeRepoUrl}
          onDemoUrlChange={setPrototypeDemoUrl}
          onFigmaUrlChange={setPrototypeFigmaUrl}
          onStatusChange={setPrototypeStatus}
          onVisibilityChange={setPrototypeVisibility}
          onTagsChange={setPrototypeTags}
          onSave={() => void savePrototype()}
        />
      </div>
    </div>
  );
}

function WorkspaceManagerDrawer({
  open,
  workspaces,
  editingWorkspaceId,
  workspaceName,
  workspaceDescription,
  saving,
  error,
  onClose,
  onCreate,
  onEdit,
  onDelete,
  onNameChange,
  onDescriptionChange,
  onSave,
}: {
  open: boolean;
  workspaces: PrototypeWorkspace[];
  editingWorkspaceId: string | null;
  workspaceName: string;
  workspaceDescription: string;
  saving: boolean;
  error: string | null;
  onClose: () => void;
  onCreate: () => void;
  onEdit: (workspace: PrototypeWorkspace) => void;
  onDelete: (workspace: PrototypeWorkspace) => void;
  onNameChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
  onSave: () => void;
}) {
  return (
    <div
      className={
        "absolute inset-0 z-40 transition " +
        (open ? "pointer-events-auto" : "pointer-events-none")
      }
    >
      <button
        type="button"
        aria-label="워크스페이스 관리 닫기"
        onClick={onClose}
        className={
          "absolute inset-0 bg-[color-mix(in_srgb,var(--foreground)_24%,transparent)] transition-opacity " +
          (open ? "opacity-100" : "opacity-0")
        }
      />
      <aside
        className={
          "absolute right-0 top-0 flex h-full w-[420px] max-w-[calc(100vw-24px)] flex-col border-l border-surface-border-soft bg-surface-raised shadow-2xl transition-transform duration-200 ease-out " +
          (open ? "translate-x-0" : "translate-x-full")
        }
      >
        <header className="flex min-h-14 items-center justify-between gap-3 border-b border-surface-border-soft px-4">
          <div className="min-w-0">
            <p className="text-[10px] font-black uppercase tracking-[0.13em] text-brand-primary">
              Workspace Manager
            </p>
            <h2 className="truncate text-base font-black text-text-primary">
              프로토타입 워크스페이스 관리
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="grid size-9 shrink-0 place-items-center rounded-md border border-surface-border-soft bg-surface-muted text-text-secondary hover:border-brand-border hover:text-brand-primary"
            title="닫기"
          >
            <X className="size-4" />
          </button>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto p-4">
          <section className="rounded-md border border-surface-border-soft bg-surface-muted p-3">
            <div className="flex items-center justify-between gap-2">
              <h3 className="text-sm font-black text-text-primary">
                {editingWorkspaceId ? "워크스페이스 수정" : "워크스페이스 추가"}
              </h3>
              <button
                type="button"
                onClick={onCreate}
                className="inline-flex min-h-8 items-center gap-1.5 rounded-md border border-brand-border bg-brand-glass px-2.5 text-xs font-black text-brand-primary"
              >
                <Plus className="size-3.5" />
                새 항목
              </button>
            </div>

            <label className="mt-3 block text-xs font-black text-text-secondary">
              이름
              <input
                value={workspaceName}
                onChange={(event) => onNameChange(event.target.value)}
                placeholder="예: Commerce MVP"
                className="ui-input mt-1"
              />
            </label>
            <label className="mt-3 block text-xs font-black text-text-secondary">
              설명
              <textarea
                value={workspaceDescription}
                onChange={(event) => onDescriptionChange(event.target.value)}
                placeholder="워크스페이스 설명"
                rows={4}
                className="ui-input mt-1 h-auto resize-none py-2"
              />
            </label>
            {error ? (
              <p className="mt-3 rounded-md border border-[color-mix(in_srgb,var(--destructive)_35%,transparent)] bg-danger-glass px-3 py-2 text-xs font-bold text-[var(--destructive)]">
                {error}
              </p>
            ) : null}
            <button
              type="button"
              disabled={saving}
              onClick={onSave}
              className="mt-3 inline-flex min-h-9 w-full items-center justify-center gap-2 rounded-md bg-brand-primary px-3 text-sm font-black text-text-on-brand disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Pencil className="size-4" />
              {saving ? "저장 중" : editingWorkspaceId ? "수정 저장" : "추가"}
            </button>
          </section>

          <section className="mt-4 rounded-md border border-surface-border-soft bg-surface-muted p-3">
            <h3 className="text-sm font-black text-text-primary">
              워크스페이스 목록
            </h3>
            <div className="mt-3 space-y-2">
              {workspaces.length === 0 ? (
                <p className="rounded-md border border-dashed border-surface-border-soft bg-surface-raised px-3 py-6 text-center text-xs font-bold text-text-muted">
                  등록된 워크스페이스가 없습니다.
                </p>
              ) : (
                workspaces.map((workspace) => {
                  const active = workspace.id === editingWorkspaceId;
                  return (
                    <div
                      key={workspace.id}
                      className={
                        "rounded-md border p-3 " +
                        (active
                          ? "border-brand-border bg-brand-glass"
                          : "border-surface-border-soft bg-surface-raised")
                      }
                    >
                      <div className="flex items-start gap-3">
                        <span className="grid size-8 shrink-0 place-items-center rounded-md border border-brand-border bg-brand-glass">
                          <GitBranch className="size-4 text-brand-primary" />
                        </span>
                        <div className="min-w-0 flex-1">
                          <strong className="block truncate text-sm font-black text-text-primary">
                            {workspace.name}
                          </strong>
                          <p className="mt-1 line-clamp-2 text-xs font-semibold leading-5 text-text-secondary">
                            {workspace.description || "설명 없음"}
                          </p>
                          <p className="mt-2 text-[11px] font-black text-text-muted">
                            주제 {workspace.categoryCount} · 프로토타입{" "}
                            {workspace.prototypeCount}
                          </p>
                        </div>
                      </div>
                      <div className="mt-3 flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => onEdit(workspace)}
                          className="inline-flex min-h-8 items-center gap-1.5 rounded-md border border-surface-border-soft bg-surface-muted px-2.5 text-xs font-black text-text-secondary hover:border-brand-border hover:text-brand-primary"
                        >
                          <Pencil className="size-3.5" />
                          수정
                        </button>
                        <button
                          type="button"
                          onClick={() => onDelete(workspace)}
                          disabled={workspace.categoryCount > 0 || saving}
                          className="inline-flex min-h-8 items-center gap-1.5 rounded-md border border-[color-mix(in_srgb,var(--destructive)_35%,transparent)] bg-danger-glass px-2.5 text-xs font-black text-[var(--destructive)] disabled:cursor-not-allowed disabled:opacity-45"
                          title={
                            workspace.categoryCount > 0
                              ? "주제가 있는 워크스페이스는 삭제할 수 없습니다."
                              : "삭제"
                          }
                        >
                          <Trash2 className="size-3.5" />
                          삭제
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </section>
        </div>
      </aside>
    </div>
  );
}

function PrototypeEditorDrawer({
  entry,
  title,
  summary,
  repoUrl,
  demoUrl,
  figmaUrl,
  status,
  visibility,
  tags,
  saving,
  error,
  onClose,
  onTitleChange,
  onSummaryChange,
  onRepoUrlChange,
  onDemoUrlChange,
  onFigmaUrlChange,
  onStatusChange,
  onVisibilityChange,
  onTagsChange,
  onSave,
}: {
  entry: { category: CatalogCategory; prototype: CatalogPrototype } | null;
  title: string;
  summary: string;
  repoUrl: string;
  demoUrl: string;
  figmaUrl: string;
  status: PrototypeStatus;
  visibility: PrototypeVisibility;
  tags: string;
  saving: boolean;
  error: string | null;
  onClose: () => void;
  onTitleChange: (value: string) => void;
  onSummaryChange: (value: string) => void;
  onRepoUrlChange: (value: string) => void;
  onDemoUrlChange: (value: string) => void;
  onFigmaUrlChange: (value: string) => void;
  onStatusChange: (value: PrototypeStatus) => void;
  onVisibilityChange: (value: PrototypeVisibility) => void;
  onTagsChange: (value: string) => void;
  onSave: () => void;
}) {
  const open = Boolean(entry);

  return (
    <div
      className={
        "absolute inset-0 z-50 transition " +
        (open ? "pointer-events-auto" : "pointer-events-none")
      }
    >
      <button
        type="button"
        aria-label="프로토타입 편집 닫기"
        onClick={onClose}
        className={
          "absolute inset-0 bg-[color-mix(in_srgb,var(--foreground)_24%,transparent)] transition-opacity " +
          (open ? "opacity-100" : "opacity-0")
        }
      />
      <aside
        className={
          "absolute right-0 top-0 flex h-full w-[520px] max-w-[calc(100vw-24px)] flex-col border-l border-surface-border-soft bg-surface-raised shadow-2xl transition-transform duration-200 ease-out " +
          (open ? "translate-x-0" : "translate-x-full")
        }
      >
        <header className="flex min-h-14 items-center justify-between gap-3 border-b border-surface-border-soft px-4">
          <div className="min-w-0">
            <p className="text-[10px] font-black uppercase tracking-[0.13em] text-brand-primary">
              Prototype Editor
            </p>
            <h2 className="truncate text-base font-black text-text-primary">
              {entry?.prototype.title ?? "프로토타입 편집"}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="grid size-9 shrink-0 place-items-center rounded-md border border-surface-border-soft bg-surface-muted text-text-secondary hover:border-brand-border hover:text-brand-primary"
            title="닫기"
          >
            <X className="size-4" />
          </button>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto p-4">
          <div className="rounded-md border border-surface-border-soft bg-surface-muted p-3">
            <p className="text-xs font-black text-text-secondary">소속 주제</p>
            <p className="mt-1 truncate text-sm font-black text-text-primary">
              {entry?.category.title ?? "-"}
            </p>
          </div>

          <div className="mt-4 grid gap-3">
            <label className="block text-xs font-black text-text-secondary">
              제목
              <input
                value={title}
                onChange={(event) => onTitleChange(event.target.value)}
                className="ui-input mt-1"
                placeholder="프로토타입 제목"
              />
            </label>
            <label className="block text-xs font-black text-text-secondary">
              요약
              <textarea
                value={summary}
                onChange={(event) => onSummaryChange(event.target.value)}
                className="ui-input mt-1 h-auto resize-none py-2"
                rows={4}
                placeholder="프로토타입 요약"
              />
            </label>
            <label className="block text-xs font-black text-text-secondary">
              GitHub
              <input
                value={repoUrl}
                onChange={(event) => onRepoUrlChange(event.target.value)}
                className="ui-input mt-1"
                placeholder="https://github.com/..."
              />
            </label>
            <label className="block text-xs font-black text-text-secondary">
              URL
              <input
                value={demoUrl}
                onChange={(event) => onDemoUrlChange(event.target.value)}
                className="ui-input mt-1"
                placeholder="https://..."
              />
            </label>
            <label className="block text-xs font-black text-text-secondary">
              Figma
              <input
                value={figmaUrl}
                onChange={(event) => onFigmaUrlChange(event.target.value)}
                className="ui-input mt-1"
                placeholder="https://figma.com/..."
              />
            </label>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="block text-xs font-black text-text-secondary">
                상태
                <Select
                  value={status}
                  onChange={(event) =>
                    onStatusChange(event.target.value as PrototypeStatus)
                  }
                  className="mt-1"
                  block
                >
                  <option value="draft">초안</option>
                  <option value="building">제작중</option>
                  <option value="ready">완료</option>
                </Select>
              </label>
              <label className="block text-xs font-black text-text-secondary">
                공개 범위
                <Select
                  value={visibility}
                  onChange={(event) =>
                    onVisibilityChange(event.target.value as PrototypeVisibility)
                  }
                  className="mt-1"
                  block
                >
                  <option value="public">공개</option>
                  <option value="private">비공개</option>
                </Select>
              </label>
            </div>
            <label className="block text-xs font-black text-text-secondary">
              태그
              <input
                value={tags}
                onChange={(event) => onTagsChange(event.target.value)}
                className="ui-input mt-1"
                placeholder="쉼표로 구분"
              />
            </label>
          </div>

          {error ? (
            <p className="mt-4 rounded-md border border-[color-mix(in_srgb,var(--destructive)_35%,transparent)] bg-danger-glass px-3 py-2 text-xs font-bold text-[var(--destructive)]">
              {error}
            </p>
          ) : null}
        </div>

        <footer className="flex min-h-14 justify-end gap-2 border-t border-surface-border-soft px-4 py-3">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex min-h-9 items-center rounded-md border border-surface-border-soft bg-surface-muted px-3 text-sm font-black text-text-secondary hover:border-brand-border hover:text-brand-primary"
          >
            취소
          </button>
          <button
            type="button"
            disabled={saving}
            onClick={onSave}
            className="inline-flex min-h-9 items-center gap-2 rounded-md bg-brand-primary px-4 text-sm font-black text-text-on-brand disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Pencil className="size-4" />
            {saving ? "저장 중" : "저장"}
          </button>
        </footer>
      </aside>
    </div>
  );
}

function EmptyState({
  title,
  description,
  actionLabel,
  onAction,
}: {
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  return (
    <div className="grid min-h-[420px] place-items-center p-6">
      <div className="flex max-w-sm flex-col items-center text-center">
        <span className="grid size-12 place-items-center rounded-md border border-surface-border-soft bg-surface-muted">
          <Boxes className="size-5 text-brand-primary" />
        </span>
        <h3 className="mt-4 text-base font-black text-text-primary">{title}</h3>
        <p className="mt-2 text-sm font-semibold leading-6 text-text-secondary">
          {description}
        </p>
        {actionLabel && onAction ? (
          <button
            type="button"
            onClick={onAction}
            className="mt-4 inline-flex min-h-9 items-center rounded-md border border-brand-border bg-brand-glass px-3 text-sm font-black text-brand-primary"
          >
            {actionLabel}
          </button>
        ) : null}
      </div>
    </div>
  );
}

function CategoryList({
  categories,
  selectedCategoryId,
  onSelect,
  newTopicTitle,
  onNewTopicTitleChange,
  onCreate,
  editingTopicId,
  topicEditTitle,
  topicEditSummary,
  onTopicEditTitleChange,
  onTopicEditSummaryChange,
  onTopicEditSave,
  onTopicEditCancel,
  onEditTopic,
  onDeleteTopic,
  onDragEnd,
  sensors,
  creating,
  savingTopicEdit,
  deletingTopicId,
}: {
  categories: CatalogCategory[];
  selectedCategoryId: string | null;
  onSelect: (categoryId: string) => void;
  newTopicTitle: string;
  onNewTopicTitleChange: (value: string) => void;
  onCreate: (event: FormEvent<HTMLFormElement>) => void;
  editingTopicId: string | null;
  topicEditTitle: string;
  topicEditSummary: string;
  onTopicEditTitleChange: (value: string) => void;
  onTopicEditSummaryChange: (value: string) => void;
  onTopicEditSave: (event: FormEvent<HTMLFormElement>) => void;
  onTopicEditCancel: () => void;
  onEditTopic: (category: CatalogCategory) => void;
  onDeleteTopic: (category: CatalogCategory) => void;
  onDragEnd: (event: DragEndEvent) => void;
  sensors: ReturnType<typeof useSensors>;
  creating: boolean;
  savingTopicEdit: boolean;
  deletingTopicId: string | null;
}) {
  return (
    <aside className="rounded-md border border-surface-border bg-surface-raised shadow-sm">
      <div className="flex min-h-12 items-center justify-between gap-3 border-b border-surface-border px-4 py-3">
        <h3 className="text-sm font-black text-text-primary">프로토타입 주제</h3>
        <span className="rounded-md border border-surface-border bg-surface-muted px-2 py-1 text-[10px] font-black text-text-muted">
          {categories.length}
        </span>
      </div>

      {editingTopicId ? (
        <form onSubmit={onTopicEditSave} className="border-b border-surface-border p-3">
          <div className="space-y-2">
            <input
              value={topicEditTitle}
              onChange={(event) => onTopicEditTitleChange(event.target.value)}
              placeholder="주제 이름"
              className="ui-input"
            />
            <input
              value={topicEditSummary}
              onChange={(event) => onTopicEditSummaryChange(event.target.value)}
              placeholder="주제 설명"
              className="ui-input"
            />
            <div className="flex gap-2">
              <button
                type="button"
                onClick={onTopicEditCancel}
                className="inline-flex min-h-8 flex-1 items-center justify-center rounded-md border border-surface-border-soft bg-surface-muted px-2.5 text-xs font-black text-text-secondary hover:border-brand-border hover:text-brand-primary"
              >
                취소
              </button>
              <button
                type="submit"
                disabled={savingTopicEdit}
                className="inline-flex min-h-8 flex-1 items-center justify-center rounded-md border border-brand-border bg-brand-glass px-2.5 text-xs font-black text-brand-primary hover:bg-surface-muted disabled:cursor-not-allowed disabled:opacity-60"
              >
                {savingTopicEdit ? "저장 중" : "수정 저장"}
              </button>
            </div>
          </div>
        </form>
      ) : (
        <form onSubmit={onCreate} className="border-b border-surface-border p-3">
          <div className="flex gap-2">
            <input
              value={newTopicTitle}
              onChange={(event) => onNewTopicTitleChange(event.target.value)}
              placeholder="새 주제"
              className="ui-input min-w-0 flex-1"
            />
            <button
              type="submit"
              disabled={creating}
              className="grid size-9 shrink-0 place-items-center rounded-md border border-brand-border bg-brand-glass text-brand-primary hover:bg-surface-muted disabled:cursor-not-allowed disabled:opacity-60"
              title="주제 추가"
            >
              <Plus className="size-4" />
            </button>
          </div>
        </form>
      )}

      <div className="p-2">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={onDragEnd}
        >
          <SortableContext
            items={categories.map((category) => category.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-1">
              {categories.map((category) => (
                <SortableTopicItem
                  key={category.id}
                  category={category}
                  selected={selectedCategoryId === category.id}
                  onSelect={() => onSelect(category.id)}
                  onEdit={() => onEditTopic(category)}
                  onDelete={() => onDeleteTopic(category)}
                  deleting={deletingTopicId === category.id}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      </div>
    </aside>
  );
}

function SortableTopicItem({
  category,
  selected,
  onSelect,
  onEdit,
  onDelete,
  deleting,
}: {
  category: CatalogCategory;
  selected: boolean;
  onSelect: () => void;
  onEdit: () => void;
  onDelete: () => void;
  deleting: boolean;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: category.id });
  const canDelete = category.prototypes.length === 0;

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
      }}
      className={
        "group flex items-center gap-2 rounded-md border-l-4 transition-colors " +
        (selected
          ? "border-brand-primary bg-brand-glass shadow-sm"
          : "border-transparent bg-transparent hover:border-l-brand-border hover:bg-surface-muted") +
        (isDragging ? " opacity-70" : "")
      }
    >
      <button
        type="button"
        className="grid size-8 shrink-0 cursor-grab place-items-center text-text-muted active:cursor-grabbing group-hover:text-text-secondary"
        title="주제 순서 변경"
        {...attributes}
        {...listeners}
      >
        <GripVertical className="size-4" />
      </button>
      <button
        type="button"
        onClick={onSelect}
        className="min-w-0 flex-1 py-3 text-left"
      >
        <div className="flex min-w-0 items-center gap-2">
          <span className="truncate text-sm font-black text-text-primary">
            {category.title}
          </span>
          <span className="shrink-0 rounded-sm bg-brand-glass px-1.5 py-0.5 text-[11px] font-black text-brand-primary">
            {category.prototypes.length}
          </span>
        </div>
        <p className="mt-1 line-clamp-2 text-xs font-semibold leading-5 text-text-secondary">
          {category.summary || "설명 없음"}
        </p>
      </button>
      <div className="flex shrink-0 items-center gap-1 pr-2 opacity-100 xl:opacity-0 xl:transition-opacity xl:group-hover:opacity-100">
        <button
          type="button"
          onClick={onEdit}
          className="grid size-7 place-items-center rounded-md border border-surface-border-soft bg-surface-raised text-text-secondary hover:border-brand-border hover:text-brand-primary"
          title="주제 수정"
        >
          <Pencil className="size-3.5" />
        </button>
        <button
          type="button"
          onClick={onDelete}
          disabled={!canDelete || deleting}
          className="grid size-7 place-items-center rounded-md border border-[color-mix(in_srgb,var(--destructive)_30%,transparent)] bg-danger-glass text-[var(--destructive)] disabled:cursor-not-allowed disabled:opacity-40"
          title={canDelete ? "주제 삭제" : "프로토타입이 있는 주제는 삭제할 수 없습니다"}
        >
          <Trash2 className="size-3.5" />
        </button>
      </div>
    </div>
  );
}

function TopicPrototypePanel({
  selectedCategory,
  prototypes,
  onOpenNotes,
  onEditPrototype,
}: {
  selectedCategory: CatalogCategory | null;
  prototypes: Array<{ category: CatalogCategory; prototype: CatalogPrototype }>;
  onOpenNotes: (prototype: CatalogPrototype) => void;
  onEditPrototype: (category: CatalogCategory, prototype: CatalogPrototype) => void;
}) {
  return (
    <section className="min-h-[420px] rounded-md border border-surface-border bg-surface-raised p-4 shadow-sm">
      {prototypes.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-3">
          {prototypes.map(({ category, prototype }) => (
            <PrototypeReferenceCard
              key={prototype.id}
              category={category}
              prototype={prototype}
              onOpenNotes={() => onOpenNotes(prototype)}
              onEdit={() => onEditPrototype(category, prototype)}
            />
          ))}
        </div>
      ) : (
        <div className="grid min-h-[260px] place-items-center text-center">
          <div>
            <h3 className="text-sm font-black text-text-primary">
              {selectedCategory
                ? "선택한 주제에 프로토타입이 없습니다"
                : "표시할 프로토타입이 없습니다"}
            </h3>
            <p className="mt-2 text-xs font-semibold leading-5 text-text-secondary">
              {selectedCategory
                ? `${selectedCategory.title} 주제에 프로토타입을 추가하면 여기에 표시됩니다.`
                : "검색어를 줄이거나 서버에 프로토타입을 추가하세요."}
            </p>
          </div>
        </div>
      )}
    </section>
  );
}

export default PrototypeModule;
