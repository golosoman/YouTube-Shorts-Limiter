import { AppError, AppErrorCode } from "@/app/shared/errors/AppError";

export class WatchTabsReadError extends AppError {
  constructor(cause?: unknown) {
    super("Failed to read watch tabs.", AppErrorCode.WatchTabsReadFailed, cause);
  }
}
