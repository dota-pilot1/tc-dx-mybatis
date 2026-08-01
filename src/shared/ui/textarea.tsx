import { forwardRef, type TextareaHTMLAttributes } from "react";

import { cn } from "../lib/utils";

export type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement>;

// Input과 같은 보더/포커스 규칙을 쓰는 여러 줄 입력. rows에 맞춰 높이가 늘어난다.
export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, rows = 3, ...props }, ref) => {
    return (
      <textarea
        ref={ref}
        rows={rows}
        className={cn(
          "block w-full resize-y rounded-md border border-surface-border-soft bg-surface-muted px-3 py-2 text-sm leading-6 text-text-primary",
          "placeholder:text-text-muted shadow-sm transition-colors",
          "focus-visible:outline-none focus-visible:bg-surface-raised focus-visible:border-brand-border focus-visible:ring-2 focus-visible:ring-brand-border/40",
          "disabled:cursor-not-allowed disabled:opacity-50",
          className,
        )}
        {...props}
      />
    );
  },
);
Textarea.displayName = "Textarea";
