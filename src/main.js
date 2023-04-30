import "@babel/polyfill";
import "mutationobserver-shim";
import Vue from "vue";
import "./plugins/bootstrap-vue";
import App from "./App.vue";
Vue.config.productionTip = false;
import VueLuxon from "vue-luxon";
import router from './router'
import store from './store'

Vue.use(VueLuxon);


new Vue({
  router,
  store,
  render: (h) => h(App)
}).$mount("#app");
