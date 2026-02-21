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
  optimizeDeps: {
    // On force Vite à inclure tout le paquet tfjs d'un coup
    include: ['@tensorflow/tfjs'],
    // On exclut les sous-paquets de l'optimisation pour éviter les conflits de chemins
    exclude: ['@tensorflow/tfjs-core', '@tensorflow/tfjs-converter']
  },
  build: {
    commonjsOptions: {
      include: [/node_modules/],
      transformMixedEsModules: true,
    },
    rollupOptions: {
      // On aide Rollup à ignorer les avertissements circulaires fréquents avec TFJS
      onwarn(warning, warn) {
        if (warning.code === 'CIRCULAR_DEPENDENCY' && warning.message.includes('@tensorflow')) {
          return;
        }
        warn(warning);
      },
    },
  },
}));