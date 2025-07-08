<template>
  <div class="pelaajat-view games-section">
    <div class="container">
      <div class="row">
        <div class="col-12">
          <div class="games-card">
            <div class="games-header d-flex flex-wrap align-items-center gap-2 mb-3">
              <div class="w-100 d-flex flex-wrap align-items-center mb-2 birthyear-filter-row">
                <b-form-group label="Syntymävuosi vähintään" label-for="birthyear-filter-min" class="mb-0 mr-3">
                  <b-form-input
                    id="birthyear-filter-min"
                    v-model.number="birthYearFilterMin"
                    type="number"
                    min="1900"
                    max="2099"
                    placeholder="Esim. 2007"
                    class="mr-2"
                    style="max-width: 150px;"
                  />
                </b-form-group>
                <b-form-group label="Syntymävuosi enintään" label-for="birthyear-filter-max" class="mb-0 mr-3">
                  <b-form-input
                    id="birthyear-filter-max"
                    v-model.number="birthYearFilterMax"
                    type="number"
                    min="1900"
                    max="2099"
                    placeholder="Esim. 2010"
                    class="mr-2"
                    style="max-width: 150px;"
                  />
                </b-form-group>
                <div class="gender-checkbox-group ms-3">
                  <span class="gender-label">Sukupuoli:</span>
                  <b-form-checkbox
                    v-model="genderFilterM"
                    value="M"
                    unchecked-value=""
                    class="gender-checkbox"
                  >Mies/poika</b-form-checkbox>
                  <b-form-checkbox
                    v-model="genderFilterF"
                    value="F"
                    unchecked-value=""
                    class="gender-checkbox"
                  >Nainen/tyttö</b-form-checkbox>
                </div>
                <div class="junior-checkbox-group ms-3">
                  <b-form-checkbox
                    v-model="juniorFilter"
                    value="junior"
                    unchecked-value=""
                    class="junior-checkbox"
                  >Junioreita (19v tai nuorempia)</b-form-checkbox>
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
            <div class="table-responsive">
              <b-table
                hover
                small
                :fields="fields"
                :items="filteredPlayers"
                :empty-text="emptyText"
                class="table-sm compact-table"
                v-model:sortBy="sortBy"
                v-model:sortDesc="sortDesc"
              >
                <template #cell(player)="data">
                  <router-link :to="{ name: 'PelaajaView', params: { player_id: data.item.player_id } }" class="player-link">
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
import axios from "axios";

export default {
  name: "PelaajatView",
  data() {
    return {
      baseurl: process.env.VUE_APP_BACKEND_URL,
      players: [],
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
      sortBy: 'player',
      sortDesc: false,
    };
  },
  computed: {
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
      const seasonEndYear = parseInt(this.currentSeason.split('-')[1]);
      return seasonEndYear - 19; // 2026 - 19 = 2007
    },
    allSeasons() {
      // Kerää kaikki kaudet kaikilta pelaajilta
      const seasons = new Set();
      this.players.forEach(p => {
        if (p.games_per_year) {
          Object.keys(p.games_per_year).forEach(season => seasons.add(season));
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
        filtered = filtered.filter(p => {
          const fullName = `${p.firstname || ''} ${p.lastname || ''}`.toLowerCase();
          return fullName.includes(term);
        });
      }
      // Sukupuolisuodatus
      const genders = [];
      if (this.genderFilterM === 'M') genders.push('M');
      if (this.genderFilterF === 'F') genders.push('F');
      if (genders.length === 1) {
        filtered = filtered.filter(p => p.gender === genders[0]);
      } else if (genders.length === 0) {
        filtered = [];
      }
      // Juniorisuodatus
      if (this.juniorFilter === 'junior') {
        filtered = filtered.filter(p => {
          const birthYear = p.birth_year || p.birth_day;
          if (!birthYear) return false;
          return parseInt(birthYear) > this.juniorBirthYear;
        });
      }
      // Syntymävuosifiltterit
      if (this.birthYearFilterMin) {
        filtered = filtered.filter(p => {
          const birthYear = p.birth_year || p.birth_day;
          if (!birthYear) return false;
          return parseInt(birthYear) >= this.birthYearFilterMin;
        });
      }
      if (this.birthYearFilterMax) {
        filtered = filtered.filter(p => {
          const birthYear = p.birth_year || p.birth_day;
          if (!birthYear) return false;
          return parseInt(birthYear) <= this.birthYearFilterMax;
        });
      }
      // Sort
      if (this.sortBy === 'player') {
        filtered = filtered.slice().sort((a, b) => {
          const nameA = `${a.firstname || ''} ${a.lastname || ''}`.toLowerCase();
          const nameB = `${b.firstname || ''} ${b.lastname || ''}`.toLowerCase();
          if (nameA < nameB) return this.sortDesc ? 1 : -1;
          if (nameA > nameB) return this.sortDesc ? -1 : 1;
          return 0;
        });
      } else if (this.sortBy === 'games') {
        filtered = filtered.slice().sort((a, b) => {
          const gamesA = this.totalGames(a);
          const gamesB = this.totalGames(b);
          if (gamesA < gamesB) return this.sortDesc ? 1 : -1;
          if (gamesA > gamesB) return this.sortDesc ? -1 : 1;
          return 0;
        });
      }
      return filtered;
    }
  },
  methods: {
    async fetchPlayers() {
      try {
        let url = this.baseurl + "/players";
        const response = await axios.get(url);
        // Oletetaan että data on lista pelaajia muodossa { firstname, lastname }
        // Lisätään debug-tulostus
        console.log("Players fetched:", response.data);
        // Tarkistetaan, onko data lista vai objektin kenttä
        if (Array.isArray(response.data)) {
          this.players = response.data;
        } else if (response.data.players && Array.isArray(response.data.players)) {
          this.players = response.data.players;
        } else {
          this.players = [];
        }
        if (this.players.length > 0) {
          console.log("Esimerkkipelaaja:", this.players[0]);
        }
        console.log("Players count:", this.players.length);
      } catch (error) {
        this.players = [];
      }
    },
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
      if (!player.games_per_year) return '';
      return Object.entries(player.games_per_year)
        .map(([season, count]) => `${season}: ${count}`)
        .join('\n');
    },
  },
  mounted() {
    this.fetchPlayers();
  },
  watch: {
  },
};
</script>

<style scoped>
@import '../assets/_shared-sections.scss';
.compact-table th,
.compact-table td {
  padding-left: 0.2rem;
  padding-right: 0.2rem;
  padding-top: 0.1rem;
  padding-bottom: 0.1rem;
  font-size: 0.92rem;
  white-space: nowrap;
  vertical-align: middle;
}
.compact-table th:first-child,
.compact-table td:first-child {
  width: 1%;
}
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
</style>
