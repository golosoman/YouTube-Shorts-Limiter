import type { Logger } from "@/app/interfaces/logger/interface";
import { config } from "@/config";

export class ConsoleLoggerService implements Logger {
  info(message: string, meta?: unknown): void {
    if (config.extension.features.debugLogs) {
      console.info(message, meta);
    }
  }

  warn(message: string, meta?: unknown): void {
    if (config.extension.features.debugLogs) {
      console.warn(message, meta);
    }
  }

  error(message: string, meta?: unknown): void {
    console.error(message, meta);
  }
}
