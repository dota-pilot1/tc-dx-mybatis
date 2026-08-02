import { ArrowRight, type LucideIcon } from "lucide-react";
import type { User } from "../../entities/user";
import PageHeader from "../../shared/ui/PageHeader";
import assemblyIllustration from "../../assets/towercrane-prototype-assembly.png";

export type HomeModule = {
  id: string;
  label: string;
  icon: LucideIcon;
  ready: boolean;
};

type Props = {
  user: User;
  modules: HomeModule[];
  onOpen: (id: string) => void;
};

// 앱 표지 겸 모듈 허브. 로고(레일 맨 위) 클릭 시 진입한다.
function HomePage({ user, modules, onOpen }: Props) {
  return (
    <div className="flex min-w-0 flex-1 flex-col">
      <PageHeader>
        <span className="flex h-[26px] w-[26px] items-center justify-center rounded-lg border border-brand-border bg-brand-glass text-[14px] text-brand-primary">
          🏗️
        </span>
        <span className="text-[14px] font-bold tracking-tight text-text-primary">
          Towercrane Project
        </span>
      </PageHeader>

      <div className="min-h-0 flex-1 overflow-y-auto bg-surface-muted">
        <main className="mx-auto flex w-full max-w-7xl flex-col gap-4 px-4 py-4">
          {/* 바탕은 일러스트 자체의 종이색. 그 위에 왼쪽 그린을 덮고 오른쪽으로 투명하게
              빼서, 일러스트 배경과 패널 색이 같은 톤으로 이어지게 한다. */}
          <section className="relative overflow-hidden rounded-xl bg-[oklch(0.972_0.008_95)] shadow-sm">
            {/* 일러스트가 보이는 lg 이상에서만 오른쪽으로 투명해진다.
                그 아래에서는 일러스트가 숨으므로 그린을 끝까지 채운다. */}
            <div className="absolute inset-0 bg-[linear-gradient(98deg,color-mix(in_srgb,var(--primary)_88%,white)_0%,var(--primary)_100%)] lg:bg-[linear-gradient(98deg,color-mix(in_srgb,var(--primary)_90%,white)_0%,var(--primary)_34%,color-mix(in_srgb,var(--primary)_60%,transparent)_60%,transparent_82%)]" />
            <div className="relative grid max-h-[300px] items-center gap-2 lg:grid-cols-[minmax(0,1fr)_520px] xl:grid-cols-[minmax(0,1fr)_620px]">
              <div className="p-5 lg:p-6">
                <span className="inline-flex rounded-full bg-text-on-brand/18 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.14em] text-text-on-brand">
                  Towercrane Project
                </span>
                <h1 className="mt-2 text-[25px] font-black leading-tight tracking-tight text-text-on-brand lg:text-[28px]">
                  프로토타입 기반의
                  <br />
                  개발 시스템
                </h1>
                <p className="mt-2 max-w-2xl text-[13px] font-semibold leading-5 text-text-on-brand/85">
                  건축처럼 구조를 설계하고, 검증된 프로토타입을 조립합니다.
                </p>
                <p className="mt-3 text-[12px] font-bold text-text-on-brand/70">
                  {user.name}님, 환영합니다.
                </p>
              </div>
              {/* 왼쪽 가장자리를 마스크로 흐려 텍스트 영역의 그린과 자연스럽게 이어지게 한다. */}
              <div className="hidden self-stretch lg:block">
                <img
                  src={assemblyIllustration}
                  alt="타워 크레인이 커머스 프로토타입 모듈을 조립하는 모습"
                  className="h-full min-h-[220px] w-full object-cover object-center [-webkit-mask-image:linear-gradient(to_right,transparent_0%,rgba(0,0,0,0.55)_14%,#000_38%)] [mask-image:linear-gradient(to_right,transparent_0%,rgba(0,0,0,0.55)_14%,#000_38%)]"
                />
              </div>
            </div>
          </section>

          <section className="rounded-xl border border-brand-border bg-brand-glass px-5 py-4">
            <p className="text-[11px] font-black uppercase tracking-[0.12em] text-brand-primary">
              Towercrane method
            </p>
            <h2 className="mt-1.5 text-[16px] font-black tracking-tight text-text-primary">
              개발자는 타워 크레인 조종사처럼 일합니다.
            </h2>
            <p className="mt-1.5 text-[13px] font-semibold leading-6 text-text-secondary">
              검증된 프로토타입 모듈을 골라 큰 시스템으로 조립하고, 전체 구조를 보며 필요한
              블록을 정확한 위치에 올립니다. 이 앱은 그 조립과 검사를 위한 작업대입니다.
            </p>
          </section>

          <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {modules.map((module) => (
              <ModuleCard
                key={module.id}
                icon={module.icon}
                label={module.label}
                ready={module.ready}
                onOpen={() => onOpen(module.id)}
              />
            ))}
          </section>
        </main>
      </div>
    </div>
  );
}

function ModuleCard({
  icon: Icon,
  label,
  ready,
  onOpen,
}: {
  icon: LucideIcon;
  label: string;
  ready: boolean;
  onOpen: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onOpen}
      className="group flex min-h-[78px] items-center gap-3 rounded-xl border border-surface-border-soft bg-surface-raised p-3 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-brand-border hover:shadow-md"
    >
      <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-brand-glass transition group-hover:bg-brand-primary">
        <Icon className="size-[18px] text-brand-primary transition group-hover:text-text-on-brand" />
      </span>
      <h2 className="min-w-0 flex-1 truncate text-sm font-black text-text-primary">
        {label}
      </h2>
      {!ready && (
        <span className="shrink-0 rounded-full bg-surface-muted px-2 py-0.5 text-[10px] font-black text-text-muted">
          준비 중
        </span>
      )}
      <span className="inline-flex shrink-0 items-center gap-1 text-xs font-black text-brand-primary">
        열기
        <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
      </span>
    </button>
  );
}

export default HomePage;
