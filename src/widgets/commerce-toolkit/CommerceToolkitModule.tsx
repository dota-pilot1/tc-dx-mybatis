import {
  ArrowRight,
  Boxes,
  CheckCircle2,
  Code2,
  Database,
  FileCode2,
  GitBranch,
  Lightbulb,
  Network,
  Rocket,
  type LucideIcon,
} from "lucide-react";
import type { ReactNode } from "react";
import type { AppModuleId } from "../../shared/config/app-modules";
import PageHeader from "../../shared/ui/PageHeader";

type Props = {
  moduleId: AppModuleId;
  onOpen: (id: AppModuleId) => void;
};

type ToolCandidate = {
  title: string;
  summary: string;
  value: string;
  icon: LucideIcon;
};

const TOOL_CANDIDATES: ToolCandidate[] = [
  {
    title: "커머스 청사진 생성기",
    summary: "자사몰, 입점형, 도매 연동형 같은 사업 유형을 고르면 필요한 도메인, 정책, MVP 범위를 한 번에 뽑습니다.",
    value: "처음부터 무엇을 만들지 헤매지 않게 만드는 시작 버튼",
    icon: Rocket,
  },
  {
    title: "도메인 모델 사전",
    summary: "상품, 옵션, SKU, 재고, 주문, 결제, 정산처럼 헷갈리는 개념을 실무 기준으로 매핑합니다.",
    value: "10인분 개발자가 빠르게 팀의 언어를 고정하는 기준표",
    icon: Boxes,
  },
  {
    title: "기능 레시피",
    summary: "장바구니, 주문 생성, 결제 승인, 재고 예약, 부분 취소 같은 기능을 정책, API, DB, 테스트 단위로 제공합니다.",
    value: "복붙이 아니라 바로 구현 가능한 판단 재료",
    icon: FileCode2,
  },
  {
    title: "상태머신 / SQL 실험실",
    summary: "주문, 결제, 배송, 환불, 정산 상태 전이를 테이블과 쿼리로 검증합니다.",
    value: "나중에 터지는 엣지케이스를 구현 전에 잡는 도구",
    icon: Database,
  },
  {
    title: "외부 연동 플레이북",
    summary: "PG, 택배, 알림톡, 도매 API, ERP, 이미지 저장소 연동의 실패 케이스와 재처리 기준을 정리합니다.",
    value: "운영에서 흔들리지 않는 연동 설계 체크리스트",
    icon: Network,
  },
  {
    title: "프로토타입 런처",
    summary: "Spring Boot 백엔드와 React/Tauri 프론트 샘플을 기능별로 생성하고 비교합니다.",
    value: "툴킷이 실제 프로젝트 생성기로 넘어가는 핵심 축",
    icon: Code2,
  },
];

const FIRST_BUILD_STEPS = [
  "커머스 유형 선택: 자사몰, 입점형, 도매 연동형, 포인트 충전형 중 하나를 선택",
  "MVP 플로우 선택: 상품 목록 -> 장바구니 -> 주문 -> 결제 중 어디까지 만들지 결정",
  "정책 질문 생성: 재고 차감, 쿠폰, 배송비, 취소/환불의 최소 질문을 자동 정리",
  "산출물 생성: 도메인 모델, ERD 후보, API 목록, 화면 목록, 테스트 케이스 초안 출력",
];

const PRINCIPLES = [
  "메뉴를 많이 만드는 앱이 아니라, 커머스 구현 속도를 올리는 도구를 하나씩 만든다.",
  "개념 설명은 결과물 생성에 필요한 만큼만 둔다.",
  "각 도구는 정책, DB, API, 화면, 테스트를 한 묶음으로 다룬다.",
  "완성된 예제는 바로 프로토타입과 챌린지로 연결한다.",
];

