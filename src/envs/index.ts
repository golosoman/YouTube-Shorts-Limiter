import { envVariables } from "./variables";

export const env = {
  mode: envVariables.MODE,
  isDevelopment: envVariables.DEV,
  isProduction: envVariables.PROD,
  enableDebugLogs: envVariables.WXT_ENABLE_DEBUG_LOGS,
  enableStrictBlocking: envVariables.WXT_ENABLE_STRICT_BLOCKING,
} as const;
