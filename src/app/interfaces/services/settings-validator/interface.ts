import type { WatchPolicy } from "@/domain/entities/WatchPolicy";

export interface SettingsValidator {
  validate(settings: WatchPolicy): WatchPolicy;
}
