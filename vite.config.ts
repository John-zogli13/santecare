import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

export default defineConfig(({ mode }) => ({
  // On remet la base à '/' pour Vercel
  base: "/",
  server: {
    host: "::",
    port: 8080,
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
    outDir: "dist",
    commonjsOptions: {
      // TensorFlow en a absolument besoin pour fonctionner dans le navigateur
      transformMixedEsModules: true,
    },
  },
  // On laisse Bun gérer l'optimisation par défaut
}));