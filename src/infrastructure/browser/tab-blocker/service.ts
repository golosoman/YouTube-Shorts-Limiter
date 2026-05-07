import { TabBlockError } from "@/app/interfaces/browser/tab-blocker/error";
import type { TabBlocker } from "@/app/interfaces/browser/tab-blocker/interface";
import { config } from "@/config";

export class ChromeTabBlockerService implements TabBlocker {
  async block(tabId: number): Promise<void> {
    try {
      await chrome.tabs.update(tabId, {
        url: chrome.runtime.getURL(config.application.routes.blockedPagePath),
      });
    } catch (error) {
      throw new TabBlockError(error);
    }
  }
}
