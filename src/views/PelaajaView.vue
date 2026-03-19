<template>
  <div class="pelaaja-view games-section">
    <div class="container">
      <div class="row">
        <div class="col-12">
          <div class="games-card">
            <div v-if="loading" class="loading">Ladataan...</div>
            <div v-else-if="error" class="error">{{ error }}</div>
            <div v-else-if="player">
              <div class="player-profile-card">
                <h2>{{ player.firstname }} {{ player.lastname }}</h2>
                <div class="player-meta">
                  <span>
                    <strong>Syntymävuosi:</strong>
                    {{ player.birth_year || player.birth_day || "-" }}
                  </span>
                  <span><strong>Kotiseura:</strong> {{ kotiseura }}</span>
                </div>
              </div>

              <div v-if="rinnakkaisedustukset.length" class="player-section">
                <h5>Rinnakkaisedustukset</h5>
                <ul class="parallel-list">
                  <li
                    v-for="edustus in rinnakkaisedustukset"
                    :key="edustus.key"
                  >
                    {{ edustus.club_name }} / {{ edustus.team_name }} ({{
                      edustus.category_name
                    }})
                  </li>
                </ul>
              </div>

              <div v-if="seasons.length" class="player-section">
                <h4>Kaudet ja joukkueet</h4>
                <div v-if="isSmallScreen" class="season-mobile-list">
                  <article
                    v-for="row in allTeamRows"
                    :key="row.key"
                    class="season-mobile-card"
                  >
                    <div class="season-mobile-top">
                      <span class="season-mobile-year">{{ row.season }}</span>
                      <span class="season-mobile-games">{{ row.games }} ott.</span>
                    </div>
                    <div class="season-mobile-team">{{ row.teamName }}</div>
                    <div class="season-mobile-category">{{ row.categoryName }}</div>
                  </article>
                </div>
                <table v-else class="table table-sm table-bordered">
                  <thead>
                    <tr>
                      <th>Kausi</th>
                      <th>Joukkue</th>
                      <th>Sarja</th>
                      <th>Pelejä</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="row in allTeamRows" :key="row.key">
                      <td>{{ row.season }}</td>
                      <td>{{ row.teamName }}</td>
                      <td>{{ row.categoryName }}</td>
                      <td>{{ row.games }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div v-else>
                <em>Ei kausia tai joukkueita löytynyt.</em>
              </div>

              <div v-if="Object.keys(matchesBySeason).length > 0" class="player-section">
                <h4 class="mt-4">Pelit</h4>
                <div class="matches-toolbar mb-2">
                  <label for="season-select"><strong>Valitse kausi:</strong></label>
                  <select
                    id="season-select"
                    v-model="selectedSeason"
                    class="form-select form-select-sm w-auto d-inline-block ml-2"
                  >
                    <option
                      v-for="season in Object.keys(matchesBySeason).sort().reverse()"
                      :key="season"
                      :value="season"
                    >
                      {{ season }}
                    </option>
                  </select>
                  <select
                    id="category-select"
                    v-model="selectedCategory"
                    class="form-select form-select-sm w-auto d-inline-block ml-2"
                  >
                    <option :value="''" key="empty-category">-</option>
                    <option
                      v-for="category_name in matchesBySeason[selectedSeason]
                        .map((m) => m.category_name)
                        .filter((value, index, self) => self.indexOf(value) === index)"
                      :key="category_name"
                      :value="category_name"
                    >
                      {{ category_name }}
                    </option>
                  </select>
                  <span class="ppg-inline">
                    Pisteitä/peli:
                    {{
                      filteredMatches.length > 0
                        ? (
                            filteredMatches.reduce((sum, match) => {
                              return (
                                sum +
                                Number(match.player_goals || 0) +
                                Number(match.player_assists || 0)
                              );
                            }, 0) / filteredMatches.length
                          ).toFixed(2)
                        : "0.00"
                    }}
                  </span>
                </div>

                <div v-if="isSmallScreen" class="match-mobile-list">
                  <article
                    v-for="match in filteredMatches"
                    :key="match.match_id"
                    class="match-mobile-card"
                  >
                    <div class="match-mobile-top">
                      <span>{{ match.date || "-" }}</span>
                      <span>{{ match.category_name || "-" }}</span>
                    </div>
                    <div class="match-mobile-game">
                      {{
                        match.team_A_name && match.team_B_name
                          ? match.team_A_name + " vs " + match.team_B_name
                          : match.team_name || "-"
                      }}
                    </div>
                    <div class="match-mobile-bottom">
                      <router-link
                        v-if="hasClubMatchReport(match)"
                        :to="matchReportRoute(match)"
                        class="match-mobile-score"
                      >
                        {{ match.fs_A + " - " + match.fs_B }}
                      </router-link>
                      <span v-else class="match-mobile-score muted">-</span>
                      <span
                        v-if="match.player_goals + match.player_assists > 0"
                        class="match-mobile-points"
                      >
                        {{ match.player_goals || 0 }} + {{ match.player_assists || 0 }}
                      </span>
                    </div>
                  </article>
                </div>

                <table v-else class="table table-sm table-bordered">
                  <thead>
                    <tr>
                      <th>Päivä</th>
                      <th>Sarja</th>
                      <th>Ottelu</th>
                      <th>Tulos</th>
                      <th>Tehot</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="match in filteredMatches" :key="match.match_id">
                      <td>{{ match.date || "-" }}</td>
                      <td>{{ match.category_name || "-" }}</td>
                      <td>
                        {{
                          match.team_A_name && match.team_B_name
                            ? match.team_A_name + " vs " + match.team_B_name
                            : match.team_name || "-"
                        }}
                      </td>
                      <td>
                        <router-link
                          v-if="hasClubMatchReport(match)"
                          :to="matchReportRoute(match)"
                          class="text-primary"
                          style="cursor: pointer; text-decoration: underline"
                        >
                          {{ match.fs_A + " - " + match.fs_B }}
                        </router-link>
                        <span v-else></span>
                      </td>
                      <td>
                        <span v-if="match.player_goals + match.player_assists > 0">
                          {{ match.player_goals || 0 }} +
                          {{ match.player_assists || 0 }}
                        </span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import { mapActions } from "vuex";

export default {
  name: "PelaajaView",
  props: ["player_id"],
  data() {
    return {
      player: null,
      loading: true,
      error: "",
      teamsBySeason: {},
      seasons: [],
      kotiseura: "",
      rinnakkaisedustukset: [],
      allMatchSeasons: [],
      selectedSeason: "",
      selectedCategory: "",
      matchesBySeason: [],
      gameReport: null,
      reportLoading: false,
      reportError: "",
      showGameReport: false,
      clubName: import.meta.env.VITE_APP_CLUB_NAME || "",
      isSmallScreen: false,
    };
  },
  mounted() {
    this.fetchPlayer();
    this.updateScreenWidth();
    window.addEventListener("resize", this.updateScreenWidth);
  },
  beforeUnmount() {
    window.removeEventListener("resize", this.updateScreenWidth);
  },
  watch: {
    "$route.params.player_id": {
      immediate: true,
      handler(newId, oldId) {
        if (newId !== oldId) {
          this.fetchPlayer();
        }
      },
    },
  },
  methods: {
    ...mapActions(["fetchPlayerById"]),
    processTeams() {
      const pdata = this.player.player_data
        ? typeof this.player.player_data === "string"
          ? JSON.parse(this.player.player_data)
          : this.player.player_data
        : null;
      if (!pdata || !pdata.matches) {
        this.teamsBySeason = {};
        this.seasons = [];
        return;
      }

      const map = {};
      pdata.matches.forEach((match) => {
        const season = match.season_id || match.season || "-";
        const teamKey = match.team_id + "-" + (match.team_name || "");
        if (!map[season]) map[season] = {};
        if (!map[season][teamKey]) {
          map[season][teamKey] = {
            teamName: match.team_name || "-",
            categoryName: match.category_name || "-",
            games: 0,
            teamKey,
          };
        }
        map[season][teamKey].games += 1;
      });

      this.seasons = Object.keys(map).sort().reverse();
      this.teamsBySeason = {};
      this.seasons.forEach((season) => {
        this.teamsBySeason[season] = Object.values(map[season]);
      });
    },
    processSeuraEdustukset() {
      const pdata = this.player.player_data
        ? typeof this.player.player_data === "string"
          ? JSON.parse(this.player.player_data)
          : this.player.player_data
        : null;
      this.kotiseura = pdata && pdata.club_name ? pdata.club_name : "-";
      this.rinnakkaisedustukset = [];
      if (pdata && Array.isArray(pdata.teams)) {
        this.rinnakkaisedustukset = pdata.teams
          .filter(
            (t) =>
              t.parallel_representation === "1" &&
              t.club_name &&
              t.club_name.toLowerCase() !== `${this.clubName.toLowerCase()} kokkola`
          )
          .map((t) => ({
            club_name: t.club_name,
            team_name: t.team_name,
            category_name:
              t.primary_category && t.primary_category.category_name
                ? t.primary_category.category_name
                : "-",
            key:
              t.team_id +
              "-" +
              (t.primary_category && t.primary_category.category_name
                ? t.primary_category.category_name
                : "-"),
          }));
      }
    },
    processMatches() {
      const pdata = this.player.player_data
        ? typeof this.player.player_data === "string"
          ? JSON.parse(this.player.player_data)
          : this.player.player_data
        : null;
      if (!pdata || !pdata.matches) {
        this.matchesBySeason = [];
        this.allMatchSeasons = [];
        this.selectedSeason = "";
        return;
      }
      const bySeason = {};
      pdata.matches.forEach((match) => {
        const season = match.season_id || match.season || "-";
        if (!bySeason[season]) bySeason[season] = [];
        bySeason[season].push(match);
      });
      this.allMatchSeasons = Object.keys(bySeason).sort().reverse();
      this.selectedSeason = this.allMatchSeasons[0] || "";
      this.matchesBySeason = bySeason;
    },
    async fetchPlayer() {
      this.loading = true;
      this.error = "";
      window.scrollTo({ top: 0, behavior: "smooth" });
      try {
        this.player = await this.fetchPlayerById({
          playerId: this.$route.params.player_id,
        });
        this.processTeams();
        this.processSeuraEdustukset();
        this.processMatches();
      } catch (e) {
        this.error = "Pelaajaa ei löytynyt.";
      } finally {
        this.loading = false;
      }
    },
    updateScreenWidth() {
      this.isSmallScreen = window.matchMedia("(max-width: 480px)").matches;
    },
    hasClubMatchReport(match) {
      return !!(
        match.fs_A &&
        match.fs_B &&
        ((match.team_A_name &&
          match.team_A_name.toLowerCase().includes(this.clubName.toLowerCase())) ||
          (match.team_B_name &&
            match.team_B_name.toLowerCase().includes(this.clubName.toLowerCase())))
      );
    },
    matchReportRoute(match) {
      return {
        name: "OtteluView",
        params: {
          season:
            (match.season_id || match.season || "").split("-")[1] ||
            match.season_id ||
            match.season,
          game_id: match.match_id || match.UniqueID || match.gameid,
        },
      };
    },
  },
  computed: {
    filteredMatches() {
      if (!this.selectedSeason || !this.matchesBySeason[this.selectedSeason]) {
        return [];
      }

      if (!this.selectedCategory || this.selectedCategory === "") {
        return this.matchesBySeason[this.selectedSeason]
          .slice()
          .sort((a, b) => (b.date || "").localeCompare(a.date || ""));
      }

      return this.matchesBySeason[this.selectedSeason]
        .filter((match) => match.category_name === this.selectedCategory)
        .slice()
        .sort((a, b) => (b.date || "").localeCompare(a.date || ""));
    },
    allTeamRows() {
      const rows = [];
      this.seasons.forEach((season) => {
        (this.teamsBySeason[season] || []).forEach((team) => {
          rows.push({
            season,
            teamName: team.teamName,
            categoryName: team.categoryName,
            games: team.games,
            key: season + "-" + team.teamKey,
          });
        });
      });
      return rows;
    },
    formattedGameReportTitle() {
      if (
        !this.gameReport ||
        !this.gameReport.date ||
        !this.gameReport.homeName ||
        !this.gameReport.awayName
      ) {
        return "";
      }
      let dateStr = this.gameReport.date;
      let timeStr = "";
      if (dateStr.includes(" ")) {
        const parts = dateStr.split(" ");
        dateStr = parts[0];
        timeStr = parts[1] ? parts[1].slice(0, 5) : "";
      }
      const [yyyy, mm, dd] = dateStr.split("-");
      const formatted = `${dd}.${mm}.${yyyy}` + (timeStr ? ` ${timeStr}` : "");
      return `${formatted} ${this.gameReport.homeName} vs ${this.gameReport.awayName}`;
    },
  },
};
</script>

<style scoped>
@import "../assets/_shared-sections.scss";

.player-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem 1rem;
  margin-bottom: 1rem;
  color: #444;
}

