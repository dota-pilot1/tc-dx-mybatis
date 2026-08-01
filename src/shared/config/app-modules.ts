import {
  BrainCircuit,
  Bookmark,
  CloudCog,
  Component,
  FileText,
  GitBranch,
  GraduationCap,
  Palette,
  Rocket,
  TestTube2,
  Trophy,
  type LucideIcon,
} from "lucide-react";

export type AppModuleId =
  | "getting-started"
  | "prototype"
  | "prototype-note"
  | "design-template"
  | "design-reference"
  | "common-component"
  | "testing"
  | "tutoring"
  | "devops"
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
    id: "getting-started",
    label: "시작하기",
    description: "커머스 제작 툴킷의 첫 작업대를 엽니다.",
    icon: Rocket,
    ready: true,
  },
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
    label: "Testing",
    description: "테스트 케이스와 검증 시나리오를 관리합니다.",
    icon: TestTube2,
    ready: true,
  },
  {
    id: "tutoring",
    label: "Tutoring",
    description: "학습 흐름과 튜터링 콘텐츠를 설계합니다.",
    icon: GraduationCap,
    ready: true,
  },
  {
    id: "devops",
    label: "DevOps",
    description: "배포, 운영, 자동화 체크리스트를 정리합니다.",
    icon: CloudCog,
    ready: true,
  },
  {
    id: "ax",
    label: "AX",
    description: "AI 전환 관점의 업무 흐름과 자동화 후보를 정리합니다.",
    icon: BrainCircuit,
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
