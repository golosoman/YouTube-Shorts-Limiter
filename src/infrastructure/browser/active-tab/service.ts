import { ActiveTabReadError } from "@/app/interfaces/browser/active-tab/error";
import type { ActiveTabOutputDto } from "@/app/interfaces/browser/active-tab/dto";
import type { ActiveTab } from "@/app/interfaces/browser/active-tab/interface";

export class ChromeActiveTabService implements ActiveTab {
  async getActiveTab(): Promise<ActiveTabOutputDto | null> {
    try {
      const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
      const tab = tabs[0];

      if (tab?.id === undefined || tab.url === undefined) {
        return null;
      }

      return {
        id: tab.id,
        url: tab.url,
      };
    } catch (error) {
      throw new ActiveTabReadError(error);
    }
  }
}
