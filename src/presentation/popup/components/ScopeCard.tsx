import * as Progress from "@radix-ui/react-progress";
import type { PopupScopeViewModel } from "@/presentation/popup/viewModel";

const PROGRESS_MAX = 100;

interface ScopeCardProps {
  readonly scope: PopupScopeViewModel;
}

export function ScopeCard({ scope }: ScopeCardProps) {
  return (
    <article className="scope-card" data-scope={scope.id}>
      <div className="scope-card__head">
        <div>
          <h3>{scope.title}</h3>
          <p className="scope-card__hint">{scope.description}</p>
        </div>
      </div>

      <div className="metric-grid">
        <p className="metric">
          <span>Used</span>
          <strong>{scope.usedText}</strong>
        </p>
        <p className="metric">
          <span>Left</span>
          <strong>{scope.remainingText}</strong>
        </p>
        <p className="metric">
          <span>Cooldown</span>
          <strong>{scope.cooldownText}</strong>
        </p>
      </div>

      <Progress.Root
        className="progress"
        value={scope.progressValue}
        max={PROGRESS_MAX}
        aria-label={`${scope.title} usage`}
      >
        <Progress.Indicator
          className="progress__indicator"
          style={{ width: `${scope.progressValue}%` }}
        />
      </Progress.Root>
    </article>
  );
}
