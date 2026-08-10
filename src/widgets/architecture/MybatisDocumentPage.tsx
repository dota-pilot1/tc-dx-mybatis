import { ArrowLeft, CloudCog, FileText, GripVertical } from "lucide-react";
import { DndContext, PointerSensor, closestCenter, useSensor, useSensors, type DragEndEvent } from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import { SortableContext, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useEffect, useState } from "react";
import PageHeader from "../../shared/ui/PageHeader";
import { DialogActions, DialogFrame } from "../../shared/ui/dialog";
import { LexicalEditor } from "../../shared/ui/lexical/lexical-editor";
import {
  listArchitecturePlaybook,
  reorderArchitectureDocuments,
  type ArchitecturePlaybookDocument,
} from "../../features/mybatis-playbook/api";

type Props = {
  documentId: string;
  onClose: () => void;
  onNavigate?: (documentId: string) => void;
};

type DocumentRow = {
  document: ArchitecturePlaybookDocument;
  depth: number;
  indexPath: number[];
};

function SortableDocumentRow({
  item,
  depth,
  indexPath,
  active,
  reordering,
  onClick,
}: {
  item: ArchitecturePlaybookDocument;
  depth: number;
  indexPath: number[];
  active: boolean;
  reordering: boolean;
  onClick: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: item.id });
  return (
    <button
      ref={setNodeRef}
      type="button"
      onClick={onClick}
      {...attributes}
      {...listeners}
      disabled={reordering}
      className={`flex w-full items-center gap-2 rounded-md p-2.5 text-left transition-colors ${active ? "border-l-2 border-brand-border bg-brand-glass text-brand-primary" : depth > 0 ? "border-l-2 border-brand-border/40 bg-surface-raised text-text-secondary" : "bg-surface-muted text-text-primary hover:bg-brand-glass"} ${isDragging ? "z-10 opacity-60 shadow-lg ring-2 ring-brand-border/40" : ""}`}
      style={{ transform: CSS.Transform.toString(transform), transition, paddingLeft: `${10 + depth * 28}px` }}
    >
      <GripVertical className="size-3.5 shrink-0 cursor-grab text-text-muted active:cursor-grabbing" aria-hidden="true" />
      <FileText className={`size-3.5 shrink-0 ${active ? "text-brand-primary" : "text-text-muted"}`} />
      <span className="flex min-w-0 items-center gap-2">
        <span className={`${depth > 0 ? "h-5 min-w-5 px-1 text-[10px]" : "h-6 min-w-6 px-1.5 text-[11px]"} inline-flex shrink-0 items-center justify-center rounded-md border border-surface-border-soft bg-surface-raised font-black text-text-muted`}>{indexPath.join(".")}</span>
        {depth > 0 && <span className="shrink-0 text-xs font-bold text-brand-primary/75">ㄴ</span>}
        <span className={`${depth > 0 ? "text-[13px] font-bold text-text-secondary" : "text-sm font-black text-text-primary"} truncate`}>{item.title}</span>
      </span>
    </button>
  );
}

function findDocument(
  categories: Awaited<ReturnType<typeof listArchitecturePlaybook>>,
  documentId: string,
) {
  for (const category of categories) {
    for (const topic of category.topics) {
      const document = topic.documents.find((item) => item.id === documentId);
      if (document) return { category, topic, document };
    }
  }
  return null;
}

function flattenDocumentRows(documents: ArchitecturePlaybookDocument[]) {
  const children = new Map<string, ArchitecturePlaybookDocument[]>();
  const roots: ArchitecturePlaybookDocument[] = [];

  for (const document of documents) {
    if (document.parentId) {
      const siblings = children.get(document.parentId) ?? [];
      siblings.push(document);
      children.set(document.parentId, siblings);
    } else {
      roots.push(document);
    }
  }

  const rows: DocumentRow[] = [];
  function visit(items: ArchitecturePlaybookDocument[], depth: number, parentPath: number[] = []) {
    items.forEach((document, index) => {
      const indexPath = [...parentPath, index + 1];
      rows.push({ document, depth, indexPath });
      visit(children.get(document.id) ?? [], depth + 1, indexPath);
    });
  }

  visit(roots, 0);
  return rows;
}

