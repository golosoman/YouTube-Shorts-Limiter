import { DurationMs } from "@/domain/value-objects/DurationMs";

const INITIAL_ALLOWED_DURATION_MINUTES = 10;
const INITIAL_COOLDOWN_DURATION_MINUTES = 60;
const MIN_ALLOWED_DURATION_MINUTES = 1;
const MAX_ALLOWED_DURATION_MINUTES = 120;
const MIN_COOLDOWN_DURATION_MINUTES = 1;
const MAX_COOLDOWN_DURATION_MINUTES = 1_440;
const TICK_ALARM_PERIOD_SECONDS = 30;

const SUPPORTED_YOUTUBE_HOSTS = ["youtube.com", "www.youtube.com", "m.youtube.com"] as const;
const SHORTS_PATH_PREFIX = "/shorts/";
const BLOCKED_PAGE_PATH = "/blocked.html";
const ORDINARY_YOUTUBE_URL = "https://www.youtube.com/";

export const AlarmName = {
  ShortsLimiterTick: "shorts-limiter.tick",
} as const;

export type AlarmName = (typeof AlarmName)[keyof typeof AlarmName];

export const applicationConfig = {
  policy: {
    initialAllowedDuration: DurationMs.fromMinutes(INITIAL_ALLOWED_DURATION_MINUTES),
    initialCooldownDuration: DurationMs.fromMinutes(INITIAL_COOLDOWN_DURATION_MINUTES),
  },
  constraints: {
    allowedDuration: {
      min: DurationMs.fromMinutes(MIN_ALLOWED_DURATION_MINUTES),
      max: DurationMs.fromMinutes(MAX_ALLOWED_DURATION_MINUTES),
    },
    cooldownDuration: {
      min: DurationMs.fromMinutes(MIN_COOLDOWN_DURATION_MINUTES),
      max: DurationMs.fromMinutes(MAX_COOLDOWN_DURATION_MINUTES),
    },
  },
  urls: {
    supportedYouTubeHosts: SUPPORTED_YOUTUBE_HOSTS,
    shortsPathPrefix: SHORTS_PATH_PREFIX,
  },
  routes: {
    blockedPagePath: BLOCKED_PAGE_PATH,
    ordinaryYouTubeUrl: ORDINARY_YOUTUBE_URL,
  },
  runtime: {
    alarmName: AlarmName.ShortsLimiterTick,
    tickAlarmPeriod: DurationMs.fromSeconds(TICK_ALARM_PERIOD_SECONDS),
  },
} as const;
