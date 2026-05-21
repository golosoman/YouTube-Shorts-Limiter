import type { ActiveTab } from "@/app/interfaces/browser/active-tab/interface";
import type { TabBlocker } from "@/app/interfaces/browser/tab-blocker/interface";
import type { Clock } from "@/app/interfaces/clock/interface";
import type { Logger } from "@/app/interfaces/logger/interface";
import {
  YouTubeUrlKind,
  type YouTubeUrlClassification,
} from "@/app/interfaces/services/youtube-url-detector/dto";
import type { YouTubeUrlDetector } from "@/app/interfaces/services/youtube-url-detector/interface";
import type { WatchLimitPolicy } from "@/app/interfaces/services/watch-limit-policy/interface";
import type { SettingsRepository } from "@/app/interfaces/storage/settings/interface";
import type { UsageStateRepository } from "@/app/interfaces/storage/usage-state/interface";
import { TickActiveTabError } from "@/app/interfaces/use-cases/tick-active-tab/error";
import type { TickActiveTab } from "@/app/interfaces/use-cases/tick-active-tab/interface";
import { WatchScope, type WatchScope as WatchScopeValue } from "@/domain/entities/WatchScope";

export class TickActiveTabUseCase implements TickActiveTab {
  constructor(
    private readonly activeTab: ActiveTab,
    private readonly usageStateRepository: UsageStateRepository,
    private readonly settingsRepository: SettingsRepository,
    private readonly youtubeUrlDetector: YouTubeUrlDetector,
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
      const classification =
        activeTab === null
          ? { kind: YouTubeUrlKind.Unsupported }
          : this.youtubeUrlDetector.classify(activeTab.url);
      const decision = this.watchLimitPolicy.evaluate(
        usageState,
        settings,
        this.clock.nowMs(),
        this.getActiveScopes(classification),
      );

      await this.usageStateRepository.save(decision.nextState);

      if (activeTab !== null && decision.kind === "block") {
        this.logger.info("Blocking YouTube tab.", {
          reason: decision.reason,
          reasons: decision.reasons,
          urlKind: classification.kind,
        });
        await this.tabBlocker.block(activeTab.id);
      }
    } catch (error) {
      throw new TickActiveTabError(error);
    }
  }

  private getActiveScopes(classification: YouTubeUrlClassification): readonly WatchScopeValue[] {
    if (classification.kind === YouTubeUrlKind.Shorts) {
      return [WatchScope.Shorts, WatchScope.YouTube];
    }

    if (classification.kind === YouTubeUrlKind.OrdinaryYouTube) {
      return [WatchScope.YouTube];
    }

    return [];
  }
}
