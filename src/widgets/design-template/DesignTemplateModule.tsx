import { openUrl } from "@tauri-apps/plugin-opener";
import {
  Copy,
  Download,
  ExternalLink,
  FileDown,
  FilePlus,
  Image as ImageIcon,
  Palette,
  Pencil,
  Plus,
  RefreshCw,
  Save,
  Trash2,
  X,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import {
  createDesignTemplate,
  deleteDesignTemplate,
  listDesignTemplates,
  updateDesignTemplate,
  uploadDesignTemplateAsset,
  type DesignTemplate,
  type DesignTemplatePayload,
  type DesignTemplateFile,
} from "../../features/design-template/api";
import PageHeader from "../../shared/ui/PageHeader";
import { toast } from "../../shared/ui/Toast";

type TemplateFormState = Omit<DesignTemplatePayload, "tags"> & {
  tagsText: string;
};

const EMPTY_TEMPLATE_FORM: TemplateFormState = {
  title: "",
  summary: "",
  category: "",
  tagsText: "",
  coverImageUrl: null,
  previewImageUrls: [],
  files: [],
  conventionFiles: [],
  designRules: "",
  aiPrompt: "",
};

function toTemplatePayload(form: TemplateFormState): DesignTemplatePayload {
  return {
    title: form.title.trim(),
    summary: form.summary.trim(),
    category: form.category.trim(),
    tags: parseTagsText(form.tagsText),
    coverImageUrl: form.coverImageUrl || null,
    previewImageUrls: form.previewImageUrls ?? [],
    files: form.files ?? [],
    conventionFiles: form.conventionFiles ?? [],
    designRules: form.designRules?.trim() ?? "",
    aiPrompt: form.aiPrompt?.trim() ?? "",
  };
}

function parseTagsText(value: string) {
  return value
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);
}

function formatBytes(value: number) {
  if (!value) return "크기 미정";
  if (value < 1024) return `${value} B`;
  if (value < 1024 * 1024) return `${Math.round(value / 1024)} KB`;
  return `${(value / 1024 / 1024).toFixed(1)} MB`;
}

function inferFileType(fileName: string) {
  const lowerName = fileName.toLowerCase();
  if (lowerName.endsWith(".html") || lowerName.endsWith(".htm")) return "text/html";
  if (lowerName.endsWith(".md")) return "text/markdown";
  if (lowerName.endsWith(".json")) return "application/json";
  return "application/octet-stream";
}

function isMarkdownFile(file: DesignTemplateFile) {
  return (
    file.purpose === "convention" ||
    file.fileType === "text/markdown" ||
    file.name.toLowerCase().endsWith(".md")
  );
}

