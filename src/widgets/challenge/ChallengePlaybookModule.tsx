import {
  Check,
  FileText,
  LoaderCircle,
  MessageCircle,
  Plus,
  RefreshCw,
  Send,
  Trophy,
  X,
} from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import {
  createChallengeCategory,
  createChallengeComment,
  createChallengeDocument,
  createChallengeTopic,
  getChallengeDocument,
  getMyChallengeSubmission,
  listChallengeCategories,
  listChallengeComments,
  listChallengeDocuments,
  listChallengeTopics,
  saveChallengeSubmission,
  type ChallengeCategory,
  type ChallengeComment,
  type ChallengeDocument,
  type ChallengeSubmission,
  type ChallengeTopic,
} from "../../features/challenge-playbook/api";
import PageHeader from "../../shared/ui/PageHeader";

type CreateDocumentForm = {
  title: string;
  content: string;
};

const EMPTY_DOCUMENT: CreateDocumentForm = {
  title: "",
  content: "",
};

function ChallengePlaybookModule() {
  const [categories, setCategories] = useState<ChallengeCategory[]>([]);
  const [topics, setTopics] = useState<ChallengeTopic[]>([]);
  const [documents, setDocuments] = useState<ChallengeDocument[]>([]);
  const [categoryId, setCategoryId] = useState("");
  const [topicId, setTopicId] = useState("");
  const [documentId, setDocumentId] = useState("");
  const [detail, setDetail] = useState<ChallengeDocument | null>(null);
  const [submission, setSubmission] = useState<ChallengeSubmission | null>(null);
  const [comments, setComments] = useState<ChallengeComment[]>([]);
  const [categoryDraft, setCategoryDraft] = useState("");
  const [topicDraft, setTopicDraft] = useState("");
  const [documentForm, setDocumentForm] = useState<CreateDocumentForm>(EMPTY_DOCUMENT);
  const [submissionText, setSubmissionText] = useState("");
  const [commentDraft, setCommentDraft] = useState("");
  const [documentDialogOpen, setDocumentDialogOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const category = categories.find((item) => item.id === categoryId) ?? categories[0];
  const topic = topics.find((item) => item.id === topicId) ?? topics[0];
  const document = documents.find((item) => item.id === documentId) ?? documents[0];

  async function load(
    nextCategoryId?: string,
    nextTopicId?: string,
    nextDocumentId?: string,
  ) {
    setBusy(true);
    try {
      const nextCategories = await listChallengeCategories();
      const nextCategory =
        nextCategories.find((item) => item.id === nextCategoryId) ?? nextCategories[0];
      const nextTopics = nextCategory ? await listChallengeTopics(nextCategory.id) : [];
      const nextTopic = nextTopics.find((item) => item.id === nextTopicId) ?? nextTopics[0];
      const nextDocuments = nextTopic ? await listChallengeDocuments(nextTopic.id) : [];
      const nextDocument =
        nextDocuments.find((item) => item.id === nextDocumentId) ?? nextDocuments[0];
      const nextDetail = nextDocument ? await getChallengeDocument(nextDocument.id) : null;
      const nextSubmission = nextDocument
        ? await getMyChallengeSubmission(nextDocument.id)
        : null;
      const nextComments = nextSubmission
        ? await listChallengeComments(nextSubmission.id)
        : [];

      setCategories(nextCategories);
      setTopics(nextTopics);
      setDocuments(nextDocuments);
      setCategoryId(nextCategory?.id ?? "");
      setTopicId(nextTopic?.id ?? "");
      setDocumentId(nextDocument?.id ?? "");
      setDetail(nextDetail);
      setSubmission(nextSubmission);
      setSubmissionText(nextSubmission?.comment ?? "");
      setComments(nextComments);
      setError("");
    } catch (reason: unknown) {
      setError(reason instanceof Error ? reason.message : "Challenge Playbook을 불러오지 못했습니다.");
    } finally {
      setBusy(false);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  async function addCategory() {
    const name = categoryDraft.trim();
    if (!name) return;
    setBusy(true);
    try {
      const created = await createChallengeCategory(name);
      setCategoryDraft("");
      await load(created.id);
    } catch (reason: unknown) {
      setError(reason instanceof Error ? reason.message : "영역을 추가하지 못했습니다.");
    } finally {
      setBusy(false);
    }
  }

  async function addTopic() {
    const title = topicDraft.trim();
    if (!category || !title) return;
    setBusy(true);
    try {
      const created = await createChallengeTopic(category.id, title);
      setTopicDraft("");
      await load(category.id, created.id);
    } catch (reason: unknown) {
      setError(reason instanceof Error ? reason.message : "주제를 추가하지 못했습니다.");
    } finally {
      setBusy(false);
    }
  }

  async function addDocument() {
    if (!topic || !documentForm.title.trim()) return;
    setBusy(true);
    try {
      const created = await createChallengeDocument(topic.id, {
        ...documentForm,
        title: documentForm.title.trim(),
        summary: "",
        checklist: "",
      });
      setDocumentForm(EMPTY_DOCUMENT);
      setDocumentDialogOpen(false);
      await load(category?.id, topic.id, created.id);
    } catch (reason: unknown) {
      setError(reason instanceof Error ? reason.message : "챌린지 문서를 추가하지 못했습니다.");
    } finally {
      setBusy(false);
    }
  }

  async function submitResult() {
    if (!document || !submissionText.trim()) return;
    setBusy(true);
    try {
      const saved = await saveChallengeSubmission(document.id, submission?.id, {
        comment: submissionText.trim(),
      });
      setSubmission(saved);
      setComments(await listChallengeComments(saved.id));
      setError("");
    } catch (reason: unknown) {
      setError(reason instanceof Error ? reason.message : "제출하지 못했습니다.");
    } finally {
      setBusy(false);
    }
  }

  async function addComment() {
    const content = commentDraft.trim();
    if (!submission || !content) return;
    setBusy(true);
    try {
      await createChallengeComment(submission.id, content);
      setCommentDraft("");
      setComments(await listChallengeComments(submission.id));
      setError("");
    } catch (reason: unknown) {
      setError(reason instanceof Error ? reason.message : "댓글을 등록하지 못했습니다.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex min-w-0 flex-1 flex-col">
      <PageHeader>
        <Trophy className="size-4 text-brand-primary" />
        <span className="text-[14px] font-bold tracking-tight text-text-primary">
          Challenge Playbook
        </span>
        <button
          type="button"
          onClick={() => void load(category?.id, topic?.id, document?.id)}
          disabled={busy}
          className="ui-icon-button ml-2 h-7 w-7 disabled:opacity-50"
          title="새로고침"
        >
          <RefreshCw className={`size-4 ${busy ? "animate-spin" : ""}`} />
        </button>
      </PageHeader>

      <div className="min-h-0 flex-1 overflow-y-auto bg-surface-muted p-5">
        {error && (
          <div className="mx-auto mb-4 max-w-[1680px] rounded-md border border-[var(--destructive)] bg-danger-glass px-4 py-3 text-xs font-bold text-[var(--destructive)]">
            {error}
          </div>
        )}
        <main className="mx-auto grid min-h-[720px] w-full max-w-[1680px] gap-4 xl:grid-cols-[300px_360px_minmax(0,1fr)]">
          <ListPanel
            title="1차 챌린지 영역"
            count={categories.length}
            draft={categoryDraft}
            placeholder="새 챌린지 영역"
            onDraft={setCategoryDraft}
            onAdd={() => void addCategory()}
          >
            {categories.map((item) => (
              <ListRow
                key={item.id}
                title={item.name}
                active={item.id === category?.id}
                onClick={() => void load(item.id)}
              />
            ))}
          </ListPanel>

          <ListPanel
            title="2차 챌린지 주제"
            count={topics.length}
            draft={topicDraft}
            placeholder="새 챌린지 주제"
            onDraft={setTopicDraft}
            onAdd={category ? () => void addTopic() : undefined}
          >
            {topics.map((item) => (
              <ListRow
                key={item.id}
                title={item.title}
                active={item.id === topic?.id}
                icon
                onClick={() => void load(category?.id, item.id)}
              />
            ))}
          </ListPanel>

          <section className="flex min-h-0 flex-col rounded-md border border-surface-border bg-surface-raised shadow-sm">
            <header className="flex items-center justify-between gap-3 border-b border-surface-border px-5 py-4">
              <div className="min-w-0">
                <p className="truncate text-[10px] font-black uppercase tracking-[0.14em] text-brand-primary">
                  {category?.name ?? "챌린지 영역"} &gt; {topic?.title ?? "챌린지 주제"}
                </p>
                <h1 className="mt-1 truncate text-lg font-black text-text-primary">
                  {document?.title ?? "문서를 선택하세요"}
                </h1>
              </div>
              {topic && (
                <button
                  type="button"
                  onClick={() => setDocumentDialogOpen(true)}
                  className="inline-flex items-center gap-1.5 rounded-md border border-brand-border bg-brand-glass px-3 py-2 text-xs font-black text-brand-primary"
                >
                  <Plus className="size-3.5" /> 문서 추가
                </button>
              )}
            </header>

            <div className="min-h-0 flex-1 overflow-y-auto p-5">
              <section className="overflow-hidden rounded-md border border-surface-border-soft">
                <div className="border-b border-surface-border-soft bg-surface-muted px-4 py-3 text-sm font-black text-text-primary">
                  챌린지 문서
                </div>
                {documents.length ? (
                  <div className="divide-y divide-[var(--surface-border-soft)]">
                    {documents.map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => void load(category?.id, topic?.id, item.id)}
                        className={`flex w-full items-start gap-3 px-4 py-3 text-left ${item.id === document?.id ? "bg-brand-glass" : "bg-surface-raised hover:bg-surface-muted"}`}
                      >
                        <FileText className="mt-0.5 size-4 shrink-0 text-brand-primary" />
                        <span className="min-w-0">
                          <span className="block truncate text-sm font-black text-text-primary">{item.title}</span>
                        </span>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="grid min-h-36 place-items-center text-sm font-semibold text-text-muted">
                    챌린지 문서를 추가하세요.
                  </div>
                )}
              </section>

              {detail && (
                <div className="fixed inset-0 z-50 grid place-items-center bg-black/35 p-5">
                  <div className="flex max-h-[92vh] w-full max-w-3xl flex-col overflow-hidden rounded-xl border border-surface-border bg-surface-raised shadow-2xl">
                    <header className="flex items-center justify-between gap-3 border-b border-surface-border-soft px-5 py-4">
                      <div className="min-w-0"><p className="truncate text-[10px] font-black uppercase tracking-[0.14em] text-brand-primary">{category?.name} &gt; {topic?.title}</p><h2 className="truncate text-lg font-black text-text-primary">{detail.title}</h2></div>
                      <button type="button" onClick={() => setDetail(null)} className="ui-icon-button h-8 w-8" title="닫기"><X className="size-4" /></button>
                    </header>
                    <div className="min-h-0 space-y-3 overflow-y-auto p-5">
                  {(detail.blocks ?? []).filter((block) => block.blockType !== "CHECKLIST").map((block) => (
                    <section key={block.id} className="rounded-md border border-surface-border-soft bg-surface-raised p-4">
                      <p className="whitespace-pre-wrap text-sm font-semibold leading-6 text-text-secondary">{block.content}</p>
                    </section>
                  ))}
                  <SubmissionSection
                    submission={submission}
                    submissionText={submissionText}
                    comments={comments}
                    commentDraft={commentDraft}
                    busy={busy}
                    onSubmissionText={setSubmissionText}
                    onCommentDraft={setCommentDraft}
                    onSubmit={() => void submitResult()}
                    onComment={() => void addComment()}
                  />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </section>
        </main>
      </div>

      {documentDialogOpen && (
        <DocumentDialog
          value={documentForm}
          busy={busy}
          onChange={setDocumentForm}
          onClose={() => setDocumentDialogOpen(false)}
          onSave={() => void addDocument()}
        />
      )}
    </div>
  );
}

function ListPanel({
  title,
  count,
  draft,
  placeholder,
  onDraft,
  onAdd,
  children,
}: {
  title: string;
  count: number;
  draft: string;
  placeholder: string;
  onDraft: (value: string) => void;
  onAdd?: () => void;
  children: ReactNode;
}) {
  const [adding, setAdding] = useState(false);

  function close() {
    onDraft("");
    setAdding(false);
  }

  function submit() {
    if (!draft.trim() || !onAdd) return;
    onAdd();
    setAdding(false);
  }

  return (
    <aside className="flex min-h-0 flex-col rounded-md border border-surface-border bg-surface-raised shadow-sm">
      <div className="flex min-h-12 items-center justify-between gap-3 border-b border-surface-border px-4">
        <h2 className="text-sm font-black text-text-primary">{title}</h2>
        <div className="flex items-center gap-2">
          <span className="grid size-7 place-items-center rounded-md bg-surface-muted text-[11px] font-black text-text-muted">{count}</span>
          {onAdd && (
            <button
              type="button"
              onClick={() => setAdding((current) => !current)}
              className="grid size-7 place-items-center rounded-md border border-brand-border bg-brand-glass text-brand-primary"
              title={adding ? "추가 닫기" : `${title} 추가`}
            >
              {adding ? <X className="size-4" /> : <Plus className="size-4" />}
            </button>
          )}
        </div>
      </div>
      <div className="min-h-0 flex-1 space-y-2 overflow-y-auto p-3">
        {children}
        {adding && onAdd && (
          <div className="flex gap-2 rounded-md border border-dashed border-brand-border bg-brand-glass p-2">
            <input
              value={draft}
              onChange={(event) => onDraft(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") submit();
                if (event.key === "Escape") close();
              }}
              placeholder={placeholder}
              className="ui-input h-9 min-w-0 flex-1 bg-surface-raised text-xs"
              autoFocus
            />
            <button
              type="button"
              onClick={submit}
              disabled={!draft.trim()}
              className="grid size-9 shrink-0 place-items-center rounded-md border border-brand-border bg-brand-glass text-brand-primary disabled:opacity-40"
              title="저장"
            >
              <Check className="size-4" />
            </button>
            <button type="button" onClick={close} className="ui-icon-button h-9 w-9 shrink-0" title="취소">
              <X className="size-4" />
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}

function ListRow({ title, active, icon, onClick }: { title: string; active?: boolean; icon?: boolean; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className={`flex min-h-11 w-full items-center gap-2 rounded-md px-3 text-left ${active ? "bg-brand-glass" : "bg-surface-muted hover:bg-brand-glass"}`}>
      {icon && <FileText className="size-3.5 shrink-0 text-brand-primary" />}
      <span className="truncate text-sm font-black text-text-primary">{title}</span>
    </button>
  );
}

function SubmissionSection({ submission, submissionText, comments, commentDraft, busy, onSubmissionText, onCommentDraft, onSubmit, onComment }: {
  submission: ChallengeSubmission | null;
  submissionText: string;
  comments: ChallengeComment[];
  commentDraft: string;
  busy: boolean;
  onSubmissionText: (value: string) => void;
  onCommentDraft: (value: string) => void;
  onSubmit: () => void;
  onComment: () => void;
}) {
  return <section className="rounded-md border border-surface-border-soft bg-surface-raised p-4">
    <h3 className="flex items-center gap-2 text-sm font-black text-text-primary"><MessageCircle className="size-4 text-brand-primary" />제출 댓글</h3>
    <textarea value={submissionText} onChange={(event) => onSubmissionText(event.target.value)} placeholder="이 챌린지의 구현 내용과 결과를 댓글로 제출하세요." className="ui-input mt-3 min-h-24 py-2 text-sm" />
    <div className="mt-3 flex justify-end"><button type="button" onClick={onSubmit} disabled={busy || !submissionText.trim()} className="rounded-md bg-brand-primary px-4 py-2 text-xs font-black text-text-on-brand disabled:opacity-40">{submission ? "제출 수정" : "제출"}</button></div>
    {submission && <div className="mt-4 border-t border-surface-border-soft pt-4">
      <div className="space-y-2">{comments.map((comment) => <div key={comment.id} className="rounded-md bg-surface-muted px-3 py-2"><div className="flex items-center gap-2 text-[10px] font-black text-text-muted"><span className="text-text-primary">{comment.authorName}</span><span>{new Date(comment.createdAt).toLocaleString("ko-KR")}</span></div><p className="mt-1 whitespace-pre-wrap text-xs font-semibold text-text-secondary">{comment.content}</p></div>)}</div>
      <div className="mt-3 flex items-end gap-2"><textarea value={commentDraft} onChange={(event) => onCommentDraft(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter" && !event.shiftKey) { event.preventDefault(); onComment(); } }} placeholder="제출 댓글에 답글을 남겨주세요." rows={1} className="ui-input min-h-9 flex-1 py-2 text-xs" /><button type="button" onClick={onComment} disabled={busy || !commentDraft.trim()} className="ui-icon-button-brand h-9 w-9 disabled:opacity-40">{busy ? <LoaderCircle className="size-4 animate-spin" /> : <Send className="size-4" />}</button></div>
    </div>}
  </section>;
}

function DocumentDialog({ value, busy, onChange, onClose, onSave }: { value: CreateDocumentForm; busy: boolean; onChange: (value: CreateDocumentForm) => void; onClose: () => void; onSave: () => void }) {
  return <div className="fixed inset-0 z-[80] grid place-items-center bg-black/50 p-6"><div className="w-full max-w-2xl rounded-lg border border-surface-border bg-surface-raised p-5 shadow-2xl"><div className="flex items-center justify-between"><h2 className="text-base font-black text-text-primary">챌린지 추가</h2><button type="button" onClick={onClose} className="ui-icon-button h-8 w-8"><X className="size-4" /></button></div><div className="mt-4 space-y-3"><input value={value.title} onChange={(event) => onChange({ ...value, title: event.target.value })} placeholder="챌린지 제목" className="ui-input h-10 text-sm" autoFocus /><textarea value={value.content} onChange={(event) => onChange({ ...value, content: event.target.value })} placeholder="챌린지 내용을 입력하세요." className="ui-input min-h-36 py-2 text-sm" /></div><div className="mt-5 flex justify-end gap-2"><button type="button" onClick={onClose} className="rounded-md px-4 py-2 text-xs font-black text-text-secondary">취소</button><button type="button" onClick={onSave} disabled={busy || !value.title.trim()} className="rounded-md bg-brand-primary px-4 py-2 text-xs font-black text-text-on-brand disabled:opacity-40">저장</button></div></div></div>;
}

export default ChallengePlaybookModule;
