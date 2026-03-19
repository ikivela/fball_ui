import { createStore } from "vuex";
import { DateTime } from "luxon";
import axios from "axios";

function normalizePlayers(payload) {
  if (Array.isArray(payload)) return payload;
  if (payload && Array.isArray(payload.players)) return payload.players;
  return [];
}

export default createStore({
  state: {
    seasons: [],
    stats: {},
    games: {},
    players: [],
    playerDetails: {},
  },
  getters: {
    getStats: (state) => state.stats,
    getSeasons: (state) => state.seasons,
    getGames: (state, _season) => state.games[_season],
    getPlayers: (state) => state.players,
    getPlayerById: (state) => (playerId) => state.playerDetails[playerId],
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
    SET_players(state, _players) {
      state.players = _players;
    },
    SET_player_detail(state, { playerId, player }) {
      state.playerDetails = {
        ...state.playerDetails,
        [playerId]: player,
      };
    },
    SET_games(state, _gamesdata) {
      console.log("store: set games", _gamesdata);
      state.games[_gamesdata.season] = _gamesdata.games.sort((a, b) => {
        let a_date = DateTime.fromISO(a.GameDate + "T" + a.GameTime).toMillis();
        let b_date = DateTime.fromISO(b.GameDate + "T" + b.GameTime).toMillis();

        return a_date > b_date ? 1 : -1;
      });
    },
  },
  actions: {
    async fetchGames({ commit }, year) {
      console.log("fetching year % from api", year);
      let response = await axios.get(
        `${import.meta.env.VITE_APP_BACKEND_URL}/games/?year=${year}`,
      );
      commit("SET_games", { games: response.data, season: year });
    },
    async fetchSeasons({ commit }) {

      let res = await axios.get(`${import.meta.env.VITE_APP_BACKEND_URL}/seasons`);
      let seasons = res.data.data;
      if (seasons.length === 0) return [];

      seasons = seasons.sort((a, b) => (a > b ? -1 : 1));
      seasons = seasons.map((x) => {
        return {
          text: `${x - 1}-${x}`,
          value: x,
        };
      });

      commit("SET_seasons", seasons);
    },
    async fetchStats({ commit }) {
      let res = await axios.get(
        `${import.meta.env.VITE_APP_BACKEND_URL}/seasonstats`,
      );
      commit("SET_stats", res.data);
    },
    async fetchPlayers({ state, commit }, options = {}) {
      if (!options.force && Array.isArray(state.players) && state.players.length > 0) {
        return state.players;
      }

      let res = await axios.get(`${import.meta.env.VITE_APP_BACKEND_URL}/players`);
      const players = normalizePlayers(res.data);
      commit("SET_players", players);
      return players;
    },
    async fetchPlayerById({ state, commit }, { playerId, force = false }) {
      if (!playerId) return null;
      if (!force && state.playerDetails[playerId]) {
        return state.playerDetails[playerId];
      }

      const res = await axios.get(
        `${import.meta.env.VITE_APP_BACKEND_URL}/players?player_id=${playerId}`
      );
      commit("SET_player_detail", { playerId, player: res.data });
      return res.data;
    },
  },
  modules: {},
});
