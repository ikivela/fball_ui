<template>
  <div class="pelaajat-view games-section">
    <div class="container">
      <div class="row">
        <div class="col-12">
          <div class="games-card">
            <div
              class="games-header d-flex flex-wrap align-items-center gap-2 mb-3"
            >
              <div
                class="w-100 d-flex flex-wrap align-items-center mb-2 birthyear-filter-row"
              >
                <b-form-group
                  label="Syntymävuosi vähintään"
                  label-for="birthyear-filter-min"
                  class="mb-0 mr-3"
                >
                  <b-form-input
                    id="birthyear-filter-min"
                    v-model.number="birthYearFilterMin"
                    type="number"
                    min="1900"
                    max="2099"
                    placeholder="Esim. 2007"
                    class="mr-2"
                    style="max-width: 150px"
                  />
                </b-form-group>
                <b-form-group
                  label="Syntymävuosi enintään"
                  label-for="birthyear-filter-max"
                  class="mb-0 mr-3"
                >
                  <b-form-input
                    id="birthyear-filter-max"
                    v-model.number="birthYearFilterMax"
                    type="number"
                    min="1900"
                    max="2099"
                    placeholder="Esim. 2010"
                    class="mr-2"
                    style="max-width: 150px"
                  />
                </b-form-group>
                <div class="gender-checkbox-group ms-3">
                  <span class="gender-label">Sukupuoli:</span>
                  <b-form-checkbox
                    v-model="genderFilterM"
                    value="M"
                    unchecked-value=""
                    class="gender-checkbox"
                    >Mies/poika</b-form-checkbox
                  >
                  <b-form-checkbox
                    v-model="genderFilterF"
                    value="F"
                    unchecked-value=""
                    class="gender-checkbox"
                    >Nainen/tyttö</b-form-checkbox
                  >
                </div>
                <div class="junior-checkbox-group ms-3">
                  <b-form-checkbox
                    v-model="juniorFilter"
                    value="junior"
                    unchecked-value=""
                    class="junior-checkbox"
                    >Junioreita (19v tai nuorempia)</b-form-checkbox
                  >
                </div>
              </div>
              <b-form-group label="" label-for="search-input" class="mb-0 mr-3">
                <b-form-input
                  id="search-input"
                  v-model="searchTerm"
                  type="text"
                  placeholder="Etsi pelaajaa..."
                  class="mr-2"
                />
              </b-form-group>
            </div>
            <div class="mb-2">
              <span class="player-count">
                Pelaajia yhteensä: <strong>{{ filteredPlayers.length }}</strong>
              </span>
            </div>
            <div v-if="isSmallScreen" class="players-mobile-list">
              <router-link
                v-for="player in filteredPlayers"
                :key="player.player_id"
                :to="{
                  name: 'PelaajaView',
                  params: { player_id: player.player_id },
                }"
                class="player-mobile-card"
              >
                <div class="player-mobile-main">
                  <div class="player-mobile-name">
                    {{ player.firstname }} {{ player.lastname }}
                  </div>
                  <div class="player-mobile-meta">
                    <span v-if="player.birth_year || player.birth_day">
                      s. {{ player.birth_year || player.birth_day }}
                    </span>
                    <span v-if="player.gender">
                      {{ player.gender === "M" ? "Mies/poika" : "Nainen/tyttö" }}
                    </span>
                  </div>
                </div>
                <div class="player-mobile-stats">
                  <span class="player-mobile-games">{{ totalGames(player) }}</span>
                  <span class="player-mobile-label">ottelua</span>
                </div>
              </router-link>
              <div v-if="filteredPlayers.length === 0" class="no-mobile-results">
                Ei pelaajia löytynyt.
              </div>
            </div>
            <div v-else class="table-responsive">
              <b-table
                hover
                small
                :fields="fields"
                :items="filteredPlayers"
                :empty-text="emptyText"
                class="table table-sm table-bordered table-responsive"
                v-model:sortBy="sortBy"
                v-model:sortDesc="sortDesc"
              >
                <template #cell(player)="data">
                  <router-link
                    :to="{
                      name: 'PelaajaView',
                      params: { player_id: data.item.player_id },
                    }"
                    class="player-link"
                  >
                    {{ data.item.firstname }} {{ data.item.lastname }}
                  </router-link>
                </template>
                <template #cell(games)="data">
                  {{ totalGames(data.item) }}
                </template>
              </b-table>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapActions, mapState } from "vuex";

