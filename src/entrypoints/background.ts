import { handleError } from "@/app/shared/handlers/handleError";
import {
  NavigationEventSource,
  type HandleNavigationInputDto,
} from "@/app/interfaces/use-cases/handle-navigation/dto";
import { config } from "@/config";
import { createAppContainer, type AppContainer } from "@/composition/createAppContainer";
import { defineBackground } from "wxt/utils/define-background";

const TOP_FRAME_ID = 0;
const ALARM_ERROR_MESSAGE = "Failed to ensure Shorts limiter alarm.";
const TICK_ERROR_MESSAGE = "Failed to execute Shorts limiter tick.";
const NAVIGATION_ERROR_MESSAGE = "Failed to process Shorts navigation event.";

export default defineBackground(() => {
  const app = createAppContainer();

  void ensureTickAlarm(app);

  chrome.runtime.onInstalled.addListener(() => {
    void ensureTickAlarm(app);
  });

  chrome.alarms.onAlarm.addListener((alarm) => {
    if (alarm.name !== config.application.runtime.alarmName) {
      return;
    }

    void app.tickActiveTab.execute().catch((error: unknown) => {
      handleError(app.logger, TICK_ERROR_MESSAGE, error);
    });
  });

  chrome.tabs.onUpdated.addListener((tabId, changeInfo) => {
    if (changeInfo.url === undefined) {
      return;
    }

    void handleNavigation(app, {
      tabId,
      url: changeInfo.url,
      eventSource: NavigationEventSource.TabsOnUpdated,
    });
  });

  chrome.webNavigation.onHistoryStateUpdated.addListener((details) => {
    if (details.frameId !== TOP_FRAME_ID) {
      return;
    }

    void handleNavigation(app, {
      tabId: details.tabId,
      url: details.url,
      eventSource: NavigationEventSource.WebNavigationHistoryStateUpdated,
    });
  });
});

async function ensureTickAlarm(app: AppContainer): Promise<void> {
  try {
    const alarm = await chrome.alarms.get(config.application.runtime.alarmName);

    if (alarm === undefined) {
      await chrome.alarms.create(config.application.runtime.alarmName, {
        periodInMinutes: config.application.runtime.tickAlarmPeriod.toMinutes(),
      });
    }
  } catch (error) {
    handleError(app.logger, ALARM_ERROR_MESSAGE, error);
  }
}

async function handleNavigation(app: AppContainer, input: HandleNavigationInputDto): Promise<void> {
  try {
    await app.handleNavigation.execute(input);
  } catch (error) {
    handleError(app.logger, NAVIGATION_ERROR_MESSAGE, error);
  }
}