function DesignTemplateModule() {
  const [templates, setTemplates] = useState<DesignTemplate[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [templateFormOpen, setTemplateFormOpen] = useState(false);
  const [templateForm, setTemplateForm] =
    useState<TemplateFormState>(EMPTY_TEMPLATE_FORM);
  const [templateSaving, setTemplateSaving] = useState(false);

  async function load(preferredId?: string | null) {
    setLoading(true);
    try {
      const data = await listDesignTemplates();
      setTemplates(data);
      setSelectedId((current) =>
        preferredId && data.some((item) => item.id === preferredId)
          ? preferredId
          : current && data.some((item) => item.id === current)
            ? current
            : data[0]?.id ?? null,
      );
      setError(null);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "디자인 템플릿을 불러오지 못했습니다.",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  const selected = useMemo(
    () => templates.find((template) => template.id === selectedId) ?? null,
    [selectedId, templates],
  );

  function openCreateTemplateForm() {
    setTemplateForm(EMPTY_TEMPLATE_FORM);
    setTemplateFormOpen(true);
  }

  function closeTemplateForm() {
    setTemplateForm(EMPTY_TEMPLATE_FORM);
    setTemplateFormOpen(false);
  }

  async function submitTemplateForm() {
    const payload = toTemplatePayload(templateForm);
    if (!payload.title || !payload.summary || !payload.category) {
      toast.error("제목, 요약, 분류는 필수입니다.");
      return;
    }

    setTemplateSaving(true);
    try {
      const saved = await createDesignTemplate(payload);
      toast.success("디자인 템플릿을 추가했습니다.");
      closeTemplateForm();
      await load(saved.id);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "디자인 템플릿을 저장하지 못했습니다.",
      );
    } finally {
      setTemplateSaving(false);
    }
  }

  async function removeTemplate(template: DesignTemplate) {
    if (!window.confirm(`"${template.title}" 템플릿을 삭제할까요?`)) return;
    try {
      await deleteDesignTemplate(template.id);
      toast.success("디자인 템플릿을 삭제했습니다.");
      await load(selectedId === template.id ? null : selectedId);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "디자인 템플릿을 삭제하지 못했습니다.",
      );
    }
  }

  function updateLoadedTemplate(template: DesignTemplate) {
    setTemplates((current) =>
      current.map((item) => (item.id === template.id ? template : item)),
    );
  }

  return (
    <div className="flex min-w-0 flex-1 flex-col">
      <PageHeader>
        <Palette className="size-4 text-brand-primary" />
        <span className="text-[14px] font-bold tracking-tight text-text-primary">
          디자인 템플릿
        </span>
      </PageHeader>

      <div className="min-h-0 flex-1 bg-surface-muted p-5">
        <div className="flex h-full min-h-0 flex-col gap-3">
          <main className="grid min-h-0 flex-1 gap-4 lg:grid-cols-[minmax(380px,4fr)_minmax(0,6fr)]">
            <aside className="flex min-h-0 flex-col rounded-md border border-surface-border bg-surface-raised shadow-sm">
              <div className="flex min-h-12 items-center justify-between gap-3 border-b border-surface-border px-4">
                <div className="flex min-w-0 items-center gap-2">
                  <Palette className="size-4 shrink-0 text-brand-primary" />
                  <h2 className="truncate text-sm font-black text-text-primary">
                    디자인 템플릿
                  </h2>
                </div>
                <div className="flex shrink-0 gap-2">
                  <button
                    type="button"
                    onClick={openCreateTemplateForm}
                    className="grid size-8 place-items-center rounded-md border border-brand-border bg-brand-glass text-brand-primary hover:bg-surface-muted"
                    title="템플릿 추가"
                  >
                    <Plus className="size-4" />
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

              <div className="min-h-0 flex-1 overflow-y-auto p-3">
                {templateFormOpen ? (
                  <TemplateEditor
                    form={templateForm}
                    saving={templateSaving}
                    onChange={setTemplateForm}
                    onCancel={closeTemplateForm}
                    onSubmit={submitTemplateForm}
                  />
                ) : null}

                {loading ? (
                  <p className="rounded-md border border-dashed border-surface-border-soft bg-surface-muted p-6 text-center text-sm font-bold text-text-muted">
                    디자인 템플릿을 불러오는 중입니다.
                  </p>
                ) : error ? (
                  <p className="rounded-md border border-dashed border-surface-border-soft bg-surface-muted p-6 text-center text-sm font-bold text-text-muted">
                    {error}
                  </p>
                ) : (
                  <div className="space-y-2">
                    {templates.map((template, index) => {
                      const active = template.id === selectedId;
                      return (
                        <article
                          key={template.id}
                          className={
                            "flex min-h-[92px] w-full gap-3 rounded-md border p-3 text-left transition " +
                            (active
                              ? "border-brand-border bg-brand-glass"
                              : "border-surface-border-soft bg-surface-muted hover:border-brand-border")
                          }
                        >
                          <button
                            type="button"
                            onClick={() => setSelectedId(template.id)}
                            className="flex min-w-0 flex-1 gap-3 text-left"
                          >
                            <PreviewThumb template={template} />
                            <span className="min-w-0 flex-1">
                              <span className="flex min-w-0 items-center gap-2">
                                <span className="grid size-6 shrink-0 place-items-center rounded-md bg-surface-raised text-[11px] font-black text-brand-primary">
                                  {index + 1}
                                </span>
                                <span className="truncate text-sm font-black text-text-primary">
                                  {template.title}
                                </span>
                              </span>
                              <span className="mt-1 line-clamp-2 text-xs font-semibold leading-5 text-text-secondary">
                                {template.summary}
                              </span>
                            </span>
                          </button>
                          <div className="flex shrink-0 flex-col gap-1">
                            <button
                              type="button"
                              onClick={() => void removeTemplate(template)}
                              className="grid size-7 place-items-center rounded-md border border-surface-border-soft bg-surface-raised text-text-secondary hover:border-brand-border hover:text-brand-primary"
                              title="삭제"
                            >
                              <Trash2 className="size-3.5" />
                            </button>
                          </div>
                        </article>
                      );
                    })}
                  </div>
                )}
              </div>
            </aside>

            <section className="flex min-h-0 flex-col rounded-md border border-surface-border bg-surface-raised shadow-sm">
              {selected ? (
                <TemplateDetail
                  template={selected}
                  onTemplateSaved={updateLoadedTemplate}
                />
              ) : (
                <EmptyDetail />
              )}
            </section>
          </main>

        </div>
      </div>
    </div>
  );
}

function TemplateEditor({
  form,
  saving,
  onChange,
  onCancel,
  onSubmit,
}: {
  form: TemplateFormState;
  saving: boolean;
  onChange: (form: TemplateFormState) => void;
  onCancel: () => void;
  onSubmit: () => void;
}) {
  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit();
      }}
      className="mb-3 rounded-md border border-brand-border bg-brand-glass p-3"
    >
      <div className="mb-2 flex items-center justify-between gap-2">
        <span className="text-xs font-black text-brand-primary">
          템플릿 추가
        </span>
        <button
          type="button"
          onClick={onCancel}
          className="grid size-7 place-items-center rounded-md border border-surface-border-soft bg-surface-raised text-text-secondary hover:border-brand-border hover:text-brand-primary"
          title="닫기"
        >
          <X className="size-3.5" />
        </button>
      </div>
      <div className="grid gap-2">
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
          placeholder="분류"
        />
        <input
          value={form.tagsText}
          onChange={(event) =>
            onChange({ ...form, tagsText: event.target.value })
          }
          className="h-9 rounded-md border border-surface-border-soft bg-surface-raised px-2 text-xs font-bold text-text-primary outline-none focus:border-brand-border"
          placeholder="태그: list, commerce"
        />
        <textarea
          value={form.summary}
          onChange={(event) =>
            onChange({ ...form, summary: event.target.value })
          }
          className="min-h-16 resize-none rounded-md border border-surface-border-soft bg-surface-raised px-2 py-2 text-xs font-bold leading-5 text-text-primary outline-none focus:border-brand-border"
          placeholder="요약"
        />
        <textarea
          value={form.designRules}
          onChange={(event) =>
            onChange({ ...form, designRules: event.target.value })
          }
          className="min-h-20 resize-none rounded-md border border-surface-border-soft bg-surface-raised px-2 py-2 text-xs font-bold leading-5 text-text-primary outline-none focus:border-brand-border"
          placeholder="디자인 규칙"
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

