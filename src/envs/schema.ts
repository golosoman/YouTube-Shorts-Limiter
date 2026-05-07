import { z } from "zod";

const TRUE_VALUES = new Set(["1", "true", "yes", "on"]);
const FALSE_VALUES = new Set(["0", "false", "no", "off", ""]);

const booleanLikeSchema = z
  .union([z.boolean(), z.string(), z.undefined()])
  .transform((value, context): boolean => {
    if (typeof value === "boolean") {
      return value;
    }

    if (value === undefined) {
      return false;
    }

    const normalizedValue = value.trim().toLowerCase();
    if (TRUE_VALUES.has(normalizedValue)) {
      return true;
    }

    if (FALSE_VALUES.has(normalizedValue)) {
      return false;
    }

    context.addIssue({
      code: "custom",
      message: "Expected a boolean-like value.",
    });

    return z.NEVER;
  });

export const envSchema = z.object({
  MODE: z.string().min(1),
  DEV: z.boolean(),
  PROD: z.boolean(),
  WXT_ENABLE_DEBUG_LOGS: booleanLikeSchema,
  WXT_ENABLE_STRICT_BLOCKING: booleanLikeSchema,
});

export type ParsedEnv = z.infer<typeof envSchema>;
