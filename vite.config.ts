import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: "",
  test: {
    globals: true,
    environment: "node", // Phase 1: pure functions, no DOM
    include: ["src/**/*.test.ts"],
  },
});
