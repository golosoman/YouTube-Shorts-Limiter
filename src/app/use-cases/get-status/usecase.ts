import type { Clock } from "@/app/interfaces/clock/interface";
import type { SettingsRepository } from "@/app/interfaces/storage/settings/interface";
import type { UsageStateRepository } from "@/app/interfaces/storage/usage-state/interface";
import {
  ActiveBlockKind,
  type ActiveBlockOutputDto,
  type GetStatusOutputDto,
  type ScopeStatusOutputDto,
} from "@/app/interfaces/use-cases/get-status/dto";
import type { GetStatus } from "@/app/interfaces/use-cases/get-status/interface";
import type { UsageBucketState } from "@/domain/entities/UsageState";
import type { WatchPolicyBucket } from "@/domain/entities/WatchPolicy";
import { WatchScope, type WatchScope as WatchScopeValue } from "@/domain/entities/WatchScope";
import { DurationMs } from "@/domain/value-objects/DurationMs";

export class GetStatusUseCase implements GetStatus {
  constructor(
    private readonly usageStateRepository: UsageStateRepository,
    private readonly settingsRepository: SettingsRepository,
    private readonly clock: Clock,
  ) {}

  async execute(): Promise<GetStatusOutputDto> {
    const usageState = await this.usageStateRepository.get();
    const settings = await this.settingsRepository.get();
    const nowMs = this.clock.nowMs();
    const shorts = this.createScopeStatus(
      WatchScope.Shorts,
      usageState.shorts,
      settings.shorts,
      nowMs,
    );
    const youtube = this.createScopeStatus(
      WatchScope.YouTube,
      usageState.youtube,
      settings.youtube,
      nowMs,
    );

    return {
      shorts,
      youtube,
      activeBlock: this.createActiveBlock(shorts, youtube),
    };
  }

  private createScopeStatus(
    scope: WatchScopeValue,
    usageBucket: UsageBucketState,
    policyBucket: WatchPolicyBucket,
    nowMs: number,
  ): ScopeStatusOutputDto {
    const zeroMs = DurationMs.zero().value;
    const remainingMs = Math.max(zeroMs, policyBucket.allowedMs - usageBucket.usedMs);
    const cooldownRemainingMs =
      usageBucket.blockedUntilMs === null
        ? zeroMs
        : Math.max(zeroMs, usageBucket.blockedUntilMs - nowMs);

    return {
      scope,
      usedMs: usageBucket.usedMs,
      allowedMs: policyBucket.allowedMs,
      cooldownMs: policyBucket.cooldownMs,
      allowedMinutes: DurationMs.fromMilliseconds(policyBucket.allowedMs).toMinutes(),
      cooldownMinutes: DurationMs.fromMilliseconds(policyBucket.cooldownMs).toMinutes(),
      remainingMs,
      isBlocked: cooldownRemainingMs > zeroMs,
      blockedUntilMs: usageBucket.blockedUntilMs,
      cooldownRemainingMs,
    };
  }

  private createActiveBlock(
    shorts: ScopeStatusOutputDto,
    youtube: ScopeStatusOutputDto,
  ): ActiveBlockOutputDto {
    if (youtube.isBlocked) {
      return {
        kind: ActiveBlockKind.YouTube,
        scope: WatchScope.YouTube,
        blockedUntilMs: youtube.blockedUntilMs,
        cooldownRemainingMs: youtube.cooldownRemainingMs,
      };
    }

    if (shorts.isBlocked) {
      return {
        kind: ActiveBlockKind.Shorts,
        scope: WatchScope.Shorts,
        blockedUntilMs: shorts.blockedUntilMs,
        cooldownRemainingMs: shorts.cooldownRemainingMs,
      };
    }

    return {
      kind: ActiveBlockKind.None,
    };
  }
}
