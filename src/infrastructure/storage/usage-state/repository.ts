import {
  UsageStateReadError,
  UsageStateWriteError,
} from "@/app/interfaces/storage/usage-state/error";
import type { UsageStateRepository } from "@/app/interfaces/storage/usage-state/interface";
import { config } from "@/config";
import type { UsageState } from "@/domain/entities/UsageState";
import { mapPersistedUsageState, mapUsageStateToPersisted } from "./mapper";

export class ChromeUsageStateRepository implements UsageStateRepository {
  async get(): Promise<UsageState> {
    try {
      const items: unknown = await chrome.storage.local.get(config.storage.keys.usageState);
      return mapPersistedUsageState(readStorageValue(items, config.storage.keys.usageState));
    } catch (error) {
      throw new UsageStateReadError(error);
    }
  }

  async save(state: UsageState): Promise<void> {
    try {
      await chrome.storage.local.set({
        [config.storage.keys.usageState]: mapUsageStateToPersisted(state),
      });
    } catch (error) {
      throw new UsageStateWriteError(error);
    }
  }
}

function readStorageValue(items: unknown, key: string): unknown {
  if (typeof items !== "object" || items === null) {
    return undefined;
  }

  return (items as Record<string, unknown>)[key];
}
