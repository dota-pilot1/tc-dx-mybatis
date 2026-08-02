import {
  ArrowRight,
  Check,
  CheckCircle2,
  ClipboardCheck,
  Command,
  FlaskConical,
  Gauge,
  Play,
  Search,
  ShieldCheck,
  Terminal,
  Wrench,
  X,
} from "lucide-react";
import { useMemo, useState } from "react";
import PageHeader from "../../shared/ui/PageHeader";
import { TESTING_GROUPS, TESTING_TRACKS, type TestingStep, type TestingTrack } from "./testing-content";

const TRACK_ICONS = {
  "01 테스트 방법": Gauge,
  "02 쓸 도구": Wrench,
  "03 꼭 검사할 10가지": ShieldCheck,
  "04 바로 실행할 시나리오": Play,
} as const;

function TestingModule() {
  const [activeId, setActiveId] = useState(TESTING_TRACKS.find((track) => track.group === "04 바로 실행할 시나리오")?.id ?? TESTING_TRACKS[0].id);
  const [query, setQuery] = useState("");
  const [completed, setCompleted] = useState<Record<string, boolean>>({});

  const activeTrack = TESTING_TRACKS.find((track) => track.id === activeId) ?? TESTING_TRACKS[0];
  const filteredGroups = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return TESTING_GROUPS;
    return TESTING_GROUPS.map((group) => ({
      ...group,
      tracks: group.tracks.filter((track) =>
        [track.title, track.summary, track.signal, ...track.tags].join(" ").toLowerCase().includes(needle),
      ),
    })).filter((group) => group.tracks.length > 0);
  }, [query]);

  const completedSteps = activeTrack.steps.filter((step) => completed[stepKey(activeTrack, step)]).length;
  const totalCompleted = Object.values(completed).filter(Boolean).length;
  const totalSteps = TESTING_TRACKS.reduce((sum, track) => sum + track.steps.length, 0);

  function toggleStep(step: TestingStep) {
    const key = stepKey(activeTrack, step);
    setCompleted((current) => ({ ...current, [key]: !current[key] }));
  }

  function openNextTrack() {
    const next = TESTING_TRACKS[(TESTING_TRACKS.findIndex((track) => track.id === activeTrack.id) + 1) % TESTING_TRACKS.length];
    setActiveId(next.id);
  }

  return (
    <div className="flex min-w-0 flex-1 flex-col">
      <PageHeader>
        <FlaskConical className="size-4 text-brand-primary" />
        <span className="text-[14px] font-bold tracking-tight text-text-primary">Testing</span>
        <span className="ml-1 text-[12px] font-semibold text-text-muted">따라 하며 검사하기</span>
      </PageHeader>

      <div className="min-h-0 flex-1 overflow-y-auto bg-surface-muted p-5">
        <main className="mx-auto flex w-full max-w-[1480px] flex-col gap-4">
          <section className="overflow-hidden rounded-xl bg-[linear-gradient(115deg,var(--primary)_0%,color-mix(in_srgb,var(--primary)_70%,var(--foreground))_100%)] px-5 py-4 shadow-sm lg:px-6">
            <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
              <div className="max-w-3xl">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-text-on-brand/15 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-[0.14em] text-text-on-brand">
                    <Play className="size-2.5 fill-current" /> Practice lab
                  </span>
                  <h1 className="text-[19px] font-black leading-tight tracking-tight text-text-on-brand lg:text-[21px]">
                    읽었으면 바로 실행합니다.
                  </h1>
                </div>
                <p className="mt-1.5 max-w-2xl text-[12px] font-semibold leading-5 text-text-on-brand/85">
                  어려운 이론은 잠시 내려놓고, 물건 하나를 주문해 보면서 어디가 제대로 동작하는지 확인합니다.
                </p>
              </div>
              <div className="grid shrink-0 grid-cols-3 gap-2">
                <Metric label="실습 시나리오" value={`${TESTING_TRACKS.length}개`} />
                <Metric label="완료 단계" value={`${totalCompleted}/${totalSteps}`} />
                <Metric label="현재 시나리오" value={`${completedSteps}/${activeTrack.steps.length}`} />
              </div>
            </div>
          </section>

          <div className="grid min-h-[650px] gap-4 xl:grid-cols-[260px_minmax(0,1fr)_235px]">
            <aside className="flex min-h-0 flex-col rounded-md border border-surface-border bg-surface-raised shadow-sm">
              <div className="border-b border-surface-border p-3">
                <div className="relative">
                  <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-text-muted" />
                  <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="시나리오 검색" className="ui-input h-9 w-full !pl-8 !pr-8 text-[13px] font-semibold" />
                  {query && <button type="button" onClick={() => setQuery("")} className="absolute right-2 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary" aria-label="검색어 지우기"><X className="size-3.5" /></button>}
                </div>
              </div>
              <nav className="min-h-0 flex-1 overflow-y-auto p-2">
                {filteredGroups.length === 0 && <p className="px-2 py-6 text-center text-[12px] font-semibold text-text-muted">검색 결과가 없습니다.</p>}
                {filteredGroups.map((group) => {
                  const Icon = TRACK_ICONS[group.id as keyof typeof TRACK_ICONS] ?? Wrench;
                  return (
                    <div key={group.id} className="mb-3">
                      <div className="flex items-center gap-1.5 px-2 py-1.5">
                        <Icon className="size-3.5 text-brand-primary" />
                        <span className="text-[11px] font-black uppercase tracking-[0.1em] text-text-secondary">{group.label}</span>
                        <span className="ml-auto text-[11px] font-black tabular-nums text-text-muted">{group.tracks.length}</span>
                      </div>
                      <ul className="space-y-0.5">
                        {group.tracks.map((track) => {
                          const active = track.id === activeTrack.id;
                          const progress = track.steps.filter((step) => completed[stepKey(track, step)]).length;
                          return <li key={track.id}>
                            <button type="button" onClick={() => setActiveId(track.id)} className={`group w-full rounded-md border-l-2 px-2.5 py-2 text-left transition ${active ? "border-brand-primary bg-brand-glass" : "border-transparent hover:bg-surface-muted"}`}>
                              <span className={`block truncate text-[13px] font-black ${active ? "text-text-primary" : "text-text-secondary group-hover:text-text-primary"}`}>{track.title}</span>
                              <span className="mt-1 flex items-center gap-1.5 text-[10px] font-bold text-text-muted"><span className="h-1 flex-1 overflow-hidden rounded-full bg-surface-border-soft"><span className="block h-full rounded-full bg-brand-primary" style={{ width: `${(progress / track.steps.length) * 100}%` }} /></span>{progress}/{track.steps.length}</span>
                            </button>
                          </li>;
                        })}
                      </ul>
                    </div>
                  );
                })}
              </nav>
            </aside>

            <section className="flex min-h-0 flex-col rounded-md border border-surface-border bg-surface-raised shadow-sm">
              <div className="border-b border-surface-border px-6 py-5 lg:px-8">
                <div className="flex flex-wrap items-center gap-1.5">
                  {activeTrack.tags.map((tag) => <span key={tag} className="rounded-full bg-brand-glass px-2.5 py-0.5 text-[11px] font-black text-brand-primary">{tag}</span>)}
                  <span className="ml-auto inline-flex items-center gap-1.5 rounded-full bg-surface-muted px-2.5 py-1 text-[11px] font-black text-text-muted"><Gauge className="size-3.5" /> {activeTrack.signal}</span>
                </div>
                <h2 className="mt-3 text-[25px] font-black leading-tight tracking-tight text-text-primary">{activeTrack.title}</h2>
                <p className="mt-2 max-w-3xl text-[14px] font-semibold leading-7 text-text-secondary">{activeTrack.summary}</p>
              </div>

              <div className="min-h-0 flex-1 overflow-y-auto px-6 py-6 lg:px-8">
                <div className="flex items-center justify-between gap-3">
                  <div><p className="text-[11px] font-black uppercase tracking-[0.12em] text-brand-primary">지금 할 일</p><h3 className="mt-1 text-[17px] font-black text-text-primary">이 순서대로 하나씩 해보세요</h3></div>
                  <span className="text-[12px] font-black tabular-nums text-text-muted">{completedSteps} / {activeTrack.steps.length} 완료</span>
                </div>
                <div className="mt-5 space-y-3">
                  {activeTrack.steps.map((step, index) => <StepCard key={step.id} step={step} index={index} done={!!completed[stepKey(activeTrack, step)]} onToggle={() => toggleStep(step)} />)}
                </div>

                <div className="mt-7 rounded-md border border-brand-border bg-brand-glass p-4">
                  <div className="flex items-center gap-2"><CheckCircle2 className="size-4 text-brand-primary" /><h3 className="text-[14px] font-black text-text-primary">끝났는지 확인</h3></div>
                  <ul className="mt-3 grid gap-2 sm:grid-cols-3">
                    {activeTrack.doneWhen.map((item) => <li key={item} className="flex items-start gap-2 text-[12px] font-bold leading-5 text-text-secondary"><Check className="mt-0.5 size-3.5 shrink-0 text-brand-primary" />{item}</li>)}
                  </ul>
                </div>

                <button type="button" onClick={openNextTrack} className="mt-6 inline-flex items-center gap-2 rounded-md border border-surface-border bg-surface-raised px-3.5 py-2 text-[12px] font-black text-text-secondary transition hover:border-brand-border hover:text-brand-primary">다음 시나리오 열기 <ArrowRight className="size-3.5" /></button>
              </div>
            </section>

            <aside className="hidden min-h-0 flex-col rounded-md border border-surface-border bg-surface-raised p-4 shadow-sm xl:flex">
              <div className="flex items-center gap-2"><Terminal className="size-4 text-brand-primary" /><h3 className="text-sm font-black text-text-primary">오늘 한 일</h3></div>
              <p className="mt-1.5 text-[11px] font-semibold leading-5 text-text-muted">시나리오를 누르면 바로 시작합니다.</p>
              <div className="mt-4 space-y-2.5">
                {TESTING_TRACKS.map((track, index) => {
                  const done = track.steps.filter((step) => completed[stepKey(track, step)]).length;
                  return <button key={track.id} type="button" onClick={() => setActiveId(track.id)} className="flex w-full items-center gap-2.5 rounded-md border border-surface-border-soft bg-surface-muted px-2.5 py-2 text-left hover:border-brand-border"><span className="grid size-5 shrink-0 place-items-center rounded-full bg-brand-glass text-[10px] font-black text-brand-primary">{done === track.steps.length ? <Check className="size-3" /> : index + 1}</span><span className="min-w-0 flex-1 truncate text-[11px] font-bold text-text-secondary">{track.title}</span><span className="text-[10px] font-black text-text-muted">{done}/{track.steps.length}</span></button>;
                })}
              </div>
            </aside>
          </div>
        </main>
      </div>
    </div>
  );
}

