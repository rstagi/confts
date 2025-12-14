import { resolve } from "./resolver";
import type { ConftsSchema, InferSchema } from "./types";

export interface ServerLike {
  listen(port: number, callback?: () => void): void;
  close(callback?: (err?: Error) => void): void;
}

export interface Service<
  S extends ConftsSchema<Record<string, unknown>>,
  T extends ServerLike,
> {
  create: (configOverrides?: Partial<InferSchema<S>>) => Promise<T>;
  run: (options?: RunOptions) => Promise<void>;
}

export interface RunOptions {
  port?: number;
  onReady?: () => void;
  onShutdown?: () => void;
  shutdownTimeout?: number;
}

export function startup<
  S extends ConftsSchema<Record<string, unknown>>,
  T extends ServerLike,
>(
  configSchema: S,
  factory: (config: InferSchema<S>) => T | Promise<T>
): Service<S, T> {
  return {
    async create(configOverrides?: Partial<InferSchema<S>>): Promise<T> {
      const config = resolve(configSchema, {
        env: process.env,
      }) as InferSchema<S>;

      const finalConfig = configOverrides
        ? { ...config, ...configOverrides }
        : config;

      return factory(finalConfig);
    },

    async run(options?: RunOptions): Promise<void> {
      const config = resolve(configSchema, {
        env: process.env,
      }) as InferSchema<S>;

      const server = await factory(config);
      const port = options?.port ?? (config as { port?: number }).port ?? 3000;

      return new Promise<void>((resolvePromise) => {
        const shutdown = () => {
          server.close(() => {
            options?.onShutdown?.();
            resolvePromise();
          });
        };

        process.once("SIGTERM", shutdown);
        process.once("SIGINT", shutdown);

        server.listen(port, () => {
          options?.onReady?.();
        });
      });
    },
  };
}