function PreviewThumb({ template }: { template: DesignTemplate }) {
  const imageUrl = template.coverImageUrl || template.previewImageUrls[0];
  return (
    <span className="h-16 w-24 shrink-0 overflow-hidden rounded-md border border-surface-border-soft bg-surface-strong">
      {imageUrl ? (
        <img src={imageUrl} alt={template.title} className="h-full w-full object-cover" />
      ) : (
        <span className="grid h-full w-full place-items-center bg-brand-glass">
          <ImageIcon className="size-5 text-brand-primary" />
        </span>
      )}
    </span>
  );
}

function TemplateDetail({
  template,
  onTemplateSaved,
}: {
  template: DesignTemplate;
  onTemplateSaved: (template: DesignTemplate) => void;
}) {
  const coverInputRef = useRef<HTMLInputElement | null>(null);
  const previewInputRef = useRef<HTMLInputElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [uploading, setUploading] = useState<string | null>(null);
  const [savingField, setSavingField] = useState<string | null>(null);
  const [editingField, setEditingField] = useState<string | null>(null);
  const [titleDraft, setTitleDraft] = useState(template.title);
  const [summaryDraft, setSummaryDraft] = useState(template.summary);
  const [rulesDraft, setRulesDraft] = useState(template.designRules);
  const [metadataForm, setMetadataForm] = useState({
    category: template.category,
    tags: template.tags,
    tagInput: "",
  });
  const sourceFiles = template.files.filter((file) => !isMarkdownFile(file));
  const images = [
    template.coverImageUrl,
    ...template.previewImageUrls,
  ].filter((value): value is string => Boolean(value));

  useEffect(() => {
    setTitleDraft(template.title);
    setSummaryDraft(template.summary);
    setRulesDraft(template.designRules);
    setMetadataForm({
      category: template.category,
      tags: template.tags,
      tagInput: "",
    });
    setEditingField(null);
  }, [template.id, template.title, template.summary, template.designRules, template.category, template.tags]);

  async function copyText(value: string, message: string) {
    try {
      await navigator.clipboard.writeText(value);
      toast.success(message);
    } catch {
      toast.error("복사하지 못했습니다.");
    }
  }

  async function saveTemplatePatch(
    patch: Partial<DesignTemplatePayload>,
    message: string,
    field: string,
  ) {
    if (patch.title !== undefined && !patch.title.trim()) {
      toast.error("제목은 필수입니다.");
      return;
    }
    if (patch.summary !== undefined && !patch.summary.trim()) {
      toast.error("설명은 필수입니다.");
      return;
    }
    if (patch.category !== undefined && !patch.category.trim()) {
      toast.error("분류는 필수입니다.");
      return;
    }

    setSavingField(field);
    try {
      const saved = await updateDesignTemplate(template.id, patch);
      onTemplateSaved(saved);
      setEditingField(null);
      toast.success(message);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "저장하지 못했습니다.");
    } finally {
      setSavingField(null);
    }
  }

  function resetDraft(field: string) {
    if (field === "title") setTitleDraft(template.title);
    if (field === "metadata") {
      setMetadataForm({
        category: template.category,
        tags: template.tags,
        tagInput: "",
      });
    }
    if (field === "summary") setSummaryDraft(template.summary);
    if (field === "rules") setRulesDraft(template.designRules);
    setEditingField(null);
  }

  function addDraftTag() {
    const nextTag = metadataForm.tagInput.trim().replace(/^#/, "");
    if (!nextTag || metadataForm.tags.includes(nextTag)) {
      setMetadataForm((current) => ({ ...current, tagInput: "" }));
      return;
    }
    setMetadataForm((current) => ({
      ...current,
      tags: [...current.tags, nextTag],
      tagInput: "",
    }));
  }

  async function handleCoverUpload(file: File | undefined) {
    if (!file) return;
    setUploading("cover");
    try {
      const url = await uploadDesignTemplateAsset(file);
      const saved = await updateDesignTemplate(template.id, { coverImageUrl: url });
      onTemplateSaved(saved);
      toast.success("대표 이미지를 업로드했습니다.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "이미지를 업로드하지 못했습니다.");
    } finally {
      setUploading(null);
      if (coverInputRef.current) coverInputRef.current.value = "";
    }
  }

  async function handlePreviewUpload(file: File | undefined) {
    if (!file) return;
    setUploading("preview");
    try {
      const url = await uploadDesignTemplateAsset(file);
      const saved = await updateDesignTemplate(template.id, {
        previewImageUrls: [...template.previewImageUrls, url],
      });
      onTemplateSaved(saved);
      toast.success("추가 이미지를 업로드했습니다.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "이미지를 업로드하지 못했습니다.");
    } finally {
      setUploading(null);
      if (previewInputRef.current) previewInputRef.current.value = "";
    }
  }

  async function handleFileUpload(file: File | undefined) {
    if (!file) return;
    setUploading("file");
    try {
      const url = await uploadDesignTemplateAsset(file);
      const saved = await updateDesignTemplate(template.id, {
        files: [
          ...template.files,
          {
            id: `template-file-${crypto.randomUUID()}`,
            name: file.name,
            url,
            fileType: file.type || inferFileType(file.name),
            fileSize: file.size,
            purpose: "source",
          },
        ],
      });
      onTemplateSaved(saved);
      toast.success("파일을 업로드했습니다.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "파일을 업로드하지 못했습니다.");
    } finally {
      setUploading(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  return (
    <>
      <div className="flex min-h-12 items-center justify-between gap-3 border-b border-surface-border px-4 py-2">
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-black uppercase tracking-[0.14em] text-brand-primary">
            Design Reference
          </p>
          {editingField === "title" ? (
            <div className="mt-1 flex min-w-0 items-center gap-2">
              <input
                value={titleDraft}
                onChange={(event) => setTitleDraft(event.target.value)}
                className="h-8 min-w-0 flex-1 rounded-md border border-brand-border bg-surface-muted px-2 text-sm font-black text-text-primary outline-none"
                aria-label="템플릿 제목"
              />
              <button
                type="button"
                onClick={() => resetDraft("title")}
                className="grid size-8 shrink-0 place-items-center rounded-md border border-surface-border-soft bg-surface-raised text-text-secondary hover:border-brand-border hover:text-brand-primary"
                title="취소"
              >
                <X className="size-3.5" />
              </button>
              <button
                type="button"
                onClick={() =>
                  void saveTemplatePatch(
                    { title: titleDraft.trim() },
                    "제목을 저장했습니다.",
                    "title",
                  )
                }
                disabled={savingField !== null || titleDraft.trim() === template.title}
                className="inline-flex min-h-8 shrink-0 items-center gap-1.5 rounded-md border border-brand-border bg-brand-glass px-3 text-xs font-black text-brand-primary hover:bg-surface-raised disabled:opacity-60"
                title="제목 저장"
              >
                <Save className="size-3.5" />
                저장
              </button>
            </div>
          ) : (
            <div className="mt-1 flex min-w-0 items-center gap-2">
              <h2 className="truncate text-sm font-black text-text-primary">
                {template.title}
              </h2>
              <button
                type="button"
                onClick={() => setEditingField("title")}
                className="grid size-7 shrink-0 place-items-center rounded-md border border-surface-border-soft bg-surface-muted text-text-secondary hover:border-brand-border hover:text-brand-primary"
                title="제목 수정"
              >
                <Pencil className="size-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto p-4">
        <div className="grid gap-4 xl:grid-cols-[minmax(0,1.15fr)_minmax(360px,0.85fr)]">
          <section className="min-w-0 space-y-4">
            <div className="overflow-hidden rounded-md border border-surface-border-soft bg-surface-muted">
              <div className="aspect-[16/9] bg-surface-strong">
                {images[0] ? (
                  <img
                    src={images[0]}
                    alt={template.title}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full flex-col items-center justify-center gap-3 bg-brand-glass text-brand-primary">
                    <ImageIcon className="size-12" />
                    <span className="text-sm font-black">이미지 프리뷰 영역</span>
                  </div>
                )}
              </div>
              <div className="flex flex-wrap justify-end gap-2 border-t border-surface-border-soft p-3">
                <input
                  ref={coverInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(event) =>
                    void handleCoverUpload(event.currentTarget.files?.[0])
                  }
                />
                <button
                  type="button"
                  onClick={() => coverInputRef.current?.click()}
                  disabled={uploading !== null}
                  className="inline-flex min-h-8 items-center gap-1.5 rounded-md border border-surface-border-soft bg-surface-raised px-3 text-xs font-black text-text-secondary hover:border-brand-border hover:text-brand-primary disabled:opacity-60"
                >
                  <ImageIcon className="size-3.5" />
                  대표 이미지
                </button>
                <button
                  type="button"
                  onClick={() => images[0] && void openUrl(images[0])}
                  disabled={!images[0]}
                  className="inline-flex min-h-8 items-center gap-1.5 rounded-md border border-brand-border bg-brand-glass px-3 text-xs font-black text-brand-primary hover:bg-surface-raised disabled:opacity-60"
                >
                  <ExternalLink className="size-3.5" />
                  크게 보기
                </button>
              </div>
            </div>

            <section className="rounded-md border border-surface-border-soft bg-surface-muted p-3">
              <div className="mb-3 flex items-center justify-between gap-3">
                <h3 className="text-sm font-black text-text-primary">
                  분류 / 태그
                </h3>
                {editingField === "metadata" ? (
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => resetDraft("metadata")}
                      className="grid size-8 place-items-center rounded-md border border-surface-border-soft bg-surface-raised text-text-secondary hover:border-brand-border hover:text-brand-primary"
                      title="취소"
                    >
                      <X className="size-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        void saveTemplatePatch(
                          {
                            category: metadataForm.category.trim(),
                            tags: metadataForm.tags,
                          },
                          "분류와 태그를 저장했습니다.",
                          "metadata",
                        )
                      }
                      disabled={
                        savingField !== null ||
                        (metadataForm.category.trim() === template.category &&
                          metadataForm.tags.join(",") === template.tags.join(","))
                      }
                      className="inline-flex min-h-8 items-center gap-1.5 rounded-md border border-brand-border bg-brand-glass px-3 text-xs font-black text-brand-primary hover:bg-surface-raised disabled:opacity-60"
                    >
                      <Save className="size-3.5" />
                      저장
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setEditingField("metadata")}
                    className="grid size-8 place-items-center rounded-md border border-surface-border-soft bg-surface-raised text-text-secondary hover:border-brand-border hover:text-brand-primary"
                    title="분류 / 태그 수정"
                  >
                    <Pencil className="size-3.5" />
                  </button>
                )}
              </div>
              {editingField === "metadata" ? (
                <div className="space-y-3">
                  <input
                    value={metadataForm.category}
                    onChange={(event) =>
                      setMetadataForm((current) => ({
                        ...current,
                        category: event.target.value,
                      }))
                    }
                    className="h-9 w-full rounded-md border border-brand-border bg-surface-raised px-2 text-xs font-bold text-text-primary outline-none"
                    aria-label="분류"
                    placeholder="분류"
                  />
                  <div className="rounded-md border border-surface-border-soft bg-surface-raised p-2">
                    <div className="flex gap-2">
                      <input
                        value={metadataForm.tagInput}
                        onChange={(event) =>
                          setMetadataForm((current) => ({
                            ...current,
                            tagInput: event.target.value,
                          }))
                        }
                        onKeyDown={(event) => {
                          if (event.key !== "Enter") return;
                          event.preventDefault();
                          addDraftTag();
                        }}
                        className="h-8 min-w-0 flex-1 rounded-md border border-surface-border-soft bg-surface-muted px-2 text-xs font-bold text-text-primary outline-none focus:border-brand-border"
                        aria-label="태그 추가"
                        placeholder="태그 입력"
                      />
                      <button
                        type="button"
                        onClick={addDraftTag}
                        className="inline-flex min-h-8 shrink-0 items-center gap-1.5 rounded-md border border-brand-border bg-brand-glass px-3 text-xs font-black text-brand-primary hover:bg-surface-muted"
                      >
                        <Plus className="size-3.5" />
                        추가
                      </button>
                    </div>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {metadataForm.tags.map((tag) => (
                        <button
                          key={tag}
                          type="button"
                          onClick={() =>
                            setMetadataForm((current) => ({
                              ...current,
                              tags: current.tags.filter((item) => item !== tag),
                            }))
                          }
                          className="inline-flex min-h-7 items-center gap-1 rounded-md border border-surface-border-soft bg-surface-muted px-2 text-xs font-black text-text-secondary hover:border-brand-border hover:text-brand-primary"
                        >
                          #{tag}
                          <X className="size-3" />
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex flex-wrap gap-1.5">
                  <span className="rounded-md border border-brand-border bg-brand-glass px-2.5 py-1.5 text-xs font-black text-brand-primary">
                    {template.category || "분류 없음"}
                  </span>
                  {template.tags.length > 0 ? (
                    template.tags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-md border border-surface-border-soft bg-surface-raised px-2.5 py-1.5 text-xs font-black text-text-muted"
                      >
                        #{tag}
                      </span>
                    ))
                  ) : (
                    <span className="rounded-md border border-dashed border-surface-border-soft bg-surface-raised px-2.5 py-1.5 text-xs font-black text-text-muted">
                      태그 없음
                    </span>
                  )}
                </div>
              )}
            </section>

            <section className="rounded-md border border-surface-border-soft bg-surface-muted p-3">
              <div className="mb-3 flex items-center justify-between gap-3">
                <h3 className="text-sm font-black text-text-primary">
                  추가 이미지
                </h3>
                <input
                  ref={previewInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(event) =>
                    void handlePreviewUpload(event.currentTarget.files?.[0])
                  }
                />
                <button
                  type="button"
                  onClick={() => previewInputRef.current?.click()}
                  disabled={uploading !== null}
                  className="inline-flex min-h-8 items-center gap-1.5 rounded-md border border-brand-border bg-brand-glass px-3 text-xs font-black text-brand-primary hover:bg-surface-raised disabled:opacity-60"
                >
                  <Plus className="size-3.5" />
                  이미지 추가
                </button>
              </div>
              {template.previewImageUrls.length > 0 ? (
                <div className="grid gap-2 sm:grid-cols-3">
                  {template.previewImageUrls.map((imageUrl) => (
                    <button
                      key={imageUrl}
                      type="button"
                      onClick={() => void openUrl(imageUrl)}
                      className="aspect-[4/3] overflow-hidden rounded-md border border-surface-border-soft bg-surface-raised"
                      title="이미지 크게 보기"
                    >
                      <img src={imageUrl} alt="" className="h-full w-full object-cover" />
                    </button>
                  ))}
                </div>
              ) : (
                <p className="rounded-md border border-dashed border-surface-border-soft bg-surface-raised p-4 text-sm font-bold text-text-muted">
                  추가 이미지가 없습니다.
                </p>
              )}
            </section>
          </section>

          <aside className="min-w-0 space-y-4">
            <InfoPanel title="설명">
              {editingField === "summary" ? (
                <>
                  <textarea
                    value={summaryDraft}
                    onChange={(event) => setSummaryDraft(event.target.value)}
                    className="min-h-24 w-full resize-none rounded-md border border-brand-border bg-surface-raised px-3 py-2 text-sm font-semibold leading-6 text-text-primary outline-none"
                    aria-label="설명"
                  />
                  <div className="mt-3 flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => resetDraft("summary")}
                      className="inline-flex min-h-8 items-center gap-1.5 rounded-md border border-surface-border-soft bg-surface-raised px-3 text-xs font-black text-text-secondary hover:border-brand-border hover:text-brand-primary"
                    >
                      <X className="size-3.5" />
                      취소
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        void saveTemplatePatch(
                          { summary: summaryDraft.trim() },
                          "설명을 저장했습니다.",
                          "summary",
                        )
                      }
                      disabled={savingField !== null || summaryDraft.trim() === template.summary}
                      className="inline-flex min-h-8 items-center gap-1.5 rounded-md border border-brand-border bg-brand-glass px-3 text-xs font-black text-brand-primary hover:bg-surface-raised disabled:opacity-60"
                    >
                      <Save className="size-3.5" />
                      저장
                    </button>
                  </div>
                </>
              ) : (
                <div className="flex items-start gap-3">
                  <p className="min-w-0 flex-1 text-sm font-semibold leading-6 text-text-secondary">
                    {template.summary}
                  </p>
                  <button
                    type="button"
                    onClick={() => setEditingField("summary")}
                    className="grid size-8 shrink-0 place-items-center rounded-md border border-surface-border-soft bg-surface-raised text-text-secondary hover:border-brand-border hover:text-brand-primary"
                    title="설명 수정"
                  >
                    <Pencil className="size-3.5" />
                  </button>
                </div>
              )}
            </InfoPanel>

            <InfoPanel title="컨벤션">
              {editingField === "rules" ? (
                <>
                  <textarea
                    value={rulesDraft}
                    onChange={(event) => setRulesDraft(event.target.value)}
                    className="min-h-36 w-full resize-none rounded-md border border-brand-border bg-surface-raised px-3 py-2 text-sm font-semibold leading-6 text-text-primary outline-none"
                    aria-label="컨벤션"
                    placeholder="등록된 디자인 규칙이 없습니다."
                  />
                  <div className="mt-3 flex flex-wrap justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => resetDraft("rules")}
                      className="inline-flex min-h-8 items-center gap-1.5 rounded-md border border-surface-border-soft bg-surface-muted px-3 text-xs font-black text-text-secondary hover:border-brand-border hover:text-brand-primary"
                    >
                      <X className="size-3.5" />
                      취소
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        void saveTemplatePatch(
                          { designRules: rulesDraft.trim() },
                          "컨벤션을 저장했습니다.",
                          "rules",
                        )
                      }
                      disabled={savingField !== null || rulesDraft.trim() === template.designRules}
                      className="inline-flex min-h-8 items-center gap-1.5 rounded-md border border-brand-border bg-brand-glass px-3 text-xs font-black text-brand-primary hover:bg-surface-raised disabled:opacity-60"
                    >
                      <Save className="size-3.5" />
                      저장
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex items-start gap-3">
                    <pre className="max-h-52 min-w-0 flex-1 overflow-y-auto whitespace-pre-wrap text-sm font-semibold leading-6 text-text-secondary">
                      {template.designRules || "등록된 디자인 규칙이 없습니다."}
                    </pre>
                    <button
                      type="button"
                      onClick={() => setEditingField("rules")}
                      className="grid size-8 shrink-0 place-items-center rounded-md border border-surface-border-soft bg-surface-muted text-text-secondary hover:border-brand-border hover:text-brand-primary"
                      title="컨벤션 수정"
                    >
                      <Pencil className="size-3.5" />
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      void copyText(template.designRules, "디자인 규칙을 복사했습니다.")
                    }
                    disabled={!template.designRules.trim()}
                    className="mt-3 inline-flex min-h-8 items-center gap-1.5 rounded-md border border-surface-border-soft bg-surface-muted px-3 text-xs font-black text-text-secondary hover:border-brand-border hover:text-brand-primary disabled:opacity-60"
                  >
                    <Copy className="size-3.5" />
                    규칙 복사
                  </button>
                </>
              )}
            </InfoPanel>

            <InfoPanel title="구현 파일">
              <input
                ref={fileInputRef}
                type="file"
                accept=".html,.htm,.zip,.tsx,.jsx,.ts,.js,.css,.json,text/html,application/zip"
                className="hidden"
                onChange={(event) =>
                  void handleFileUpload(event.currentTarget.files?.[0])
                }
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading !== null}
                className="mb-3 inline-flex min-h-8 w-full items-center justify-center gap-1.5 rounded-md border border-brand-border bg-brand-glass px-3 text-xs font-black text-brand-primary hover:bg-surface-raised disabled:opacity-60"
              >
                <FilePlus className="size-3.5" />
                HTML / 소스 파일 업로드
              </button>
              <div className="space-y-2">
                {sourceFiles.length > 0 ? (
                  sourceFiles.map((file) => <FileRow key={file.id} file={file} />)
                ) : (
                  <p className="rounded-md border border-dashed border-surface-border-soft bg-surface-muted p-4 text-sm font-bold text-text-muted">
                    아직 구현 파일이 없습니다. HTML, ZIP, 소스 파일을 업로드하세요.
                  </p>
                )}
              </div>
            </InfoPanel>
          </aside>
        </div>
      </div>
    </>
  );
}

function FileRow({ file }: { file: DesignTemplateFile }) {
  return (
    <div className="rounded-md border border-surface-border-soft bg-surface-muted p-3">
      <div className="flex min-w-0 items-start gap-3">
        <span className="grid size-9 shrink-0 place-items-center rounded-md border border-brand-border bg-brand-glass">
          <FileDown className="size-4 text-brand-primary" />
        </span>
        <div className="min-w-0 flex-1">
          <h4 className="truncate text-sm font-black text-text-primary">{file.name}</h4>
          <p className="mt-1 text-xs font-bold text-text-muted">
            {file.fileType || "file"} · {formatBytes(file.fileSize)}
          </p>
        </div>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={() => void openUrl(file.url)}
          className="inline-flex min-h-8 items-center justify-center gap-1.5 rounded-md border border-surface-border-soft bg-surface-raised px-2 text-xs font-black text-text-secondary hover:border-brand-border hover:text-brand-primary"
        >
          <ExternalLink className="size-3.5" />
          바로 보기
        </button>
        <a
          href={file.url}
          download={file.name}
          className="inline-flex min-h-8 items-center justify-center gap-1.5 rounded-md border border-brand-border bg-brand-glass px-2 text-xs font-black text-brand-primary hover:bg-surface-raised"
        >
          <Download className="size-3.5" />
          다운로드
        </a>
      </div>
    </div>
  );
}

function InfoPanel({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-md border border-surface-border-soft bg-surface-muted p-4">
      <h3 className="text-sm font-black text-text-primary">{title}</h3>
      <div className="mt-3">{children}</div>
    </section>
  );
}

function EmptyDetail() {
  return (
    <div className="grid min-h-full place-items-center p-8 text-center">
      <div>
        <ImageIcon className="mx-auto size-10 text-text-muted" />
        <h2 className="mt-3 text-base font-black text-text-primary">
          디자인 템플릿을 선택하세요
        </h2>
        <p className="mt-2 text-sm font-semibold text-text-secondary">
          왼쪽 목록에서 템플릿을 선택하면 이미지, 파일, 규칙, AI 참고 문구가 표시됩니다.
        </p>
      </div>
    </div>
  );
}

export default DesignTemplateModule;
