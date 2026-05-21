import { DurationMs } from "@/domain/value-objects/DurationMs";

const MINUTE_FRACTION_DIGITS = 1;

export function formatMinutes(valueMs: number, unitLabel: string): string {
  return `${DurationMs.fromMilliseconds(valueMs).toMinutes().toFixed(MINUTE_FRACTION_DIGITS)} ${unitLabel}`;
}
