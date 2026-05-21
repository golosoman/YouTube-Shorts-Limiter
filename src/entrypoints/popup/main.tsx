import "@/presentation/shared/styles.css";
import "@/presentation/popup/styles.css";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import type { UpdateSettingsInputDto } from "@/app/interfaces/use-cases/update-settings/dto";
import { handleError } from "@/app/shared/handlers/handleError";
import { createAppContainer } from "@/composition/createAppContainer";
import { PopupApp } from "@/presentation/popup/PopupApp";

const MOUNT_ELEMENT_ID = "root";

const app = createAppContainer();
const root = createRoot(getMountElement());

root.render(
  <StrictMode>
    <PopupApp
      loadStatus={() => app.getStatus.execute()}
      saveSettings={(input: UpdateSettingsInputDto) => app.updateSettings.execute(input)}
      resetUsage={() => app.resetUsage.execute()}
      onError={(message, error) => {
        handleError(app.logger, message, error);
      }}
    />
  </StrictMode>,
);

function getMountElement(): HTMLElement {
  const element = document.getElementById(MOUNT_ELEMENT_ID);

  if (element === null) {
    throw new Error(`Missing popup mount element: ${MOUNT_ELEMENT_ID}`);
  }

  return element;
}
