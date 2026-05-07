import { applicationConfig } from "./application.config";
import { extensionConfig } from "./extension.config";
import { storageConfig } from "./storage.config";
import { validationConfig } from "./validation.config";

export const config = {
  application: applicationConfig,
  extension: extensionConfig,
  storage: storageConfig,
  validation: validationConfig,
} as const;
