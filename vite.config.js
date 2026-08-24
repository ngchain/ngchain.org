import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// self-contained landing page served at the domain root
export default defineConfig({
  base: "/",
  plugins: [react()],
  build: { outDir: "dist", emptyOutDir: true },
});
