import { createApp } from "vue";
import bootstrapVue from "./plugins/bootstrap-vue";
import "bootstrap/dist/css/bootstrap.css";
import "bootstrap-vue-next/dist/bootstrap-vue-next.css";
import App from "./App.vue";
import router from "./router";
import store from "./store";

const app = createApp(App);

app.use(bootstrapVue);
app.use(router);
app.use(store);

app.mount("#app");
