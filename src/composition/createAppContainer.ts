import type { ActiveTab } from "@/app/interfaces/browser/active-tab/interface";
import type { TabBlocker } from "@/app/interfaces/browser/tab-blocker/interface";
import type { Clock } from "@/app/interfaces/clock/interface";
import type { Logger } from "@/app/interfaces/logger/interface";
import type { ShortsUrlDetector } from "@/app/interfaces/services/shorts-url-detector/interface";
import type { UsageAccounting } from "@/app/interfaces/services/usage-accounting/interface";
import type { WatchLimitPolicy } from "@/app/interfaces/services/watch-limit-policy/interface";
import type { SettingsRepository } from "@/app/interfaces/storage/settings/interface";
import type { UsageStateRepository } from "@/app/interfaces/storage/usage-state/interface";
import type { GetStatus } from "@/app/interfaces/use-cases/get-status/interface";
import type { HandleNavigation } from "@/app/interfaces/use-cases/handle-navigation/interface";
import type { ResetUsage } from "@/app/interfaces/use-cases/reset-usage/interface";
import type { TickActiveTab } from "@/app/interfaces/use-cases/tick-active-tab/interface";
import type { UpdateSettings } from "@/app/interfaces/use-cases/update-settings/interface";
import { SettingsValidatorService } from "@/app/services/settings-validator/service";
import { ShortsUrlDetectorService } from "@/app/services/shorts-url-detector/service";
import { UsageAccountingService } from "@/app/services/usage-accounting/service";
import { WatchLimitPolicyService } from "@/app/services/watch-limit-policy/service";
import { GetStatusUseCase } from "@/app/use-cases/get-status/usecase";
import { HandleNavigationUseCase } from "@/app/use-cases/handle-navigation/usecase";
import { ResetUsageUseCase } from "@/app/use-cases/reset-usage/usecase";
import { TickActiveTabUseCase } from "@/app/use-cases/tick-active-tab/usecase";
import { UpdateSettingsUseCase } from "@/app/use-cases/update-settings/usecase";
import { ChromeActiveTabService } from "@/infrastructure/browser/active-tab/service";
import { ChromeTabBlockerService } from "@/infrastructure/browser/tab-blocker/service";
import { SystemClockService } from "@/infrastructure/clock/service";
import { ConsoleLoggerService } from "@/infrastructure/logger/service";
import { ChromeSettingsRepository } from "@/infrastructure/storage/settings/repository";
import { ChromeUsageStateRepository } from "@/infrastructure/storage/usage-state/repository";

export interface AppContainer {
  readonly tickActiveTab: TickActiveTab;
  readonly handleNavigation: HandleNavigation;
  readonly getStatus: GetStatus;
  readonly resetUsage: ResetUsage;
  readonly updateSettings: UpdateSettings;
  readonly logger: Logger;
}

export function createAppContainer(): AppContainer {
  const activeTab: ActiveTab = new ChromeActiveTabService();
  const tabBlocker: TabBlocker = new ChromeTabBlockerService();
  const usageStateRepository: UsageStateRepository = new ChromeUsageStateRepository();
  const settingsRepository: SettingsRepository = new ChromeSettingsRepository();
  const shortsUrlDetector: ShortsUrlDetector = new ShortsUrlDetectorService();
  const watchLimitPolicy: WatchLimitPolicy = new WatchLimitPolicyService();
  const usageAccounting: UsageAccounting = new UsageAccountingService();
  const settingsValidator = new SettingsValidatorService();
  const clock: Clock = new SystemClockService();
  const logger: Logger = new ConsoleLoggerService();

  const tickActiveTab = new TickActiveTabUseCase(
    activeTab,
    usageStateRepository,
    settingsRepository,
    shortsUrlDetector,
    watchLimitPolicy,
    clock,
    tabBlocker,
    logger,
  );

  return {
    tickActiveTab,
    handleNavigation: new HandleNavigationUseCase(tickActiveTab),
    getStatus: new GetStatusUseCase(usageStateRepository, settingsRepository, clock),
    resetUsage: new ResetUsageUseCase(usageStateRepository, usageAccounting),
    updateSettings: new UpdateSettingsUseCase(settingsRepository, settingsValidator),
    logger,
  };
}
