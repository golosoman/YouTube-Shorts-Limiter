export const YouTubeUrlKind = {
  Unsupported: "unsupported",
  OrdinaryYouTube: "ordinary-youtube",
  Shorts: "shorts",
} as const;

export type YouTubeUrlKind = (typeof YouTubeUrlKind)[keyof typeof YouTubeUrlKind];

export interface YouTubeUrlClassification {
  readonly kind: YouTubeUrlKind;
}
