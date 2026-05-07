import type { UsageState } from "@/domain/entities/UsageState";

export interface UsageAccounting {
  createResetState(): UsageState;
}
