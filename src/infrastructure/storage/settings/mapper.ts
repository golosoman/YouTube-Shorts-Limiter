import type {
  PersistedSettingsBucketOutputDto,
  PersistedSettingsOutputDto,
} from "@/app/interfaces/storage/settings/dto";
import { config } from "@/config";
import type { WatchPolicy, WatchPolicyBucket } from "@/domain/entities/WatchPolicy";
import { DurationMs } from "@/domain/value-objects/DurationMs";

export function mapPersistedSettings(value: unknown): WatchPolicy {
  if (!isRecord(value)) {
    return createInitialSettings();
  }

  const nestedSettings = mapNestedSettings(value);

  if (nestedSettings !== null) {
    return nestedSettings;
  }

  const legacyBucket = mapSettingsBucket(value);

  if (legacyBucket !== null) {
    return {
      shorts: legacyBucket,
      youtube: createInitialYouTubeSettingsBucket(),
    };
  }

  return createInitialSettings();
}

export function mapSettingsToPersisted(settings: WatchPolicy): PersistedSettingsOutputDto {
  return {
    shorts: mapSettingsBucketToPersisted(settings.shorts),
    youtube: mapSettingsBucketToPersisted(settings.youtube),
  };
}

function mapNestedSettings(value: Record<string, unknown>): WatchPolicy | null {
  const shorts = mapSettingsBucket(value["shorts"]);
  const youtube = mapSettingsBucket(value["youtube"]);

  if (shorts === null || youtube === null) {
    return null;
  }

  return {
    shorts,
    youtube,
  };
}

function mapSettingsBucket(value: unknown): WatchPolicyBucket | null {
  if (!isRecord(value)) {
    return null;
  }

  const allowedMs = value["allowedMs"];
  const cooldownMs = value["cooldownMs"];

  if (!isFiniteNonNegativeNumber(allowedMs) || !isFiniteNonNegativeNumber(cooldownMs)) {
    return null;
  }

  return {
    allowedMs,
    cooldownMs,
  };
}

function mapSettingsBucketToPersisted(
  settings: WatchPolicyBucket,
): PersistedSettingsBucketOutputDto {
  return {
    allowedMs: settings.allowedMs,
    cooldownMs: settings.cooldownMs,
  };
}

function createInitialSettings(): WatchPolicy {
  return {
    shorts: createInitialShortsSettingsBucket(),
    youtube: createInitialYouTubeSettingsBucket(),
  };
}

function createInitialShortsSettingsBucket(): WatchPolicyBucket {
  return {
    allowedMs: config.application.policy.initial.shorts.allowedDuration.value,
    cooldownMs: config.application.policy.initial.shorts.cooldownDuration.value,
  };
}

function createInitialYouTubeSettingsBucket(): WatchPolicyBucket {
  return {
    allowedMs: config.application.policy.initial.youtube.allowedDuration.value,
    cooldownMs: config.application.policy.initial.youtube.cooldownDuration.value,
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isFiniteNonNegativeNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value) && value >= DurationMs.zero().value;
}
