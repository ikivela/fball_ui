import Vue from 'vue'
import Vuex from 'vuex'
import { DateTime } from 'luxon';
import axios from 'axios';



Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    seasons: [],
    stats: {},
    games: {}
  },
  getters: {
    getStats: (state) => state.stats,
    getSeasons: (state) => state.seasons,
    getGames: (state, _season) => state.games[_season]
  },
  mutations: {
    SET_seasons(state, _seasons) {
      console.log("store: set seasons");
      state.seasons = _seasons;

    },
    SET_stats(state, _stats) {
      console.log("store: set stats");
      state.stats = _stats;
    },
    SET_games(state, _gamesdata) {
      console.log("store: set games", _gamesdata);
      state.games[_gamesdata.season] = _gamesdata.games.sort((a, b) => {
        let a_date = DateTime.fromISO(a.GameDate + "T" + a.GameTime).toMillis();
        let b_date = DateTime.fromISO(b.GameDate + "T" + b.GameTime).toMillis();

        return a_date > b_date ? 1 : -1;
      });
    }

  },
  actions: {
    async fetchGames({ commit }, year) {
      console.log("fetching year % from api", year);
      let response = await axios.get(`${process.env.VUE_APP_BACKEND_URL}/games/?year=${year}`);
      commit('SET_games', { games: response.data, season: year });
    },
    async fetchSeasons({ commit }) {
      let res = await axios.get(`${process.env.VUE_APP_BACKEND_URL}/seasons`);
      let seasons = res.data.data;
      seasons = seasons.sort((a, b) => (a > b ? -1 : 1));
      seasons = seasons.map((x) => {
        return {
          text: `${x - 1}-${x}`,
          value: x,
        };
      });

      commit('SET_seasons', seasons);
    },
    async fetchStats({ commit }) {
      let res = await axios.get(`${process.env.VUE_APP_BACKEND_URL}/seasonstats`);
      commit('SET_stats', res.data);
    }

  },
  modules: {

  }
})
