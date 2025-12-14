#!/usr/bin/env node
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";

const entryFile = process.argv[2];

if (!entryFile) {
  console.error("Usage: confts-start <entry-file>");
  console.error("Example: confts-start app.ts");
  process.exit(1);
}

const absolutePath = resolve(process.cwd(), entryFile);
const fileUrl = pathToFileURL(absolutePath).href;

try {
  const module = await import(fileUrl);
  const service = module.default;

  if (!service || typeof service.run !== "function") {
    console.error(
      `Error: ${entryFile} must export a service created with startup() as default export`
    );
    process.exit(1);
  }

  await service.run();
} catch (error) {
  console.error("Failed to start service:", error);
  process.exit(1);
}
