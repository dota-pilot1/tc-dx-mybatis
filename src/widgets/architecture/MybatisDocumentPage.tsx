import { ArrowLeft, Check, CloudCog, ExternalLink, Link as LinkIcon, RefreshCw } from "lucide-react";
import { useEffect, useState } from "react";
import PageHeader from "../../shared/ui/PageHeader";
import { LexicalEditor } from "../../shared/ui/lexical/lexical-editor";
import {
  listArchitecturePlaybook,
  type ArchitecturePlaybookDocument,
} from "../../features/mybatis-playbook/api";

type Props = {
  documentId: string;
  onClose: () => void;
};

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

export default function MybatisDocumentPage({ documentId, onClose }: Props) {
  const [result, setResult] = useState<ReturnType<typeof findDocument>>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  async function load() {
    setLoading(true);
    setError("");
    try {
      const categories = await listArchitecturePlaybook();
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

  async function copyPageLink() {
    await navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  }

  const document = result?.document as ArchitecturePlaybookDocument | undefined;

  return (
    <div className="flex min-w-0 flex-1 flex-col">
      <PageHeader>
        <CloudCog className="size-4 text-brand-primary" />
        <span className="text-[14px] font-bold tracking-tight text-text-primary">MyBatis Playbook</span>
        <span className="ml-1 text-[12px] font-semibold text-text-muted">문서 페이지</span>
      </PageHeader>
      <div className="min-h-0 flex-1 overflow-y-auto bg-surface-muted p-5">
        <main className="mx-auto max-w-5xl">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <button type="button" onClick={onClose} className="inline-flex items-center gap-1.5 text-xs font-black text-text-secondary hover:text-brand-primary">
              <ArrowLeft className="size-3.5" /> 목록으로
            </button>
            {document && (
              <div className="flex items-center gap-1.5">
                <button type="button" onClick={() => void copyPageLink()} className="ui-icon-button h-8 w-8" title={copied ? "링크 복사됨" : "페이지 링크 복사"} aria-label={copied ? "링크 복사됨" : "페이지 링크 복사"}>
                  {copied ? <Check className="size-3.5 text-brand-primary" /> : <LinkIcon className="size-3.5" />}
                </button>
                <button type="button" onClick={() => void load()} className="ui-icon-button h-8 w-8" title="문서 새로고침" aria-label="문서 새로고침">
                  <RefreshCw className="size-3.5" />
                </button>
              </div>
            )}
          </div>

          {loading ? (
            <div className="grid min-h-[520px] place-items-center rounded-xl border border-surface-border bg-surface-raised text-sm font-semibold text-text-muted">문서를 불러오는 중입니다.</div>
          ) : error || !result || !document ? (
            <div className="rounded-xl border border-[var(--destructive)] bg-danger-glass px-4 py-4 text-sm font-semibold text-[var(--destructive)]">{error || "문서를 찾을 수 없습니다."}</div>
          ) : (
            <article className="overflow-hidden rounded-xl border border-surface-border bg-surface-raised shadow-sm">
              <header className="border-b border-surface-border px-6 py-6">
                <p className="text-[10px] font-black uppercase tracking-[0.14em] text-brand-primary">{result.category.title} &gt; {result.topic.title}</p>
                <h1 className="mt-2 text-2xl font-black tracking-tight text-text-primary">{document.title}</h1>
                <p className="mt-2 text-[11px] font-semibold text-text-muted">최종 수정 {new Date(document.updatedAt).toLocaleString("ko-KR")}</p>
              </header>
              <div className="p-6">
                <LexicalEditor key={document.id} initialState={document.content} onChange={() => undefined} readOnly minHeight="560px" />
              </div>
              <footer className="flex items-center justify-between gap-3 border-t border-surface-border-soft bg-surface-muted px-6 py-3">
                <span className="text-[11px] font-semibold text-text-muted">문서 페이지 링크를 복사해 팀원과 공유할 수 있습니다.</span>
                <button type="button" onClick={() => void copyPageLink()} className="inline-flex items-center gap-1.5 text-xs font-black text-brand-primary">
                  <ExternalLink className="size-3.5" /> {copied ? "복사됨" : "링크 복사"}
                </button>
              </footer>
            </article>
          )}
        </main>
      </div>
    </div>
  );
}
