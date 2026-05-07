import type { UpdateSettingsInputDto } from "./dto";

export interface UpdateSettings {
  execute(input: UpdateSettingsInputDto): Promise<void>;
}
