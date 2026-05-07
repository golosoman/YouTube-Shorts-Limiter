import { ActiveTabReadError } from "@/app/interfaces/browser/active-tab/error";
import type { ActiveTab } from "@/app/interfaces/browser/active-tab/interface";
import type { ActiveTabDto } from "@/app/interfaces/browser/active-tab/dto";

export class ChromeActiveTabService implements ActiveTab {
  async getActiveTab(): Promise<ActiveTabDto | null> {
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
