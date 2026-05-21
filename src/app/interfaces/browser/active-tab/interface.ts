import type { ActiveTabOutputDto } from "./dto";

export interface ActiveTab {
  getActiveTab(): Promise<ActiveTabOutputDto | null>;
}
