import Vue from "vue";
import VueRouter from "vue-router";

Vue.use(VueRouter);

const routes = [
  {
    path: "/",
    name: "AjankohtaisetView",
    component: () =>
      import(
        /* webpackChunkName: "Ottelut" */ "../views/AjankohtaisetView.vue"
      ),
  },
  {
    path: "/ottelut",
    name: "OttelutView",
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
  /* {
     path: '/pelaajat',
     name: 'PelaajatView',
     component: () => import(/* webpackChunkName: "Pelaajat"  '../views/PelaajatView.vue')
   },*/
];

const router = new VueRouter({
  mode: "history",
  base: process.env.BASE_URL,
  routes,
});

export default router;
