import type { YouTubeUrlClassification } from "./dto";

export interface YouTubeUrlDetector {
  classify(rawUrl: string): YouTubeUrlClassification;
}
