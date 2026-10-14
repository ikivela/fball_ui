import { createRouter, createWebHistory } from "vue-router";

// Sovelluksen reitit. Näkymät ladataan laiskasti omina paloinaan.
const routes = [
  // Kirjautuminen: ainoa reitti, joka ei vaadi API-tokenia
  {
    path: '/login',
    name: 'LoginView',
    component: () => import('../views/LoginView.vue')
  },
  // Etusivu: tulevat ja viimeksi pelatut ottelut
  {
    path: "/",
    name: "AjankohtaisetView",
    component: () =>
      import(
        /* webpackChunkName: "Ajankohtaiset" */ "../views/AjankohtaisetView.vue"
      ),
  },
  // Kauden kaikki ottelut
  {
    path: "/ottelut",
    name: "OttelutView",
    component: () =>
      import(/* webpackChunkName: "Ottelut" */ "../views/OttelutView.vue"),
  },
  // Pelaajalista (oletuksena vain seuran nykyiset pelaajat)
  {
    path: "/pelaajat",
    name: "PelaajatView",
    component: () =>
      import(/* webpackChunkName: "Ottelut" */ "../views/PelaajatView.vue"),
  },
  // Kausi- ja kaikkien aikojen tilastot
  {
    path: "/tilastot",
    name: "TilastotView",

    component: () =>
      import(/* webpackChunkName: "About" */ "../views/TilastotView.vue"),
  },
  // Sarjojen/ikäluokkien vertailu
  {
    path: '/vertaile',
    name: 'ClassMatrix',
    component: () => import('../views/VertailuView.vue')
  },
  // Ottelupöytäkirja; season = kauden loppuvuosi (kausi 2026-2027 → 2027)
  {
    path: '/ottelu/:season/:game_id',
    name: 'OtteluView',
    component: () => import('../views/OtteluView.vue'),
    props: true
  },
  // Pelaajasivu Torneopalin player_id:llä
  {
    path: '/pelaaja/:player_id',
    name: 'PelaajaView',
    component: () => import('../views/PelaajaView.vue'),
    props: true
  },
  // Sarjataulukot
  {
    path: '/sarjataulukot',
    name: 'SarjataulukotView',
    component: () => import('../views/SarjataulukotView.vue')
  },
  // Tietoja sivustosta
  {
    path: '/tietoja',
    name: 'TietojaView',
    component: () => import('../views/TietojaView.vue')
  },
];

// Tuotannossa sovellus toimii alipolussa (VITE_APP_BASE_URL)
const router = createRouter({
  history: createWebHistory(import.meta.env.VITE_APP_BASE_URL || '/'),
  routes,
  // Selaimen takaisin-napilla palataan aiempaan kohtaan, muuten sivun alkuun
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition;
    }

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
