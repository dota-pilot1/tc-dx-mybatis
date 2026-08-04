import type { AppModuleId } from "./app-modules";

export const APP_PROFILE = {
  id: "tc-dx-mybatis",
  displayName: "TC DX MyBatis",
  settingsStorageKey: "tc-dx-mybatis.appSettings",
  moduleIds: ["architecture", "sql", "db", "debugging-playbook", "apiexcel", "apidoc", "cicd", "chat"] as AppModuleId[],
  moduleLabels: { architecture: "MyBatis Playbook" } as Partial<Record<AppModuleId, string>>,
};
