#!/usr/bin/env node

import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const ROOT = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const BIN = path.join(ROOT, "bin", "media-content-distiller");

// On Windows the shebang-less shell wrapper cannot be spawned directly;
// run the portable .mjs entry point through the current Node binary instead.
function spawnOurCli(args, options = {}) {
  if (process.platform === "win32") {
    return spawnSync(
      process.execPath,
      [path.join(ROOT, "bin", "media-content-distiller.mjs"), "--", ...args],
      { encoding: "utf8", ...options },
    );
  }
  return spawnSync(BIN, args, { encoding: "utf8", ...options });
}
const requiredFiles = [
  "package.json",
  "bin/media-content-distiller",
  "bin/media-content-distiller.mjs",
  "lib/core.mjs",
  "lib/cli.mjs",
  "tests/cli.test.mjs",
];

for (const relative of requiredFiles) {
  assert.equal(fs.existsSync(path.join(ROOT, relative)), true, `missing ${relative}`);
}

for (const file of ["bin/media-content-distiller.mjs", "lib/core.mjs", "lib/cli.mjs"]) {
  const result = spawnSync(process.execPath, ["--check", path.join(ROOT, file)], {
    encoding: "utf8",
  });
  assert.equal(result.status, 0, `${file} failed syntax check:\n${result.stderr}`);
}

const help = spawnOurCli(["--help"]);
assert.equal(help.status, 0);
assert.match(help.stdout, /No Python or third-party npm package is required/);

const version = spawnOurCli(["--version"]);
assert.equal(version.status, 0);
assert.match(version.stdout.trim(), /^\d+\.\d+\.\d+$/);

const packageJson = JSON.parse(
  fs.readFileSync(path.join(ROOT, "package.json"), "utf8"),
);
assert.equal(packageJson.bin?.["media-content-distiller"], "./bin/media-content-distiller.mjs");

const temporary = fs.mkdtempSync(path.join(os.tmpdir(), "media-content-distiller-verify-"));
try {
  const isolatedEnv = path.join(temporary, ".env");
  const noCredential = spawnOurCli(
    [
      "subtitle",
      "--url",
      "https://example.invalid/video",
      "--env-file",
      isolatedEnv,
      "--no-prompt",
    ],
    {
      env: Object.fromEntries(
        Object.entries(process.env).filter(
          ([key]) => !key.startsWith("BIBI") && !key.startsWith("BIBIGPT"),
        ),
      ),
    },
  );
  assert.equal(noCredential.status, 2);
  assert.match(noCredential.stderr, /no network request was made/);
} finally {
  fs.rmSync(temporary, { recursive: true, force: true });
}

console.log("CLI_VERIFY_OK");
