import type { TabBlocker } from "@/app/interfaces/browser/tab-blocker/interface";
import type { WatchTabOutputDto } from "@/app/interfaces/browser/watch-tabs/dto";
import type { WatchTabs } from "@/app/interfaces/browser/watch-tabs/interface";
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
import { BlockReason } from "@/domain/entities/PolicyDecision";
import { WatchScope, type WatchScope as WatchScopeValue } from "@/domain/entities/WatchScope";

interface ClassifiedWatchTab {
  readonly tab: WatchTabOutputDto;
  readonly classification: YouTubeUrlClassification;
}

export class TickActiveTabUseCase implements TickActiveTab {
  constructor(
    private readonly watchTabs: WatchTabs,
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
      const watchTabs = await this.watchTabs.getWatchTabs();
      const usageState = await this.usageStateRepository.get();
      const settings = await this.settingsRepository.get();
      const classifiedTabs = this.classifyTabs(watchTabs);
      const decision = this.watchLimitPolicy.evaluate(
        usageState,
        settings,
        this.clock.nowMs(),
        this.getActiveScopes(classifiedTabs),
      );

      await this.usageStateRepository.save(decision.nextState);

      if (decision.kind === "block") {
        const tabsToBlock = this.getTabsToBlock(classifiedTabs, decision.reasons);

        this.logger.info("Blocking YouTube tab.", {
          reason: decision.reason,
          reasons: decision.reasons,
          tabIds: tabsToBlock.map((tab) => tab.id),
        });
        await Promise.all(tabsToBlock.map((tab) => this.tabBlocker.block(tab.id)));
      }
    } catch (error) {
      throw new TickActiveTabError(error);
    }
  }

  private classifyTabs(tabs: readonly WatchTabOutputDto[]): readonly ClassifiedWatchTab[] {
    return tabs.map((tab) => ({
      tab,
      classification: this.youtubeUrlDetector.classify(tab.url),
    }));
  }

  private getActiveScopes(tabs: readonly ClassifiedWatchTab[]): readonly WatchScopeValue[] {
    const scopes = new Set<WatchScopeValue>();

    for (const tab of tabs) {
      if (!this.isWatchActivity(tab.tab)) {
        continue;
      }

      if (tab.classification.kind === YouTubeUrlKind.Shorts) {
        scopes.add(WatchScope.Shorts);
        scopes.add(WatchScope.YouTube);
      }

      if (tab.classification.kind === YouTubeUrlKind.OrdinaryYouTube) {
        scopes.add(WatchScope.YouTube);
      }
    }

    return [...scopes.values()];
  }

  private getTabsToBlock(
    tabs: readonly ClassifiedWatchTab[],
    reasons: readonly BlockReason[],
  ): readonly WatchTabOutputDto[] {
    return tabs
      .filter((tab) => this.isWatchActivity(tab.tab))
      .filter((tab) => this.shouldBlockTab(tab.classification, reasons))
      .map((tab) => tab.tab);
  }

  private shouldBlockTab(
    classification: YouTubeUrlClassification,
    reasons: readonly BlockReason[],
  ): boolean {
    if (classification.kind === YouTubeUrlKind.Unsupported) {
      return false;
    }

    if (
      reasons.includes(BlockReason.YouTubeCooldownActive) ||
      reasons.includes(BlockReason.YouTubeLimitExceeded)
    ) {
      return true;
    }

    if (
      classification.kind === YouTubeUrlKind.Shorts &&
      (reasons.includes(BlockReason.ShortsCooldownActive) ||
        reasons.includes(BlockReason.ShortsLimitExceeded))
    ) {
      return true;
    }

    return false;
  }

  private isWatchActivity(tab: WatchTabOutputDto): boolean {
    return tab.isActive || tab.isAudible;
  }
}
