import type { ActiveTab } from "@/app/interfaces/browser/active-tab/interface";
import type { TabBlocker } from "@/app/interfaces/browser/tab-blocker/interface";
import type { Clock } from "@/app/interfaces/clock/interface";
import type { Logger } from "@/app/interfaces/logger/interface";
import type { ShortsUrlDetector } from "@/app/interfaces/services/shorts-url-detector/interface";
import type { WatchLimitPolicy } from "@/app/interfaces/services/watch-limit-policy/interface";
import type { SettingsRepository } from "@/app/interfaces/storage/settings/interface";
import type { UsageStateRepository } from "@/app/interfaces/storage/usage-state/interface";
import { TickActiveTabError } from "@/app/interfaces/use-cases/tick-active-tab/error";
import type { TickActiveTab } from "@/app/interfaces/use-cases/tick-active-tab/interface";

export class TickActiveTabUseCase implements TickActiveTab {
  constructor(
    private readonly activeTab: ActiveTab,
    private readonly usageStateRepository: UsageStateRepository,
    private readonly settingsRepository: SettingsRepository,
    private readonly shortsUrlDetector: ShortsUrlDetector,
    private readonly watchLimitPolicy: WatchLimitPolicy,
    private readonly clock: Clock,
    private readonly tabBlocker: TabBlocker,
    private readonly logger: Logger,
  ) {}

  async execute(): Promise<void> {
    try {
      const activeTab = await this.activeTab.getActiveTab();
      const usageState = await this.usageStateRepository.get();
      const settings = await this.settingsRepository.get();

      if (activeTab === null || !this.shortsUrlDetector.isShortsUrl(activeTab.url)) {
        await this.usageStateRepository.save(
          this.watchLimitPolicy.evaluateNotWatchingShorts(usageState),
        );
        return;
      }

      const decision = this.watchLimitPolicy.evaluateWatchingShorts(
        usageState,
        settings,
        this.clock.nowMs(),
      );

      await this.usageStateRepository.save(decision.nextState);

      if (decision.kind === "block") {
        this.logger.info("Blocking YouTube Shorts tab.", { reason: decision.reason });
        await this.tabBlocker.block(activeTab.id);
      }
    } catch (error) {
      throw new TickActiveTabError(error);
    }
  }
}
