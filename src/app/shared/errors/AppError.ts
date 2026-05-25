export const AppErrorCode = {
  ActiveTabReadFailed: "active-tab.read-failed",
  WatchTabsReadFailed: "watch-tabs.read-failed",
  TabBlockFailed: "tab-block.failed",
  UsageStateReadFailed: "usage-state.read-failed",
  UsageStateWriteFailed: "usage-state.write-failed",
  SettingsReadFailed: "settings.read-failed",
  SettingsWriteFailed: "settings.write-failed",
  TickActiveTabFailed: "tick-active-tab.failed",
  HandleNavigationFailed: "handle-navigation.failed",
  ResetUsageFailed: "reset-usage.failed",
  InvalidSettings: "settings.invalid",
  UpdateSettingsFailed: "update-settings.failed",
} as const;

export type AppErrorCode = (typeof AppErrorCode)[keyof typeof AppErrorCode];

export abstract class AppError extends Error {
  readonly code: AppErrorCode;

  override readonly cause?: unknown;

  protected constructor(message: string, code: AppErrorCode, cause?: unknown) {
    super(message);
    this.name = new.target.name;
    this.code = code;

    if (cause !== undefined) {
      this.cause = cause;
    }
  }
}
