import { SettingsReadError, SettingsWriteError } from "@/app/interfaces/storage/settings/error";
import type { SettingsRepository } from "@/app/interfaces/storage/settings/interface";
import { config } from "@/config";
import type { WatchPolicy } from "@/domain/entities/WatchPolicy";
import { mapPersistedSettings, mapSettingsToPersisted } from "./mapper";

export class ChromeSettingsRepository implements SettingsRepository {
  async get(): Promise<WatchPolicy> {
    try {
      const items: unknown = await chrome.storage.local.get(config.storage.keys.settings);
      return mapPersistedSettings(readStorageValue(items, config.storage.keys.settings));
    } catch (error) {
      throw new SettingsReadError(error);
    }
  }

  async save(settings: WatchPolicy): Promise<void> {
    try {
      await chrome.storage.local.set({
        [config.storage.keys.settings]: mapSettingsToPersisted(settings),
      });
    } catch (error) {
      throw new SettingsWriteError(error);
    }
  }
}

function readStorageValue(items: unknown, key: string): unknown {
  if (typeof items !== "object" || items === null) {
    return undefined;
  }

  return (items as Record<string, unknown>)[key];
}
