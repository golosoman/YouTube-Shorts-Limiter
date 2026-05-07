export const NavigationEventSource = {
  TabsOnUpdated: "tabs.onUpdated",
  WebNavigationHistoryStateUpdated: "webNavigation.onHistoryStateUpdated",
} as const;

export type NavigationEventSource =
  (typeof NavigationEventSource)[keyof typeof NavigationEventSource];

export interface HandleNavigationInputDto {
  readonly tabId?: number;
  readonly url?: string;
  readonly eventSource: NavigationEventSource;
}
