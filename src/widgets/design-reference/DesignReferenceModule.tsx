import { openUrl } from "@tauri-apps/plugin-opener";
import {
  Bookmark,
  Copy,
  ExternalLink,
  LayoutList,
  Pencil,
  Plus,
  RefreshCw,
  Save,
  Trash2,
  X,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import {
  createDesignReference,
  deleteDesignReference,
  listDesignReferences,
  updateDesignReference,
  type DesignReference,
  type DesignReferencePayload,
} from "../../features/design-template/api";
import PageHeader from "../../shared/ui/PageHeader";
import { toast } from "../../shared/ui/Toast";

type ReferenceFormState = DesignReferencePayload;

const ALL_CATEGORY = "전체";

const EMPTY_REFERENCE_FORM: ReferenceFormState = {
  title: "",
  category: "",
  description: "",
  url: "",
  sortOrder: 0,
};

function DesignReferenceModule() {
  const [references, setReferences] = useState<DesignReference[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState(ALL_CATEGORY);
  const [editing, setEditing] = useState<DesignReference | null>(null);
  const [form, setForm] = useState<ReferenceFormState>(EMPTY_REFERENCE_FORM);
  const [formOpen, setFormOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  async function load() {
    setLoading(true);
    try {
      setReferences(await listDesignReferences());
    } catch (err) {
      toast.error(
        err instanceof Error
          ? err.message
          : "디자인 레퍼런스를 불러오지 못했습니다.",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  const categories = useMemo(() => {
    const counts = new Map<string, number>();
    references.forEach((reference) => {
      counts.set(reference.category, (counts.get(reference.category) ?? 0) + 1);
    });
    return [
      { name: ALL_CATEGORY, count: references.length },
      ...Array.from(counts.entries())
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([name, count]) => ({ name, count })),
    ];
  }, [references]);

  const filteredReferences = useMemo(
    () =>
      selectedCategory === ALL_CATEGORY
        ? references
        : references.filter((reference) => reference.category === selectedCategory),
    [references, selectedCategory],
  );

  function openCreateForm(category = selectedCategory) {
    setEditing(null);
    setFormOpen(true);
    setForm({
      ...EMPTY_REFERENCE_FORM,
      category: category === ALL_CATEGORY ? "" : category,
      sortOrder: references.length + 1,
    });
  }

  function openEditForm(reference: DesignReference) {
    setEditing(reference);
    setFormOpen(true);
    setForm({
      title: reference.title,
      category: reference.category,
      description: reference.description,
      url: reference.url,
      sortOrder: reference.sortOrder,
    });
  }

  function closeForm() {
    setEditing(null);
    setFormOpen(false);
    setForm(EMPTY_REFERENCE_FORM);
  }

  async function copyUrl(url: string) {
    try {
      await navigator.clipboard.writeText(url);
      toast.success("레퍼런스 URL을 복사했습니다.");
    } catch {
      toast.error("복사하지 못했습니다.");
    }
  }

  async function submitForm() {
    const payload = {
      ...form,
      title: form.title.trim(),
      category: form.category.trim(),
      description: form.description.trim(),
      url: form.url.trim(),
    };
    if (!payload.title || !payload.category || !payload.url) {
      toast.error("제목, 분류, URL은 필수입니다.");
      return;
    }

    setSaving(true);
    try {
      const saved = editing
        ? await updateDesignReference(editing.id, payload)
        : await createDesignReference(payload);
      toast.success(
        editing ? "레퍼런스를 수정했습니다." : "레퍼런스를 추가했습니다.",
      );
      setSelectedCategory(saved.category);
      closeForm();
      await load();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "레퍼런스를 저장하지 못했습니다.",
      );
    } finally {
      setSaving(false);
    }
  }

  async function removeReference(reference: DesignReference) {
    if (!window.confirm(`"${reference.title}" 레퍼런스를 삭제할까요?`)) return;
    try {
      await deleteDesignReference(reference.id);
      toast.success("레퍼런스를 삭제했습니다.");
      if (editing?.id === reference.id) closeForm();
      await load();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "레퍼런스를 삭제하지 못했습니다.",
      );
    }
  }

  return (
    <div className="flex min-w-0 flex-1 flex-col">
      <PageHeader>
        <Bookmark className="size-4 text-brand-primary" />
        <span className="text-[14px] font-bold tracking-tight text-text-primary">
          디자인 레퍼런스
        </span>
      </PageHeader>

      <div className="min-h-0 flex-1 bg-surface-muted p-5">
        <main className="grid h-full min-h-0 gap-4 lg:grid-cols-[320px_minmax(0,1fr)]">
          <aside className="flex min-h-0 flex-col rounded-md border border-surface-border bg-surface-raised shadow-sm">
            <div className="flex min-h-12 items-center justify-between gap-3 border-b border-surface-border px-4">
              <div className="flex min-w-0 items-center gap-2">
                <LayoutList className="size-4 text-brand-primary" />
                <h2 className="truncate text-sm font-black text-text-primary">
                  분류
                </h2>
              </div>
              <button
                type="button"
                onClick={() => openCreateForm()}
                className="grid size-8 shrink-0 place-items-center rounded-md border border-brand-border bg-brand-glass text-brand-primary hover:bg-surface-muted"
                title="레퍼런스 추가"
              >
                <Plus className="size-4" />
              </button>
            </div>
            <div className="min-h-0 flex-1 space-y-2 overflow-y-auto p-3">
              {categories.map((category) => {
                const active = category.name === selectedCategory;
                return (
                  <button
                    key={category.name}
                    type="button"
                    onClick={() => setSelectedCategory(category.name)}
                    className={
                      "flex min-h-12 w-full items-center justify-between gap-3 rounded-md border px-3 text-left transition " +
                      (active
                        ? "border-brand-border bg-brand-glass"
                        : "border-surface-border-soft bg-surface-muted hover:border-brand-border")
                    }
                  >
                    <span className="truncate text-sm font-black text-text-primary">
                      {category.name}
                    </span>
                    <span className="grid size-7 shrink-0 place-items-center rounded-md bg-surface-raised text-xs font-black text-brand-primary">
                      {category.count}
                    </span>
                  </button>
                );
              })}
            </div>
          </aside>

          <section className="flex min-h-0 flex-col rounded-md border border-surface-border bg-surface-raised shadow-sm">
            <div className="flex min-h-12 items-center justify-between gap-3 border-b border-surface-border px-4">
              <div className="min-w-0">
                <p className="text-[10px] font-black uppercase tracking-[0.14em] text-brand-primary">
                  Reference Library
                </p>
                <h2 className="truncate text-sm font-black text-text-primary">
                  {selectedCategory}
                </h2>
              </div>
              <div className="flex shrink-0 gap-2">
                <button
                  type="button"
                  onClick={() => openCreateForm()}
                  className="inline-flex min-h-8 items-center gap-1.5 rounded-md border border-brand-border bg-brand-glass px-3 text-xs font-black text-brand-primary hover:bg-surface-muted"
                >
                  <Plus className="size-3.5" />
                  추가
                </button>
                <button
                  type="button"
                  onClick={() => void load()}
                  className="grid size-8 place-items-center rounded-md border border-surface-border-soft bg-surface-muted text-text-secondary hover:border-brand-border hover:text-brand-primary"
                  title="새로고침"
                >
                  <RefreshCw className="size-4" />
                </button>
              </div>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto p-4">
              {formOpen ? (
                <ReferenceEditor
                  form={form}
                  saving={saving}
                  editing={editing}
                  onChange={setForm}
                  onCancel={closeForm}
                  onSubmit={submitForm}
                />
              ) : null}

              {loading ? (
                <p className="rounded-md border border-dashed border-surface-border-soft bg-surface-muted p-6 text-center text-sm font-bold text-text-muted">
                  레퍼런스를 불러오는 중입니다.
                </p>
              ) : filteredReferences.length === 0 ? (
                <p className="rounded-md border border-dashed border-surface-border-soft bg-surface-muted p-6 text-center text-sm font-bold text-text-muted">
                  등록된 레퍼런스가 없습니다.
                </p>
              ) : (
                <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                  {filteredReferences.map((reference) => (
                    <ReferenceCard
                      key={reference.id}
                      reference={reference}
                      onCopy={() => void copyUrl(reference.url)}
                      onEdit={() => openEditForm(reference)}
                      onDelete={() => void removeReference(reference)}
                    />
                  ))}
                </div>
              )}
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}

function ReferenceCard({
  reference,
  onCopy,
  onEdit,
  onDelete,
}: {
  reference: DesignReference;
  onCopy: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <article className="flex min-h-[204px] flex-col rounded-md border border-surface-border-soft bg-surface-muted p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="truncate text-base font-black text-text-primary">
            {reference.title}
          </h3>
          <p className="mt-1 text-[10px] font-black uppercase tracking-[0.1em] text-brand-primary">
            {reference.category}
          </p>
        </div>
        <div className="flex shrink-0 gap-1">
          <button
            type="button"
            onClick={onCopy}
            className="grid size-8 place-items-center rounded-md border border-surface-border-soft bg-surface-raised text-text-secondary hover:border-brand-border hover:text-brand-primary"
            title="URL 복사"
          >
            <Copy className="size-3.5" />
          </button>
          <button
            type="button"
            onClick={onEdit}
            className="grid size-8 place-items-center rounded-md border border-surface-border-soft bg-surface-raised text-text-secondary hover:border-brand-border hover:text-brand-primary"
            title="수정"
          >
            <Pencil className="size-3.5" />
          </button>
          <button
            type="button"
            onClick={onDelete}
            className="grid size-8 place-items-center rounded-md border border-surface-border-soft bg-surface-raised text-text-secondary hover:border-brand-border hover:text-brand-primary"
            title="삭제"
          >
            <Trash2 className="size-3.5" />
          </button>
        </div>
      </div>
      <p className="mt-3 line-clamp-3 text-sm font-semibold leading-6 text-text-secondary">
        {reference.description || "설명이 없습니다."}
      </p>
      <div className="mt-auto pt-4">
        <p className="truncate rounded-md border border-surface-border-soft bg-surface-raised px-2 py-1.5 text-xs font-bold text-text-muted">
          {reference.url}
        </p>
        <button
          type="button"
          onClick={() => void openUrl(reference.url)}
          className="mt-2 inline-flex min-h-9 w-full items-center justify-center gap-1.5 rounded-md border border-brand-border bg-brand-glass px-3 text-xs font-black text-brand-primary hover:bg-surface-raised"
        >
          바로 열기
          <ExternalLink className="size-3.5" />
        </button>
      </div>
    </article>
  );
}

function ReferenceEditor({
  form,
  saving,
  editing,
  onChange,
  onCancel,
  onSubmit,
}: {
  form: ReferenceFormState;
  saving: boolean;
  editing: DesignReference | null;
  onChange: (form: ReferenceFormState) => void;
  onCancel: () => void;
  onSubmit: () => void;
}) {
  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit();
      }}
      className="mb-4 rounded-md border border-brand-border bg-brand-glass p-4"
    >
      <div className="mb-3 flex items-center justify-between gap-3">
        <h3 className="text-sm font-black text-text-primary">
          {editing ? "레퍼런스 수정" : "레퍼런스 추가"}
        </h3>
        <button
          type="button"
          onClick={onCancel}
          className="grid size-8 place-items-center rounded-md border border-surface-border-soft bg-surface-raised text-text-secondary hover:border-brand-border hover:text-brand-primary"
          title="닫기"
        >
          <X className="size-4" />
        </button>
      </div>
      <div className="grid gap-2 md:grid-cols-2">
        <input
          value={form.title}
          onChange={(event) => onChange({ ...form, title: event.target.value })}
          className="h-9 rounded-md border border-surface-border-soft bg-surface-raised px-2 text-xs font-bold text-text-primary outline-none focus:border-brand-border"
          placeholder="제목"
        />
        <input
          value={form.category}
          onChange={(event) =>
            onChange({ ...form, category: event.target.value })
          }
          className="h-9 rounded-md border border-surface-border-soft bg-surface-raised px-2 text-xs font-bold text-text-primary outline-none focus:border-brand-border"
          placeholder="분류: AI 디자인 생성"
        />
        <input
          value={form.url}
          onChange={(event) => onChange({ ...form, url: event.target.value })}
          className="h-9 rounded-md border border-surface-border-soft bg-surface-raised px-2 text-xs font-bold text-text-primary outline-none focus:border-brand-border md:col-span-2"
          placeholder="https://..."
        />
        <textarea
          value={form.description}
          onChange={(event) =>
            onChange({ ...form, description: event.target.value })
          }
          className="min-h-16 resize-none rounded-md border border-surface-border-soft bg-surface-raised px-2 py-2 text-xs font-bold leading-5 text-text-primary outline-none focus:border-brand-border md:col-span-2"
          placeholder="설명"
        />
      </div>
      <div className="mt-3 flex justify-end gap-2">
        <button
          type="button"
          onClick={onCancel}
          className="inline-flex min-h-8 items-center gap-1.5 rounded-md border border-surface-border-soft bg-surface-raised px-3 text-xs font-black text-text-secondary hover:border-brand-border hover:text-brand-primary"
        >
          <X className="size-3.5" />
          취소
        </button>
        <button
          type="submit"
          disabled={saving}
          className="inline-flex min-h-8 items-center gap-1.5 rounded-md border border-brand-border bg-surface-raised px-3 text-xs font-black text-brand-primary hover:bg-surface-muted disabled:opacity-60"
        >
          <Save className="size-3.5" />
          저장
        </button>
      </div>
    </form>
  );
}

export default DesignReferenceModule;
