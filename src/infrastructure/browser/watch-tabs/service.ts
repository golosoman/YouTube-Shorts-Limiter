import { WatchTabsReadError } from "@/app/interfaces/browser/watch-tabs/error";
import type { WatchTabOutputDto } from "@/app/interfaces/browser/watch-tabs/dto";
import type { WatchTabs } from "@/app/interfaces/browser/watch-tabs/interface";

export class ChromeWatchTabsService implements WatchTabs {
  async getWatchTabs(): Promise<readonly WatchTabOutputDto[]> {
    try {
      const [activeTabs, audibleTabs] = await Promise.all([
        chrome.tabs.query({ active: true, currentWindow: true }),
        chrome.tabs.query({ audible: true }),
      ]);

      return this.mapTabs([...activeTabs, ...audibleTabs]);
    } catch (error) {
      throw new WatchTabsReadError(error);
    }
  }

  private mapTabs(tabs: readonly chrome.tabs.Tab[]): readonly WatchTabOutputDto[] {
    const mappedTabs = new Map<number, WatchTabOutputDto>();

    for (const tab of tabs) {
      if (tab.id === undefined || tab.url === undefined) {
        continue;
      }

      mappedTabs.set(tab.id, {
        id: tab.id,
        url: tab.url,
        isActive: tab.active,
        isAudible: tab.audible === true,
      });
    }

    return [...mappedTabs.values()];
  }
}
