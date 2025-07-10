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
                      <th>Ottelu</th>
                      <th>Tulos</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="match in filteredMatches" :key="match.match_id">
                      <td>{{ match.date || '-' }}</td>
                      <td>{{ match.category_name || '-' }}</td>
                      <td>
                        {{
                          (match.team_A_name && match.team_B_name)
                            ? (match.team_A_name + ' vs ' + match.team_B_name)
                            : (match.team_name || '-')
                        }}
                      </td>
                      <td>
                        <span class="text-primary" style="cursor:pointer; text-decoration:underline;" @click="openGameReport(match)">
                          {{ match.fs_A && match.fs_B ? match.fs_A + ' - ' + match.fs_B : '-' }}
                        </span>
                      </td>
                    </tr>
                  </tbody>
                </table>

                <!-- Otteluraportti-modal -->
                <div v-if="showGameReport" class="modal fade show" id="gameReportModal" tabindex="-1" aria-labelledby="gameReportModalLabel" aria-modal="true" style="display: block;" ref="gameReportModal">
                  <div class="modal-dialog modal-lg">
                    <div class="modal-content">
                      <div class="modal-header">
                        <h5 class="modal-title" id="gameReportModalLabel">
                          <span v-if="gameReport && gameReport.homeName && gameReport.awayName && gameReport.date">
                            {{ formattedGameReportTitle }}
                          </span>
                        </h5>
                        <button type="button" class="btn-close" @click="showGameReport = false" aria-label="Close"></button>
                      </div>
                      <div class="modal-body">
                        <div v-if="reportLoading">Ladataan otteluraporttia...</div>
                        <div v-else-if="reportError" class="text-danger">{{ reportError }}</div>
                        <div v-else-if="gameReport">
                          <div class="mb-4">
                            <div class="timeline-container">
                              <div class="timeline">
                                <div v-for="event in gameReport.allEvents" :key="event.event_id || event.time + event.type + event.player_id">
                                  <div class="timeline-row d-flex align-items-center mb-2">
                                    <!-- Vasen: kotijoukkueen tapahtuma -->
                                    <div class="timeline-col text-end">
                                      <span v-if="event.team == gameReport.homeId">
                                        <span class="timeline-event-content">
                                          <span class="fw-semibold">
                                            <a v-if="event.player_id && gameReport.homeName && gameReport.homeName.toLowerCase().includes('nibacos')" href="#" class="player-link" @click.prevent="handlePlayerLinkClick(event.player_id)">
                                              {{ event.player_name || event.name }}
                                            </a>
                                            <template v-else>
                                              {{ event.player_name || event.name }}
                                            </template>
                                          </span>
                                          <span v-if="event.type === 'goal'">&nbsp;🥅</span>
                                          <span v-if="event.type === 'penalty'">&nbsp;🚫</span>
                                          <span class="text-muted ms-1">{{ event.description || event.code }}&nbsp;</span>
                                        </span>
                                      </span>
                                    </div>
                                    <!-- Keskellä: kellonaika -->
                                    <div class="timeline-col timeline-time-col">
                                      <div class="timeline-time-box">{{ event.event_time }}</div>
                                    </div>
                                    <!-- Oikea: vierasjoukkueen tapahtuma -->
                                    <div class="timeline-col text-start">
                                      <span v-if="event.team == gameReport.awayId">
                                        <span class="timeline-event-content">
                                          <span class="fw-semibold">
                                            <a v-if="event.player_id && gameReport.awayName && gameReport.awayName.toLowerCase().includes('nibacos')" href="#" class="player-link" @click.prevent="handlePlayerLinkClick(event.player_id)">
                                              {{ event.player_name || event.name }}
                                            </a>
                                            <template v-else>
                                              {{ event.player_name || event.name }}
                                            </template>
                                          </span>
                                          <span v-if="event.type === 'goal'">&nbsp;🥅</span>
                                          <span v-if="event.type === 'penalty'">&nbsp;🚫</span>
                                          <span class="text-muted ms-1">{{ event.description || event.code }}&nbsp;</span>
                                        </span>
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                          <div class="d-flex flex-column flex-md-row gap-4">
                            <div class="flex-fill bg-light rounded p-3 mb-3 mb-md-0 shadow-sm">
                              <h5 class="text-center mb-3">{{ gameReport.homeName }}</h5>
                              <ul class="list-unstyled">
                                <li v-for="p in gameReport.homeLineup" :key="p.player_id || p.id || p.name" class="mb-1">
                                  <span class="me-2">{{ p.player_shirt_number || p.shirt_number || '' }}</span>
                                  <span class="fw-semibold">
                                    <a v-if="p.player_id && gameReport.homeName && gameReport.homeName.toLowerCase().includes('nibacos')" href="#" class="player-link" @click.prevent="handlePlayerLinkClick(p.player_id)">
                                      {{ p.name || p.player_name || p.id || JSON.stringify(p) }}
                                    </a>
                                    <template v-else>
                                      {{ p.name || p.player_name || p.id || JSON.stringify(p) }}
                                    </template>
                                  </span>
                                </li>
                              </ul>
                            </div>
                            <div class="flex-fill bg-light rounded p-3 shadow-sm">
                              <h5 class="text-center mb-3">{{ gameReport.awayName }}</h5>
                              <ul class="list-unstyled">
                                <li v-for="p in gameReport.awayLineup" :key="p.player_id || p.id || p.name" class="mb-1">
                                  <span class="me-2">{{ p.player_shirt_number || p.shirt_number || '' }}</span>
                                  <span class="fw-semibold">
                                    <a v-if="p.player_id && gameReport.awayName && gameReport.awayName.toLowerCase().includes('nibacos')" href="#" class="player-link" @click.prevent="handlePlayerLinkClick(p.player_id)">
                                      {{ p.name || p.player_name || p.id || JSON.stringify(p) }}
                                    </a>
                                    <template v-else>
                                      {{ p.name || p.player_name || p.id || JSON.stringify(p) }}
                                    </template>
                                  </span>
                                </li>
                              </ul>
                            </div>
                          </div>
                        </div>
                        <div v-else>Ei otteluraporttia saatavilla.</div>
                      </div>
                      <div class="modal-footer justify-content-end">
                        <button type="button" class="btn btn-outline-secondary" @click="showGameReport = false" aria-label="Close">
                          &#10005; Sulje
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
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
import 'bootstrap/dist/js/bootstrap.bundle.min.js';

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
      gameReport: null,
      reportLoading: false,
      reportError: '',
      showGameReport: false,
    };
  },
  mounted() {
    this.fetchPlayer();
  },
  watch: {
    '$route.params.player_id': {
      immediate: true,
      handler(newId, oldId) {
        if (newId !== oldId) {
          this.fetchPlayer();
        }
      }
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
    async fetchPlayer() {
      this.loading = true;
      this.error = '';
      window.scrollTo({ top: 0, behavior: 'smooth' });
      try {
        const baseurl = process.env.VUE_APP_BACKEND_URL;
        const response = await axios.get(`${baseurl}/players?player_id=${this.$route.params.player_id}`);
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
    async openGameReport(match) {
      this.gameReport = null;
      this.reportError = '';
      this.reportLoading = true;
      this.showGameReport = true;
      try {
        // Oletetaan että match.match_id ja match.date/season on saatavilla
        let season = (match.season_id || match.season || (match.date ? match.date.substring(0,4) : ''));
        // Jos season on muodossa '2024-2025', otetaan vain jälkimmäinen osa
        if (typeof season === 'string' && season.includes('-')) {
          season = season.split('-')[1];
        }
        const gameid = match.match_id || match.UniqueID || match.gameid;
        const baseurl = process.env.VUE_APP_BACKEND_URL;
        const url = `${baseurl}/gamestats/?season=${season}&gameid=${gameid}`;
        console.log('Otteluraportti parametrit:', { season, gameid });
        console.log('Otteluraportin API-url:', url);
        if (!season || !gameid) throw new Error('Puuttuvat ottelun tunnistetiedot');
        const response = await axios.get(url);
        const data = response.data;
        const root = data.match ? data.match : data;
        // Selvitä kotijoukkueen ja vierasjoukkueen id:t ja nimet
        const homeId = root.team_A_id || (root.goals && root.goals[0] && root.goals[0].team_id);
        const awayId = root.team_B_id || (root.goals && root.goals.find(g => g.team_id !== homeId)?.team_id);
        console.log('root.events:', root.events);
        console.log('root.lineups:', root.lineups);
        // Kokoonpanot: tuki sekä objektimuodolle että taulukolle
        let homeLineup = [];
        let awayLineup = [];
        if (Array.isArray(root.lineups)) {
          homeLineup = root.lineups.filter(p => p.team_id == homeId);
          awayLineup = root.lineups.filter(p => p.team_id == awayId);
        } else if (root.lineups && typeof root.lineups === 'object') {
          homeLineup = root.lineups[homeId] || [];
          awayLineup = root.lineups[awayId] || [];
        }
        // Yhdistetty aikajanan tapahtumat (maalit + jäähyt)
        const allEvents = [
          ...((root.goals || []).map(g => ({
            ...g,
            type: 'goal',
            event_time: g.time,
            team: g.team_id
          }))),
          ...((root.events || [])
            .filter(e =>
              e.code && (
                e.code.toLowerCase().includes('pen') ||
                e.code.toLowerCase().includes('jäähy') ||
                e.code.toLowerCase().includes('rangaistus') ||
                e.code.toLowerCase().includes('pun') ||
                e.code.toLowerCase().includes('2min') ||
                e.code.toLowerCase().includes('5min')
              )
            )
            .map(e => ({
              ...e,
              type: 'penalty',
              event_time: e.time,
              team: e.team_id
            }))
          )
        ];
        console.log('allEvents:', allEvents);
        // Järjestä aikajärjestykseen (aika muodossa mm:ss)
        allEvents.sort((a, b) => {
          const toSeconds = t => {
            if (!t) return 0;
            const parts = t.split(':');
            return parseInt(parts[0] || 0) * 60 + parseInt(parts[1] || 0);
          };
          return toSeconds(a.event_time) - toSeconds(b.event_time);
        });
        this.gameReport = {
          date: root.date || '',
          homeId,
          awayId,
          homeGoals: (root.goals || []).filter(g => g.team_id == homeId),
          awayGoals: (root.goals || []).filter(g => g.team_id == awayId),
          homePenalties: (root.events || []).filter(e =>
            e.code && (
              e.code.toLowerCase().includes('pen') ||
              e.code.toLowerCase().includes('jäähy') ||
              e.code.toLowerCase().includes('rangaistus') ||
              e.code.toLowerCase().includes('pun') ||
              e.code.toLowerCase().includes('2min') ||
              e.code.toLowerCase().includes('5min')
            ) && e.team_id == homeId
          ),
          awayPenalties: (root.events || []).filter(e =>
            e.code && (
              e.code.toLowerCase().includes('pen') ||
              e.code.toLowerCase().includes('jäähy') ||
              e.code.toLowerCase().includes('rangaistus') ||
              e.code.toLowerCase().includes('pun') ||
              e.code.toLowerCase().includes('2min') ||
              e.code.toLowerCase().includes('5min')
            ) && e.team_id == awayId
          ),
          homeLineup,
          awayLineup,
          homeName: root.team_A_name || root.team_A_description_en || 'Koti',
          awayName: root.team_B_name || root.team_B_description_en || 'Vieras',
          allEvents
        };
        console.log('gameReport:', this.gameReport);
        console.log('raw data:', data);
      } catch (e) {
        console.error('Otteluraportin hakuvirhe:', e);
      } finally {
        this.reportLoading = false;
      }
    },
    closeGameReportModal() {
      if (this.$refs.gameReportModal) {
        const modal = window.bootstrap ? window.bootstrap.Modal.getInstance(this.$refs.gameReportModal) : null;
        if (modal) modal.hide();
      }
    },
    handlePlayerLinkClick(playerId) {
      this.showGameReport = false;
      this.$nextTick(() => {
        document.querySelectorAll('.modal-backdrop').forEach(el => el.parentNode.removeChild(el));
        document.body.classList.remove('modal-open');
        this.$router.push({ name: 'PelaajaView', params: { player_id: playerId } });
      });
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
    },
    formattedGameReportTitle() {
      if (!this.gameReport || !this.gameReport.date || !this.gameReport.homeName || !this.gameReport.awayName) return '';
      // Oletetaan että date on muodossa yyyy-mm-dd[ hh:mm:ss]
      let dateStr = this.gameReport.date;
      let timeStr = '';
      if (dateStr.includes(' ')) {
        const parts = dateStr.split(' ');
        dateStr = parts[0];
        timeStr = parts[1] ? parts[1].slice(0,5) : '';
      }
      const [yyyy, mm, dd] = dateStr.split('-');
      const formatted = `${dd}.${mm}.${yyyy}` + (timeStr ? ` ${timeStr}` : '');
      return `${formatted} ${this.gameReport.homeName} vs ${this.gameReport.awayName}`;
    },
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
</style> 