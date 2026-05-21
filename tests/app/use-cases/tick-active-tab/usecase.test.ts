import { describe, expect, it } from "vitest";
import type { ActiveTabOutputDto } from "@/app/interfaces/browser/active-tab/dto";
import type { ActiveTab } from "@/app/interfaces/browser/active-tab/interface";
import type { TabBlocker } from "@/app/interfaces/browser/tab-blocker/interface";
import type { Clock } from "@/app/interfaces/clock/interface";
import type { Logger } from "@/app/interfaces/logger/interface";
import type { SettingsRepository } from "@/app/interfaces/storage/settings/interface";
import type { UsageStateRepository } from "@/app/interfaces/storage/usage-state/interface";
import { TickActiveTabError } from "@/app/interfaces/use-cases/tick-active-tab/error";
import { WatchLimitPolicyService } from "@/app/services/watch-limit-policy/service";
import { YouTubeUrlDetectorService } from "@/app/services/youtube-url-detector/service";
import { TickActiveTabUseCase } from "@/app/use-cases/tick-active-tab/usecase";
import type { UsageState } from "@/domain/entities/UsageState";
import type { WatchPolicy } from "@/domain/entities/WatchPolicy";

describe("TickActiveTabUseCase", () => {
  it("does not block and clears last tick when active tab is null", async () => {
    const dependencies = createDependencies();
    dependencies.activeTab.tab = null;
    dependencies.usageStateRepository.state = {
      shorts: { usedMs: 100, lastTickAtMs: 1_000, blockedUntilMs: null },
      youtube: { usedMs: 200, lastTickAtMs: 1_000, blockedUntilMs: null },
    };

    await dependencies.useCase.execute();

    expect(dependencies.tabBlocker.blockedTabIds).toEqual([]);
    expect(dependencies.usageStateRepository.savedStates.at(-1)).toEqual({
      shorts: { usedMs: 100, lastTickAtMs: null, blockedUntilMs: null },
      youtube: { usedMs: 200, lastTickAtMs: null, blockedUntilMs: null },
    });
  });

  it("does not block for non-YouTube URLs", async () => {
    const dependencies = createDependencies();
    dependencies.activeTab.tab = { id: 1, url: "https://example.com/" };

    await dependencies.useCase.execute();

    expect(dependencies.tabBlocker.blockedTabIds).toEqual([]);
  });

  it("updates only YouTube for ordinary YouTube under limit", async () => {
    const dependencies = createDependencies();
    dependencies.activeTab.tab = { id: 1, url: "https://www.youtube.com/watch?v=abc" };
    dependencies.clock.currentMs = 2_000;
    dependencies.usageStateRepository.state = {
      shorts: { usedMs: 100, lastTickAtMs: 1_000, blockedUntilMs: null },
      youtube: { usedMs: 100, lastTickAtMs: 1_000, blockedUntilMs: null },
    };

    await dependencies.useCase.execute();

    expect(dependencies.usageStateRepository.savedStates.at(-1)).toEqual({
      shorts: { usedMs: 100, lastTickAtMs: null, blockedUntilMs: null },
      youtube: { usedMs: 1_100, lastTickAtMs: 2_000, blockedUntilMs: null },
    });
    expect(dependencies.tabBlocker.blockedTabIds).toEqual([]);
  });

  it("updates Shorts and YouTube for Shorts under limit", async () => {
    const dependencies = createDependencies();
    dependencies.activeTab.tab = { id: 1, url: "https://www.youtube.com/shorts/abc" };
    dependencies.clock.currentMs = 2_000;
    dependencies.usageStateRepository.state = {
      shorts: { usedMs: 100, lastTickAtMs: 1_000, blockedUntilMs: null },
      youtube: { usedMs: 200, lastTickAtMs: 1_000, blockedUntilMs: null },
    };

    await dependencies.useCase.execute();

    expect(dependencies.usageStateRepository.savedStates.at(-1)).toEqual({
      shorts: { usedMs: 1_100, lastTickAtMs: 2_000, blockedUntilMs: null },
      youtube: { usedMs: 1_200, lastTickAtMs: 2_000, blockedUntilMs: null },
    });
    expect(dependencies.tabBlocker.blockedTabIds).toEqual([]);
  });

  it("blocks Shorts when Shorts limit is exceeded", async () => {
    const dependencies = createDependencies();
    dependencies.activeTab.tab = { id: 7, url: "https://www.youtube.com/shorts/abc" };
    dependencies.clock.currentMs = 2_000;
    dependencies.usageStateRepository.state = {
      shorts: { usedMs: 9_900, lastTickAtMs: 1_000, blockedUntilMs: null },
      youtube: { usedMs: 200, lastTickAtMs: 1_000, blockedUntilMs: null },
    };

    await dependencies.useCase.execute();

    expect(dependencies.usageStateRepository.savedStates.at(-1)?.shorts).toEqual({
      usedMs: 0,
      lastTickAtMs: null,
      blockedUntilMs: 62_000,
    });
    expect(dependencies.tabBlocker.blockedTabIds).toEqual([7]);
  });

  it("blocks ordinary YouTube when YouTube limit is exceeded", async () => {
    const dependencies = createDependencies();
    dependencies.activeTab.tab = { id: 7, url: "https://www.youtube.com/feed/subscriptions" };
    dependencies.clock.currentMs = 2_000;
    dependencies.usageStateRepository.state = {
      shorts: { usedMs: 0, lastTickAtMs: null, blockedUntilMs: null },
      youtube: { usedMs: 19_900, lastTickAtMs: 1_000, blockedUntilMs: null },
    };

    await dependencies.useCase.execute();

    expect(dependencies.usageStateRepository.savedStates.at(-1)?.youtube).toEqual({
      usedMs: 0,
      lastTickAtMs: null,
      blockedUntilMs: 122_000,
    });
    expect(dependencies.tabBlocker.blockedTabIds).toEqual([7]);
  });

  it("blocks Shorts when YouTube limit is exceeded", async () => {
    const dependencies = createDependencies();
    dependencies.activeTab.tab = { id: 7, url: "https://www.youtube.com/shorts/abc" };
    dependencies.clock.currentMs = 2_000;
    dependencies.usageStateRepository.state = {
      shorts: { usedMs: 100, lastTickAtMs: 1_000, blockedUntilMs: null },
      youtube: { usedMs: 19_900, lastTickAtMs: 1_000, blockedUntilMs: null },
    };

    await dependencies.useCase.execute();

    expect(dependencies.usageStateRepository.savedStates.at(-1)?.youtube.blockedUntilMs).toBe(
      122_000,
    );
    expect(dependencies.tabBlocker.blockedTabIds).toEqual([7]);
  });

  it("reads current settings on each execution", async () => {
    const dependencies = createDependencies();
    dependencies.activeTab.tab = { id: 7, url: "https://www.youtube.com/watch?v=abc" };
    dependencies.clock.currentMs = 1_000;
    dependencies.settingsRepository.settings = {
      shorts: { allowedMs: 10_000, cooldownMs: 60_000 },
      youtube: { allowedMs: 20_000, cooldownMs: 120_000 },
    };

    await dependencies.useCase.execute();

    dependencies.clock.currentMs = 2_000;
    dependencies.settingsRepository.settings = {
      shorts: { allowedMs: 10_000, cooldownMs: 60_000 },
      youtube: { allowedMs: 500, cooldownMs: 120_000 },
    };

    await dependencies.useCase.execute();

    expect(dependencies.settingsRepository.getCount).toBe(2);
    expect(dependencies.tabBlocker.blockedTabIds).toEqual([7]);
  });

  it("wraps dependency errors", async () => {
    const dependencies = createDependencies();
    dependencies.activeTab.shouldThrow = true;

    await expect(dependencies.useCase.execute()).rejects.toBeInstanceOf(TickActiveTabError);
  });
});

