import { AppError, AppErrorCode } from "@/app/shared/errors/AppError";

export class ActiveTabReadError extends AppError {
  constructor(cause?: unknown) {
    super("Failed to read the active tab.", AppErrorCode.ActiveTabReadFailed, cause);
  }
}
