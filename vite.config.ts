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
      // Force la redirection vers les modules ESM de TFJS
      '@tensorflow/tfjs-core': '@tensorflow/tfjs-core/dist/index.js',
    },
  },
  optimizeDeps: {
    include: [
      '@tensorflow/tfjs',
      '@tensorflow/tfjs-core',
      '@tensorflow/tfjs-converter',
      '@tensorflow/tfjs-backend-webgl'
    ],
  },
  build: {
    commonjsOptions: {
      include: [/node_modules/],
      transformMixedEsModules: true, // Important pour TFJS
    },
    rollupOptions: {
      // Si Rollup bloque encore, on peut lui dire de traiter ces modules comme externes
      // Mais essayons d'abord avec le flag transformMixedEsModules
    }
  },
}));