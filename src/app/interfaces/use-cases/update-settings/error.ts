import { AppError, AppErrorCode } from "@/app/shared/errors/AppError";

export class UpdateSettingsError extends AppError {
  constructor(cause?: unknown) {
    super("Failed to update settings.", AppErrorCode.UpdateSettingsFailed, cause);
  }
}
