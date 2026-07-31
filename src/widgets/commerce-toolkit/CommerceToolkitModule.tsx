import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  ClipboardList,
  type LucideIcon,
} from "lucide-react";
import type { AppModuleId } from "../../shared/config/app-modules";
import { APP_MODULES } from "../../shared/config/app-modules";
import PageHeader from "../../shared/ui/PageHeader";

type Props = {
  moduleId: AppModuleId;
  onOpen: (id: AppModuleId) => void;
};

type ToolkitSection = {
  id: AppModuleId;
  kicker: string;
  title: string;
  summary: string;
  outcomes: string[];
  checklist: string[];
  examples: string[];
};

const IMPLEMENTATION_ROADMAP = [
  "상품·전시 구현",
  "회원·인증 구현",
  "장바구니 구현",
  "주문 구현",
  "결제 구현",
  "재고 구현",
  "배송 구현",
  "취소·반품·환불",
  "쿠폰·포인트·프로모션",
  "관리자 구현",
  "외부 서비스 연동",
  "테스트·검증",
  "배포·운영",
  "고도화",
  "완성 프로젝트",
];

const TOOLKIT_SECTIONS: Record<AppModuleId, ToolkitSection> = {
  "getting-started": {
    id: "getting-started",
    kicker: "0. 시작하기",
    title: "커머스 개발을 설계 순서대로 진행하는 작업대",
    summary:
      "바로 구현부터 들어가기 전에 비즈니스 유형, 핵심 정책, 도메인 경계를 먼저 정리합니다.",
    outcomes: [
      "툴킷 사용 순서",
      "커머스 유형 선택 기준",
      "학습과 구현을 분리한 로드맵",
    ],
    checklist: [
      "만들 커머스가 자사몰인지, 입점형인지, 도매 연동형인지 정한다.",
      "MVP에서 반드시 필요한 구매 플로우를 하나로 좁힌다.",
      "처음 구현할 도메인을 상품, 장바구니, 주문 중 하나로 고른다.",
    ],
    examples: [
      "자사몰 MVP: 상품 목록 -> 장바구니 -> 주문 생성",
      "도매 연동형 MVP: 도매 상품 수집 -> 마진 계산 -> 자사몰 전시",
    ],
  },
  "business-definition": {
    id: "business-definition",
    kicker: "1. 비즈니스 정의",
    title: "수익 모델과 운영 방식을 먼저 고정한다",
    summary:
      "커머스 구현 난이도는 코드보다 정책에서 결정됩니다. 판매자, 구매자, 운영자, 정산 주체를 먼저 정의합니다.",
    outcomes: [
      "커머스 유형 정의서",
      "수익 모델과 수수료 구조",
      "운영자와 입점사의 책임 범위",
    ],
    checklist: [
      "누가 상품을 등록하고 누가 배송 책임을 지는지 정한다.",
      "결제 금액이 누구에게 귀속되고 언제 정산되는지 정한다.",
      "포인트, 쿠폰, 배송비를 MVP에 포함할지 결정한다.",
    ],
    examples: [
      "입점형: 플랫폼은 주문 중개, 입점사는 상품/배송 책임",
      "포인트 충전형: 현금 결제와 서비스 포인트를 별도 원장으로 관리",
    ],
  },
  "requirements-design": {
    id: "requirements-design",
    kicker: "2. 요구사항 설계",
    title: "사용자 역할별 요구사항을 플로우로 정리한다",
    summary:
      "고객, 관리자, 입점사, CS 담당자가 같은 주문을 다르게 봅니다. 화면 요구사항보다 업무 흐름을 먼저 잡습니다.",
    outcomes: [
      "역할별 요구사항 목록",
      "구매/운영/CS 유스케이스",
      "정책 질문지",
    ],
    checklist: [
      "고객 구매 플로우를 8단계 이하로 쪼갠다.",
      "관리자가 처리해야 하는 예외 업무를 먼저 모은다.",
      "취소, 환불, 품절, 배송 지연의 처리 기준을 문장으로 쓴다.",
    ],
    examples: [
      "고객: 상품 탐색 -> 옵션 선택 -> 장바구니 -> 주문 -> 결제",
      "관리자: 상품 승인 -> 주문 확인 -> 송장 등록 -> CS 처리",
    ],
  },
  "domain-design": {
    id: "domain-design",
    kicker: "3. 도메인 설계",
    title: "상품, 주문, 결제, 재고의 경계를 나눈다",
    summary:
      "커머스 도메인은 서로 강하게 연결됩니다. 그래도 모델 경계를 나눠야 API와 DB가 오래 버팁니다.",
    outcomes: [
      "도메인 모델 사전",
      "Aggregate 후보",
      "상태 전이 초안",
    ],
    checklist: [
      "상품, 옵션, SKU, 재고를 같은 개념으로 섞지 않는다.",
      "주문 상태와 결제 상태를 분리한다.",
      "재고 차감 시점과 복원 시점을 명확히 한다.",
    ],
    examples: [
      "Product: 전시 정보",
      "Sku: 판매 가능한 최소 단위",
      "Inventory: 판매 가능 수량과 예약 수량",
    ],
  },
  "data-design": {
    id: "data-design",
    kicker: "4. 데이터 설계",
    title: "ERD, 이벤트, SQL 연습을 구현 전 단계에서 검증한다",
    summary:
      "커머스 데이터는 취소/반품/정산 때문에 계속 되감기와 재계산이 발생합니다. 상태와 이력을 함께 설계합니다.",
    outcomes: [
      "핵심 ERD",
      "주문/결제/배송 상태머신",
      "SQL 실습 과제",
    ],
    checklist: [
      "주문 원장과 결제 원장을 분리한다.",
      "금액 컬럼은 상품금액, 할인금액, 배송비, 결제금액으로 나눈다.",
      "상태 변경 이력을 별도 테이블이나 이벤트로 남긴다.",
    ],
    examples: [
      "orders, order_items, payments, inventory_reservations",
      "order_status_history, payment_events, settlement_items",
    ],
  },
  "system-architecture": {
    id: "system-architecture",
    kicker: "5. 시스템 아키텍처",
    title: "백엔드, 프론트, 외부 연동의 책임을 분리한다",
    summary:
      "PG, 택배, 알림톡, 도매 API 같은 외부 서비스는 실패를 전제로 설계해야 합니다.",
    outcomes: [
      "백엔드 모듈 구조",
      "프론트 화면 구조",
      "외부 연동 플레이북",
    ],
    checklist: [
      "결제 승인과 주문 확정을 같은 트랜잭션으로 가정하지 않는다.",
      "외부 API 요청/응답 원문을 추적 가능하게 저장한다.",
      "관리자 화면은 반복 운영 업무 기준으로 설계한다.",
    ],
    examples: [
      "Spring Boot: catalog, order, payment, inventory 패키지",
      "React: customer shop, admin console, vendor console 분리",
    ],
  },
  "commerce-roadmap": {
    id: "commerce-roadmap",
    kicker: "6. 구현 로드맵",
    title: "21단계 전체 목록은 로드맵으로 두고 메뉴는 하나씩 확장한다",
    summary:
      "처음부터 모든 메뉴를 만들지 않고, 구현 가능한 단위가 준비될 때마다 메뉴로 승격합니다.",
    outcomes: [
      "단계별 구현 순서",
      "챌린지 후보",
      "완성 프로젝트 기준",
    ],
    checklist: [
      "각 단계마다 개념, 정책 질문, DB, API, 화면, 테스트를 묶는다.",
      "상품·전시부터 주문까지 한 줄 구매 플로우를 먼저 완성한다.",
      "완성작 공유는 샘플 프로젝트가 1개 이상 생긴 뒤 메뉴로 분리한다.",
    ],
    examples: IMPLEMENTATION_ROADMAP,
  },
};

