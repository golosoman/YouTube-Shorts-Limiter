import type { HandleNavigationInputDto } from "./dto";

export interface HandleNavigation {
  execute(input: HandleNavigationInputDto): Promise<void>;
}
