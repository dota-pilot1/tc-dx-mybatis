import { LayoutList, PanelRight } from "lucide-react";
import {
  APP_MODULES,
  type AppModuleId,
} from "../../shared/config/app-modules";
import PageHeader from "../../shared/ui/PageHeader";

type Props = {
  moduleId: AppModuleId;
};

type TopicStatus = "ready" | "draft";

type TopicPlan = {
  title: string;
  summary: string;
  detail: string;
  items: string[];
  /** 전용 모듈이 붙었는지 여부. draft는 아직 공용 UI 뼈대만 있는 상태. */
  status: TopicStatus;
};

const TOPIC_PLANS: Record<AppModuleId, TopicPlan> = {
  prototype: {
    title: "프로토타입",
    summary: "프로토타입 워크스페이스와 주제별 결과물을 관리합니다.",
    detail: "실제 구현 산출물을 카드로 모으고, GitHub, URL, Figma, 노트를 한 카드에서 바로 연결합니다.",
    items: ["워크스페이스", "프로토타입 주제", "결과물 카드", "링크 액션"],
    status: "ready",
  },
  "prototype-note": {
    title: "프로토타입 노트",
    summary: "프로토타입별 설계/구현 노트를 연결합니다.",
    detail: "좌측에서 프로토타입을 고르고, 우측에서 노트 섹션과 상세 내용을 관리하는 구조입니다.",
    items: ["프로토타입 목록", "노트 섹션", "상세 노트", "연결 상태"],
    status: "ready",
  },
  "design-template": {
    title: "디자인 템플릿",
    summary: "커머스 화면 템플릿을 목록과 상세 구조로 정리합니다.",
    detail: "왼쪽에는 템플릿 유형 목록을 두고, 오른쪽에는 레이아웃 목적, 사용 조건, 포함 컴포넌트를 표시합니다.",
    items: ["상품 목록", "상세 화면", "장바구니", "주문/결제"],
    status: "ready",
  },
  "design-reference": {
    title: "디자인 레퍼런스",
    summary: "디자인 생성 도구와 커머스 참고 사이트를 분류별 즐겨찾기로 관리합니다.",
    detail: "AI 디자인 생성, UI 패턴, 커머스 UX, 실제 커머스 사이트를 한 화면에서 분류하고 바로 열 수 있게 정리합니다.",
    items: ["AI 디자인 생성", "UI 패턴", "커머스 UX", "커머스 사이트"],
    status: "ready",
  },
  "common-component": {
    title: "공통 컴퍼넌트",
    summary: "반복 UI를 공통 컴포넌트 후보로 분리합니다.",
    detail: "버튼, 입력, 카드, 필터, 테이블처럼 반복되는 UI를 사용처와 상태 기준으로 정리합니다.",
    items: ["입력 필드", "액션 버튼", "정보 카드", "필터/탭"],
    status: "draft",
  },
  testing: {
    title: "테스트 플레이북",
    summary: "테스트 코드를 따라 만들고 실행 결과와 리뷰를 남깁니다.",
    detail: "1차 테스트 영역과 2차 실행 문서를 따라가며 코드·명령어·증거·원천 모듈을 기록합니다.",
    items: ["실행 과정", "테스트 코드", "실행 증거", "팀 리뷰"],
    status: "ready",
  },
  tutoring: {
    title: "Tutoring",
    summary: "카테고리·주제·본문으로 튜토리얼을 만들고 영상과 참고 문서를 연결합니다.",
    detail: "왼쪽에서 1차 카테고리와 2차 주제를 고르고, 오른쪽에서 Lexical 본문·YouTube 영상·참고 문서를 관리합니다.",
    items: ["1차 카테고리", "2차 주제", "본문 편집", "영상·문서 연결"],
    status: "ready",
  },
  devops: {
    title: "DevOps Playbook",
    summary: "환경 설정부터 배포·운영 과정을 문서로 정리합니다.",
    detail: "1차 영역, 2차 주제, 여러 Lexical 문서로 DevOps 실행 과정을 쌓습니다.",
    items: ["환경 설정", "빌드/릴리즈", "배포 검증", "운영 점검"],
    status: "ready",
  },
  cicd: {
    title: "CI/CD Playbook",
    summary: "소스부터 배포·롤백까지 CI/CD 실행 절차를 문서로 정리합니다.",
    detail: "파이프라인 단계, 빌드 산출물, 릴리즈 기준, 배포 검증과 롤백 절차를 Lexical 문서로 쌓습니다.",
    items: ["Source", "Build/Test", "Release", "Deploy/Rollback"],
    status: "ready",
  },
  architecture: {
    title: "Architecture Playbook",
    summary: "프론트엔드·백엔드 구조와 설계 원칙을 문서로 정리합니다.",
    detail: "FSD, DDD, 모듈 경계, 계층 설계와 실제 적용 과정을 Lexical 문서로 쌓습니다.",
    items: ["프론트엔드 아키텍처", "백엔드 아키텍처", "FSD", "DDD"],
    status: "ready",
  },
  sql: {
    title: "SQL Playbook",
    summary: "SQL 쿼리와 성능 기준을 문서로 정리합니다.",
    detail: "조회 패턴, 인덱스, 성능 점검 기준을 실행 가능한 문서로 쌓습니다.",
    items: ["쿼리 패턴", "인덱스", "성능 점검", "트러블슈팅"],
    status: "ready",
  },
  "debugging-playbook": {
    title: "Debugging Playbook",
    summary: "원인·조치·재발 방지 기록을 문서로 남깁니다.",
    detail: "장애 증상과 원인, 조치 결과, 재발 방지책을 반복 가능한 기록으로 관리합니다.",
    items: ["증상", "원인", "조치", "재발 방지"],
    status: "ready",
  },
  "skill-analysys": {
    title: "Skill Analysys",
    summary: "기술부채의 영향과 상환 계획을 문서로 정리합니다.",
    detail: "기술부채를 영향도와 우선순위로 분석하고 상환 계획을 관리합니다.",
    items: ["기술부채", "영향도", "우선순위", "상환 계획"],
    status: "ready",
  },
  apidoc: {
    title: "Postman",
    summary: "워크스페이스별 API 요청을 관리하고 직접 테스트합니다.",
    detail: "Excel에서 가져온 API와 프로젝트별 요청을 컬렉션으로 정리하고 실행 결과를 확인합니다.",
    items: ["워크스페이스", "컬렉션", "API 요청", "응답 확인"],
    status: "ready",
  },
  apiexcel: {
    title: "Excel",
    summary: "프로젝트별 API Excel 원본 문서를 관리합니다.",
    detail: "1차 프로젝트, 2차 API 분류, Excel 문서 목록으로 원본 파일을 관리합니다.",
    items: ["1차 프로젝트", "2차 API 분류", "Excel 문서", "파일 버전"],
    status: "ready",
  },
  commerce: {
    title: "Commerce Playbook",
    summary: "커머스 도메인의 업무 흐름과 구현 규칙을 문서로 정리합니다.",
    detail: "주문, 결제, 후원, 배송, 환불과 관리자·사용자 흐름을 실제 구현 기준으로 쌓습니다.",
    items: ["주문 흐름", "결제·환불", "후원·구매", "배송 추적"],
    status: "ready",
  },
  db: {
    title: "DB Playbook",
    summary: "데이터베이스 설계와 운영 기준을 문서로 정리합니다.",
    detail: "스키마 설계, 마이그레이션, 인덱스, 트랜잭션과 쿼리 검증 과정을 기록합니다.",
    items: ["스키마 설계", "마이그레이션", "인덱스", "트랜잭션·쿼리"],
    status: "ready",
  },
  ax: {
    title: "AX 플레이북",
    summary: "AI를 개발과 업무에 적용한 과정을 문서로 정리합니다.",
    detail: "1차 AX 영역, 2차 AX 주제, Lexical 문서로 실제 적용 과정을 쌓습니다.",
    items: ["AX 영역", "적용 주제", "Lexical 문서", "실제 적용 과정"],
    status: "ready",
  },
  challenge: {
    title: "Challenge Playbook",
    summary: "실전 과제를 문서화하고 참가자 제출을 관리합니다.",
    detail: "1차 영역, 2차 주제, 챌린지 문서의 3단 구조에 참가자 제출과 댓글을 연결합니다.",
    items: ["1차 챌린지 영역", "2차 챌린지 주제", "챌린지 문서", "제출·댓글"],
    status: "draft",
  },
  chat: {
    title: "채팅",
    summary: "팀 채널과 메시지를 관리합니다.",
    detail: "업무 대화를 채널과 메시지 단위로 확인합니다.",
    items: ["채널", "대화", "멤버", "검색"],
    status: "ready",
  },
};

function moduleById(id: AppModuleId) {
  return APP_MODULES.find((module) => module.id === id);
}

// 전용 모듈이 아직 없는 메뉴의 공용 UI 뼈대.
function CommerceToolkitModule({ moduleId }: Props) {
  const module = moduleById(moduleId);
  const plan = TOPIC_PLANS[moduleId];
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
