import { Eraser, Sparkles, X } from "lucide-react";
import { useState } from "react";
import { aiEditArchitectureDocument, updateArchitectureDocument } from "../../features/mybatis-playbook/api";
import { LexicalEditor } from "../../shared/ui/lexical/lexical-editor";
import { addLexicalHeadingNumbers, normalizeLexicalJson, preservesLexicalContent, resetLexicalFormatting } from "../../shared/ui/lexical/lexical-state";

type Props = {
  documentId: string;
  title: string;
  initialContent: string;
  onClose: () => void;
  onSaved: () => void;
};

const INSTRUCTION_PRESETS = [
  "제목, 파일(없으면 생략), 코드 이런 단위로 나눠서 정리해줘. 제목은 Heading으로 만들고, 내용이 코드·Java·SQL·YAML·JSON·명령어이면 전체 줄을 하나의 실제 Lexical 코드 블록(CodeNode)으로 처리해서 깔끔하게 정리해줘",
  "제목(번호를 붙여 1. 제목 형식으로 작성하고 조금 큰 글씨와 진한 글씨로 표시), 파일(없으면 생략), 코드 이런 단위로 나눠서 정리해줘. 내용은 코드 블록으로 처리해서 깔끔하게",
] as const;

export default function MybatisDocumentAiEditDialog({
  documentId,
  title,
  initialContent,
  onClose,
  onSaved,
}: Props) {
  const [content, setContent] = useState(initialContent);
  const [activePreset, setActivePreset] = useState(1);
  const [instruction, setInstruction] = useState(INSTRUCTION_PRESETS[1]);
  const [revision, setRevision] = useState(0);
  const [formattingReset, setFormattingReset] = useState(false);
  const [busy, setBusy] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  async function applyAiEdit() {
    if (!instruction.trim() || busy || saving) return;
    setBusy(true);
    setError("");
    setNotice("");
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
      const numberedContent = instruction.includes("번호")
        ? addLexicalHeadingNumbers(normalizedContent) ?? normalizedContent
        : normalizedContent;
      if (!preservesLexicalContent(sourceContent, numberedContent)) {
        const fallbackBase = normalizeLexicalJson(sourceContent) ?? content;
        const fallbackContent = instruction.includes("번호")
          ? addLexicalHeadingNumbers(fallbackBase) ?? fallbackBase
          : fallbackBase;
        setContent(fallbackContent);
        setFormattingReset(false);
        setRevision((current) => current + 1);
        setNotice("AI 결과가 불완전해 원문을 유지하고 요청한 서식만 적용했습니다.");
        return;
      }
      setContent(numberedContent);
      setFormattingReset(false);
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
    setNotice("");
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
    setFormattingReset(true);
    setRevision((current) => current + 1);
    setError("");
    setNotice("");
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
            <div className="mt-3 flex items-center gap-1 border-b border-surface-border-soft">
              {["기본 지시1", "기본 지시2", "기본 지시3"].map((label, index) => {
                const available = index < INSTRUCTION_PRESETS.length;
                return (
                  <button
                    key={label}
                    type="button"
                    disabled={!available || busy || saving}
                    onClick={() => {
                      if (!available) return;
                      setActivePreset(index);
                      setInstruction(INSTRUCTION_PRESETS[index]);
                    }}
                    className={`border-b-2 px-3 py-2 text-xs font-black transition-colors ${
                      activePreset === index && available
                        ? "border-brand-primary text-brand-primary"
                        : "border-transparent text-text-muted hover:text-text-primary"
                    } disabled:cursor-not-allowed disabled:opacity-50`}
                  >
                    {label}{!available ? " (작성 예정)" : ""}
                  </button>
                );
              })}
            </div>
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
            {notice && <p className="mt-2 whitespace-pre-wrap text-xs font-bold text-brand-primary">{notice}</p>}
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
              promoteStructure={!formattingReset}
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