export default {
  name: "PelaajatView",
  data() {
    return {
      searchTerm: "",
      genderFilterM: "M",
      genderFilterF: "F",
      juniorFilter: "",
      birthYearFilterMin: null,
      birthYearFilterMax: null,
      staticFields: [
        { key: "player", label: "Pelaaja", sortable: true },
        { key: "games", label: "Ottelut", sortable: true },
      ],
      emptyText: "Ei pelaajia löytynyt.",
      sortBy: "player",
      sortDesc: false,
      isSmallScreen: false,
    };
  },
  computed: {
    ...mapState({
      players: (state) => state.players,
    }),
    currentSeason() {
      // Palauttaa nykyisen kauden muodossa "2025-2026"
      const now = new Date();
      const year = now.getFullYear();
      const month = now.getMonth() + 1; // 0-11 -> 1-12
      // Jos olemme elokuusta alkaen, kausi on nykyinen vuosi - seuraava vuosi
      // Muuten kausi on edellinen vuosi - nykyinen vuosi
      if (month >= 8) {
        return `${year}-${year + 1}`;
      } else {
        return `${year - 1}-${year}`;
      }
    },
    juniorBirthYear() {
      // Kaudella 2025-2026 juniorit ovat 2007 tai sitä myöhemmin syntyneet
      const seasonEndYear = parseInt(this.currentSeason.split("-")[1]);
      return seasonEndYear - 19; // 2026 - 19 = 2007
    },
    allSeasons() {
      // Kerää kaikki kaudet kaikilta pelaajilta
      const seasons = new Set();
      this.players.forEach((p) => {
        if (p.games_per_year) {
          Object.keys(p.games_per_year).forEach((season) =>
            seasons.add(season)
          );
        }
      });
      return Array.from(seasons).sort().reverse();
    },
    fields() {
      return this.staticFields;
    },
    filteredPlayers() {
      let filtered = this.players;
      if (this.searchTerm) {
        const term = this.searchTerm.toLowerCase();
        filtered = filtered.filter((p) => {
          const fullName = `${p.firstname || ""} ${
            p.lastname || ""
          }`.toLowerCase();
          return fullName.includes(term);
        });
      }
      // Sukupuolisuodatus
      const genders = [];
      if (this.genderFilterM === "M") genders.push("M");
      if (this.genderFilterF === "F") genders.push("F");
      if (genders.length === 1) {
        filtered = filtered.filter((p) => p.gender === genders[0]);
      } else if (genders.length === 0) {
        filtered = [];
      }
      // Juniorisuodatus
      if (this.juniorFilter === "junior") {
        filtered = filtered.filter((p) => {
          const birthYear = p.birth_year || p.birth_day;
          if (!birthYear) return false;
          return parseInt(birthYear) > this.juniorBirthYear;
        });
      }
      // Syntymävuosifiltterit
      if (this.birthYearFilterMin) {
        filtered = filtered.filter((p) => {
          const birthYear = p.birth_year || p.birth_day;
          if (!birthYear) return false;
          return parseInt(birthYear) >= this.birthYearFilterMin;
        });
      }
      if (this.birthYearFilterMax) {
        filtered = filtered.filter((p) => {
          const birthYear = p.birth_year || p.birth_day;
          if (!birthYear) return false;
          return parseInt(birthYear) <= this.birthYearFilterMax;
        });
      }
      // Sort
      if (this.sortBy === "player") {
        filtered = filtered.slice().sort((a, b) => {
          const nameA = `${a.firstname || ""} ${
            a.lastname || ""
          }`.toLowerCase();
          const nameB = `${b.firstname || ""} ${
            b.lastname || ""
          }`.toLowerCase();
          if (nameA < nameB) return this.sortDesc ? 1 : -1;
          if (nameA > nameB) return this.sortDesc ? -1 : 1;
          return 0;
        });
      } else if (this.sortBy === "games") {
        filtered = filtered.slice().sort((a, b) => {
          const gamesA = this.totalGames(a);
          const gamesB = this.totalGames(b);
          if (gamesA < gamesB) return this.sortDesc ? 1 : -1;
          if (gamesA > gamesB) return this.sortDesc ? -1 : 1;
          return 0;
        });
      }
      return filtered;
    },
  },
  methods: {
    ...mapActions(["fetchPlayers"]),
    toggleSort(field) {
      if (this.sortBy === field) {
        this.sortDesc = !this.sortDesc;
      } else {
        this.sortBy = field;
        this.sortDesc = false;
      }
    },
    totalGames(player) {
      if (!player.games_per_year) return 0;
      return Object.values(player.games_per_year).reduce((a, b) => a + b, 0);
    },
    gamesTooltip(player) {
      if (!player.games_per_year) return "";
      return Object.entries(player.games_per_year)
        .map(([season, count]) => `${season}: ${count}`)
        .join("\n");
    },
    updateScreenWidth() {
      this.isSmallScreen = window.matchMedia("(max-width: 480px)").matches;
    },
  },
  async mounted() {
    await this.fetchPlayers();
    this.updateScreenWidth();
    window.addEventListener("resize", this.updateScreenWidth);
  },
  beforeUnmount() {
    window.removeEventListener("resize", this.updateScreenWidth);
  },
  watch: {},
};
</script>

