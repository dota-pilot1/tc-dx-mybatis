import { ArrowRight, LayoutList, PanelRight, type LucideIcon } from "lucide-react";
import {
  APP_MODULES,
  type AppModuleId,
} from "../../shared/config/app-modules";
import PageHeader from "../../shared/ui/PageHeader";

type Props = {
  moduleId: AppModuleId;
  onOpen: (id: AppModuleId) => void;
};

type TopicPlan = {
  title: string;
  summary: string;
  detail: string;
  items: string[];
};

const START_TOPIC_IDS: AppModuleId[] = [
  "prototype",
  "prototype-note",
  "design-template",
  "design-reference",
  "common-component",
  "testing",
  "tutoring",
  "devops",
  "ax",
  "challenge",
];

const TOPIC_PLANS: Record<Exclude<AppModuleId, "getting-started">, TopicPlan> = {
  prototype: {
    title: "프로토타입",
    summary: "프로토타입 워크스페이스와 주제별 결과물을 관리합니다.",
    detail: "실제 구현 산출물을 카드로 모으고, GitHub, URL, Figma, 노트를 한 카드에서 바로 연결합니다.",
    items: ["워크스페이스", "프로토타입 주제", "결과물 카드", "링크 액션"],
  },
  "prototype-note": {
    title: "프로토타입 노트",
    summary: "프로토타입별 설계/구현 노트를 연결합니다.",
    detail: "좌측에서 프로토타입을 고르고, 우측에서 노트 섹션과 상세 내용을 관리하는 구조입니다.",
    items: ["프로토타입 목록", "노트 섹션", "상세 노트", "연결 상태"],
  },
  "design-template": {
    title: "디자인 템플릿",
    summary: "커머스 화면 템플릿을 목록과 상세 구조로 정리합니다.",
    detail: "왼쪽에는 템플릿 유형 목록을 두고, 오른쪽에는 레이아웃 목적, 사용 조건, 포함 컴포넌트를 표시합니다.",
    items: ["상품 목록", "상세 화면", "장바구니", "주문/결제"],
  },
  "design-reference": {
    title: "디자인 레퍼런스",
    summary: "디자인 생성 도구와 커머스 참고 사이트를 분류별 즐겨찾기로 관리합니다.",
    detail: "AI 디자인 생성, UI 패턴, 커머스 UX, 실제 커머스 사이트를 한 화면에서 분류하고 바로 열 수 있게 정리합니다.",
    items: ["AI 디자인 생성", "UI 패턴", "커머스 UX", "커머스 사이트"],
  },
  "common-component": {
    title: "공통 컴퍼넌트",
    summary: "반복 UI를 공통 컴포넌트 후보로 분리합니다.",
    detail: "버튼, 입력, 카드, 필터, 테이블처럼 반복되는 UI를 사용처와 상태 기준으로 정리합니다.",
    items: ["입력 필드", "액션 버튼", "정보 카드", "필터/탭"],
  },
  testing: {
    title: "Testing",
    summary: "기능별 테스트 시나리오와 체크리스트를 관리합니다.",
    detail: "정책, API, UI 흐름마다 필수 테스트 케이스를 목록화하고 검증 상태를 추적합니다.",
    items: ["정책 테스트", "API 테스트", "UI 플로우", "회귀 체크"],
  },
  tutoring: {
    title: "Tutoring",
    summary: "학습 흐름과 실습 가이드를 구성합니다.",
    detail: "주제별 튜터링 자료를 왼쪽 목록에 두고, 오른쪽에서 설명, 예제, 실습 과제를 확인합니다.",
    items: ["개념 설명", "실습 과제", "코드 예시", "피드백"],
  },
  devops: {
    title: "DevOps",
    summary: "배포와 운영 자동화 체크리스트를 정리합니다.",
    detail: "환경변수, 빌드, 릴리즈, 배포 검증, 장애 대응을 운영 기준으로 묶습니다.",
    items: ["환경 설정", "빌드/릴리즈", "배포 검증", "운영 점검"],
  },
  ax: {
    title: "AX",
    summary: "AI 전환 관점의 업무 자동화 후보를 모읍니다.",
    detail: "사람이 반복하던 기획, 구현, 검증 흐름을 AI 작업 단위로 쪼개고 자동화 우선순위를 정리합니다.",
    items: ["업무 흐름", "자동화 후보", "프롬프트", "평가 기준"],
  },
  challenge: {
    title: "Challenge",
    summary: "구현 챌린지와 실전 과제를 관리합니다.",
    detail: "작은 기능 단위의 요구사항, 제출 조건, 리뷰 기준을 카드와 상세 화면으로 구성합니다.",
    items: ["과제 목록", "요구사항", "제출 조건", "리뷰 기준"],
  },
};

