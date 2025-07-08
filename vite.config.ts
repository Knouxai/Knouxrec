import path from "path";
import { defineConfig } from "vite";

export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "."),
    },
  },
  server: {
    host: true,
    port: 5173,
  },
  build: {
    outDir: "dist",
    sourcemap: false,
    minify: "terser",
  },
});
