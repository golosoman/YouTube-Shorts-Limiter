const MILLISECONDS_PER_SECOND = 1_000;
const SECONDS_PER_MINUTE = 60;
const MILLISECONDS_PER_MINUTE = SECONDS_PER_MINUTE * MILLISECONDS_PER_SECOND;

export class DurationMs {
  private constructor(readonly value: number) {
    DurationMs.assertValid(value);
  }

  static zero(): DurationMs {
    return new DurationMs(0);
  }

  static fromMilliseconds(value: number): DurationMs {
    return new DurationMs(value);
  }

  static fromSeconds(value: number): DurationMs {
    return new DurationMs(value * MILLISECONDS_PER_SECOND);
  }

  static fromMinutes(value: number): DurationMs {
    return new DurationMs(value * MILLISECONDS_PER_MINUTE);
  }

  toMinutes(): number {
    return this.value / MILLISECONDS_PER_MINUTE;
  }

  private static assertValid(value: number): void {
    if (!Number.isFinite(value) || value < 0) {
      throw new RangeError("DurationMs must be a finite non-negative number.");
    }
  }
}
