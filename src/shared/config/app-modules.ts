import {
  BookOpen,
  Boxes,
  ClipboardList,
  Database,
  FileSearch,
  Network,
  Rocket,
  type LucideIcon,
} from "lucide-react";

export type AppModuleId =
  | "getting-started"
  | "business-definition"
  | "requirements-design"
  | "domain-design"
  | "data-design"
  | "system-architecture"
  | "commerce-roadmap";

export type AppModuleDefinition = {
  id: AppModuleId;
  label: string;
  description: string;
  icon: LucideIcon;
  ready: boolean;
};

export const APP_MODULES: AppModuleDefinition[] = [
  {
    id: "getting-started",
    label: "시작하기",
    description: "커머스 툴킷의 학습 순서와 사용 방식을 잡습니다.",
    icon: Rocket,
    ready: true,
  },
  {
    id: "business-definition",
    label: "비즈니스 정의",
    description: "커머스 유형, 수익 모델, 운영 정책을 먼저 정의합니다.",
    icon: BookOpen,
    ready: true,
  },
  {
    id: "requirements-design",
    label: "요구사항 설계",
    description: "고객, 관리자, 입점사 관점의 요구사항을 구조화합니다.",
    icon: ClipboardList,
    ready: true,
  },
  {
    id: "domain-design",
    label: "도메인 설계",
    description: "상품, 주문, 결제, 재고, 정산 도메인을 모델링합니다.",
    icon: Boxes,
    ready: true,
  },
  {
    id: "data-design",
    label: "데이터 설계",
    description: "ERD, 상태머신, 이벤트, SQL 연습을 다룹니다.",
    icon: Database,
    ready: true,
  },
  {
    id: "system-architecture",
    label: "시스템 아키텍처",
    description: "백엔드, 프론트, 외부 연동, 운영 구조를 설계합니다.",
    icon: Network,
    ready: true,
  },
  {
    id: "commerce-roadmap",
    label: "로드맵",
    description: "상품부터 완성 프로젝트까지 구현 순서를 관리합니다.",
    icon: FileSearch,
    ready: true,
  },
];

export const DEFAULT_MODULE_ORDER = APP_MODULES.map((module) => module.id);

export function isAppModuleId(value: string): value is AppModuleId {
  return DEFAULT_MODULE_ORDER.includes(value as AppModuleId);
}