.player-profile-card,
.player-section {
  margin-bottom: 1.25rem;
}

.parallel-list {
  padding-left: 1.1rem;
}

.season-block {
  margin-bottom: 2rem;
}

.season-title {
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: #333;
}

.loading {
  color: #888;
  font-size: 1.2rem;
}

.error {
  color: #b00;
  font-weight: 600;
}

.mt-4 {
  margin-top: 2rem;
}

.ml-2 {
  margin-left: 0.5rem;
}

.timeline-container {
  overflow-x: auto;
  margin-bottom: 1.5rem;
}

.timeline {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  position: relative;
}

.timeline-row {
  display: flex;
  align-items: center;
}

.timeline-col {
  flex: 1 1 0;
  min-width: 0;
}

.timeline-col.text-end {
  text-align: right;
  justify-content: flex-end;
  display: flex;
}

.timeline-col.text-start {
  text-align: left;
  justify-content: flex-start;
  display: flex;
}

.timeline-time-col {
  flex: 0 0 70px;
  max-width: 80px;
  min-width: 60px;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-right: 12px;
  margin-left: 12px;
}

.timeline-time-box {
  background: #0d6efd;
  color: #fff;
  border-radius: 0.5em;
  padding: 0.2em 0;
  font-weight: bold;
  font-size: 1em;
  min-width: 70px;
  max-width: 70px;
  width: 70px;
  text-align: center;
  box-shadow: 0 0 0 2px #e5e7eb;
  display: flex;
  justify-content: center;
  align-items: center;
}

