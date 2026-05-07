import { AppError, AppErrorCode } from "@/app/shared/errors/AppError";

export class InvalidSettingsError extends AppError {
  constructor(message: string, cause?: unknown) {
    super(message, AppErrorCode.InvalidSettings, cause);
  }
}