interface TickDependencies {
  readonly activeTab: FakeActiveTab;
  readonly usageStateRepository: FakeUsageStateRepository;
  readonly settingsRepository: FakeSettingsRepository;
  readonly clock: FakeClock;
  readonly tabBlocker: FakeTabBlocker;
  readonly useCase: TickActiveTabUseCase;
}

function createDependencies(): TickDependencies {
  const activeTab = new FakeActiveTab();
  const usageStateRepository = new FakeUsageStateRepository();
  const settingsRepository = new FakeSettingsRepository();
  const clock = new FakeClock();
  const tabBlocker = new FakeTabBlocker();
  const logger = new FakeLogger();

  return {
    activeTab,
    usageStateRepository,
    settingsRepository,
    clock,
    tabBlocker,
    useCase: new TickActiveTabUseCase(
      activeTab,
      usageStateRepository,
      settingsRepository,
      new YouTubeUrlDetectorService(),
      new WatchLimitPolicyService(),
      clock,
      tabBlocker,
      logger,
    ),
  };
}

class FakeActiveTab implements ActiveTab {
  tab: ActiveTabOutputDto | null = { id: 1, url: "https://www.youtube.com/shorts/abc" };
  shouldThrow = false;

  getActiveTab(): Promise<ActiveTabOutputDto | null> {
    if (this.shouldThrow) {
      return Promise.reject(new Error("active tab failed"));
    }

    return Promise.resolve(this.tab);
  }
}

class FakeUsageStateRepository implements UsageStateRepository {
  state: UsageState = createEmptyUsageState();
  savedStates: UsageState[] = [];

  get(): Promise<UsageState> {
    return Promise.resolve(this.state);
  }

  save(state: UsageState): Promise<void> {
    this.state = state;
    this.savedStates.push(state);
    return Promise.resolve();
  }
}

class FakeSettingsRepository implements SettingsRepository {
  settings: WatchPolicy = {
    shorts: { allowedMs: 10_000, cooldownMs: 60_000 },
    youtube: { allowedMs: 20_000, cooldownMs: 120_000 },
  };
  getCount = 0;

  get(): Promise<WatchPolicy> {
    this.getCount += 1;
    return Promise.resolve(this.settings);
  }

  save(settings: WatchPolicy): Promise<void> {
    this.settings = settings;
    return Promise.resolve();
  }
}

class FakeClock implements Clock {
  currentMs = 1_000;

  nowMs(): number {
    return this.currentMs;
  }
}

class FakeTabBlocker implements TabBlocker {
  blockedTabIds: number[] = [];

  block(tabId: number): Promise<void> {
    this.blockedTabIds.push(tabId);
    return Promise.resolve();
  }
}

class FakeLogger implements Logger {
  info(_message: string, _meta?: unknown): void {
    void _message;
    void _meta;
  }

  warn(_message: string, _meta?: unknown): void {
    void _message;
    void _meta;
  }

  error(_message: string, _meta?: unknown): void {
    void _message;
    void _meta;
  }
}

function createEmptyUsageState(): UsageState {
  return {
    shorts: { usedMs: 0, lastTickAtMs: null, blockedUntilMs: null },
    youtube: { usedMs: 0, lastTickAtMs: null, blockedUntilMs: null },
  };
}
