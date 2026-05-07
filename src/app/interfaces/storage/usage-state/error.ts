import { AppError, AppErrorCode } from "@/app/shared/errors/AppError";

export class UsageStateReadError extends AppError {
  constructor(cause?: unknown) {
    super("Failed to read usage state.", AppErrorCode.UsageStateReadFailed, cause);
  }
}

export class UsageStateWriteError extends AppError {
  constructor(cause?: unknown) {
    super("Failed to write usage state.", AppErrorCode.UsageStateWriteFailed, cause);
  }
}
