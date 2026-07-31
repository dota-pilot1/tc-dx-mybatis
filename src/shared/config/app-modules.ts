import { FileText, GitBranch, Rocket, type LucideIcon } from "lucide-react";

export type AppModuleId = "getting-started" | "prototype-note" | "prototype";

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
];

export const DEFAULT_MODULE_ORDER = APP_MODULES.map((module) => module.id);

export function isAppModuleId(value: string): value is AppModuleId {
  return DEFAULT_MODULE_ORDER.includes(value as AppModuleId);
}
