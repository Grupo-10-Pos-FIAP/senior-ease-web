import os from "node:os";
import path from "node:path";
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

/**
 * On Windows, spawning one worker per core makes startup exceed Vitest's
 * worker ping budget (real-time antivirus scans every forked process),
 * surfacing as "Timeout waiting for worker to respond".
 * @see https://github.com/vitest-dev/vitest/issues/8968
 */
const workerLimit =
  process.platform === "win32" ? { maxWorkers: Math.min(2, os.availableParallelism()) } : {};

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@domain": path.resolve(__dirname, "./src/domain"),
      "@application": path.resolve(__dirname, "./src/application"),
      "@infrastructure": path.resolve(__dirname, "./src/infrastructure"),
      "@presentation": path.resolve(__dirname, "./src/presentation"),
      "@shared": path.resolve(__dirname, "./src/shared"),
      "@app": path.resolve(__dirname, "./src/app"),
    },
  },
  test: {
    environment: "jsdom",
    setupFiles: ["./src/shared/test/setup.ts"],
    pool: "forks",
    ...workerLimit,
    exclude: ["**/node_modules/**", "**/dist/**", "**/functions/**"],
  },
});
