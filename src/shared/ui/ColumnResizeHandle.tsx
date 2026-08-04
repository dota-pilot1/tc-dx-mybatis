import type { MouseEvent } from "react";

// 컬럼(1·2차 주제) 사이에 놓는 드래그 리사이즈 손잡이.
// onMouseDown 은 useColumnResize 훅이 돌려주는 핸들러를 그대로 넘긴다.
export function ColumnResizeHandle({
  onMouseDown,
  title = "너비 조절",
}: {
  onMouseDown: (e: MouseEvent) => void;
  title?: string;
}) {
  return (
    <div
      role="separator"
      aria-orientation="vertical"
      title={title}
      onMouseDown={onMouseDown}
      className="group relative z-10 block w-3 shrink-0 cursor-col-resize select-none"
    >
      <span className="absolute inset-y-0 left-1/2 w-0.5 -translate-x-1/2 bg-surface-border-soft transition-colors group-hover:bg-brand-primary" />
    </div>
  );
}

export default ColumnResizeHandle;
