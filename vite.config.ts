import { fileURLToPath, URL } from "node:url";

import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import vueDevTools from "vite-plugin-vue-devtools";
import ui, { NuxtUIOptions } from "@nuxt/ui/vite";

const uiOptions: NuxtUIOptions = {
  ui: {
    colors: {
      primary: "yellow",
      neutral: "zinc",
    },
  },
};

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue(), vueDevTools(), ui(uiOptions)],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  }
});
