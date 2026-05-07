import type { PersistedUsageStateDto } from "@/app/interfaces/storage/usage-state/dto";
import type { UsageState } from "@/domain/entities/UsageState";
import { DurationMs } from "@/domain/value-objects/DurationMs";

export function mapPersistedUsageState(value: unknown): UsageState {
  if (!isRecord(value)) {
    return createInitialUsageState();
  }

  const usedMs = value["usedMs"];
  const lastTickAtMs = value["lastTickAtMs"];
  const blockedUntilMs = value["blockedUntilMs"];

  if (
    !isFiniteNonNegativeNumber(usedMs) ||
    !isNullableFiniteNonNegativeNumber(lastTickAtMs) ||
    !isNullableFiniteNonNegativeNumber(blockedUntilMs)
  ) {
    return createInitialUsageState();
  }

  return {
    usedMs,
    lastTickAtMs,
    blockedUntilMs,
  };
}

export function mapUsageStateToPersisted(state: UsageState): PersistedUsageStateDto {
  return {
    usedMs: state.usedMs,
    lastTickAtMs: state.lastTickAtMs,
    blockedUntilMs: state.blockedUntilMs,
  };
}

function createInitialUsageState(): UsageState {
  return {
    usedMs: DurationMs.zero().value,
    lastTickAtMs: null,
    blockedUntilMs: null,
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isNullableFiniteNonNegativeNumber(value: unknown): value is number | null {
  return value === null || isFiniteNonNegativeNumber(value);
}

function isFiniteNonNegativeNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value) && value >= DurationMs.zero().value;
}
