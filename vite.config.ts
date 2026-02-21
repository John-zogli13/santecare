import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: false,
    },
  },
  plugins: [
    react(),
    mode === "development" && componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    outDir: 'dist',
    commonjsOptions: {
      include: [/node_modules/],
      transformMixedEsModules: true,
    },
    rollupOptions: {
      // SOLUTION CRITIQUE ICI :
      // On ignore les sous-modules profonds qui bloquent le build
      external: [
        /@tensorflow\/tfjs-core\/dist\/.*/,
      ],
      onwarn(warning, warn) {
        if (warning.code === 'CIRCULAR_DEPENDENCY' && warning.message.includes('@tensorflow')) {
          return;
        }
        warn(warning);
      },
    },
  },
}));