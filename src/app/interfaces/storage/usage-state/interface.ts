import type { UsageState } from "@/domain/entities/UsageState";

export interface UsageStateRepository {
  get(): Promise<UsageState>;
  save(state: UsageState): Promise<void>;
}
