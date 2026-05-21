import { useEffect, useState } from "react";
import type { GetStatusOutputDto } from "@/app/interfaces/use-cases/get-status/dto";
import type { UpdateSettingsInputDto } from "@/app/interfaces/use-cases/update-settings/dto";
import { ScopeCard } from "@/presentation/popup/components/ScopeCard";
import { SettingsForm } from "@/presentation/popup/components/SettingsForm";
import { StatusChip } from "@/presentation/popup/components/StatusChip";
import {
  createPopupSettingsConstraintsViewModel,
  createPopupViewModel,
  type PopupViewModel,
} from "@/presentation/popup/viewModel";

const MessageKind = {
  Error: "error",
  Success: "success",
} as const;

interface PopupMessageViewModel {
  readonly text: string;
  readonly kind: (typeof MessageKind)[keyof typeof MessageKind];
}

interface PopupLoadedViewProps {
  readonly viewModel: PopupViewModel;
  readonly message: PopupMessageViewModel | null;
  readonly isBusy: boolean;
  readonly onSave: (input: UpdateSettingsInputDto) => Promise<void>;
  readonly onReset: () => Promise<void>;
}

export interface PopupAppProps {
  readonly loadStatus: () => Promise<GetStatusOutputDto>;
  readonly saveSettings: (input: UpdateSettingsInputDto) => Promise<void>;
  readonly resetUsage: () => Promise<void>;
  readonly onError: (message: string, error: unknown) => void;
}

export function PopupApp({ loadStatus, saveSettings, resetUsage, onError }: PopupAppProps) {
  const [viewModel, setViewModel] = useState<PopupViewModel | null>(null);
  const [message, setMessage] = useState<PopupMessageViewModel | null>(null);
  const [isBusy, setIsBusy] = useState(false);

  useEffect(() => {
    void refreshStatus();
  }, []);

  async function refreshStatus(): Promise<void> {
    try {
      setViewModel(createPopupViewModel(await loadStatus()));
    } catch (error) {
      onError("Failed to load popup status.", error);
      setMessage({ text: "Could not load status.", kind: MessageKind.Error });
    }
  }

  async function handleSave(input: UpdateSettingsInputDto): Promise<void> {
    try {
      setIsBusy(true);
      await saveSettings(input);
      setMessage({ text: "Settings saved.", kind: MessageKind.Success });
      await refreshStatus();
    } catch (error) {
      onError("Failed to save settings from popup.", error);
      setMessage({ text: "Could not save settings.", kind: MessageKind.Error });
    } finally {
      setIsBusy(false);
    }
  }

  async function handleReset(): Promise<void> {
    try {
      setIsBusy(true);
      await resetUsage();
      setMessage({ text: "Usage reset.", kind: MessageKind.Success });
      await refreshStatus();
    } catch (error) {
      onError("Failed to reset usage from popup.", error);
      setMessage({ text: "Could not reset usage.", kind: MessageKind.Error });
    } finally {
      setIsBusy(false);
    }
  }

  if (viewModel === null) {
    return (
      <main className="popup-shell">
        <p className="message">Loading...</p>
      </main>
    );
  }

  return (
    <PopupLoadedView
      viewModel={viewModel}
      message={message}
      isBusy={isBusy}
      onSave={handleSave}
      onReset={handleReset}
    />
  );
}

function PopupLoadedView({ viewModel, message, isBusy, onSave, onReset }: PopupLoadedViewProps) {
  const constraints = createPopupSettingsConstraintsViewModel();

  return (
    <main className="popup-shell">
      <header className="popup-header">
        <div>
          <h1>YouTube Limiter</h1>
          <h2>Shorts and YouTube time budgets</h2>
        </div>
        <StatusChip label={viewModel.statusLabel} tone={viewModel.statusTone} />
      </header>

      <section className="overview" aria-label="Current limits">
        <ScopeCard scope={viewModel.shorts} />
        <ScopeCard scope={viewModel.youtube} />
      </section>

      <SettingsForm
        values={viewModel.settings}
        constraints={constraints}
        isBusy={isBusy}
        onSave={onSave}
        onReset={onReset}
      />

      <p className="message" data-kind={message?.kind} aria-live="polite">
        {message?.text}
      </p>
    </main>
  );
}
