import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: { "@": path.resolve(__dirname, "./src") },
  },
  define: {
    // Polyfill Buffer for wagmi/ethers deps that reference it in browser context
    global: "globalThis",
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("lightweight-charts"))                               return "vendor-charts";
          if (id.includes("@lifi/"))                                           return "vendor-lifi";
          if (id.includes("@privy-io/"))                                       return "vendor-privy";
          if (id.includes("wagmi") || id.includes("viem") || id.includes("@wagmi/")) return "vendor-wagmi";
          if (id.includes("node_modules/react") || id.includes("react-router")) return "vendor-react";
        },
      },
    },
  },
  server: {
    port: 5173,
    proxy: {
      "/api": {
        target: "http://localhost:4000",
        changeOrigin: true,
      },
    },
  },
});
