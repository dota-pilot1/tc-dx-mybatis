import { ArrowDown, ArrowUp } from "lucide-react";

type OrderControlsProps = {
  itemLabel: string;
  busy?: boolean;
  upDisabled?: boolean;
  downDisabled?: boolean;
  onMoveUp: () => void;
  onMoveDown: () => void;
};

/** 문서 목록에서 순서 조작을 다른 행 액션과 분리해 보여주는 공통 컨트롤. */
export default function OrderControls({
  itemLabel,
  busy = false,
  upDisabled = false,
  downDisabled = false,
  onMoveUp,
  onMoveDown,
}: OrderControlsProps) {
  return (
    <div
      className="flex shrink-0 items-center gap-1 rounded-md border border-surface-border-soft bg-surface-raised p-0.5"
      aria-label={`${itemLabel} 순서 변경`}
    >
      <span className="px-1.5 text-[10px] font-black text-text-muted">순서</span>
      <div className="flex items-center gap-1 border-l border-surface-border-soft pl-1">
        <button
          type="button"
          disabled={busy || upDisabled}
          onClick={onMoveUp}
          className="grid size-7 place-items-center rounded-sm text-text-secondary transition-colors hover:bg-brand-glass hover:text-brand-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-border/40 disabled:pointer-events-none disabled:opacity-30"
          title="위로 이동"
          aria-label={`${itemLabel} 위로 이동`}
        >
          <ArrowUp className="size-3.5" />
        </button>
        <button
          type="button"
          disabled={busy || downDisabled}
          onClick={onMoveDown}
          className="grid size-7 place-items-center rounded-sm text-text-secondary transition-colors hover:bg-brand-glass hover:text-brand-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-border/40 disabled:pointer-events-none disabled:opacity-30"
          title="아래로 이동"
          aria-label={`${itemLabel} 아래로 이동`}
        >
          <ArrowDown className="size-3.5" />
        </button>
      </div>
    </div>
  );
}
