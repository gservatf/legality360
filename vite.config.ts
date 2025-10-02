import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { fileURLToPath } from "url";
import { viteSourceLocator } from "@metagptx/vite-plugin-source-locator";

// __dirname no existe en ESM, lo definimos manualmente
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig(({ mode }) => ({
  plugins: [
    react(),
    // metagptx puede ser opcional, mejor dejarlo al final
    viteSourceLocator
      ? viteSourceLocator({ prefix: "mgx" })
      : undefined,
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    outDir: "dist", // asegura la salida correcta en Vercel
    sourcemap: mode === "development",
  },
}));