function moduleById(id: AppModuleId) {
  return APP_MODULES.find((module) => module.id === id);
}

function CommerceToolkitModule({ moduleId, onOpen }: Props) {
  if (moduleId !== "getting-started") {
    return <SkeletonTopicModule moduleId={moduleId} />;
  }

  return (
    <div className="flex min-w-0 flex-1 flex-col">
      <PageHeader>
        <span className="text-[14px] font-bold tracking-tight text-text-primary">
          Towercrane Commerce Toolkit
        </span>
      </PageHeader>

      <div className="min-h-0 flex-1 overflow-y-auto bg-surface-muted">
        <main className="mx-auto flex w-full max-w-7xl flex-col gap-5 px-5 py-6">
          <section className="rounded-md border border-surface-border-soft bg-surface-raised p-5">
            <p className="text-[11px] font-black uppercase tracking-[0.14em] text-brand-primary">
              Start
            </p>
            <div className="mt-2 grid gap-5 lg:grid-cols-[minmax(0,1fr)_340px]">
              <div className="min-w-0">
                <h1 className="text-2xl font-black tracking-tight text-text-primary">
                  10개 주제로 커머스 제작 도구를 확장하는 시작점
                </h1>
                <p className="mt-3 max-w-3xl text-sm font-semibold leading-6 text-text-secondary">
                  프로토타입과 노트를 중심축으로 두고, 디자인 템플릿, 디자인 레퍼런스, 공통 컴퍼넌트,
                  테스트, 튜터링, DevOps, AX, 챌린지까지 같은 작업대에서 다룹니다.
                  3번 이후 메뉴는 먼저 목록/상세 UI 뼈대를 놓고 점진적으로 채웁니다.
                </p>
              </div>
              <div className="rounded-md border border-brand-border bg-brand-glass p-4">
                <h2 className="text-sm font-black text-text-primary">메뉴명 기준</h2>
                <p className="mt-2 text-sm font-bold leading-6 text-text-secondary">
                  레일에서는 폭 때문에 <strong className="text-brand-primary">프로토 노트</strong>로 짧게 두고,
                  본문 카드와 화면 제목에서는 <strong className="text-brand-primary">프로토타입 노트</strong>로 풀네임을 씁니다.
                </p>
              </div>
            </div>
          </section>

          <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {START_TOPIC_IDS.map((id, index) => {
              const module = moduleById(id);
              const plan = TOPIC_PLANS[id as Exclude<AppModuleId, "getting-started">];
              if (!module) return null;

              return (
                <StartTopicCard
                  key={id}
                  index={index + 1}
                  icon={module.icon}
                  title={plan.title}
                  summary={plan.summary}
                  onOpen={() => onOpen(id)}
                />
              );
            })}
          </section>
        </main>
      </div>
    </div>
  );
}

