import type { WatchPolicy } from "@/domain/entities/WatchPolicy";

export interface SettingsRepository {
  get(): Promise<WatchPolicy>;
  save(settings: WatchPolicy): Promise<void>;
}