.timeline-event-content {
  display: inline-flex;
  align-items: center;
  word-break: break-word;
  max-width: 220px;
}

.player-link {
  color: #007bff;
  text-decoration: none;
}

.player-link:hover {
  text-decoration: underline;
}

.modal-lg {
  max-width: 700px;
}

.table-sm td,
.table-sm th {
  padding: 0.2rem 0.5rem;
}

.games-card {
  padding: 2rem 2rem 1.5rem 2rem;
}

.season-mobile-list,
.match-mobile-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.season-mobile-card,
.match-mobile-card {
  border: 1px solid var(--border-color);
  border-radius: 12px;
  padding: 0.85rem 0.9rem;
  background: linear-gradient(180deg, #ffffff 0%, #f8fafc 100%);
}

.season-mobile-top,
.match-mobile-top {
  display: flex;
  justify-content: space-between;
  gap: 0.75rem;
  font-size: 0.78rem;
  color: var(--text-light);
  margin-bottom: 0.35rem;
}

.season-mobile-team,
.match-mobile-game {
  font-size: 0.98rem;
  font-weight: 700;
  color: var(--text-dark);
  line-height: 1.2;
}

.season-mobile-category {
  margin-top: 0.2rem;
  font-size: 0.82rem;
  color: var(--primary-color);
}

.matches-toolbar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.5rem;
}

.ppg-inline {
  font-size: 0.9rem;
  color: var(--text-dark);
}

.match-mobile-bottom {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 0.75rem;
  margin-top: 0.55rem;
}

.match-mobile-score {
  color: var(--primary-color);
  font-weight: 700;
  text-decoration: underline;
}

.match-mobile-score.muted {
  color: var(--text-light);
  text-decoration: none;
}

.match-mobile-points {
  font-size: 0.82rem;
  font-weight: 600;
  color: var(--text-dark);
}

@media (max-width: 768px) {
  .timeline-dot {
    width: 2em;
    height: 2em;
    font-size: 0.95em;
  }
}

@media (max-width: 480px) {
  .games-card {
    padding: 0.85rem;
  }

  .player-meta {
    flex-direction: column;
    gap: 0.25rem;
  }

  .matches-toolbar {
    align-items: stretch;
  }

  .matches-toolbar .form-select {
    width: 100% !important;
    margin-left: 0 !important;
  }

  .ppg-inline {
    display: block;
    width: 100%;
  }
}
</style>