function StartTopicCard({
  index,
  icon: Icon,
  title,
  summary,
  onOpen,
}: {
  index: number;
  icon: LucideIcon;
  title: string;
  summary: string;
  onOpen: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onOpen}
      className="group flex min-h-[172px] flex-col rounded-md border border-surface-border-soft bg-surface-raised p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-brand-border hover:bg-surface-muted"
    >
      <div className="flex items-start justify-between gap-3">
        <span className="grid size-10 shrink-0 place-items-center rounded-md border border-brand-border bg-brand-glass">
          <Icon className="size-5 text-brand-primary" />
        </span>
        <span className="rounded-md border border-surface-border-soft bg-surface-muted px-2 py-1 text-[11px] font-black text-text-muted">
          {index}
        </span>
      </div>
      <h2 className="mt-4 text-base font-black text-text-primary">{title}</h2>
      <p className="mt-2 line-clamp-3 text-sm font-semibold leading-6 text-text-secondary">
        {summary}
      </p>
      <span className="mt-auto inline-flex items-center gap-1 pt-4 text-sm font-black text-brand-primary">
        열기
        <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
      </span>
    </button>
  );
}

function SkeletonTopicModule({ moduleId }: { moduleId: AppModuleId }) {
  const module = moduleById(moduleId);
  const plan = TOPIC_PLANS[moduleId as Exclude<AppModuleId, "getting-started">];
  const Icon = module?.icon ?? LayoutList;

  return (
    <div className="flex min-w-0 flex-1 flex-col">
      <PageHeader>
        <Icon className="size-4 text-brand-primary" />
        <span className="text-[14px] font-bold tracking-tight text-text-primary">
          {plan.title}
        </span>
      </PageHeader>

      <div className="min-h-0 flex-1 bg-surface-muted p-5">
        <main className="grid h-full min-h-0 gap-4 lg:grid-cols-[320px_minmax(0,1fr)]">
          <aside className="flex min-h-0 flex-col rounded-md border border-surface-border bg-surface-raised shadow-sm">
            <div className="flex min-h-12 items-center gap-2 border-b border-surface-border px-4">
              <LayoutList className="size-4 text-brand-primary" />
              <h2 className="text-sm font-black text-text-primary">목록</h2>
            </div>
            <div className="min-h-0 flex-1 space-y-2 overflow-y-auto p-3">
              {plan.items.map((item, index) => (
                <button
                  key={item}
                  type="button"
                  className={
                    "flex min-h-12 w-full items-center gap-3 rounded-md border px-3 text-left transition " +
                    (index === 0
                      ? "border-brand-border bg-brand-glass text-text-primary"
                      : "border-surface-border-soft bg-surface-muted text-text-secondary hover:border-brand-border hover:text-text-primary")
                  }
                >
                  <span className="grid size-7 shrink-0 place-items-center rounded-md bg-surface-raised text-xs font-black text-brand-primary">
                    {index + 1}
                  </span>
                  <span className="truncate text-sm font-black">{item}</span>
                </button>
              ))}
            </div>
          </aside>

          <section className="flex min-h-0 flex-col rounded-md border border-surface-border bg-surface-raised shadow-sm">
            <div className="flex min-h-12 items-center gap-2 border-b border-surface-border px-4">
              <PanelRight className="size-4 text-brand-primary" />
              <h2 className="text-sm font-black text-text-primary">상세</h2>
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto p-5">
              <div className="rounded-md border border-brand-border bg-brand-glass p-4">
                <p className="text-[11px] font-black uppercase tracking-[0.14em] text-brand-primary">
                  UI Skeleton
                </p>
                <h1 className="mt-2 text-xl font-black text-text-primary">
                  {plan.title}
                </h1>
                <p className="mt-3 max-w-3xl text-sm font-semibold leading-6 text-text-secondary">
                  {plan.detail}
                </p>
              </div>

              <div className="mt-4 grid gap-3 md:grid-cols-2">
                {plan.items.map((item) => (
                  <div
                    key={item}
                    className="rounded-md border border-surface-border-soft bg-surface-muted p-4"
                  >
                    <h3 className="text-sm font-black text-text-primary">{item}</h3>
                    <p className="mt-2 text-xs font-semibold leading-5 text-text-secondary">
                      아직 데이터 모델은 붙이지 않고, 화면 구조와 배치만 먼저 잡는 영역입니다.
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}

export default CommerceToolkitModule;
