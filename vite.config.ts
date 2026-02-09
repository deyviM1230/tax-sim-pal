import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    proxy: {
      "/api": {
        target: "https://ptzsk572-4000.brs.devtunnels.ms",
        changeOrigin: true,
        secure: false,
        // ESTA ES LA CLAVE PARA ELIMINAR EL ERROR 403
        configure: (proxy, _options) => {
          proxy.on('proxyReq', (proxyReq, req, _res) => {
            // Forzamos el header Origin para que coincida con el backend
            proxyReq.setHeader('Origin', 'https://ptzsk572-4000.brs.devtunnels.ms');
          });
        },
      },
      "/ws": {
        target: "wss://ptzsk572-4000.brs.devtunnels.ms", // Nota: wss:// para conexiones seguras
        ws: true, // Habilita soporte para WebSockets
        changeOrigin: true,
        secure: false,
      },
    },  
    hmr: {
      overlay: false,
    },
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