function CommerceToolkitModule({ moduleId: _moduleId, onOpen: _onOpen }: Props) {
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
            <div className="mt-2 grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
              <div className="min-w-0">
                <h1 className="text-2xl font-black tracking-tight text-text-primary">
                  10인분 하는 개발자가 커머스를 빠르게 찍어내는 작업대
                </h1>
                <p className="mt-3 max-w-3xl text-sm font-semibold leading-6 text-text-secondary">
                  이 툴킷의 목표는 커머스 강의 목차를 나열하는 것이 아니라, 실무자가
                  바로 참고해서 설계와 구현 속도를 올리는 도구를 만드는 것입니다.
                  지금은 `시작하기` 하나만 두고, 첫 번째로 만들 핵심 도구를 고르는
                  단계부터 진행합니다.
                </p>
              </div>
              <div className="rounded-md border border-brand-border bg-brand-glass p-4">
                <h2 className="text-sm font-black text-text-primary">첫 구현 후보</h2>
                <p className="mt-2 text-sm font-bold leading-6 text-text-secondary">
                  가장 먼저 만들 만한 것은 커머스 유형을 고르면 MVP 범위, 정책 질문,
                  도메인 모델, DB/API 초안을 뽑아주는 <strong className="text-brand-primary">청사진 생성기</strong>입니다.
                </p>
              </div>
            </div>
          </section>

          <section className="grid gap-4 lg:grid-cols-[360px_minmax(0,1fr)]">
            <Panel title="방향 원칙" icon={CheckCircle2}>
              <ul className="space-y-2">
                {PRINCIPLES.map((item) => (
                  <li
                    key={item}
                    className="rounded-md border border-surface-border-soft bg-surface-muted px-3 py-2 text-sm font-semibold leading-5 text-text-secondary"
                  >
                    {item}
                  </li>
                ))}
              </ul>
            </Panel>

            <Panel title="후보 도구" icon={Lightbulb}>
              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                {TOOL_CANDIDATES.map((tool) => (
                  <article
                    key={tool.title}
                    className="flex min-h-[190px] flex-col rounded-md border border-surface-border-soft bg-surface-muted p-4"
                  >
                    <div className="flex items-start gap-3">
                      <span className="grid size-9 shrink-0 place-items-center rounded-md border border-brand-border bg-brand-glass">
                        <tool.icon className="size-4 text-brand-primary" />
                      </span>
                      <div className="min-w-0">
                        <h3 className="text-sm font-black leading-5 text-text-primary">
                          {tool.title}
                        </h3>
                        <p className="mt-1 text-xs font-semibold leading-5 text-text-secondary">
                          {tool.summary}
                        </p>
                      </div>
                    </div>
                    <p className="mt-auto border-t border-surface-border-soft pt-3 text-xs font-bold leading-5 text-brand-primary">
                      {tool.value}
                    </p>
                  </article>
                ))}
              </div>
            </Panel>
          </section>

          <section className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_360px]">
            <Panel title="청사진 생성기부터 만들 때 필요한 입력" icon={GitBranch}>
              <div className="grid gap-3 md:grid-cols-2">
                {FIRST_BUILD_STEPS.map((step, index) => (
                  <div
                    key={step}
                    className="flex min-h-16 items-start gap-3 rounded-md border border-surface-border-soft bg-surface-muted px-3 py-3"
                  >
                    <span className="grid size-7 shrink-0 place-items-center rounded-md bg-brand-glass text-xs font-black text-brand-primary">
                      {index + 1}
                    </span>
                    <span className="text-sm font-semibold leading-5 text-text-secondary">
                      {step}
                    </span>
                  </div>
                ))}
              </div>
            </Panel>

            <section className="rounded-md border border-surface-border-soft bg-surface-raised p-4">
              <h2 className="text-sm font-black text-text-primary">다음 작업</h2>
              <p className="mt-2 text-sm font-semibold leading-6 text-text-secondary">
                다음 커밋에서는 `청사진 생성기` 화면을 추가하고, 자사몰/입점형/도매 연동형을 선택하면
                MVP 기능 목록과 정책 질문을 생성하는 폼부터 만들면 됩니다.
              </p>
              <div className="mt-4 flex items-center gap-2 rounded-md border border-brand-border bg-brand-glass px-3 py-2 text-sm font-black text-brand-primary">
                청사진 생성기
                <ArrowRight className="size-4" />
              </div>
            </section>
          </section>
        </main>
      </div>
    </div>
  );
}

function Panel({
  icon: Icon,
  title,
  children,
}: {
  icon: LucideIcon;
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="min-w-0 rounded-md border border-surface-border-soft bg-surface-raised">
      <div className="flex min-h-11 items-center gap-2 border-b border-surface-border-soft px-4">
        <Icon className="size-4 text-brand-primary" />
        <h2 className="text-sm font-black text-text-primary">{title}</h2>
      </div>
      <div className="p-4">{children}</div>
    </section>
  );
}

export default CommerceToolkitModule;
