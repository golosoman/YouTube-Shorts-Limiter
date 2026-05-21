import { applicationConfig } from "./application.config";

export const validationConfig = {
  settings: {
    shorts: applicationConfig.constraints.shorts,
    youtube: applicationConfig.constraints.youtube,
  },
} as const;
