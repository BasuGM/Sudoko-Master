import path from "node:path";
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  test: {
    testTimeout: 40000,
    environment: "node",
    exclude: ["tests/e2e/**", "node_modules/**", ".next/**"],
  },
});
