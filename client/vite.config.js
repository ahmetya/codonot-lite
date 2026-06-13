import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    // Mermaid is loaded on demand. Its parser is published as one prebundled
    // module, so it cannot be divided further by Vite.
    chunkSizeWarningLimit: 650,
  },
  server: {
    proxy: {
      "/api": "http://localhost:3001",
    },
  },
});
