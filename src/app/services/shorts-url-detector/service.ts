import type { ShortsUrlDetector } from "@/app/interfaces/services/shorts-url-detector/interface";
import { config } from "@/config";
import { ShortsUrl } from "@/domain/value-objects/ShortsUrl";

export class ShortsUrlDetectorService implements ShortsUrlDetector {
  isShortsUrl(rawUrl: string): boolean {
    const shortsUrl = ShortsUrl.parse(rawUrl);

    if (shortsUrl === null) {
      return false;
    }

    const isSupportedHost = config.application.urls.supportedYouTubeHosts.some(
      (host) => host === shortsUrl.value.hostname,
    );

    return (
      isSupportedHost &&
      shortsUrl.value.pathname.startsWith(config.application.urls.shortsPathPrefix)
    );
  }
}
