import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

export default defineConfig(({ mode }) => ({
  // FORCE les chemins relatifs pour éviter les erreurs /vercel/path0/
  base: './', 
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
    // Désactive les sourcemaps qui pointent vers les dossiers locaux du serveur
    sourcemap: false, 
    assetsDir: 'assets',
    rollupOptions: {
      output: {
        // Force un nom de fichier simple pour éviter les mauvaises résolutions de modules
        entryFileNames: `assets/[name].js`,
        chunkFileNames: `assets/[name].js`,
        assetFileNames: `assets/[name].[ext]`
      },
    },
  },
}));