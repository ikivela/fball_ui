import { createRouter, createWebHistory } from "vue-router";

const routes = [
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
    path: "/tilastot",
    name: "TilastotView",
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () =>
      import(/* webpackChunkName: "About" */ "../views/TilastotView.vue"),
  },
  {
    path: '/vertaile',
    name: 'ClassMatrix',
    component: () => import('../views/ClassMatrixView.vue')
  },
  /* {
     path: '/pelaajat',
     name: 'PelaajatView',
     component: () => import(/* webpackChunkName: "Pelaajat"  '../views/PelaajatView.vue')
   },*/
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
});

export default router;
