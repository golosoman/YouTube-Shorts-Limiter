import type { Clock } from "@/app/interfaces/clock/interface";
import type { SettingsRepository } from "@/app/interfaces/storage/settings/interface";
import type { UsageStateRepository } from "@/app/interfaces/storage/usage-state/interface";
import type { GetStatusResultDto } from "@/app/interfaces/use-cases/get-status/dto";
import type { GetStatus } from "@/app/interfaces/use-cases/get-status/interface";
import { DurationMs } from "@/domain/value-objects/DurationMs";

export class GetStatusUseCase implements GetStatus {
  constructor(
    private readonly usageStateRepository: UsageStateRepository,
    private readonly settingsRepository: SettingsRepository,
    private readonly clock: Clock,
  ) {}

  async execute(): Promise<GetStatusResultDto> {
    const usageState = await this.usageStateRepository.get();
    const settings = await this.settingsRepository.get();
    const nowMs = this.clock.nowMs();
    const zeroMs = DurationMs.zero().value;
    const remainingMs = Math.max(zeroMs, settings.allowedMs - usageState.usedMs);
    const cooldownRemainingMs =
      usageState.blockedUntilMs === null
        ? zeroMs
        : Math.max(zeroMs, usageState.blockedUntilMs - nowMs);

    return {
      usedMs: usageState.usedMs,
      allowedMs: settings.allowedMs,
      cooldownMs: settings.cooldownMs,
      allowedMinutes: DurationMs.fromMilliseconds(settings.allowedMs).toMinutes(),
      cooldownMinutes: DurationMs.fromMilliseconds(settings.cooldownMs).toMinutes(),
      remainingMs,
      isBlocked: cooldownRemainingMs > zeroMs,
      blockedUntilMs: usageState.blockedUntilMs,
      cooldownRemainingMs,
    };
  }
}
