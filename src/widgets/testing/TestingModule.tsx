import {
  Check,
  ChevronDown,
  ChevronRight,
  ListChecks,
  Search,
  TestTube2,
  X,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import PageHeader from "../../shared/ui/PageHeader";
import {
  ALL_TESTING_DOCS,
  TESTING_GROUPS,
  type DocBlock,
  type TestingDoc,
} from "./testing-content";

/** 체크리스트도 목차 항목으로 다루기 위한 가상 섹션 id */
const CHECKLIST_SECTION_ID = "__checklist";

function matchesQuery(doc: TestingDoc, query: string) {
  const needle = query.trim().toLowerCase();
  if (!needle) return true;
  const haystack = [
    doc.title,
    doc.summary,
    ...doc.tags,
    ...doc.sections.map((section) => section.heading),
  ]
    .join(" ")
    .toLowerCase();
  return haystack.includes(needle);
}

function TestingModule() {
  const [activeDocId, setActiveDocId] = useState(ALL_TESTING_DOCS[0].id);
  const [query, setQuery] = useState("");
  const [collapsedGroups, setCollapsedGroups] = useState<string[]>([]);
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const [activeSectionId, setActiveSectionId] = useState<string | null>(null);

  const bodyRef = useRef<HTMLDivElement>(null);

  const activeDoc = useMemo(
    () =>
      ALL_TESTING_DOCS.find((doc) => doc.id === activeDocId) ??
      ALL_TESTING_DOCS[0],
    [activeDocId],
  );

  // 목차는 본문 섹션 + 하단 체크리스트를 하나의 목록으로 다룬다.
  const tocItems = useMemo(
    () => [
      ...activeDoc.sections.map((section) => ({
        id: section.id,
        label: section.heading,
      })),
      { id: CHECKLIST_SECTION_ID, label: "적용 체크리스트" },
    ],
    [activeDoc],
  );

  const filteredGroups = useMemo(
    () =>
      TESTING_GROUPS.map((group) => ({
        ...group,
        docs: group.docs.filter((doc) => matchesQuery(doc, query)),
      })).filter((group) => group.docs.length > 0),
    [query],
  );

  // 문서를 바꾸면 본문 스크롤과 목차 하이라이트를 처음으로 되돌린다.
  useEffect(() => {
    bodyRef.current?.scrollTo({ top: 0 });
    setActiveSectionId(activeDoc.sections[0]?.id ?? null);
  }, [activeDoc.id]);

  // 본문 스크롤 위치로 우측 목차의 현재 위치를 갱신한다.
  // 스크롤이 걸린 뒤 rect를 읽으면 한 프레임 뒤처지므로, 섹션 위치를 미리 재 두고
  // 항상 최신인 scrollTop과 비교한다.
  useEffect(() => {
    const container = bodyRef.current;
    if (!container) return;

    let offsets: { id: string; top: number }[] = [];

    function measure() {
      if (!container) return;
      const base = container.getBoundingClientRect().top - container.scrollTop;
      offsets = tocItems.flatMap((item) => {
        const el = container.querySelector<HTMLElement>(
          `[data-section-id="${item.id}"]`,
        );
        return el
          ? [{ id: item.id, top: el.getBoundingClientRect().top - base }]
          : [];
      });
    }

    function handleScroll() {
      if (!container) return;
      const line = container.scrollTop + 96;
      let current = offsets[0]?.id ?? null;
      for (const offset of offsets) {
        if (offset.top <= line) current = offset.id;
      }
      setActiveSectionId(current);
    }

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(container);
    container.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      observer.disconnect();
      container.removeEventListener("scroll", handleScroll);
    };
  }, [tocItems]);

  function toggleGroup(groupId: string) {
    setCollapsedGroups((prev) =>
      prev.includes(groupId)
        ? prev.filter((id) => id !== groupId)
        : [...prev, groupId],
    );
  }

  function scrollToSection(sectionId: string) {
    const el = bodyRef.current?.querySelector<HTMLElement>(
      `[data-section-id="${sectionId}"]`,
    );
    el?.scrollIntoView({ behavior: "smooth", block: "start" });
    setActiveSectionId(sectionId);
  }

  const checkedCount = activeDoc.checklist.filter(
    (_, index) => checked[`${activeDoc.id}:${index}`],
  ).length;

  return (
    <div className="flex min-w-0 flex-1 flex-col">
      <PageHeader>
        <TestTube2 className="size-4 text-brand-primary" />
        <span className="text-[14px] font-bold tracking-tight text-text-primary">
          Testing
        </span>
        <span className="ml-1 text-[12px] font-semibold text-text-muted">
          테스팅 방법과 이론
        </span>
      </PageHeader>

      <div className="min-h-0 flex-1 bg-surface-muted p-5">
        <main className="grid h-full min-h-0 gap-4 lg:grid-cols-[260px_minmax(0,1fr)] xl:grid-cols-[260px_minmax(0,1fr)_200px]">
          {/* 좌측: 카테고리 트리 */}
          <aside className="flex min-h-0 flex-col rounded-md border border-surface-border bg-surface-raised shadow-sm">
            <div className="border-b border-surface-border p-3">
              <div className="relative">
                <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-text-muted" />
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="문서 검색"
                  // ui-input의 px-3을 아이콘 자리만큼 덮어쓴다.
                  className="ui-input h-9 w-full !pl-8 !pr-8 text-[13px] font-semibold"
                />
                {query && (
                  <button
                    type="button"
                    onClick={() => setQuery("")}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-text-muted transition hover:text-text-primary"
                    aria-label="검색어 지우기"
                  >
                    <X className="size-3.5" />
                  </button>
                )}
              </div>
            </div>

            <nav className="min-h-0 flex-1 overflow-y-auto p-2">
              {filteredGroups.length === 0 && (
                <p className="px-2 py-6 text-center text-[12px] font-semibold text-text-muted">
                  검색 결과가 없습니다.
                </p>
              )}

              {filteredGroups.map((group) => {
                const collapsed = collapsedGroups.includes(group.id);
                return (
                  <div key={group.id} className="mb-1">
                    <button
                      type="button"
                      onClick={() => toggleGroup(group.id)}
                      className="flex w-full items-center gap-1.5 rounded-md px-2 py-1.5 text-left transition hover:bg-surface-muted"
                    >
                      {collapsed ? (
                        <ChevronRight className="size-3.5 text-text-muted" />
                      ) : (
                        <ChevronDown className="size-3.5 text-text-muted" />
                      )}
                      <span className="text-[11px] font-black uppercase tracking-[0.1em] text-text-secondary">
                        {group.label}
                      </span>
                      <span className="ml-auto text-[11px] font-black tabular-nums text-text-muted">
                        {group.docs.length}
                      </span>
                    </button>

                    {!collapsed && (
                      <ul className="mt-0.5 space-y-0.5 pl-3">
                        {group.docs.map((doc) => {
                          const active = doc.id === activeDoc.id;
                          return (
                            <li key={doc.id}>
                              <button
                                type="button"
                                onClick={() => setActiveDocId(doc.id)}
                                className={
                                  "w-full truncate rounded-md border-l-2 px-2.5 py-1.5 text-left text-[13px] font-bold transition " +
                                  (active
                                    ? "border-brand-primary bg-brand-glass text-text-primary"
                                    : "border-transparent text-text-secondary hover:bg-surface-muted hover:text-text-primary")
                                }
                              >
                                {doc.title}
                              </button>
                            </li>
                          );
                        })}
                      </ul>
                    )}
                  </div>
                );
              })}
            </nav>
          </aside>

          {/* 중앙: 본문 */}
          <section className="flex min-h-0 flex-col rounded-md border border-surface-border bg-surface-raised shadow-sm">
            <div ref={bodyRef} className="min-h-0 flex-1 overflow-y-auto">
              <article className="mx-auto w-full max-w-3xl px-8 py-8">
                <div className="flex flex-wrap items-center gap-1.5">
                  {activeDoc.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full bg-brand-glass px-2.5 py-0.5 text-[11px] font-black text-brand-primary"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                <h1 className="mt-3 text-[26px] font-black leading-tight tracking-tight text-text-primary">
                  {activeDoc.title}
                </h1>
                <p className="mt-2.5 text-[14px] font-semibold leading-7 text-text-secondary">
                  {activeDoc.summary}
                </p>

                <div className="mt-7 space-y-8">
                  {activeDoc.sections.map((section) => (
                    <section
                      key={section.id}
                      data-section-id={section.id}
                      className="scroll-mt-6"
                    >
                      <h2 className="border-b border-surface-border-soft pb-2 text-[17px] font-black text-text-primary">
                        {section.heading}
                      </h2>
                      <div className="mt-3.5 space-y-3.5">
                        {section.blocks.map((block, index) => (
                          <DocBlockView key={index} block={block} />
                        ))}
                      </div>
                    </section>
                  ))}
                </div>

                {/* 이론 문서 하단에 붙는 실행 체크리스트 */}
                <section
                  data-section-id={CHECKLIST_SECTION_ID}
                  className="mt-10 scroll-mt-6 rounded-md border border-surface-border bg-surface-muted p-5"
                >
                  <div className="flex items-center gap-2">
                    <ListChecks className="size-4 text-brand-primary" />
                    <h2 className="text-[15px] font-black text-text-primary">
                      적용 체크리스트
                    </h2>
                    <span className="ml-auto text-[12px] font-black tabular-nums text-text-muted">
                      {checkedCount} / {activeDoc.checklist.length}
                    </span>
                  </div>

                  <ul className="mt-3.5 space-y-1.5">
                    {activeDoc.checklist.map((item, index) => {
                      const key = `${activeDoc.id}:${index}`;
                      const done = !!checked[key];
                      return (
                        <li key={key}>
                          <button
                            type="button"
                            onClick={() =>
                              setChecked((prev) => ({
                                ...prev,
                                [key]: !prev[key],
                              }))
                            }
                            className="flex w-full items-start gap-2.5 rounded-md border border-surface-border-soft bg-surface-raised px-3 py-2.5 text-left transition hover:border-brand-border"
                          >
                            <span
                              className={
                                "mt-0.5 grid size-4 shrink-0 place-items-center rounded border transition " +
                                (done
                                  ? "border-brand-primary bg-brand-primary"
                                  : "border-surface-border bg-surface-muted")
                              }
                            >
                              {done && (
                                <Check className="size-3 text-text-on-brand" />
                              )}
                            </span>
                            <span
                              className={
                                "text-[13px] font-semibold leading-5 transition " +
                                (done
                                  ? "text-text-muted line-through"
                                  : "text-text-secondary")
                              }
                            >
                              {item}
                            </span>
                          </button>
                        </li>
                      );
                    })}
                  </ul>

                  <p className="mt-3 text-[11px] font-semibold text-text-muted">
                    체크 상태는 아직 저장되지 않습니다. 서버 연동 시 문서별로 보관됩니다.
                  </p>
                </section>
              </article>
            </div>
          </section>

          {/* 우측: 문서 내 목차 */}
          <aside className="hidden min-h-0 flex-col rounded-md border border-surface-border bg-surface-raised shadow-sm xl:flex">
            <div className="border-b border-surface-border px-4 py-3">
              <span className="text-[11px] font-black uppercase tracking-[0.1em] text-text-secondary">
                이 문서
              </span>
            </div>
            <nav className="min-h-0 flex-1 overflow-y-auto p-2">
              <ul className="space-y-0.5">
                {tocItems.map((item) => {
                  const active = item.id === activeSectionId;
                  const isChecklist = item.id === CHECKLIST_SECTION_ID;
                  return (
                    <li key={item.id} className={isChecklist ? "pt-1" : ""}>
                      <button
                        type="button"
                        onClick={() => scrollToSection(item.id)}
                        className={
                          "w-full rounded-md border-l-2 px-2.5 py-1.5 text-left text-[12px] font-bold leading-5 transition " +
                          (active
                            ? "border-brand-primary bg-brand-glass text-brand-primary"
                            : "border-transparent text-text-muted hover:text-text-primary")
                        }
                      >
                        {item.label}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </nav>
          </aside>
        </main>
      </div>
    </div>
  );
}

function DocBlockView({ block }: { block: DocBlock }) {
  if (block.kind === "text") {
    return (
      <p className="text-[14px] font-semibold leading-7 text-text-secondary">
        {block.text}
      </p>
    );
  }

  if (block.kind === "bullets") {
    return (
      <ul className="space-y-1.5">
        {block.items.map((item) => (
          <li key={item} className="flex gap-2.5">
            <span className="mt-[9px] size-1.5 shrink-0 rounded-full bg-brand-primary" />
            <span className="text-[14px] font-semibold leading-7 text-text-secondary">
              {item}
            </span>
          </li>
        ))}
      </ul>
    );
  }

  if (block.kind === "callout") {
    return (
      <div className="rounded-md border-l-[3px] border-brand-primary bg-brand-glass px-4 py-3">
        <p className="text-[13.5px] font-bold leading-6 text-text-primary">
          {block.text}
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-md border border-surface-border bg-surface-muted">
      <div className="border-b border-surface-border-soft px-3 py-1.5">
        <span className="text-[10px] font-black uppercase tracking-[0.12em] text-text-muted">
          {block.lang}
        </span>
      </div>
      <pre className="overflow-x-auto px-4 py-3">
        <code className="font-mono text-[12.5px] leading-6 text-text-secondary">
          {block.text}
        </code>
      </pre>
    </div>
  );
}

export default TestingModule;
