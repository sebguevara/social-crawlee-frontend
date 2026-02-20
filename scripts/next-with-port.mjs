import { spawn } from "node:child_process";
import { createRequire } from "node:module";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

const require = createRequire(import.meta.url);
const nextBin = require.resolve("next/dist/bin/next");

const mode = process.argv[2] === "start" ? "start" : "dev";

const parseEnvFile = () => {
  const envPath = path.resolve(process.cwd(), ".env");
  if (!existsSync(envPath)) return {};

  const parsed = {};
  const raw = readFileSync(envPath, "utf8");

  for (const line of raw.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const equalsIdx = trimmed.indexOf("=");
    if (equalsIdx <= 0) continue;

    const key = trimmed.slice(0, equalsIdx).trim();
    const value = trimmed
      .slice(equalsIdx + 1)
      .trim()
      .replace(/^['"]|['"]$/g, "");

    parsed[key] = value;
  }

  return parsed;
};

const envFromFile = parseEnvFile();
const port =
  process.env.PORT ??
  envFromFile.PORT ??
  process.env.port ??
  envFromFile.port ??
  "3001";

const child = spawn(process.execPath, [nextBin, mode, "-p", String(port)], {
  stdio: "inherit",
  env: process.env,
});

child.on("exit", (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
    return;
  }
  process.exit(code ?? 1);
});
