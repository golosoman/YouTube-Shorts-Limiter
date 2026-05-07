import { AppError, AppErrorCode } from "@/app/shared/errors/AppError";

export class TickActiveTabError extends AppError {
  constructor(cause?: unknown) {
    super("Failed to tick the active tab.", AppErrorCode.TickActiveTabFailed, cause);
  }
}
