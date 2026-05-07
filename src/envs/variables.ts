import { envSchema } from "./schema";

export const envVariables = envSchema.parse({
  MODE: import.meta.env.MODE,
  DEV: import.meta.env.DEV,
  PROD: import.meta.env.PROD,
  WXT_ENABLE_DEBUG_LOGS: import.meta.env.WXT_ENABLE_DEBUG_LOGS,
  WXT_ENABLE_STRICT_BLOCKING: import.meta.env.WXT_ENABLE_STRICT_BLOCKING,
});
