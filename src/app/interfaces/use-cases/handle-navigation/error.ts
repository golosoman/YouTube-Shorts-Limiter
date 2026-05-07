import { AppError, AppErrorCode } from "@/app/shared/errors/AppError";

export class HandleNavigationError extends AppError {
  constructor(cause?: unknown) {
    super("Failed to handle navigation.", AppErrorCode.HandleNavigationFailed, cause);
  }
}