<style scoped>
@import "../assets/_shared-sections.scss";
.narrow-table-wrapper {
  max-width: 500px;
  margin: 0 auto;
}
.narrow-table-wrapper .mb-3 {
  margin-bottom: 0.5rem !important;
}
.narrow-table-wrapper .form-group {
  margin-bottom: 0.2rem !important;
}
.narrow-table-wrapper .form-control {
  padding: 0.15rem 0.3rem;
  font-size: 0.92rem;
}
.games-tooltip {
  white-space: pre-line;
  font-size: 0.95em;
}
.player-count {
  font-size: 0.95rem;
  color: #666;
  font-weight: 500;
}
.player-link {
  color: #007bff;
  text-decoration: underline;
  cursor: pointer;
}
.player-link:hover {
  color: #0056b3;
}
/* Syntymävuosifiltterit omalla rivillä siististi */
.birthyear-filter-row {
  gap: 1.5rem;
  margin-bottom: 0.5rem;
}
.games-card {
  padding: 2rem 2rem 1.5rem 2rem;
}
.games-card .table-responsive {
  padding: 0.5rem 0.5rem 0.5rem 0.5rem;
}

.players-mobile-list {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
}

.player-mobile-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  padding: 0.85rem 0.9rem;
  border: 1px solid var(--border-color);
  border-radius: 12px;
  background: linear-gradient(180deg, #ffffff 0%, #f8fafc 100%);
  text-decoration: none;
  color: inherit;
}

.player-mobile-main {
  min-width: 0;
}

.player-mobile-name {
  font-size: 1rem;
  font-weight: 700;
  color: var(--text-dark);
  line-height: 1.2;
}

.player-mobile-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 0.35rem 0.6rem;
  margin-top: 0.25rem;
  font-size: 0.78rem;
  color: #666;
}

.player-mobile-stats {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  flex: 0 0 auto;
}

.player-mobile-games {
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--primary-color);
  line-height: 1;
}

.player-mobile-label {
  font-size: 0.72rem;
  color: #666;
}

.no-mobile-results {
  padding: 1rem 0.5rem;
  color: #666;
}

@media (max-width: 480px) {
  .games-card {
    padding: 0.85rem;
  }

  .games-header .ms-3 {
    margin-left: 0 !important;
  }

  .games-header .form-group,
  .games-header .form-control,
  .games-header .gender-checkbox-group,
  .games-header .junior-checkbox-group {
    width: 100%;
    min-width: 0;
  }
}
</style>

<style>
.table.table-sm td,
.table.table-sm th {
  padding: 0.2rem 0.5rem !important;
}
</style>
