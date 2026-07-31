import { useEffect, useMemo, useState } from "react";
import { openUrl } from "@tauri-apps/plugin-opener";
import {
  Boxes,
  ExternalLink,
  GitBranch,
  ImageOff,
  RefreshCw,
  Search,
} from "lucide-react";
import {
  listPrototypeWorkspaces,
  listWorkspaceCategories,
  type CatalogCategory,
  type CatalogPrototype,
  type PrototypeWorkspace,
} from "../../features/prototype/api";
import PageHeader from "../../shared/ui/PageHeader";

const STATUS_LABEL: Record<string, string> = {
  draft: "초안",
  building: "제작중",
  ready: "완료",
};

function PrototypeModule() {
  const [workspaces, setWorkspaces] = useState<PrototypeWorkspace[]>([]);
  const [selectedWorkspaceId, setSelectedWorkspaceId] = useState<string | null>(
    null,
  );
  const [categories, setCategories] = useState<CatalogCategory[]>([]);
  const [query, setQuery] = useState("");
  const [loadingWorkspaces, setLoadingWorkspaces] = useState(true);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function loadWorkspaces() {
    setLoadingWorkspaces(true);
    try {
      const data = await listPrototypeWorkspaces();
      setWorkspaces(data);
      setSelectedWorkspaceId((current) => current ?? data[0]?.id ?? null);
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

  async function loadCategories(workspaceId: string) {
    setLoadingCategories(true);
    try {
      setCategories(await listWorkspaceCategories(workspaceId));
      setError(null);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "프로토타입 카테고리를 불러오지 못했습니다.",
      );
    } finally {
      setLoadingCategories(false);
    }
  }

  useEffect(() => {
    void loadWorkspaces();
  }, []);

  useEffect(() => {
    if (!selectedWorkspaceId) {
      setCategories([]);
      return;
    }
    void loadCategories(selectedWorkspaceId);
  }, [selectedWorkspaceId]);

  const prototypes = useMemo(() => {
    const q = query.trim().toLowerCase();
    return categories.flatMap((category) =>
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
  }, [categories, query]);

  return (
    <div className="flex min-w-0 flex-1 flex-col">
      <PageHeader>
        <span className="text-[14px] font-bold tracking-tight text-text-primary">
          프로토타입
        </span>
      </PageHeader>

      <div className="flex min-h-0 flex-1 flex-col bg-surface-muted">
        <section className="shrink-0 border-b border-surface-border-soft bg-surface-raised px-4 py-3">
          <div className="flex min-h-11 items-center gap-3">
            <div className="flex min-w-0 shrink-0 items-center gap-2">
              <span className="grid size-8 place-items-center rounded-md border border-brand-border bg-brand-glass">
                <GitBranch className="size-4 text-brand-primary" />
              </span>
              <div className="min-w-0">
                <p className="text-[10px] font-black uppercase tracking-[0.13em] text-brand-primary">
                  Workspaces
                </p>
                <h1 className="truncate text-base font-black text-text-primary">
                  설계 및 프로토타입 공간
                </h1>
              </div>
            </div>

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

        <main className="min-w-0 overflow-y-auto p-5">
          <section className="rounded-md border border-surface-border-soft bg-surface-raised">
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
                description="서버의 워크스페이스 카테고리와 프로토타입을 확인하고 있습니다."
              />
            ) : selectedWorkspaceId && prototypes.length > 0 ? (
              <div className="grid gap-4 p-4 xl:grid-cols-[260px_minmax(0,1fr)]">
                <CategoryList categories={categories} />
                <div className="grid auto-rows-fr gap-3 md:grid-cols-2 xl:grid-cols-3">
                  {prototypes.map(({ category, prototype }) => (
                    <PrototypeCard
                      key={prototype.id}
                      category={category}
                      prototype={prototype}
                    />
                  ))}
                </div>
              </div>
            ) : (
              <EmptyState
                title="표시할 프로토타입이 없습니다"
                description="서버에 프로토타입을 추가하면 이 메뉴에서 바로 확인할 수 있습니다. 다음 단계에서는 여기서 커머스 프로토타입 생성 폼을 붙이면 됩니다."
              />
            )}
          </section>
        </main>
      </div>
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

function CategoryList({ categories }: { categories: CatalogCategory[] }) {
  return (
    <aside className="rounded-md border border-surface-border-soft bg-surface-muted p-3">
      <h3 className="text-xs font-black uppercase tracking-[0.12em] text-text-muted">
        Categories
      </h3>
      <div className="mt-3 space-y-2">
        {categories.map((category) => (
          <div
            key={category.id}
            className="rounded-md border border-surface-border-soft bg-surface-raised px-3 py-2"
          >
            <div className="flex items-center justify-between gap-2">
              <span className="truncate text-sm font-black text-text-primary">
                {category.title}
              </span>
              <span className="shrink-0 text-xs font-black text-brand-primary">
                {category.prototypes.length}
              </span>
            </div>
            <p className="mt-1 line-clamp-2 text-xs font-semibold leading-5 text-text-secondary">
              {category.summary || "설명 없음"}
            </p>
          </div>
        ))}
      </div>
    </aside>
  );
}

function PrototypeCard({
  category,
  prototype,
}: {
  category: CatalogCategory;
  prototype: CatalogPrototype;
}) {
  return (
    <article className="flex min-h-[260px] flex-col overflow-hidden rounded-md border border-surface-border-soft bg-surface-muted">
      <div className="h-28 border-b border-surface-border-soft bg-surface-raised">
        {prototype.images[0] ? (
          <img
            src={prototype.images[0]}
            alt={prototype.title}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full flex-col items-center justify-center gap-2 text-text-muted">
            <ImageOff className="size-7" strokeWidth={1.5} />
            <span className="text-xs font-bold">이미지 없음</span>
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-2 p-3">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="rounded border border-brand-border bg-brand-glass px-1.5 py-0.5 text-[11px] font-black text-brand-primary">
            {STATUS_LABEL[prototype.status] ?? prototype.status}
          </span>
          <span className="rounded border border-surface-border-soft bg-surface-raised px-1.5 py-0.5 text-[11px] font-bold text-text-secondary">
            {category.title}
          </span>
        </div>
        <h3 className="line-clamp-2 text-sm font-black leading-5 text-text-primary">
          {prototype.title}
        </h3>
        <p className="line-clamp-3 text-xs font-semibold leading-5 text-text-secondary">
          {prototype.summary || "요약 없음"}
        </p>
        <div className="mt-auto flex items-center justify-between gap-2 border-t border-surface-border-soft pt-3">
          <div className="min-w-0 flex flex-wrap gap-1">
            {prototype.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="rounded bg-surface-raised px-1.5 py-0.5 text-[11px] font-bold text-text-muted"
              >
                #{tag}
              </span>
            ))}
          </div>
          {prototype.demoUrl || prototype.repoUrl ? (
            <button
              type="button"
              onClick={() =>
                void openUrl(prototype.demoUrl || prototype.repoUrl)
              }
              className="grid size-8 shrink-0 place-items-center rounded-md border border-surface-border-soft bg-surface-raised text-text-secondary hover:border-brand-border hover:text-brand-primary"
              title="프로토타입 열기"
            >
              <ExternalLink className="size-4" />
            </button>
          ) : null}
        </div>
      </div>
    </article>
  );
}

export default PrototypeModule;
