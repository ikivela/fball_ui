import { createApp } from "vue";
import bootstrapVue from "./plugins/bootstrap-vue";
import "bootstrap/dist/css/bootstrap.css";
import "bootstrap-vue-next/dist/bootstrap-vue-next.css";
import App from "./App.vue";
import router from "./router";
import store from "./store";

const app = createApp(App);
import axios from "axios";

// Axios interceptor for 401/403
// Axios request interceptor: lisää Authorization-header
axios.interceptors.request.use(
  config => {
    const token = localStorage.getItem('apitoken');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  error => Promise.reject(error)
);
axios.interceptors.response.use(
  response => response,
  error => {
    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
      if (router.currentRoute.value.path !== '/login') {
        router.replace('/login');
      }
    }
    return Promise.reject(error);
  }
);

// Intercept fetch to handle 401 globally
const originalFetch = window.fetch;
window.fetch = async (...args) => {
  const response = await originalFetch(...args);
  if (response.status === 401 || response.status === 403) {
    if (window.location.pathname !== '/login') {
      router.replace('/login');
    }
  }
  return response;
};

app.use(bootstrapVue);
app.use(router);
app.use(store);

app.mount("#app");
