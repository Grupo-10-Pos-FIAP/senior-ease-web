import { spawn } from "node:child_process";
import { existsSync } from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";

/**
 * Vitest 4.x on Windows fails with "failed to find the runner" when paths
 * start with a lowercase drive letter (c:\ vs C:\): Node's ESM cache treats
 * the two casings as distinct modules, so the worker and the setup file end
 * up with different runner singletons.
 * @see https://github.com/vitest-dev/vitest/issues/10692
 *
 * On macOS and Linux this is a no-op passthrough.
 */
const isWindows = process.platform === "win32";

function normalizeDriveLetter(value) {
  return isWindows ? value.replace(/^([a-z]):/, (_, letter) => `${letter.toUpperCase()}:`) : value;
}

/** The CLI entry is a bin, not an exported subpath, so walk up from the package entry. */
function resolveVitestCli() {
  const require = createRequire(import.meta.url);
  let dir = path.dirname(require.resolve("vitest"));

  for (;;) {
    const candidate = path.join(dir, "vitest.mjs");
    if (existsSync(candidate)) {
      return candidate;
    }
    const parent = path.dirname(dir);
    if (parent === dir) {
      throw new Error("Could not locate the Vitest CLI entry point (vitest.mjs).");
    }
    dir = parent;
  }
}

const cwd = normalizeDriveLetter(process.cwd());
if (cwd !== process.cwd()) {
  process.chdir(cwd);
}

const child = spawn(
  process.execPath,
  [normalizeDriveLetter(resolveVitestCli()), ...process.argv.slice(2)],
  {
    cwd,
    env: process.env,
    stdio: "inherit",
    windowsHide: true,
  },
);

child.on("error", (error) => {
  console.error(error);
  process.exit(1);
});

child.on("exit", (code, signal) => {
  process.exit(signal ? 1 : (code ?? 1));
});
