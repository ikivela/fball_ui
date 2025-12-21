<template>
  <div class="pelaaja-view games-section">
    <div class="container">
      <div class="row">
        <div class="col-12">
          <div class="games-card">
            <div v-if="loading" class="loading">Ladataan...</div>
            <div v-else-if="error" class="error">{{ error }}</div>
            <div v-else-if="player">
              <h2>{{ player.firstname }} {{ player.lastname }}</h2>
              <div class="player-meta">
                <span
                  ><strong>Syntymävuosi:</strong>
                  {{ player.birth_year || player.birth_day || "-" }}</span
                >
                <br />
                <span><strong>Kotiseura:</strong> {{ kotiseura }}</span>
              </div>
              <div v-if="rinnakkaisedustukset.length">
                <h5>Rinnakkaisedustukset</h5>
                <ul>
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
              <div v-if="seasons.length">
                <h4>Kaudet ja joukkueet</h4>
                <table class="table table-sm table-bordered">
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
              <div v-if="Object.keys(matchesBySeason).length">
                <h4 class="mt-4">Pelit</h4>
                <div class="mb-2">
                  <label for="season-select"
                    ><strong>Valitse kausi:</strong></label
                  >
                  <select
                    id="season-select"
                    v-model="selectedSeason"
                    class="form-select form-select-sm w-auto d-inline-block ml-2"
                  >
                    <option
                      v-for="season in Object.keys(matchesBySeason)
                        .sort()
                        .reverse()"
                      :key="season"
                      :value="season"
                    >
                      {{ season }}
                    </option>
                  </select>
                </div>
                <table class="table table-sm table-bordered">
                  <thead>
                    <tr>
                      <th>Päivä</th>
                      <th>Sarja</th>
                      <th>Ottelu</th>
                      <th>Tulos</th>
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
                          v-if="
                            match.fs_A &&
                            match.fs_B &&
                            ((match.team_A_name &&
                              match.team_A_name
                                .toLowerCase()
                                .includes('nibacos')) ||
                              (match.team_B_name &&
                                match.team_B_name
                                  .toLowerCase()
                                  .includes('nibacos')))
                          "
                          :to="{
                            name: 'OtteluView',
                            params: {
                              season:
                                (match.season_id || match.season || '').split('-')[1] ||
                                match.season_id ||
                                match.season,
                              game_id:
                                match.match_id ||
                                match.UniqueID ||
                                match.gameid
                            }
                          }"
                          class="text-primary"
                          style="cursor: pointer; text-decoration: underline"
                        >
                          {{ match.fs_A + " - " + match.fs_B }}
                        </router-link>
                        <span
                          v-else
                          class="text-primary"
                          style="text-decoration: underline"
                          >-</span
                        >
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
import axios from "axios";
import "bootstrap/dist/js/bootstrap.bundle.min.js";

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
      matchesBySeason: [],
      gameReport: null,
      reportLoading: false,
      reportError: "",
      showGameReport: false,
    };
  },
  mounted() {
    this.fetchPlayer();
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
    processTeams() {
      // Rakennetaan kaudet ja joukkueet pelimäärineen player_data:sta
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
      // { season: { teamKey: { teamName, categoryName, games } } }
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
      // Muodosta lista kausista ja joukkueista
      this.seasons = Object.keys(map).sort().reverse();
      this.teamsBySeason = {};
      this.seasons.forEach((season) => {
        this.teamsBySeason[season] = Object.values(map[season]);
      });
    },
    processSeuraEdustukset() {
      // Kotiseura juuritasolta
      const pdata = this.player.player_data
        ? typeof this.player.player_data === "string"
          ? JSON.parse(this.player.player_data)
          : this.player.player_data
        : null;
      this.kotiseura = pdata && pdata.club_name ? pdata.club_name : "-";
      // Rinnakkaisedustukset teams-taulukosta
      this.rinnakkaisedustukset = [];
      if (pdata && Array.isArray(pdata.teams)) {
        this.rinnakkaisedustukset = pdata.teams
          .filter(
            (t) =>
              t.parallel_representation === "1" &&
              t.club_name &&
              t.club_name.toLowerCase() !== "nibacos kokkola"
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
      // Ryhmittele pelit kausittain
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
        const baseurl = import.meta.env.VITE_APP_BACKEND_URL;
        const response = await axios.get(
          `${baseurl}/players?player_id=${this.$route.params.player_id}`
        );
        this.player = response.data;
        this.processTeams();
        this.processSeuraEdustukset();
        this.processMatches();
      } catch (e) {
        this.error = "Pelaajaa ei löytynyt.";
      } finally {
        this.loading = false;
      }
    },
  },
  computed: {
    filteredMatches() {
      if (!this.selectedSeason || !this.matchesBySeason[this.selectedSeason])
        return [];
      // Lajittele pelit uusimmat ensin
      return this.matchesBySeason[this.selectedSeason]
        .slice()
        .sort((a, b) => (b.date || "").localeCompare(a.date || ""));
    },
    allTeamRows() {
      // Palauttaa kaikki (season, team) rivit taulukkoon
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
      )
        return "";
      // Oletetaan että date on muodossa yyyy-mm-dd[ hh:mm:ss]
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
  margin-bottom: 1rem;
  color: #444;
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
  flex: 0 0 70px; /* kiinteä leveys, säädä tarvittaessa */
  max-width: 80px;
  min-width: 60px;
  display: flex;
  justify-content: center;
  align-items: center;
  /* Lisää marginaali oikealle, jotta oikeanpuoleinen nimi ei ole kiinni */
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
  color: #007bff; /* Linkin väri */
  text-decoration: none; /* Poista allekirjoitus */
  &:hover {
    text-decoration: underline; /* Väri muuttuu kun hover */
  }
}
@media (max-width: 768px) {
  .timeline-dot {
    width: 2em;
    height: 2em;
    font-size: 0.95em;
  }
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
</style> 