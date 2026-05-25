import type { WatchTabOutputDto } from "./dto";

export interface WatchTabs {
  getWatchTabs(): Promise<readonly WatchTabOutputDto[]>;
}
