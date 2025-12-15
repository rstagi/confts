import { extname } from "node:path";
import { getLoader, getSupportedExtensions } from "./loader-registry";
import { resolveValues } from "./values";
import { ConfigError } from "./errors";
import type { ConftsSchema, InferSchema } from "./types";
import { DiagnosticsCollector } from "./diagnostics";

export interface ResolveOptions {
  configPath?: string;
  env?: Record<string, string | undefined>;
  secretsPath?: string;
}

export function resolve<S extends ConftsSchema<Record<string, unknown>>>(
  schema: S,
  options: ResolveOptions = {}
): InferSchema<S> {
  const { env = process.env, secretsPath = "/secrets" } = options;
  const collector = new DiagnosticsCollector();

  // Build candidates list for diagnostics
  const candidates: string[] = [];
  if (options.configPath) candidates.push(`option:${options.configPath}`);
  if (env.CONFIG_PATH) candidates.push(`env:${env.CONFIG_PATH}`);

  const configPath = options.configPath ?? env.CONFIG_PATH;

  if (!configPath) {
    collector.addConfigPath(null, candidates, "no config path found");
    throw new ConfigError(
      "No config path provided. Set configPath option or CONFIG_PATH env var.",
      "CONFIG_PATH",
      false
    );
  }

  const reason = options.configPath ? "picked from configPath option" : "picked from CONFIG_PATH env";
  collector.addConfigPath(configPath, candidates, reason);

  const ext = extname(configPath).toLowerCase();
  const loader = getLoader(ext);

  if (!loader) {
    const supported = getSupportedExtensions().join(", ");
    collector.addLoader(ext, false, `unsupported extension, supported: ${supported || "none"}`);
    throw new ConfigError(
      `Unsupported config file extension: ${ext}. Supported: ${supported || "none"}. Install @confts/yaml-loader for YAML support.`,
      configPath,
      false
    );
  }

  collector.addLoader(ext, true);

  const fileValues = loader(configPath);

  if (fileValues === undefined) {
    throw new ConfigError(
      `Config file not found: ${configPath}`,
      configPath,
      false
    );
  }

  return resolveValues(schema, { fileValues, env, secretsPath, configPath, _collector: collector }) as InferSchema<S>;
}
