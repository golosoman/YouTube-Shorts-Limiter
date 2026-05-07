export class ShortsUrl {
  private constructor(readonly value: URL) {}

  static parse(rawUrl: string): ShortsUrl | null {
    try {
      return new ShortsUrl(new URL(rawUrl));
    } catch {
      return null;
    }
  }
}