function CommerceToolkitModule({ moduleId, onOpen }: Props) {
  const section = TOOLKIT_SECTIONS[moduleId];
  const currentIndex = APP_MODULES.findIndex((module) => module.id === moduleId);
  const nextModule = APP_MODULES[currentIndex + 1];

  return (
    <div className="flex min-w-0 flex-1 flex-col">
      <PageHeader>
        <span className="text-[14px] font-bold tracking-tight text-text-primary">
          Towercrane Commerce Toolkit
        </span>
      </PageHeader>

      <div className="min-h-0 flex-1 overflow-y-auto bg-surface-muted">
        <div className="mx-auto grid w-full max-w-7xl gap-5 px-5 py-6 lg:grid-cols-[280px_minmax(0,1fr)]">
          <aside className="min-w-0 rounded-md border border-surface-border-soft bg-surface-raised p-3">
            <div className="px-2 py-2">
              <p className="text-[11px] font-black uppercase tracking-[0.14em] text-brand-primary">
                Commerce Steps
              </p>
              <h2 className="mt-1 text-lg font-black text-text-primary">
                툴킷 단계
              </h2>
            </div>
            <div className="mt-2 space-y-1">
              {APP_MODULES.map((module) => {
                const active = module.id === moduleId;
                return (
                  <button
                    key={module.id}
                    type="button"
                    onClick={() => onOpen(module.id)}
                    className={
                      "flex min-h-12 w-full items-center gap-2 rounded-md border px-3 text-left transition-colors " +
                      (active
                        ? "border-brand-border bg-brand-glass text-brand-primary"
                        : "border-transparent bg-transparent text-text-secondary hover:border-surface-border-soft hover:bg-surface-muted hover:text-text-primary")
                    }
                  >
                    <module.icon className="size-4 shrink-0" />
                    <span className="min-w-0">
                      <span className="block truncate text-[13px] font-black">
                        {module.label}
                      </span>
                      <span className="mt-0.5 block truncate text-[11px] font-semibold opacity-80">
                        {module.description}
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>
          </aside>

          <main className="min-w-0 space-y-5">
            <section className="rounded-md border border-surface-border-soft bg-surface-raised p-5">
              <p className="text-[11px] font-black uppercase tracking-[0.14em] text-brand-primary">
                {section.kicker}
              </p>
              <h1 className="mt-2 text-2xl font-black tracking-tight text-text-primary">
                {section.title}
              </h1>
              <p className="mt-3 max-w-3xl text-sm leading-6 text-text-secondary">
                {section.summary}
              </p>
              {nextModule ? (
                <button
                  type="button"
                  onClick={() => onOpen(nextModule.id)}
                  className="mt-5 inline-flex min-h-10 items-center gap-2 rounded-md border border-brand-border bg-brand-glass px-3 text-sm font-black text-brand-primary hover:bg-surface-muted"
                >
                  다음: {nextModule.label}
                  <ArrowRight className="size-4" />
                </button>
              ) : null}
            </section>

            <div className="grid gap-4 xl:grid-cols-3">
              <ToolkitCard
                icon={BookOpen}
                title="산출물"
                items={section.outcomes}
              />
              <ToolkitCard
                icon={CheckCircle2}
                title="체크리스트"
                items={section.checklist}
              />
              <ToolkitCard
                icon={ClipboardList}
                title="예제 / 후보"
                items={section.examples}
              />
            </div>

            {moduleId === "commerce-roadmap" ? <RoadmapPanel /> : null}
          </main>
        </div>
      </div>
    </div>
  );
}

function ToolkitCard({
  icon: Icon,
  title,
  items,
}: {
  icon: LucideIcon;
  title: string;
  items: string[];
}) {
  return (
    <section className="min-w-0 rounded-md border border-surface-border-soft bg-surface-raised">
      <div className="flex min-h-11 items-center gap-2 border-b border-surface-border-soft px-4">
        <Icon className="size-4 text-brand-primary" />
        <h2 className="text-sm font-black text-text-primary">{title}</h2>
      </div>
      <ul className="space-y-2 p-4">
        {items.map((item) => (
          <li
            key={item}
            className="rounded-md border border-surface-border-soft bg-surface-muted px-3 py-2 text-sm font-semibold leading-5 text-text-secondary"
          >
            {item}
          </li>
        ))}
      </ul>
    </section>
  );
}

function RoadmapPanel() {
  return (
    <section className="rounded-md border border-surface-border-soft bg-surface-raised">
      <div className="border-b border-surface-border-soft px-4 py-3">
        <h2 className="text-sm font-black text-text-primary">전체 구현 로드맵</h2>
        <p className="mt-1 text-xs font-semibold text-text-muted">
          메뉴는 한 번에 만들지 않고, 구현 자료가 준비된 단계부터 분리합니다.
        </p>
      </div>
      <div className="grid gap-2 p-4 md:grid-cols-2 xl:grid-cols-3">
        {IMPLEMENTATION_ROADMAP.map((item, index) => (
          <div
            key={item}
            className="flex min-h-11 items-center gap-3 rounded-md border border-surface-border-soft bg-surface-muted px-3"
          >
            <span className="grid size-6 shrink-0 place-items-center rounded-md bg-brand-glass text-[11px] font-black text-brand-primary">
              {index + 7}
            </span>
            <span className="text-sm font-bold text-text-secondary">{item}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

export default CommerceToolkitModule;
