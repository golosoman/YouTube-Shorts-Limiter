export class TimestampMs {
  private constructor(readonly value: number) {
    TimestampMs.assertValid(value);
  }

  static fromMilliseconds(value: number): TimestampMs {
    return new TimestampMs(value);
  }

  private static assertValid(value: number): void {
    if (!Number.isFinite(value) || value < 0) {
      throw new RangeError("TimestampMs must be a finite non-negative number.");
    }
  }
}