function StepCard({ step, index, done, onToggle }: { step: TestingStep; index: number; done: boolean; onToggle: () => void }) {
  return <div className={`rounded-md border p-4 transition ${done ? "border-brand-border bg-brand-glass" : "border-surface-border-soft bg-surface-raised hover:border-brand-border"}`}>
    <div className="flex items-start gap-3">
      <button type="button" onClick={onToggle} className={`mt-0.5 grid size-6 shrink-0 place-items-center rounded-full border text-[11px] font-black transition ${done ? "border-brand-primary bg-brand-primary text-text-on-brand" : "border-surface-border bg-surface-muted text-text-muted hover:border-brand-primary hover:text-brand-primary"}`} aria-label={`${step.title} ${done ? "완료 취소" : "완료"}`}>{done ? <Check className="size-3.5" /> : index + 1}</button>
      <div className="min-w-0 flex-1"><div className="flex flex-wrap items-center justify-between gap-2"><h4 className={`text-[14px] font-black ${done ? "text-brand-primary" : "text-text-primary"}`}>{step.title}</h4><span className="inline-flex items-center gap-1 rounded-full bg-surface-muted px-2 py-0.5 text-[10px] font-black text-text-muted"><ClipboardCheck className="size-3" />남길 것: {step.artifact}</span></div><p className="mt-1.5 text-[12.5px] font-semibold leading-6 text-text-secondary">{step.description}</p>{step.command && <div className="mt-3 flex items-center gap-2 rounded-md border border-surface-border-soft bg-surface-muted px-3 py-2"><Command className="size-3.5 shrink-0 text-brand-primary" /><span className="text-[10px] font-black text-text-muted">실행 명령</span><code className="min-w-0 truncate text-[11px] font-bold text-text-primary">{step.command}</code></div>}</div>
    </div>
  </div>;
}

function Metric({ label, value }: { label: string; value: string }) { return <div className="rounded-md border border-text-on-brand/20 bg-text-on-brand/10 px-2.5 py-1.5"><p className="text-[10px] font-bold text-text-on-brand/70">{label}</p><p className="text-[15px] font-black leading-tight text-text-on-brand">{value}</p></div>; }
function stepKey(track: TestingTrack, step: TestingStep) { return `${track.id}:${step.id}`; }

export default TestingModule;
