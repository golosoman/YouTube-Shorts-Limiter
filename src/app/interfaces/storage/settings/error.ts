import { AppError, AppErrorCode } from "@/app/shared/errors/AppError";

export class SettingsReadError extends AppError {
  constructor(cause?: unknown) {
    super("Failed to read settings.", AppErrorCode.SettingsReadFailed, cause);
  }
}

export class SettingsWriteError extends AppError {
  constructor(cause?: unknown) {
    super("Failed to write settings.", AppErrorCode.SettingsWriteFailed, cause);
  }
}
