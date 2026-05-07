import type { Logger } from "@/app/interfaces/logger/interface";

export function handleError(logger: Logger, message: string, error: unknown): void {
  logger.error(message, error);
}
