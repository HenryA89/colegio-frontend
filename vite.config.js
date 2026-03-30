import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    chunkSizeWarningLimit: 1000, // en KB
    rollupOptions: {
      onwarn(warning, warn) {
        // Silenciar warnings específicos de dependencias externas
        if (
          warning.code === "MODULE_LEVEL_DIRECTIVE" ||
          warning.message?.includes("DEPRECATED") ||
          warning.message?.includes("zustand")
        ) {
          return;
        }
        warn(warning);
      },
    },
  },
  server: {
    watch: {
      // Ignorar warnings específicos durante desarrollo
      ignored: ["**/node_modules/**"],
    },
  },
});
