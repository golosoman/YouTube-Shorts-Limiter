import type { PopupStatusTone } from "@/presentation/popup/viewModel";

interface StatusChipProps {
  readonly label: string;
  readonly tone: PopupStatusTone;
}

export function StatusChip({ label, tone }: StatusChipProps) {
  return (
    <p className="popup-chip" data-tone={tone}>
      {label}
    </p>
  );
}