export default function MybatisDocumentPage({ documentId, onClose, onNavigate }: Props) {
  const [result, setResult] = useState<ReturnType<typeof findDocument>>(null);
  const [categories, setCategories] = useState<Awaited<ReturnType<typeof listArchitecturePlaybook>>>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [breadcrumbOpen, setBreadcrumbOpen] = useState(false);
  const [selectedCategoryId, setSelectedCategoryId] = useState("");
  const [selectedTopicId, setSelectedTopicId] = useState("");
  const [reordering, setReordering] = useState(false);
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));

  async function load() {
    if (categories.length) {
      const cached = findDocument(categories, documentId);
      if (cached) {
        setResult(cached);
        setError("");
        setLoading(false);
        return;
      }
    }

    setLoading(true);
    setError("");
    try {
      const categories = await listArchitecturePlaybook();
      setCategories(categories);
      const found = findDocument(categories, documentId);
      setResult(found);
      if (!found) setError("문서를 찾을 수 없습니다.");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "문서를 불러오지 못했습니다.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, [documentId]);

  const document = result?.document as ArchitecturePlaybookDocument | undefined;
  const documentRows = result ? flattenDocumentRows(result.topic.documents) : [];
  const selectedCategory = categories.find((item) => item.id === selectedCategoryId);

  function openBreadcrumbDialog() {
    setSelectedCategoryId(result?.category.id ?? "");
    setSelectedTopicId(result?.topic.id ?? "");
    setBreadcrumbOpen(true);
  }

  function selectBreadcrumb() {
    const topic = selectedCategory?.topics.find((item) => item.id === selectedTopicId);
    const nextDocument = topic?.documents.find((item) => !item.parentId) ?? topic?.documents[0];
    setBreadcrumbOpen(false);
    if (nextDocument) onNavigate?.(nextDocument.id);
  }

  async function reorderDocuments(fromId: string, toId: string) {
    if (!result || reordering || fromId === toId) return;
    const documents = result.topic.documents;
    const from = documents.find((item) => item.id === fromId);
    const to = documents.find((item) => item.id === toId);
    if (!from || !to || (from.parentId ?? null) !== (to.parentId ?? null)) return;

    const parentId = from.parentId ?? null;
    const siblings = documents.filter((item) => (item.parentId ?? null) === parentId);
    const nextSiblings = arrayMove(siblings, siblings.findIndex((item) => item.id === fromId), siblings.findIndex((item) => item.id === toId));
    const nextSiblingIds = nextSiblings.map((item) => item.id);
    const nextDocuments = [...documents];
    let siblingIndex = 0;
    documents.forEach((item, index) => {
      if ((item.parentId ?? null) !== parentId) return;
      nextDocuments[index] = nextSiblings[siblingIndex++];
    });

    setReordering(true);
    try {
      await reorderArchitectureDocuments(result.topic.id, nextSiblingIds, parentId);
      setCategories((current) => current.map((category) => ({
        ...category,
        topics: category.topics.map((topic) => topic.id === result.topic.id ? { ...topic, documents: nextDocuments } : topic),
      })));
      setResult((current) => current ? { ...current, topic: { ...current.topic, documents: nextDocuments } } : current);
    } finally {
      setReordering(false);
    }
  }

  function handleDocumentDragEnd({ active, over }: DragEndEvent) {
    if (!over || active.id === over.id) {
      return;
    }
    void reorderDocuments(String(active.id), String(over.id));
  }

  return (
    <div className="flex min-w-0 flex-1 flex-col">
      <PageHeader>
        <CloudCog className="size-4 text-brand-primary" />
        <span className="text-[14px] font-bold tracking-tight text-text-primary">MyBatis Playbook</span>
        <span className="ml-1 text-[12px] font-semibold text-text-muted">문서 페이지</span>
      </PageHeader>
      <div className="min-h-0 flex-1 overflow-y-auto bg-surface-muted p-3 md:p-4">
        <main className="mx-auto grid w-full max-w-[1800px] gap-3 lg:grid-cols-[520px_minmax(0,1fr)]">
          {loading ? (
            <div className="grid min-h-[520px] place-items-center rounded-xl border border-surface-border bg-surface-raised text-sm font-semibold text-text-muted lg:col-span-2">문서를 불러오는 중입니다.</div>
          ) : error || !result || !document ? (
            <div className="rounded-xl border border-[var(--destructive)] bg-danger-glass px-4 py-4 text-sm font-semibold text-[var(--destructive)] lg:col-span-2">{error || "문서를 찾을 수 없습니다."}</div>
          ) : (
            <>
              <button type="button" onClick={openBreadcrumbDialog} className="flex w-fit items-center gap-1 rounded-md px-1 text-left text-[11px] font-black tracking-tight text-brand-primary hover:bg-brand-glass lg:col-span-2">
                <span className="truncate">{result.category.title}</span>
                <span className="text-text-muted">&gt;</span>
                <span className="truncate">{result.topic.title}</span>
              </button>
              <aside className="h-fit rounded-xl border border-surface-border bg-surface-raised p-2.5 shadow-sm lg:sticky lg:top-0 lg:max-h-[calc(100vh-6rem)] lg:overflow-y-auto">
                <div className="border-b border-surface-border-soft px-2 pb-2.5">
                  <div className="mt-1 flex items-center justify-between gap-2">
                    <h2 className="truncate text-sm font-black text-text-primary">문서 목록</h2>
                    <div className="flex items-center gap-1.5">
                      <span className="shrink-0 rounded-md bg-surface-muted px-2 py-1 text-[10px] font-bold text-text-muted">{documentRows.length}</span>
                      <button type="button" onClick={onClose} className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-[11px] font-black text-text-secondary hover:bg-surface-muted hover:text-brand-primary" title="목록으로" aria-label="목록으로">
                        <ArrowLeft className="size-3.5" />
                        목록으로
                      </button>
                    </div>
                  </div>
                </div>
                <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDocumentDragEnd}>
                  <SortableContext items={documentRows.map(({ document: item }) => item.id)} strategy={verticalListSortingStrategy}>
                    <div className="mt-1.5 space-y-0.5" role="list">
                      {documentRows.map(({ document: item, depth, indexPath }) => (
                        <SortableDocumentRow key={item.id} item={item} depth={depth} indexPath={indexPath} active={item.id === document.id} reordering={reordering} onClick={() => onNavigate?.(item.id)} />
                      ))}
                    </div>
                  </SortableContext>
                </DndContext>
              </aside>

              <section className="min-w-0">
                <article className="overflow-hidden rounded-xl border border-surface-border bg-surface-raised shadow-sm">
                  <header className="border-b border-surface-border px-5 py-5">
                    <p className="text-[10px] font-black uppercase tracking-[0.14em] text-brand-primary">{result.category.title} &gt; {result.topic.title}</p>
                    <h1 className="mt-2 text-2xl font-black tracking-tight text-text-primary">{document.title}</h1>
                    <p className="mt-2 text-[11px] font-semibold text-text-muted">최종 수정 {new Date(document.updatedAt).toLocaleString("ko-KR")}</p>
                  </header>
                  <div className="p-5">
                    <LexicalEditor key={document.id} initialState={document.content} onChange={() => undefined} readOnly minHeight="560px" />
                  </div>
                </article>
              </section>
            </>
          )}
        </main>
      </div>
      {breadcrumbOpen && (
        <DialogFrame title="문서 위치 선택" eyebrow="MyBatis 문서" onClose={() => setBreadcrumbOpen(false)} size="lg" contentClassName="min-h-[300px]">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="min-w-0 space-y-2">
              <span className="flex items-center justify-between text-xs font-black text-text-primary">
                <span>1차 MyBatis 영역</span>
                <span className="text-[10px] font-bold text-text-muted">{categories.length}개</span>
              </span>
              <div className="min-h-40 space-y-1 rounded-lg border border-surface-border-soft bg-surface-muted p-1.5">
                {categories.map((item) => {
                  const active = item.id === selectedCategoryId;
                  return <button key={item.id} type="button" onClick={() => {
                    setSelectedCategoryId(item.id);
                    setSelectedTopicId(item.topics[0]?.id ?? "");
                  }} className={`w-full rounded-md px-3 py-2.5 text-left text-xs font-black transition-colors ${active ? "border-l-2 border-brand-border bg-brand-glass text-brand-primary" : "text-text-secondary hover:bg-surface-raised hover:text-text-primary"}`}>{item.title}</button>;
                })}
              </div>
            </div>
            <div className="min-w-0 space-y-2">
              <span className="flex items-center justify-between text-xs font-black text-text-primary">
                <span>2차 MyBatis 주제</span>
                <span className="text-[10px] font-bold text-text-muted">{selectedCategory?.topics.length ?? 0}개</span>
              </span>
              <div className="min-h-40 space-y-1 rounded-lg border border-surface-border-soft bg-surface-muted p-1.5">
                {(selectedCategory?.topics ?? []).map((item) => {
                  const active = item.id === selectedTopicId;
                  return <button key={item.id} type="button" onClick={() => setSelectedTopicId(item.id)} className={`w-full rounded-md px-3 py-2.5 text-left text-xs font-black transition-colors ${active ? "border-l-2 border-brand-border bg-brand-glass text-brand-primary" : "text-text-secondary hover:bg-surface-raised hover:text-text-primary"}`}>{item.title}</button>;
                })}
              </div>
            </div>
          </div>
          <DialogActions busy={false} deleting={false} onClose={() => setBreadcrumbOpen(false)} onSave={selectBreadcrumb} />
        </DialogFrame>
      )}
    </div>
  );
}
