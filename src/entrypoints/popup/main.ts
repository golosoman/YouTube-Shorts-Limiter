import { config } from "@/config";
import { createAppContainer } from "@/composition/createAppContainer";
import { DurationMs } from "@/domain/value-objects/DurationMs";

const Selector = {
  SettingsForm: "#settings-form",
  AllowedMinutes: "#allowed-minutes",
  CooldownMinutes: "#cooldown-minutes",
  ResetUsage: "#reset-usage",
  UsedMinutes: "#used-minutes",
  RemainingMinutes: "#remaining-minutes",
  CooldownStatus: "#cooldown-status",
  Message: "#message",
} as const;

const MessageKind = {
  Error: "error",
  Success: "success",
} as const;

const app = createAppContainer();
const form = getRequiredElement(Selector.SettingsForm, HTMLFormElement);
const allowedMinutesInput = getRequiredElement(Selector.AllowedMinutes, HTMLInputElement);
const cooldownMinutesInput = getRequiredElement(Selector.CooldownMinutes, HTMLInputElement);
const resetUsageButton = getRequiredElement(Selector.ResetUsage, HTMLButtonElement);
const usedMinutesElement = getRequiredElement(Selector.UsedMinutes, HTMLElement);
const remainingMinutesElement = getRequiredElement(Selector.RemainingMinutes, HTMLElement);
const cooldownStatusElement = getRequiredElement(Selector.CooldownStatus, HTMLElement);
const messageElement = getRequiredElement(Selector.Message, HTMLElement);

configureInputs();
void refreshStatus();

form.addEventListener("submit", (event) => {
  event.preventDefault();
  void saveSettings();
});

resetUsageButton.addEventListener("click", () => {
  void resetUsage();
});

async function saveSettings(): Promise<void> {
  try {
    await app.updateSettings.execute({
      allowedMinutes: Number(allowedMinutesInput.value),
      cooldownMinutes: Number(cooldownMinutesInput.value),
    });
    setMessage("Settings saved.", MessageKind.Success);
    await refreshStatus();
  } catch (error) {
    app.logger.error("Failed to save settings from popup.", error);
    setMessage("Could not save settings.", MessageKind.Error);
  }
}

async function resetUsage(): Promise<void> {
  try {
    await app.resetUsage.execute();
    setMessage("Usage reset.", MessageKind.Success);
    await refreshStatus();
  } catch (error) {
    app.logger.error("Failed to reset usage from popup.", error);
    setMessage("Could not reset usage.", MessageKind.Error);
  }
}

async function refreshStatus(): Promise<void> {
  try {
    const status = await app.getStatus.execute();
    allowedMinutesInput.value = String(status.allowedMinutes);
    cooldownMinutesInput.value = String(status.cooldownMinutes);
    usedMinutesElement.textContent = formatMinutes(status.usedMs);
    remainingMinutesElement.textContent = formatMinutes(status.remainingMs);
    cooldownStatusElement.textContent =
      status.cooldownRemainingMs > DurationMs.zero().value
        ? formatMinutes(status.cooldownRemainingMs)
        : "Inactive";
  } catch (error) {
    app.logger.error("Failed to load popup status.", error);
    setMessage("Could not load status.", MessageKind.Error);
  }
}

function configureInputs(): void {
  allowedMinutesInput.min = String(config.validation.settings.allowedDuration.min.toMinutes());
  allowedMinutesInput.max = String(config.validation.settings.allowedDuration.max.toMinutes());
  cooldownMinutesInput.min = String(config.validation.settings.cooldownDuration.min.toMinutes());
  cooldownMinutesInput.max = String(config.validation.settings.cooldownDuration.max.toMinutes());
  allowedMinutesInput.step = String(DurationMs.fromMinutes(1).toMinutes());
  cooldownMinutesInput.step = String(DurationMs.fromMinutes(1).toMinutes());
}

function formatMinutes(valueMs: number): string {
  return `${DurationMs.fromMilliseconds(valueMs).toMinutes().toFixed(1)} min`;
}

function setMessage(message: string, kind: (typeof MessageKind)[keyof typeof MessageKind]): void {
  messageElement.textContent = message;
  messageElement.dataset["kind"] = kind;
}

function getRequiredElement<TElement extends Element>(
  selector: string,
  elementConstructor: abstract new () => TElement,
): TElement {
  const element = document.querySelector(selector);

  if (element === null || !(element instanceof elementConstructor)) {
    throw new Error(`Missing popup element for selector: ${selector}`);
  }

  return element;
}
