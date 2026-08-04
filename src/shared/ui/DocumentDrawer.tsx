import { ChevronLeft, ChevronRight, MessageCircle, Pencil, Reply, Send, Trash2, X } from "lucide-react";
import { useEffect, useState } from "react";
import { LexicalEditor } from "./lexical/lexical-editor";

type DrawerDocument = { id: string; title: string; content: string };
type Comment = { id: string; parentId?: string; content: string; createdAt: string };

function storageKey(documentId: string) { return "playbook-document-comments:" + documentId; }

export default function DocumentDrawer({
  document,
  previous,
  next,
  onNavigate,
  onEdit,
  onDelete,
  onClose,
}: {
  document: DrawerDocument;
  previous?: DrawerDocument;
  next?: DrawerDocument;
  onNavigate: (document: DrawerDocument) => void;
  onEdit?: () => void;
  onDelete?: () => void;
  onClose: () => void;
}) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [draft, setDraft] = useState("");
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [replyDraft, setReplyDraft] = useState("");

  useEffect(() => {
    try { setComments(JSON.parse(window.localStorage.getItem(storageKey(document.id)) ?? "[]")); } catch { setComments([]); }
    setDraft(""); setReplyTo(null); setReplyDraft("");
  }, [document.id]);

  function persist(nextComments: Comment[]) {
    setComments(nextComments);
    window.localStorage.setItem(storageKey(document.id), JSON.stringify(nextComments));
  }
  function addComment(parentId?: string) {
    const content = (parentId ? replyDraft : draft).trim();
    if (!content) return;
    persist([...comments, { id: crypto.randomUUID(), parentId, content, createdAt: new Date().toISOString() }]);
    if (parentId) { setReplyDraft(""); setReplyTo(null); } else setDraft("");
  }
  const roots = comments.filter((comment) => !comment.parentId);

  return <div className="fixed inset-0 z-[60] isolate bg-[color-mix(in_srgb,var(--background)_84%,transparent)]">
    <button type="button" aria-label="드로워 닫기" onClick={onClose} className="absolute inset-0 cursor-default" />
    <aside className="absolute inset-y-0 right-0 z-10 flex w-full max-w-[820px] flex-col border-l border-surface-border bg-surface-raised shadow-2xl">
      <header className="flex items-center gap-2 border-b border-surface-border px-5 py-4">
        <div className="min-w-0 flex-1"><p className="text-[10px] font-black uppercase tracking-[0.14em] text-brand-primary">문서 보기</p><h2 className="truncate text-lg font-black text-text-primary">{document.title}</h2></div>
        {(previous || next) && <nav className="flex shrink-0 items-center gap-2 border-l border-surface-border-soft pl-4" aria-label="문서 이동">
          {previous && <button type="button" onClick={() => onNavigate(previous)} className="inline-flex h-9 shrink-0 items-center gap-1 rounded-md border border-surface-border px-2.5 text-xs font-black text-text-secondary hover:border-brand-border hover:bg-brand-glass hover:text-brand-primary" title="이전 문서"><ChevronLeft className="size-4" />이전</button>}
          {next && <button type="button" onClick={() => onNavigate(next)} className="inline-flex h-9 shrink-0 items-center gap-1 rounded-md border border-surface-border px-2.5 text-xs font-black text-text-secondary hover:border-brand-border hover:bg-brand-glass hover:text-brand-primary" title="다음 문서">다음<ChevronRight className="size-4" /></button>}
        </nav>}
        {(onEdit || onDelete) && <div className="flex shrink-0 items-center gap-2 border-l border-surface-border-soft pl-4" aria-label="문서 작업">
          {onEdit && <button type="button" onClick={onEdit} className="inline-flex h-9 items-center gap-1.5 rounded-md border border-brand-border bg-brand-glass px-2.5 text-xs font-black text-brand-primary hover:bg-surface-raised" title="문서 수정"><Pencil className="size-3.5" />수정</button>}
          {onDelete && <button type="button" onClick={onDelete} className="inline-flex h-9 items-center gap-1.5 rounded-md border border-[var(--destructive)]/30 px-2.5 text-xs font-black text-[var(--destructive)] hover:bg-danger-glass" title="문서 삭제"><Trash2 className="size-3.5" />삭제</button>}
        </div>}
        <button type="button" onClick={onClose} className="ui-icon-button ml-2 h-9 w-9 shrink-0" title="닫기"><X className="size-4" /></button>
      </header>
      <div className="min-h-0 flex-1 overflow-y-auto p-5">
        <div className="rounded-md border border-surface-border-soft p-4"><LexicalEditor key={document.id} initialState={document.content} onChange={() => undefined} readOnly minHeight="360px" /></div>
        <section className="mt-6">
          <h3 className="flex items-center gap-2 text-sm font-black text-text-primary"><MessageCircle className="size-4 text-brand-primary" />댓글·대댓글<span className="grid min-w-6 place-items-center rounded-full bg-surface-muted px-1.5 py-0.5 text-[10px] text-text-muted">{comments.length}</span></h3>
          <div className="mt-3 space-y-2"><textarea value={draft} onChange={(event) => setDraft(event.target.value)} placeholder="이 문서에 댓글을 남겨보세요." rows={2} className="ui-input min-h-20 w-full resize-y py-2 text-sm" /><div className="flex justify-end"><button type="button" onClick={() => addComment()} disabled={!draft.trim()} className="inline-flex h-9 items-center gap-1.5 rounded-md bg-brand-primary px-3 text-xs font-black text-text-on-brand disabled:opacity-40"><Send className="size-3.5" />댓글 등록</button></div></div>
          <div className="mt-4 space-y-3">{roots.map((comment) => <article key={comment.id} className="rounded-lg border border-surface-border-soft bg-surface-muted p-4"><div className="flex items-start justify-between gap-3"><p className="whitespace-pre-wrap text-sm font-semibold leading-6 text-text-secondary">{comment.content}</p><span className="shrink-0 text-[10px] font-semibold text-text-muted">{new Date(comment.createdAt).toLocaleDateString("ko-KR")}</span></div><div className="mt-3 flex justify-end"><button type="button" onClick={() => setReplyTo(replyTo === comment.id ? null : comment.id)} className="inline-flex items-center gap-1.5 rounded-md border border-surface-border bg-surface-raised px-2.5 py-1.5 text-xs font-black text-text-secondary hover:border-brand-border hover:bg-brand-glass hover:text-brand-primary"><Reply className="size-3.5" />답글 달기</button></div>{replyTo === comment.id && <div className="mt-3 rounded-md border border-brand-border bg-brand-glass p-3"><textarea value={replyDraft} onChange={(event) => setReplyDraft(event.target.value)} placeholder="대댓글을 남겨보세요." rows={2} className="ui-input min-h-14 w-full bg-surface-raised py-2 text-xs" /><div className="mt-2 flex justify-end"><button type="button" onClick={() => addComment(comment.id)} disabled={!replyDraft.trim()} className="inline-flex h-8 items-center gap-1 rounded-md bg-brand-primary px-2.5 text-[11px] font-black text-text-on-brand disabled:opacity-40"><Send className="size-3" />답글 등록</button></div></div>}{comments.filter((reply) => reply.parentId === comment.id).map((reply) => <div key={reply.id} className="mt-3 ml-6"><div className="rounded-md border border-surface-border-soft bg-surface-raised px-3 py-2.5 text-sm font-semibold leading-6 text-text-secondary"><div className="mb-1 text-[10px] font-black text-brand-primary">ㄴ 대댓글</div>{reply.content}</div></div>)}</article>)}</div>
        </section>
      </div>
    </aside>
  </div>;
}
