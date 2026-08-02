import {
  BrainCircuit,
  Bookmark,
  CloudCog,
  Component,
  Database,
  FileText,
  GitBranch,
  GraduationCap,
  Layers3,
  Palette,
  ShoppingCart,
  TestTube2,
  Trophy,
  type LucideIcon,
} from "lucide-react";

export type AppModuleId =
  | "prototype"
  | "prototype-note"
  | "design-template"
  | "design-reference"
  | "common-component"
  | "testing"
  | "tutoring"
  | "devops"
  | "architecture"
  | "commerce"
  | "db"
  | "ax"
  | "challenge";

export type AppModuleDefinition = {
  id: AppModuleId;
  label: string;
  description: string;
  icon: LucideIcon;
  ready: boolean;
};

export const APP_MODULES: AppModuleDefinition[] = [
  {
    id: "prototype",
    label: "프로토타입",
    description: "서버의 프로토타입 워크스페이스를 커머스 제작 기준으로 봅니다.",
    icon: GitBranch,
    ready: true,
  },
  {
    id: "prototype-note",
    label: "프로토 노트",
    description: "프로토타입 주제와 연결된 구현 노트를 봅니다.",
    icon: FileText,
    ready: true,
  },
  {
    id: "design-template",
    label: "디자인 템플릿",
    description: "화면 패턴과 레이아웃 템플릿을 목록과 상세로 정리합니다.",
    icon: Palette,
    ready: true,
  },
  {
    id: "design-reference",
    label: "레퍼런스",
    description: "디자인 생성 도구와 커머스 참고 사이트를 분류별 즐겨찾기로 관리합니다.",
    icon: Bookmark,
    ready: true,
  },
  {
    id: "common-component",
    label: "공통 컴퍼넌트",
    description: "반복 UI를 공통 컴포넌트 후보로 수집합니다.",
    icon: Component,
    ready: true,
  },
  {
    id: "testing",
    label: "테스트 플레이북",
    description: "테스트 코드를 따라 만들고 실행 결과와 리뷰를 기록합니다.",
    icon: TestTube2,
    ready: true,
  },
  {
    id: "ax",
    label: "AX 플레이북",
    description: "AI를 개발과 업무에 적용한 과정을 문서로 정리합니다.",
    icon: BrainCircuit,
    ready: true,
  },
  {
    id: "devops",
    label: "DevOps Playbook",
    description: "환경 설정부터 배포·운영 과정을 문서로 정리합니다.",
    icon: CloudCog,
    ready: true,
  },
  {
    id: "architecture",
    label: "Architecture Playbook",
    description: "프론트엔드·백엔드 아키텍처와 FSD·DDD 설계를 문서로 정리합니다.",
    icon: Layers3,
    ready: true,
  },
  {
    id: "commerce",
    label: "Commerce Playbook",
    description: "주문·결제·후원·배송 도메인의 흐름과 규칙을 문서로 정리합니다.",
    icon: ShoppingCart,
    ready: true,
  },
  {
    id: "db",
    label: "DB Playbook",
    description: "스키마·마이그레이션·인덱스·트랜잭션 기준을 문서로 정리합니다.",
    icon: Database,
    ready: true,
  },
  {
    id: "tutoring",
    label: "Tutoring",
    description: "튜토리얼을 카테고리·주제·본문으로 만들고 영상·문서를 연결합니다.",
    icon: GraduationCap,
    ready: true,
  },
  {
    id: "challenge",
    label: "Challenge",
    description: "구현 챌린지와 실전 과제를 관리합니다.",
    icon: Trophy,
    ready: true,
  },
];

export const DEFAULT_MODULE_ORDER = APP_MODULES.map((module) => module.id);

export function isAppModuleId(value: string): value is AppModuleId {
  return DEFAULT_MODULE_ORDER.includes(value as AppModuleId);
}
