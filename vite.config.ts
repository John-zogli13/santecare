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
      // FORCE TOUTE L'IMPORTATION TENSORFLOW VERS LE POINT D'ENTRÉE UNIQUE
      "@tensorflow/tfjs-core/dist/register_all_gradients": "@tensorflow/tfjs",
      "@tensorflow/tfjs-core": "@tensorflow/tfjs",
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: false, // Désactiver pour éviter les fuites de chemins système
    commonjsOptions: {
      include: [/node_modules/],
      transformMixedEsModules: true,
    },
    rollupOptions: {
      output: {
        // Évite que les noms de fichiers contiennent des chemins absolus
        manualChunks: (id) => {
          if (id.includes('node_modules')) {
            return 'vendor';
          }
        },
      },
    },
  },
}));