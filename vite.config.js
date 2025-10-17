import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import tailwindcss from "@tailwindcss/vite";
import Components from 'unplugin-vue-components/vite';
import { VantResolver } from 'unplugin-vue-components/resolvers';
import path from "path";
import { fileURLToPath, URL } from "node:url";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    tailwindcss(),
    Components({
      resolvers: [VantResolver()],
    }),
  ],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  server: {
    port: 3000,
    open: true,
    proxy: {
      "/api/taipower": {
        target: "https://service.taipower.com.tw",
        changeOrigin: true,
        rewrite: (path) =>
          path.replace(
            /^\/api\/taipower/,
            "/data/opendata/apply/file/d007008/001.json"
          ),
      },
    },
  },
  build: {
    target: "esnext",
    minify: "terser",
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
    },
    rollupOptions: {
      output: {
        manualChunks: {
          "vue-vendor": ["vue", "pinia"],
          echarts: ["echarts/core", "vue-echarts"],
          vant: ["vant"],
          utils: ["./src/utils/formulas.js", "./src/utils/validators.js"],
        },
      },
    },
    chunkSizeWarningLimit: 600,
  },
});
