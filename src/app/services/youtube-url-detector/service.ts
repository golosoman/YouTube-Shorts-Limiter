import {
  YouTubeUrlKind,
  type YouTubeUrlClassification,
} from "@/app/interfaces/services/youtube-url-detector/dto";
import type { YouTubeUrlDetector } from "@/app/interfaces/services/youtube-url-detector/interface";
import { config } from "@/config";
import { ShortsUrl } from "@/domain/value-objects/ShortsUrl";

export class YouTubeUrlDetectorService implements YouTubeUrlDetector {
  classify(rawUrl: string): YouTubeUrlClassification {
    const parsedUrl = ShortsUrl.parse(rawUrl);

    if (parsedUrl === null || !this.isSupportedHost(parsedUrl.value.hostname)) {
      return { kind: YouTubeUrlKind.Unsupported };
    }

    if (parsedUrl.value.pathname.startsWith(config.application.urls.shortsPathPrefix)) {
      return { kind: YouTubeUrlKind.Shorts };
    }

    return { kind: YouTubeUrlKind.OrdinaryYouTube };
  }

  private isSupportedHost(hostname: string): boolean {
    return config.application.urls.supportedYouTubeHosts.some((host) => host === hostname);
  }
}
