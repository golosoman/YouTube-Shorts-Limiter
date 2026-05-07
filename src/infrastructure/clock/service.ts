import type { Clock } from "@/app/interfaces/clock/interface";

export class SystemClockService implements Clock {
  nowMs(): number {
    return Date.now();
  }
}
