# CLAUDE.md

Salibandyseuran (Nibacos) ottelu-, pelaaja- ja tilastosivusto. Vue 3 -frontend, jonka data tulee erillisestä
backendistä `../fball_backend` (Express + MySQL). Data on alun perin Torneopalin salibandy-API:sta
(`salibandy-api.torneopal.fi/taso/rest/`).

## Komennot

- `npm run dev` – kehityspalvelin (127.0.0.1:3000)
- `npm run build` – tuotantobuild `dist/`-hakemistoon; käytä tätä muutosten tarkistukseen (testejä ei ole)
- Backend: `node src/backend.js` (`../fball_backend`), tuotannossa pm2 (`ecosystem.config.js`)

## Rakenne

- `src/views/*View.vue` – sivut (Ajankohtaiset, Ottelut, Ottelu, Pelaajat, Pelaaja, Tilastot, Vertailu, Sarjataulukot, Tietoja, Login)
- `src/router/index.js` – reitit, esim. `/ottelu/:season/:game_id`, `/pelaaja/:player_id`
- `src/store/index.js` – Vuex; hakee backendiltä ja välimuistittaa (`fetchPlayers`, `fetchPlayerById` …)
- `src/main.js` – axios-interceptor lisää `Authorization: Bearer <apitoken>` (localStoragesta); kaikki backendin reitit vaativat tokenin
- `src/assets/_table-styles.scss`, `_shared-sections.scss` – jaetut tyylit
- `src/tmp/` – paikallisia esimerkkidatoja (gitignoroitu)

## Ympäristömuuttujat (`.env`, ei versionhallinnassa)

`VITE_APP_BACKEND_URL`, `VITE_APP_CLUB_NAME` (esim. "Nibacos"; käytetään oman seuran otteluiden tunnistamiseen
joukkueen nimestä), `VITE_APP_SITE_TITLE`, `VITE_APP_LOGO_URL`, `VITE_APP_BASE_URL` (tuotannon base path).
Backendin `.env`: `your_club_id` (368), `your_team_name`, `token` (Torneopal API), `DB_*`.

## Backend ja data (`../fball_backend`)

- `src/backend.js` – kaikki API-reitit (`/games`, `/gamestats`, `/players`, `/standings`, `/seasonstats` …)
- Ottelut tauluissa `` `<vuosi>_games` ``, vuosi = kauden loppuvuosi (kausi `2026-2027` → `2027_games`).
  Vuodesta 2024 alkaen sarakkeessa `matchdata` on koko Torneopalin `getMatch`-vastaus (mm. `lineups`, `events`).
- `players`-taulun `player_data` on Torneopalin `getPlayer`-vastaus (`teams`, `matches`, `club_id` …).
- Cron-jobit (pm2): `torneopal_fetch_games.js`, `torneopal_fetch_results.js`, `torneopal_generate_standings.js`.

## Torneopal-datan sudenkuopat

- Juniorien ottelukohtaiset pisteet puuttuvat `getPlayer`-datasta (`player_stats_visibility: "none"`).
  Ne täydennetään backendissä ottelun `lineups`-tiedoista (`fillPlayerMatchStats`).
- Erävoittopelit (`match_type: "double"`): tulos on erävoitot, maalit erikseen (`getPeriodWinResult`).
- Rinnakkaisedustus (R-edustus): `teams[].parallel_representation === "1"` ja joukkueen seura ≠ pelaajan
  kotiseura (`club_id`). Oma seura voi olla myös R-edustuksen seura.
- Nykyinen pelaaja = joukkue omassa seurassa tai kotiseura oma ja pelannut tällä/edellisellä kaudella
  (`isCurrentClubPlayer`). Kausi vaihtuu elokuussa.
- Kentät ovat usein merkkijonoja (`"0"`, `""`); vertaa id:t `String(...)`-muodossa.

## Käytännöt

- UI-tekstit ja koodikommentit suomeksi; noudata ympäröivän koodin tyyliä (Options API, Bootstrap-Vue-Next).
- Mobiilinäkymä on toteutettu erikseen (`isSmallScreen`, ≤480px) – päivitä muutokset sekä taulukko- että korttinäkymään.
- Git: commitit noreply-osoitteella (`493381+ikivela@users.noreply.github.com`, asetettu repokohtaisesti),
  muuten GitHub hylkää pushin (GH007).
