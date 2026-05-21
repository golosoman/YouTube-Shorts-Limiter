import {
  ActiveBlockKind,
  type GetStatusOutputDto,
} from "@/app/interfaces/use-cases/get-status/dto";
import { config } from "@/config";
import { formatMinutes } from "@/presentation/shared/formatDuration";

const MINUTE_UNIT_LABEL = "min";

export const BlockedPageTone = {
  Ready: "ready",
  Shorts: "shorts",
  YouTube: "youtube",
} as const;

export type BlockedPageTone = (typeof BlockedPageTone)[keyof typeof BlockedPageTone];

export interface BlockedPageViewModel {
  readonly title: string;
  readonly description: string;
  readonly cooldownText: string;
  readonly tone: BlockedPageTone;
  readonly showOrdinaryYouTubeLink: boolean;
  readonly ordinaryYouTubeUrl: string;
}

export function createBlockedPageViewModel(status: GetStatusOutputDto): BlockedPageViewModel {
  if (status.activeBlock.kind === ActiveBlockKind.YouTube) {
    return {
      title: "YouTube is cooling down",
      description: "Your full YouTube budget is paused until the cooldown finishes.",
      cooldownText: createCooldownText(status.activeBlock.cooldownRemainingMs),
      tone: BlockedPageTone.YouTube,
      showOrdinaryYouTubeLink: false,
      ordinaryYouTubeUrl: config.application.routes.ordinaryYouTubeUrl,
    };
  }

  if (status.activeBlock.kind === ActiveBlockKind.Shorts) {
    return {
      title: "Shorts are blocked for now",
      description: "Regular YouTube is still available while the Shorts cooldown runs.",
      cooldownText: createCooldownText(status.activeBlock.cooldownRemainingMs),
      tone: BlockedPageTone.Shorts,
      showOrdinaryYouTubeLink: true,
      ordinaryYouTubeUrl: config.application.routes.ordinaryYouTubeUrl,
    };
  }

  return {
    title: "Cooldown finished",
    description: "You can return to YouTube now.",
    cooldownText: "Ready",
    tone: BlockedPageTone.Ready,
    showOrdinaryYouTubeLink: true,
    ordinaryYouTubeUrl: config.application.routes.ordinaryYouTubeUrl,
  };
}

export function createBlockedPageFallbackViewModel(): BlockedPageViewModel {
  return {
    title: "YouTube is temporarily blocked",
    description: "The extension could not load the current cooldown status.",
    cooldownText: "Try again later.",
    tone: BlockedPageTone.YouTube,
    showOrdinaryYouTubeLink: false,
    ordinaryYouTubeUrl: config.application.routes.ordinaryYouTubeUrl,
  };
}

function createCooldownText(cooldownRemainingMs: number): string {
  return `Available in ${formatMinutes(cooldownRemainingMs, MINUTE_UNIT_LABEL)}`;
}
