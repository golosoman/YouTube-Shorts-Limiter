import type {
  PersistedUsageBucketStateOutputDto,
  PersistedUsageStateOutputDto,
} from "@/app/interfaces/storage/usage-state/dto";
import type { UsageBucketState, UsageState } from "@/domain/entities/UsageState";
import { DurationMs } from "@/domain/value-objects/DurationMs";

export function mapPersistedUsageState(value: unknown): UsageState {
  if (!isRecord(value)) {
    return createInitialUsageState();
  }

  const nestedState = mapNestedUsageState(value);

  if (nestedState !== null) {
    return nestedState;
  }

  const legacyBucket = mapUsageBucket(value);

  if (legacyBucket !== null) {
    return {
      shorts: legacyBucket,
      youtube: createInitialUsageBucket(),
    };
  }

  return createInitialUsageState();
}

export function mapUsageStateToPersisted(state: UsageState): PersistedUsageStateOutputDto {
  return {
    shorts: mapUsageBucketToPersisted(state.shorts),
    youtube: mapUsageBucketToPersisted(state.youtube),
  };
}

function mapNestedUsageState(value: Record<string, unknown>): UsageState | null {
  const shorts = mapUsageBucket(value["shorts"]);
  const youtube = mapUsageBucket(value["youtube"]);

  if (shorts === null || youtube === null) {
    return null;
  }

  return {
    shorts,
    youtube,
  };
}

function mapUsageBucket(value: unknown): UsageBucketState | null {
  if (!isRecord(value)) {
    return null;
  }

  const usedMs = value["usedMs"];
  const lastTickAtMs = value["lastTickAtMs"];
  const blockedUntilMs = value["blockedUntilMs"];

  if (
    !isFiniteNonNegativeNumber(usedMs) ||
    !isNullableFiniteNonNegativeNumber(lastTickAtMs) ||
    !isNullableFiniteNonNegativeNumber(blockedUntilMs)
  ) {
    return null;
  }

  return {
    usedMs,
    lastTickAtMs,
    blockedUntilMs,
  };
}

function mapUsageBucketToPersisted(bucket: UsageBucketState): PersistedUsageBucketStateOutputDto {
  return {
    usedMs: bucket.usedMs,
    lastTickAtMs: bucket.lastTickAtMs,
    blockedUntilMs: bucket.blockedUntilMs,
  };
}

function createInitialUsageState(): UsageState {
  return {
    shorts: createInitialUsageBucket(),
    youtube: createInitialUsageBucket(),
  };
}

function createInitialUsageBucket(): UsageBucketState {
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
