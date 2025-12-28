import { createRouter, createWebHistory } from "vue-router";
import PelaajaView from '../views/PelaajaView.vue';

const routes = [
  {
    path: '/login',
    name: 'LoginView',
    component: () => import('../views/LoginView.vue')
  },
  {
    path: "/",
    name: "OttelutView",
    component: () =>
      import(
        /* webpackChunkName: "Ottelut" */ "../views/OttelutView.vue"
      ),
  },
  {
    path: "/ottelut",
    name: "OttelutViewAlias",
    component: () =>
      import(/* webpackChunkName: "Ottelut" */ "../views/OttelutView.vue"),
  },
  {
    path: "/pelaajat",
    name: "PelaajatView",
    component: () =>
      import(/* webpackChunkName: "Ottelut" */ "../views/PelaajatView.vue"),
  },
  {
    path: "/tilastot",
    name: "TilastotView",
   
    component: () =>
      import(/* webpackChunkName: "About" */ "../views/TilastotView.vue"),
  },
  {
    path: '/vertaile',
    name: 'ClassMatrix',
    component: () => import('../views/VertailuView.vue')
  },
  {
    path: '/ottelu/:season/:game_id',
    name: 'OtteluView',
    component: () => import('../views/OtteluView.vue'),
    props: true
  },
  {
    path: '/pelaaja/:player_id',
    name: 'PelaajaView',
    component: PelaajaView,
    props: true
  },
  {
    path: '/sarjataulukot',
    name: 'SarjataulukotView',
    component: () => import('../views/SarjataulukotView.vue')
  },
  /* {
     path: '/pelaajat',
     name: 'PelaajatView',
     component: () => import(/* webpackChunkName: "Pelaajat"  '../views/PelaajatView.vue')
   },*/
];

const router = createRouter({
  history: createWebHistory((import.meta.env.VITE_BASE_PATH) || '/'),
  routes,
  scrollBehavior() {
    // Always scroll to top
    return { top: 0 };
  },
});

export default router;

// Autentikointitarkistus kaikille reiteille
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('apitoken');
  if (to.path !== '/login' && !token) {
    next('/login');
  } else {
    next();
  }
});
