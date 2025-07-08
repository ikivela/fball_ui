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
                <span><strong>Syntymävuosi:</strong> {{ player.birth_year || player.birth_day || '-' }}</span>
                <br />
                <span><strong>Kotiseura:</strong> {{ kotiseura }}</span>
              </div>
              <div v-if="rinnakkaisedustukset.length">
                <h5>Rinnakkaisedustukset</h5>
                <ul>
                  <li v-for="edustus in rinnakkaisedustukset" :key="edustus.key">
                    {{ edustus.club_name }} / {{ edustus.team_name }} ({{ edustus.category_name }})
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
                  <label for="season-select"><strong>Valitse kausi:</strong></label>
                  <select id="season-select" v-model="selectedSeason" class="form-select form-select-sm w-auto d-inline-block ml-2">
                    <option v-for="season in Object.keys(matchesBySeason).sort().reverse()" :key="season" :value="season">{{ season }}</option>
                  </select>
                </div>
                <table class="table table-sm table-bordered">
                  <thead>
                    <tr>
                      <th>Päivä</th>
                      <th>Sarja</th>
                      <th>Joukkue</th>
                      <th>Vastustaja</th>
                      <th>Tulos</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="match in filteredMatches" :key="match.match_id">
                      <td>{{ match.date || '-' }}</td>
                      <td>{{ match.category_name || '-' }}</td>
                      <td>{{ match.team_name || '-' }}</td>
                      <td>{{ match.team_A_name === player.team_name ? match.team_B_name : match.team_A_name || '-' }}</td>
                      <td>{{ match.fs_A && match.fs_B ? match.fs_A + ' - ' + match.fs_B : '-' }}</td>
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
import axios from 'axios';

export default {
  name: 'PelaajaView',
  props: ['player_id'],
  data() {
    return {
      player: null,
      loading: true,
      error: '',
      teamsBySeason: {},
      seasons: [],
      kotiseura: '',
      rinnakkaisedustukset: [],
      allMatchSeasons: [],
      selectedSeason: '',
      matchesBySeason: [],
    };
  },
  async mounted() {
    try {
      const baseurl = process.env.VUE_APP_BACKEND_URL;
      const response = await axios.get(`${baseurl}/players?player_id=${this.player_id}`);
      this.player = response.data;
      this.processTeams();
      this.processSeuraEdustukset();
      this.processMatches();
    } catch (e) {
      this.error = 'Pelaajaa ei löytynyt.';
    } finally {
      this.loading = false;
    }
  },
  methods: {
    processTeams() {
      // Rakennetaan kaudet ja joukkueet pelimäärineen player_data:sta
      const pdata = this.player.player_data ? (typeof this.player.player_data === 'string' ? JSON.parse(this.player.player_data) : this.player.player_data) : null;
      if (!pdata || !pdata.matches) {
        this.teamsBySeason = {};
        this.seasons = [];
        return;
      }
      // { season: { teamKey: { teamName, categoryName, games } } }
      const map = {};
      pdata.matches.forEach(match => {
        const season = match.season_id || match.season || '-';
        const teamKey = match.team_id + '-' + (match.team_name || '');
        if (!map[season]) map[season] = {};
        if (!map[season][teamKey]) {
          map[season][teamKey] = {
            teamName: match.team_name || '-',
            categoryName: match.category_name || '-',
            games: 0,
            teamKey,
          };
        }
        map[season][teamKey].games += 1;
      });
      // Muodosta lista kausista ja joukkueista
      this.seasons = Object.keys(map).sort().reverse();
      this.teamsBySeason = {};
      this.seasons.forEach(season => {
        this.teamsBySeason[season] = Object.values(map[season]);
      });
    },
    processSeuraEdustukset() {
      // Kotiseura juuritasolta
      const pdata = this.player.player_data ? (typeof this.player.player_data === 'string' ? JSON.parse(this.player.player_data) : this.player.player_data) : null;
      this.kotiseura = pdata && pdata.club_name ? pdata.club_name : '-';
      // Rinnakkaisedustukset teams-taulukosta
      this.rinnakkaisedustukset = [];
      if (pdata && Array.isArray(pdata.teams)) {
        this.rinnakkaisedustukset = pdata.teams.filter(t => t.parallel_representation === '1' && t.club_name && t.club_name.toLowerCase() !== 'nibacos kokkola')
          .map(t => ({
            club_name: t.club_name,
            team_name: t.team_name,
            category_name: t.primary_category && t.primary_category.category_name ? t.primary_category.category_name : '-',
            key: t.team_id + '-' + (t.primary_category && t.primary_category.category_name ? t.primary_category.category_name : '-')
          }));
      }
    },
    processMatches() {
      const pdata = this.player.player_data ? (typeof this.player.player_data === 'string' ? JSON.parse(this.player.player_data) : this.player.player_data) : null;
      if (!pdata || !pdata.matches) {
        this.matchesBySeason = [];
        this.allMatchSeasons = [];
        this.selectedSeason = '';
        return;
      }
      // Ryhmittele pelit kausittain
      const bySeason = {};
      pdata.matches.forEach(match => {
        const season = match.season_id || match.season || '-';
        if (!bySeason[season]) bySeason[season] = [];
        bySeason[season].push(match);
      });
      this.allMatchSeasons = Object.keys(bySeason).sort().reverse();
      this.selectedSeason = this.allMatchSeasons[0] || '';
      this.matchesBySeason = bySeason;
    },
  },
  computed: {
    filteredMatches() {
      if (!this.selectedSeason || !this.matchesBySeason[this.selectedSeason]) return [];
      // Lajittele pelit uusimmat ensin
      return this.matchesBySeason[this.selectedSeason].slice().sort((a, b) => (b.date || '').localeCompare(a.date || ''));
    },
    allTeamRows() {
      // Palauttaa kaikki (season, team) rivit taulukkoon
      const rows = [];
      this.seasons.forEach(season => {
        (this.teamsBySeason[season] || []).forEach(team => {
          rows.push({
            season,
            teamName: team.teamName,
            categoryName: team.categoryName,
            games: team.games,
            key: season + '-' + team.teamKey
          });
        });
      });
      return rows;
    }
  },
};
</script>

<style scoped>
@import '../assets/_shared-sections.scss';
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
</style> 