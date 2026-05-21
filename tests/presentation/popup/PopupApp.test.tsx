/** @vitest-environment jsdom */
import "@testing-library/jest-dom/vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import {
  ActiveBlockKind,
  type GetStatusOutputDto,
} from "@/app/interfaces/use-cases/get-status/dto";
import type { UpdateSettingsInputDto } from "@/app/interfaces/use-cases/update-settings/dto";
import { PopupApp } from "@/presentation/popup/PopupApp";
import { WatchScope } from "@/domain/entities/WatchScope";

describe("PopupApp", () => {
  it("renders Shorts and YouTube scope cards from status", async () => {
    renderPopup();

    expect(await screen.findByRole("heading", { name: "Shorts" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "YouTube" })).toBeInTheDocument();
    expect(screen.getAllByText("5.0 min")).toHaveLength(2);
    expect(screen.getAllByText("30.0 min")).toHaveLength(2);
  });

  it("emits settings input dto values from the settings form", async () => {
    const user = userEvent.setup();
    const saveSettings = vi.fn<(input: UpdateSettingsInputDto) => Promise<void>>(() =>
      Promise.resolve(),
    );
    renderPopup({ saveSettings });

    await screen.findByRole("heading", { name: "Shorts" });
    await user.clear(screen.getByLabelText("Shorts limit"));
    await user.type(screen.getByLabelText("Shorts limit"), "12");
    await user.clear(screen.getByLabelText("Shorts cooldown"));
    await user.type(screen.getByLabelText("Shorts cooldown"), "34");
    await user.clear(screen.getByLabelText("YouTube limit"));
    await user.type(screen.getByLabelText("YouTube limit"), "56");
    await user.clear(screen.getByLabelText("YouTube cooldown"));
    await user.type(screen.getByLabelText("YouTube cooldown"), "78");
    await user.click(screen.getByRole("button", { name: /save settings/i }));

    await waitFor(() => {
      expect(saveSettings).toHaveBeenCalledWith({
        shortsAllowedMinutes: 12,
        shortsCooldownMinutes: 34,
        youtubeAllowedMinutes: 56,
        youtubeCooldownMinutes: 78,
      });
    });
  });

  it("renders save success and error messages", async () => {
    const user = userEvent.setup();
    const saveSettings = vi
      .fn<(input: UpdateSettingsInputDto) => Promise<void>>()
      .mockResolvedValueOnce()
      .mockRejectedValueOnce(new Error("save failed"));
    renderPopup({ saveSettings });

    await screen.findByRole("heading", { name: "Shorts" });
    await user.click(screen.getByRole("button", { name: /save settings/i }));
    expect(await screen.findByText("Settings saved.")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /save settings/i }));
    expect(await screen.findByText("Could not save settings.")).toBeInTheDocument();
  });

  it("calls reset usage from the secondary action", async () => {
    const user = userEvent.setup();
    const resetUsage = vi.fn<() => Promise<void>>(() => Promise.resolve());
    renderPopup({ resetUsage });

    await screen.findByRole("heading", { name: "Shorts" });
    await user.click(screen.getByRole("button", { name: /reset usage/i }));

    await waitFor(() => {
      expect(resetUsage).toHaveBeenCalledTimes(1);
    });
  });
});

interface RenderPopupOptions {
  readonly loadStatus?: () => Promise<GetStatusOutputDto>;
  readonly saveSettings?: (input: UpdateSettingsInputDto) => Promise<void>;
  readonly resetUsage?: () => Promise<void>;
}

function renderPopup(options: RenderPopupOptions = {}) {
  const loadStatus = options.loadStatus ?? (() => Promise.resolve(createStatus()));
  const saveSettings = options.saveSettings ?? (() => Promise.resolve());
  const resetUsage = options.resetUsage ?? (() => Promise.resolve());

  return render(
    <PopupApp
      loadStatus={loadStatus}
      saveSettings={saveSettings}
      resetUsage={resetUsage}
      onError={vi.fn()}
    />,
  );
}

function createStatus(): GetStatusOutputDto {
  return {
    shorts: {
      scope: WatchScope.Shorts,
      usedMs: 300_000,
      allowedMs: 600_000,
      cooldownMs: 3_600_000,
      allowedMinutes: 10,
      cooldownMinutes: 60,
      remainingMs: 300_000,
      isBlocked: false,
      blockedUntilMs: null,
      cooldownRemainingMs: 0,
    },
    youtube: {
      scope: WatchScope.YouTube,
      usedMs: 1_800_000,
      allowedMs: 3_600_000,
      cooldownMs: 3_600_000,
      allowedMinutes: 60,
      cooldownMinutes: 60,
      remainingMs: 1_800_000,
      isBlocked: false,
      blockedUntilMs: null,
      cooldownRemainingMs: 0,
    },
    activeBlock: {
      kind: ActiveBlockKind.None,
    },
  };
}
