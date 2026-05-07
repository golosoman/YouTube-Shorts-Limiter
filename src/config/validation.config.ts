import { applicationConfig } from "./application.config";

export const validationConfig = {
  settings: {
    allowedDuration: applicationConfig.constraints.allowedDuration,
    cooldownDuration: applicationConfig.constraints.cooldownDuration,
  },
} as const;
