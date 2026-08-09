import { useEffect, type ReactNode } from "react";
import { AlertTriangle, CircleHelp, Save, Trash2, X } from "lucide-react";
import { cn } from "../lib/utils";

// 위젯마다 복사돼 있던 DialogFrame / Actions / DangerNotice 공통본.
// 톤 색상은 헤더에서 한 번만 쓰고, 본문은 색을 얹지 않는다.

export type DialogSize = "sm" | "md" | "wide";
export type DialogTone = "default" | "danger";

const sizeClass: Record<DialogSize, string> = {
  sm: "max-w-lg",
  md: "max-w-3xl",
  wide: "max-w-6xl",
};

export function DialogFrame({
  title,
  eyebrow,
  onClose,
  size = "md",
  tone = "default",
  contentClassName,
  children,
}: {
  title: string;
  eyebrow?: string;
  onClose: () => void;
  size?: DialogSize;
  tone?: DialogTone;
  contentClassName?: string;
  children: ReactNode;
}) {
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key !== "Escape") return;
      event.preventDefault();
      onClose();
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  const danger = tone === "danger";
  const caption = eyebrow ?? (danger ? "확인 필요" : undefined);

  return (
    <div className="fixed inset-0 z-40 grid place-items-center bg-[color-mix(in_srgb,var(--foreground)_24%,transparent)] p-4 backdrop-blur-[3px]">
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={cn(
          "flex max-h-[calc(100vh-2rem)] w-full flex-col overflow-hidden rounded-2xl border border-surface-border bg-surface-raised shadow-2xl",
          sizeClass[size],
        )}
      >
        <div
          className={cn(
            "flex items-center justify-between gap-4 border-b px-5 py-3.5",
            danger
              ? "border-destructive/20 bg-danger-glass"
              : "border-surface-border-soft bg-surface-muted",
          )}
        >
          <div className="flex min-w-0 items-center gap-2.5">
            <div
              className={cn(
                "grid size-8 shrink-0 place-items-center rounded-lg border bg-surface-raised",
                danger
                  ? "border-destructive/25 text-destructive"
                  : "border-surface-border-soft text-brand-primary",
              )}
            >
              {danger ? (
                <AlertTriangle className="size-4" />
              ) : (
                <CircleHelp className="size-4" />
              )}
            </div>
            <div className="min-w-0">
              {caption && (
                <p
                  className={cn(
                    "text-[10px] font-bold uppercase tracking-[0.12em]",
                    danger ? "text-destructive" : "text-text-muted",
                  )}
                >
                  {caption}
                </p>
              )}
              <h2 className="truncate text-[15px] font-black text-text-primary">
                {title}
              </h2>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="ui-icon-button h-8 w-8 shrink-0 rounded-lg"
            aria-label="다이얼로그 닫기"
          >
            <X className="size-4" />
          </button>
        </div>
        <div className={cn("min-h-0 px-5 pb-5 pt-4", contentClassName)}>
          {children}
        </div>
      </div>
    </div>
  );
}

export function DialogActions({
  busy,
  deleting,
  onClose,
  onSave,
}: {
  busy: boolean;
  deleting: boolean;
  onClose: () => void;
  onSave: () => void;
}) {
  return (
    <div className="mt-5 flex justify-end gap-2 border-t border-surface-border-soft pt-4">
      <button
        type="button"
        onClick={onClose}
        className="inline-flex h-9 items-center justify-center rounded-lg border border-surface-border px-3.5 text-xs font-bold text-text-secondary transition-colors hover:bg-surface-muted hover:text-text-primary"
      >
        취소
      </button>
      <button
        type="button"
        onClick={onSave}
        disabled={busy}
        className={cn(
          "inline-flex h-9 items-center gap-1.5 rounded-lg px-3.5 text-xs font-bold text-text-on-brand transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50",
          deleting ? "bg-destructive" : "bg-brand-primary",
        )}
      >
        {deleting ? (
          <Trash2 className="size-3.5" />
        ) : (
          <Save className="size-3.5" />
        )}
        {deleting ? "삭제" : "저장"}
      </button>
    </div>
  );
}

export function DangerNotice({
  message,
  description = "삭제한 내용은 복구할 수 없습니다.",
}: {
  message: string;
  description?: string;
}) {
  return (
    <div className="space-y-1">
      <p className="text-sm font-bold text-text-primary">{message}</p>
      <p className="text-xs font-semibold leading-5 text-text-muted">
        {description}
      </p>
    </div>
  );
}
