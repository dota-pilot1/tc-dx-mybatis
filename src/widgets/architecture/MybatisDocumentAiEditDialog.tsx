import { Eraser, Sparkles, X } from "lucide-react";
import { useState } from "react";
import { aiEditArchitectureDocument, updateArchitectureDocument } from "../../features/mybatis-playbook/api";
import { LexicalEditor } from "../../shared/ui/lexical/lexical-editor";
import { normalizeLexicalJson, resetLexicalFormatting } from "../../shared/ui/lexical/lexical-state";

type Props = {
  documentId: string;
  title: string;
  initialContent: string;
  onClose: () => void;
  onSaved: () => void;
};

const DEFAULT_INSTRUCTION = `
기존 서식은 모두 무시하고 문서 내용을 누락 없이 처음부터 다시 정리해줘.
제목과 소제목은 Heading으로, 설명과 안내는 일반 문단으로 작성해줘.
실행 명령어, 코드, SQL, YAML, JSON, docker-compose 설정, 긴 URL은 반드시 실제 Lexical 코드 블럭(CodeNode)으로 만들어줘.
코드 블럭 안의 줄바꿈과 들여쓰기는 유지하고, 각 섹션 사이에는 충분한 문단 간격을 넣어줘.
문장 전체에 인라인 코드, 글자색, 폰트색을 적용하지 말고, 코드가 아닌 스펙 항목도 일반 문장이나 목록으로 작성해줘.
`.trim();

export default function MybatisDocumentAiEditDialog({
  documentId,
  title,
  initialContent,
  onClose,
  onSaved,
}: Props) {
  const [content, setContent] = useState(initialContent);
  const [instruction, setInstruction] = useState(DEFAULT_INSTRUCTION);
  const [revision, setRevision] = useState(0);
  const [busy, setBusy] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function applyAiEdit() {
    if (!instruction.trim() || busy || saving) return;
    setBusy(true);
    setError("");
    try {
      const sourceContent = resetLexicalFormatting(content) ?? content;
      const result = await aiEditArchitectureDocument(documentId, {
        content: sourceContent,
        instruction: instruction.trim(),
      });
      const normalizedContent = normalizeLexicalJson(result.content);
      if (!normalizedContent) {
        throw new Error("AI가 올바른 Lexical 문서 형식으로 결과를 만들지 못했습니다. 요구사항을 조금 더 구체적으로 입력해 주세요.");
      }
      setContent(normalizedContent);
      setRevision((current) => current + 1);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "AI 편집에 실패했습니다.");
    } finally {
      setBusy(false);
    }
  }

  async function save() {
    setSaving(true);
    setError("");
    try {
      await updateArchitectureDocument(documentId, { content });
      onSaved();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "문서를 저장하지 못했습니다.");
    } finally {
      setSaving(false);
    }
  }

  function resetFormatting() {
    const reset = resetLexicalFormatting(content);
    if (!reset) return;
    setContent(reset);
    setRevision((current) => current + 1);
    setError("");
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-[color-mix(in_srgb,var(--background)_72%,transparent)] p-4">
      <div className="flex max-h-[min(900px,calc(100vh-2rem))] w-full max-w-5xl flex-col overflow-hidden rounded-xl border border-surface-border bg-surface-raised shadow-2xl">
        <header className="flex items-center justify-between gap-3 border-b border-surface-border px-5 py-4">
          <div className="min-w-0">
            <div className="flex items-center gap-2 text-brand-primary">
              <Sparkles className="size-4" />
              <span className="text-xs font-black uppercase tracking-[0.14em]">AI 편집</span>
            </div>
            <h2 className="mt-1 truncate text-lg font-black text-text-primary">{title}</h2>
          </div>
          <button type="button" onClick={onClose} className="ui-icon-button h-8 w-8" title="닫기" aria-label="AI 편집 닫기">
            <X className="size-4" />
          </button>
        </header>

        <div className="min-h-0 overflow-y-auto p-5">
          <section className="rounded-lg border border-brand-border bg-brand-glass p-4">
            <label htmlFor="mybatis-ai-edit-instruction" className="text-sm font-black text-text-primary">편집 요구사항</label>
            <p className="mt-1 text-xs font-semibold leading-5 text-text-secondary">현재 본문에서 원하는 수정 내용을 구체적으로 입력하세요. 결과는 아래 편집창에 반영되며, 검토 후 저장할 수 있습니다.</p>
            <div className="mt-3 flex gap-2">
              <textarea
                id="mybatis-ai-edit-instruction"
                value={instruction}
                onChange={(event) => setInstruction(event.target.value)}
                onKeyDown={(event) => {
                  if ((event.metaKey || event.ctrlKey) && event.key === "Enter") void applyAiEdit();
                }}
                className="ui-input min-h-20 min-w-0 flex-1 resize-y bg-surface-raised px-3 py-2 text-sm leading-6"
                placeholder="기본 편집 지시를 필요한 경우 수정하세요."
                disabled={busy || saving}
              />
              <button
                type="button"
                onClick={() => void applyAiEdit()}
                disabled={!instruction.trim() || busy || saving}
                className="inline-flex h-fit shrink-0 items-center gap-1.5 rounded-md bg-brand-primary px-3 py-2.5 text-xs font-black text-text-on-brand disabled:cursor-not-allowed disabled:opacity-40"
              >
                <Sparkles className="size-3.5" />
                {busy ? "편집 중..." : "AI로 편집"}
              </button>
            </div>
            {error && <p className="mt-2 whitespace-pre-wrap text-xs font-bold text-[var(--destructive)]">{error}</p>}
          </section>

          <section className="mt-4 overflow-hidden rounded-lg border border-surface-border-soft">
            <div className="flex items-center justify-between gap-3 border-b border-surface-border-soft bg-surface-muted px-4 py-2">
              <span className="text-xs font-black text-text-secondary">편집 결과 검토</span>
              <button type="button" onClick={resetFormatting} disabled={busy || saving} className="inline-flex items-center gap-1 rounded-md border border-surface-border-soft px-2 py-1 text-[11px] font-black text-text-secondary hover:bg-surface-raised disabled:opacity-40" title="내용은 유지하고 서식만 초기화">
                <Eraser className="size-3.5" />서식 초기화
              </button>
            </div>
            <LexicalEditor
              key={`${documentId}-${revision}`}
              initialState={content}
              onChange={setContent}
              minHeight="440px"
              scrollable
              height="min(52vh, 560px)"
            />
          </section>
        </div>

        <footer className="flex shrink-0 justify-end gap-2 border-t border-surface-border px-5 py-3">
          <button type="button" onClick={onClose} disabled={busy || saving} className="rounded-md px-3 py-2 text-xs font-black text-text-secondary hover:bg-surface-muted disabled:opacity-40">취소</button>
          <button type="button" onClick={() => void save()} disabled={busy || saving} className="rounded-md bg-brand-primary px-4 py-2 text-xs font-black text-text-on-brand disabled:cursor-not-allowed disabled:opacity-40">{saving ? "저장 중..." : "저장"}</button>
        </footer>
      </div>
    </div>
  );
}
