import "./assets/css/main.css";
import "./assets/css/font.css";

import { createApp } from "vue";
import App from "./App.vue";
import ui from "@nuxt/ui/vue-plugin";

createApp(App).use(ui).mount("#app");
