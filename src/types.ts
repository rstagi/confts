import type { ZodTypeAny } from "zod";

export interface KeyConfig<T extends ZodTypeAny = ZodTypeAny> {
  type: T;
  env?: string;
  secretFile?: string;
  sensitive?: boolean;
  default?: unknown;
}

export type SchemaDefinition = {
  [key: string]: KeyConfig | SchemaDefinition | string | number | boolean;
};

export const KEY_MARKER = Symbol("confts.key");

export interface MarkedKeyConfig<T extends ZodTypeAny = ZodTypeAny>
  extends KeyConfig<T> {
  [KEY_MARKER]: true;
}
