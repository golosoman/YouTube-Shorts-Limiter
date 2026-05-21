import "@/presentation/shared/styles.css";
import "@/presentation/blocked/styles.css";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { handleError } from "@/app/shared/handlers/handleError";
import { createAppContainer } from "@/composition/createAppContainer";
import { BlockedApp } from "@/presentation/blocked/BlockedApp";

const MOUNT_ELEMENT_ID = "root";

const app = createAppContainer();
const root = createRoot(getMountElement());

root.render(
  <StrictMode>
    <BlockedApp
      loadStatus={() => app.getStatus.execute()}
      onError={(message, error) => {
        handleError(app.logger, message, error);
      }}
    />
  </StrictMode>,
);

function getMountElement(): HTMLElement {
  const element = document.getElementById(MOUNT_ELEMENT_ID);

  if (element === null) {
    throw new Error(`Missing blocked page mount element: ${MOUNT_ELEMENT_ID}`);
  }

  return element;
}
