import "@babel/polyfill";
import "mutationobserver-shim";
import Vue from "vue";
import "./plugins/bootstrap-vue";
import App from "./App.vue";

Vue.config.productionTip = false;

import VueLuxon from "vue-luxon";
Vue.use(VueLuxon);


new Vue({
  render: (h) => h(App),
}).$mount("#app");
