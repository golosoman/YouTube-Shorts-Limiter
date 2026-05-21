/** @vitest-environment jsdom */
import "@testing-library/jest-dom/vitest";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import {
  ActiveBlockKind,
  type GetStatusOutputDto,
} from "@/app/interfaces/use-cases/get-status/dto";
import { WatchScope } from "@/domain/entities/WatchScope";
import { BlockedApp } from "@/presentation/blocked/BlockedApp";

describe("BlockedApp", () => {
  it("shows the regular YouTube link when only Shorts are blocked", async () => {
    renderBlocked(createBlockedStatus(ActiveBlockKind.Shorts));

    expect(
      await screen.findByRole("heading", { name: "Shorts are blocked for now" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /open regular youtube/i })).toBeInTheDocument();
  });

  it("hides the regular YouTube link when all YouTube is blocked", async () => {
    renderBlocked(createBlockedStatus(ActiveBlockKind.YouTube));

    expect(
      await screen.findByRole("heading", { name: "YouTube is cooling down" }),
    ).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: /open regular youtube/i })).not.toBeInTheDocument();
  });
});

function renderBlocked(status: GetStatusOutputDto) {
  return render(<BlockedApp loadStatus={() => Promise.resolve(status)} onError={vi.fn()} />);
}

function createBlockedStatus(
  kind: typeof ActiveBlockKind.Shorts | typeof ActiveBlockKind.YouTube,
): GetStatusOutputDto {
  const shortsBlocked = kind === ActiveBlockKind.Shorts;
  const youtubeBlocked = kind === ActiveBlockKind.YouTube;

  return {
    shorts: {
      scope: WatchScope.Shorts,
      usedMs: 0,
      allowedMs: 600_000,
      cooldownMs: 3_600_000,
      allowedMinutes: 10,
      cooldownMinutes: 60,
      remainingMs: 600_000,
      isBlocked: shortsBlocked,
      blockedUntilMs: shortsBlocked ? 4_000_000 : null,
      cooldownRemainingMs: shortsBlocked ? 3_000_000 : 0,
    },
    youtube: {
      scope: WatchScope.YouTube,
      usedMs: 0,
      allowedMs: 3_600_000,
      cooldownMs: 3_600_000,
      allowedMinutes: 60,
      cooldownMinutes: 60,
      remainingMs: 3_600_000,
      isBlocked: youtubeBlocked,
      blockedUntilMs: youtubeBlocked ? 4_000_000 : null,
      cooldownRemainingMs: youtubeBlocked ? 3_000_000 : 0,
    },
    activeBlock: youtubeBlocked
      ? {
          kind: ActiveBlockKind.YouTube,
          scope: WatchScope.YouTube,
          blockedUntilMs: 4_000_000,
          cooldownRemainingMs: 3_000_000,
        }
      : {
          kind: ActiveBlockKind.Shorts,
          scope: WatchScope.Shorts,
          blockedUntilMs: 4_000_000,
          cooldownRemainingMs: 3_000_000,
        },
  };
}
