import { describe, expect, it } from "vitest";
import { YouTubeUrlKind } from "@/app/interfaces/services/youtube-url-detector/dto";
import { YouTubeUrlDetectorService } from "@/app/services/youtube-url-detector/service";

describe("YouTubeUrlDetectorService", () => {
  const service = new YouTubeUrlDetectorService();

  it("classifies Shorts URLs on supported hosts", () => {
    expect(service.classify("https://www.youtube.com/shorts/abc")).toEqual({
      kind: YouTubeUrlKind.Shorts,
    });
    expect(service.classify("https://youtube.com/shorts/abc")).toEqual({
      kind: YouTubeUrlKind.Shorts,
    });
    expect(service.classify("https://m.youtube.com/shorts/abc")).toEqual({
      kind: YouTubeUrlKind.Shorts,
    });
  });

  it("classifies ordinary YouTube URLs", () => {
    expect(service.classify("https://www.youtube.com/watch?v=abc")).toEqual({
      kind: YouTubeUrlKind.OrdinaryYouTube,
    });
    expect(service.classify("https://www.youtube.com/feed/subscriptions")).toEqual({
      kind: YouTubeUrlKind.OrdinaryYouTube,
    });
    expect(service.classify("https://www.youtube.com/results?search_query=abc")).toEqual({
      kind: YouTubeUrlKind.OrdinaryYouTube,
    });
  });

  it("rejects unsupported URLs", () => {
    expect(service.classify("https://music.youtube.com/shorts/abc")).toEqual({
      kind: YouTubeUrlKind.Unsupported,
    });
    expect(service.classify("invalid-url")).toEqual({ kind: YouTubeUrlKind.Unsupported });
  });
});
