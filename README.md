# confts

[![npm version](https://img.shields.io/npm/v/confts.svg)](https://www.npmjs.com/package/confts)

Dev-friendly TypeScript config library wrapping Zod with multi-source value resolution.

## Features

- Type-safe config with Zod validation
- Multi-source value resolution (env vars, secret files, config files)
- JSON support built-in, YAML via optional package
- Sensitive value redaction in errors and logs
- Composable nested schemas
- Server bootstrap with graceful shutdown (optional)
- Source tracking and diagnostics

## Install

```bash
npm install confts zod
```

## Quick Start

```typescript
import { schema, field, resolve } from "confts";
import { z } from "zod";

const configSchema = schema({
  appName: "my-app", // literal value
  db: {
    host: field({ type: z.string(), env: "DB_HOST", default: "localhost" }),
    port: field({ type: z.coerce.number(), env: "DB_PORT", default: 5432 }),
    password: field({
      type: z.string(),
      env: "DB_PASSWORD",
      secretFile: "db-password",
      sensitive: true,
    }),
  },
});

const config = resolve(configSchema, { configPath: "./config.json" });
// config is fully typed: { appName: "my-app", db: { host: string, port: number, password: string } }
```

## Bootstrap

Server lifecycle management with graceful shutdown.

```bash
npm install @confts/bootstrap
```

### Runtime (autorun)

```typescript
// app.ts
import { schema, field } from "confts";
import { bootstrap } from "@confts/bootstrap";
import { z } from "zod";
import express from "express";

const configSchema = schema({
  port: field({ type: z.number(), env: "PORT", default: 3000 }),
});

export default bootstrap(
  configSchema,
  { autorun: { enabled: true, meta: import.meta } },
  async (config) => {
    const app = express();
    app.get("/health", (req, res) => res.send("ok"));
    return app;
  }
);

// node app.ts → auto-runs server
// import from app.ts → just exports service (for tests)
```

### Testing

```typescript
import service from "./app";

const { server } = await service.create({ override: { port: 0 } });
// use supertest(server) - no listen() called
```

See [@confts/bootstrap README](packages/bootstrap/README.md) for details.

## Resolution Priority

Values are resolved in order (highest to lowest):

1. **Override** - `override` option in resolve
2. **Environment variable** - `env` field option
3. **Secret file** - `secretFile` field option
4. **Config file** - JSON/YAML file
5. **Initial values** - `initialValues` option in resolve
6. **Default** - `default` field option

## Packages

| Package | Description | Docs |
|---------|-------------|------|
| `confts` | Core schema, field, resolve | [README](packages/confts/README.md) |
| `@confts/yaml-loader` | YAML file support (side-effect import) | [README](packages/yaml-loader/README.md) |
| `@confts/bootstrap` | Server lifecycle management | [README](packages/bootstrap/README.md) |

## License

MIT
