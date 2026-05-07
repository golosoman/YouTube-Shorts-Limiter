import { HandleNavigationError } from "@/app/interfaces/use-cases/handle-navigation/error";
import type { HandleNavigationInputDto } from "@/app/interfaces/use-cases/handle-navigation/dto";
import type { HandleNavigation } from "@/app/interfaces/use-cases/handle-navigation/interface";
import type { TickActiveTab } from "@/app/interfaces/use-cases/tick-active-tab/interface";

export class HandleNavigationUseCase implements HandleNavigation {
  constructor(private readonly tickActiveTab: TickActiveTab) {}

  async execute(input: HandleNavigationInputDto): Promise<void> {
    try {
      if (input.url === undefined && input.tabId === undefined) {
        await this.tickActiveTab.execute();
        return;
      }

      await this.tickActiveTab.execute();
    } catch (error) {
      throw new HandleNavigationError(error);
    }
  }
}
