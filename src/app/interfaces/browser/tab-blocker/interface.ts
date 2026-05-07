export interface TabBlocker {
  block(tabId: number): Promise<void>;
}
