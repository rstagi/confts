import type { ZodTypeAny } from "zod";
import { KEY_MARKER, type KeyConfig, type MarkedKeyConfig } from "./types";

export function key<T extends ZodTypeAny>(config: KeyConfig<T>): MarkedKeyConfig<T> {
  return {
    ...config,
    [KEY_MARKER]: true,
  };
}

export function schema<T extends Record<string, unknown>>(_definition: T): T {
  // TODO: Phase 2 - convert to Zod schema
  return _definition;
}
