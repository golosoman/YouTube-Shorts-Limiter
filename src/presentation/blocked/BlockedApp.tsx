import { useEffect, useState } from "react";
import type { GetStatusOutputDto } from "@/app/interfaces/use-cases/get-status/dto";
import {
  createBlockedPageFallbackViewModel,
  createBlockedPageViewModel,
  type BlockedPageViewModel,
} from "@/presentation/blocked/viewModel";

export interface BlockedAppProps {
  readonly loadStatus: () => Promise<GetStatusOutputDto>;
  readonly onError: (message: string, error: unknown) => void;
}

export function BlockedApp({ loadStatus, onError }: BlockedAppProps) {
  const [viewModel, setViewModel] = useState<BlockedPageViewModel | null>(null);

  useEffect(() => {
    void loadViewModel();
  }, []);

  async function loadViewModel(): Promise<void> {
    try {
      setViewModel(createBlockedPageViewModel(await loadStatus()));
    } catch (error) {
      onError("Failed to load blocked page status.", error);
      setViewModel(createBlockedPageFallbackViewModel());
    }
  }

  if (viewModel === null) {
    return (
      <main className="blocked-shell" aria-live="polite">
        <p className="blocked-card">Loading cooldown status...</p>
      </main>
    );
  }

  return (
    <main className="blocked-shell" aria-live="polite">
      <section className="blocked-card" data-tone={viewModel.tone}>
        <p className="blocked-eyebrow">YouTube Limiter</p>
        <h1>{viewModel.title}</h1>
        <p className="blocked-description">{viewModel.description}</p>
        <p className="blocked-cooldown">{viewModel.cooldownText}</p>
        {viewModel.showOrdinaryYouTubeLink ? (
          <a href={viewModel.ordinaryYouTubeUrl}>Open regular YouTube</a>
        ) : null}
      </section>
    </main>
  );
}
