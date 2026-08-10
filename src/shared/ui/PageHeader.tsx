import type { MouseEvent, ReactNode } from "react";
import { RefreshCw } from "lucide-react";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { useContentRefresh } from "../lib/content-refresh";

const isTauri =
  typeof window !== "undefined" && "__TAURI_INTERNALS__" in window;

function isInteractive(target: EventTarget | null) {
  return (
    target instanceof HTMLElement &&
    !!target.closest(
      "button, a, input, textarea, select, [contenteditable='true'], [data-no-drag]",
    )
  );
}

// 모든 페이지 공통 상단 헤더. 빈 영역은 창 드래그/더블클릭 최대화에 사용한다.
function PageHeader({ children }: { children?: ReactNode }) {
  const contentRefresh = useContentRefresh();
  const handleMouseDown = (e: MouseEvent<HTMLElement>) => {
    if (!isTauri || e.button !== 0 || isInteractive(e.target)) return;
    void getCurrentWindow().startDragging();
  };

  const handleDoubleClick = (e: MouseEvent<HTMLElement>) => {
    if (!isTauri || isInteractive(e.target)) return;
    void getCurrentWindow().toggleMaximize();
  };

  return (
    <header
      onMouseDown={handleMouseDown}
      onDoubleClick={handleDoubleClick}
      className="flex h-12 shrink-0 select-none items-center gap-2.5 border-b border-surface-border-soft bg-surface-raised px-4 shadow-sm"
    >
      {children}
      {contentRefresh && (
        <button
          type="button"
          onClick={contentRefresh.refresh}
          disabled={contentRefresh.isRefreshing}
          className="ui-icon-button ml-2 h-7 w-7 shrink-0"
          title="본문 새로고침"
          aria-label="본문 새로고침"
        >
          <RefreshCw className={`size-3.5 ${contentRefresh.isRefreshing ? "animate-spin" : ""}`} />
        </button>
      )}
    </header>
  );
}

export default PageHeader;
