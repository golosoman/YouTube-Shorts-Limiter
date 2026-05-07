import { AppError, AppErrorCode } from "@/app/shared/errors/AppError";

export class TabBlockError extends AppError {
  constructor(cause?: unknown) {
    super("Failed to block the tab.", AppErrorCode.TabBlockFailed, cause);
  }
}
