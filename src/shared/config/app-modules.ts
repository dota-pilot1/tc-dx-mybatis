import { Rocket, type LucideIcon } from "lucide-react";

export type AppModuleId = "getting-started";

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
];

export const DEFAULT_MODULE_ORDER = APP_MODULES.map((module) => module.id);

export function isAppModuleId(value: string): value is AppModuleId {
  return DEFAULT_MODULE_ORDER.includes(value as AppModuleId);
}
