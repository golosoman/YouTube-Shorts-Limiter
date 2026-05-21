export interface PersistedSettingsBucketOutputDto {
  readonly allowedMs: number;
  readonly cooldownMs: number;
}

export interface PersistedSettingsOutputDto {
  readonly shorts: PersistedSettingsBucketOutputDto;
  readonly youtube: PersistedSettingsBucketOutputDto;
}
