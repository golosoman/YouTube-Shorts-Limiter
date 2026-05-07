import { env } from "@/envs";

export const extensionConfig = {
  mode: env.mode,
  isDevelopment: env.isDevelopment,
  isProduction: env.isProduction,
  features: {
    debugLogs: env.enableDebugLogs,
    strictBlocking: env.enableStrictBlocking,
  },
} as const;
