import {
  ActiveBlockKind,
  type GetStatusOutputDto,
  type ScopeStatusOutputDto,
} from "@/app/interfaces/use-cases/get-status/dto";
import { config } from "@/config";
import { formatMinutes } from "@/presentation/shared/formatDuration";
import { calculateProgressPercent } from "@/presentation/shared/progress";

const MINUTE_UNIT_LABEL = "min";

export const PopupScopeId = {
  Shorts: "shorts",
  YouTube: "youtube",
} as const;

export type PopupScopeId = (typeof PopupScopeId)[keyof typeof PopupScopeId];

export const PopupStatusTone = {
  Ready: "ready",
  Warning: "warning",
  Blocked: "blocked",
} as const;

export type PopupStatusTone = (typeof PopupStatusTone)[keyof typeof PopupStatusTone];

export interface PopupScopeViewModel {
  readonly id: PopupScopeId;
  readonly title: string;
  readonly description: string;
  readonly usedText: string;
  readonly remainingText: string;
  readonly cooldownText: string;
  readonly progressValue: number;
  readonly isBlocked: boolean;
}

export interface PopupViewModel {
  readonly statusLabel: string;
  readonly statusTone: PopupStatusTone;
  readonly shorts: PopupScopeViewModel;
  readonly youtube: PopupScopeViewModel;
  readonly settings: PopupSettingsValuesViewModel;
}

export interface PopupSettingsValuesViewModel {
  readonly shortsAllowedMinutes: string;
  readonly shortsCooldownMinutes: string;
  readonly youtubeAllowedMinutes: string;
  readonly youtubeCooldownMinutes: string;
}

export interface PopupSettingsConstraintsViewModel {
  readonly shortsAllowedMinutes: InputConstraintsViewModel;
  readonly shortsCooldownMinutes: InputConstraintsViewModel;
  readonly youtubeAllowedMinutes: InputConstraintsViewModel;
  readonly youtubeCooldownMinutes: InputConstraintsViewModel;
}

export interface InputConstraintsViewModel {
  readonly min: string;
  readonly max: string;
  readonly step: string;
}

export function createPopupViewModel(status: GetStatusOutputDto): PopupViewModel {
  return {
    statusLabel: createStatusLabel(status.activeBlock.kind),
    statusTone: createStatusTone(status.activeBlock.kind),
    shorts: createScopeViewModel(PopupScopeId.Shorts, status.shorts),
    youtube: createScopeViewModel(PopupScopeId.YouTube, status.youtube),
    settings: {
      shortsAllowedMinutes: String(status.shorts.allowedMinutes),
      shortsCooldownMinutes: String(status.shorts.cooldownMinutes),
      youtubeAllowedMinutes: String(status.youtube.allowedMinutes),
      youtubeCooldownMinutes: String(status.youtube.cooldownMinutes),
    },
  };
}

export function createPopupSettingsConstraintsViewModel(): PopupSettingsConstraintsViewModel {
  return {
    shortsAllowedMinutes: {
      min: String(config.validation.settings.shorts.allowedDuration.min.toMinutes()),
      max: String(config.validation.settings.shorts.allowedDuration.max.toMinutes()),
      step: String(config.application.constraints.shorts.allowedDuration.min.toMinutes()),
    },
    shortsCooldownMinutes: {
      min: String(config.validation.settings.shorts.cooldownDuration.min.toMinutes()),
      max: String(config.validation.settings.shorts.cooldownDuration.max.toMinutes()),
      step: String(config.application.constraints.shorts.cooldownDuration.min.toMinutes()),
    },
    youtubeAllowedMinutes: {
      min: String(config.validation.settings.youtube.allowedDuration.min.toMinutes()),
      max: String(config.validation.settings.youtube.allowedDuration.max.toMinutes()),
      step: String(config.application.constraints.youtube.allowedDuration.min.toMinutes()),
    },
    youtubeCooldownMinutes: {
      min: String(config.validation.settings.youtube.cooldownDuration.min.toMinutes()),
      max: String(config.validation.settings.youtube.cooldownDuration.max.toMinutes()),
      step: String(config.application.constraints.youtube.cooldownDuration.min.toMinutes()),
    },
  };
}

function createScopeViewModel(id: PopupScopeId, status: ScopeStatusOutputDto): PopupScopeViewModel {
  return {
    id,
    title: id === PopupScopeId.Shorts ? "Shorts" : "YouTube",
    description:
      id === PopupScopeId.Shorts
        ? "Counts toward both budgets"
        : "Videos, feed, search, and Shorts",
    usedText: formatMinutes(status.usedMs, MINUTE_UNIT_LABEL),
    remainingText: formatMinutes(status.remainingMs, MINUTE_UNIT_LABEL),
    cooldownText: status.isBlocked
      ? formatMinutes(status.cooldownRemainingMs, MINUTE_UNIT_LABEL)
      : "Ready",
    progressValue: calculateProgressPercent(status.usedMs, status.allowedMs),
    isBlocked: status.isBlocked,
  };
}

function createStatusLabel(kind: ActiveBlockKind): string {
  if (kind === ActiveBlockKind.YouTube) {
    return "YouTube cooling down";
  }

  if (kind === ActiveBlockKind.Shorts) {
    return "Shorts cooling down";
  }

  return "Ready";
}

function createStatusTone(kind: ActiveBlockKind): PopupStatusTone {
  if (kind === ActiveBlockKind.YouTube) {
    return PopupStatusTone.Blocked;
  }

  if (kind === ActiveBlockKind.Shorts) {
    return PopupStatusTone.Warning;
  }

  return PopupStatusTone.Ready;
}
