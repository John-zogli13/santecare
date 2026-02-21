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
      // On force la résolution des imports internes vers le paquet principal
      "@tensorflow/tfjs-core": path.resolve(__dirname, "node_modules/@tensorflow/tfjs-core"),
    },
  },
  optimizeDeps: {
    include: ['@tensorflow/tfjs', '@tensorflow/tfjs-core', '@tensorflow/tfjs-converter'],
  },
  build: {
    outDir: 'dist',
    // Empêche la création de liens vers les dossiers système de Vercel
    sourcemap: false,
    commonjsOptions: {
      include: [/node_modules/],
      transformMixedEsModules: true,
    },
    rollupOptions: {
      output: {
        // Force le regroupement de TensorFlow dans un seul fichier pour éviter les erreurs de chemins
        manualChunks: {
          tensorflow: ['@tensorflow/tfjs', '@tensorflow/tfjs-core', '@tensorflow/tfjs-converter'],
        },
      },
    },
  },
}));