import type { UsageAccounting } from "@/app/interfaces/services/usage-accounting/interface";
import type { UsageState } from "@/domain/entities/UsageState";
import { DurationMs } from "@/domain/value-objects/DurationMs";

export class UsageAccountingService implements UsageAccounting {
  createResetState(): UsageState {
    return {
      usedMs: DurationMs.zero().value,
      lastTickAtMs: null,
      blockedUntilMs: null,
    };
  }
}
