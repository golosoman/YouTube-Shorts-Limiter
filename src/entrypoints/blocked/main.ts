import { config } from "@/config";
import { createAppContainer } from "@/composition/createAppContainer";
import { DurationMs } from "@/domain/value-objects/DurationMs";

const Selector = {
  CooldownStatus: "#cooldown-status",
  OrdinaryYouTubeLink: "#ordinary-youtube-link",
} as const;

const app = createAppContainer();
const cooldownStatusElement = getRequiredElement(Selector.CooldownStatus, HTMLElement);
const ordinaryYouTubeLink = getRequiredElement(Selector.OrdinaryYouTubeLink, HTMLAnchorElement);

ordinaryYouTubeLink.href = config.application.routes.ordinaryYouTubeUrl;
void renderCooldownStatus();

async function renderCooldownStatus(): Promise<void> {
  try {
    const status = await app.getStatus.execute();
    cooldownStatusElement.textContent =
      status.cooldownRemainingMs > DurationMs.zero().value
        ? `Осталось: ${formatMinutes(status.cooldownRemainingMs)}.`
        : "Cooldown завершён.";
  } catch (error) {
    app.logger.error("Failed to load blocked page status.", error);
    cooldownStatusElement.textContent = "Попробуйте вернуться позже.";
  }
}

function formatMinutes(valueMs: number): string {
  return `${DurationMs.fromMilliseconds(valueMs).toMinutes().toFixed(1)} мин`;
}

function getRequiredElement<TElement extends Element>(
  selector: string,
  elementConstructor: abstract new () => TElement,
): TElement {
  const element = document.querySelector(selector);

  if (element === null || !(element instanceof elementConstructor)) {
    throw new Error(`Missing blocked page element for selector: ${selector}`);
  }

  return element;
}
