import { describe, expect, it } from "vitest";
import { ShortsUrlDetectorService } from "@/app/services/shorts-url-detector/service";

describe("ShortsUrlDetectorService", () => {
  const service = new ShortsUrlDetectorService();

  it("detects supported Shorts URLs", () => {
    expect(service.isShortsUrl("https://www.youtube.com/shorts/abc")).toBe(true);
    expect(service.isShortsUrl("https://youtube.com/shorts/abc")).toBe(true);
    expect(service.isShortsUrl("https://m.youtube.com/shorts/abc")).toBe(true);
  });

  it("rejects ordinary YouTube and unsupported URLs", () => {
    expect(service.isShortsUrl("https://www.youtube.com/watch?v=abc")).toBe(false);
    expect(service.isShortsUrl("https://www.youtube.com/feed/subscriptions")).toBe(false);
    expect(service.isShortsUrl("https://music.youtube.com/shorts/abc")).toBe(false);
    expect(service.isShortsUrl("invalid-url")).toBe(false);
  });
});
