import { AppError, AppErrorCode } from "@/app/shared/errors/AppError";

export class ResetUsageError extends AppError {
  constructor(cause?: unknown) {
    super("Failed to reset usage.", AppErrorCode.ResetUsageFailed, cause);
  }
}
