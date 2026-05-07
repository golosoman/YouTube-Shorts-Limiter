import type { ActiveTabDto } from "./dto";

export interface ActiveTab {
  getActiveTab(): Promise<ActiveTabDto | null>;
}
