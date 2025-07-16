<template>
  <div class="ottelu-view container py-4">
    <div v-if="loading" class="loading">Ladataan otteluraporttia...</div>
    <div v-else-if="error" class="error">{{ error }}</div>
    <div v-else-if="gameReport">
      <div class="card shadow-sm mb-4">
        <div class="card-header bg-primary text-white">
          <h4 class="mb-0 text-center">{{ formattedGameReportTitle }}</h4>
        </div>
        <div class="card-body">
          <div class="timeline-container mb-4">
            <div class="timeline">
              <div v-for="event in gameReport.allEvents" :key="event.event_id || event.time + event.type + event.player_id">
                <div class="timeline-row d-flex align-items-center mb-2">
                  <!-- Vasen: kotijoukkueen tapahtuma -->
                  <div class="timeline-col text-end">
                    <span v-if="event.team == gameReport.homeId">
                      <span class="timeline-event-content">
                        <span class="fw-semibold">
                          <template v-if="event.player_id && gameReport.homeName && gameReport.homeName.toLowerCase().includes('nibacos')">
                            <a href="#" class="player-link" @click.prevent="goToPlayer(event.player_id)">
                              {{ event.player_name || event.name || (event.type === 'goal' ? event.scorer : (event.type === 'penalty' ? event.player : '')) }}
                            </a>
                          </template>
                          <template v-else>
                            {{ event.player_name || event.name || (event.type === 'goal' ? event.scorer : (event.type === 'penalty' ? event.player : '')) }}
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
                          <template v-if="event.player_id && gameReport.awayName && gameReport.awayName.toLowerCase().includes('nibacos')">
                            <a href="#" class="player-link" @click.prevent="goToPlayer(event.player_id)">
                              {{ event.player_name || event.name || (event.type === 'goal' ? event.scorer : (event.type === 'penalty' ? event.player : '')) }}
                            </a>
                          </template>
                          <template v-else>
                            {{ event.player_name || event.name || (event.type === 'goal' ? event.scorer : (event.type === 'penalty' ? event.player : '')) }}
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
          <div class="d-flex flex-column flex-md-row gap-4">
            <div class="flex-fill bg-light rounded p-3 mb-3 mb-md-0 shadow-sm">
              <h5 class="text-center mb-3">{{ gameReport.homeName }}</h5>
              <ul class="list-unstyled">
                <li v-for="p in gameReport.homeLineup" :key="p.player_id || p.id || p.name" class="mb-1">
                  <span class="me-2">{{ p.player_shirt_number || p.shirt_number || '' }}</span>
                  <span class="fw-semibold">
                    <template v-if="p.player_id && gameReport.homeName && gameReport.homeName.toLowerCase().includes('nibacos')">
                      <a href="#" class="player-link" @click.prevent="goToPlayer(p.player_id)">
                        {{ p.name || p.player_name || p.id || JSON.stringify(p) }}
                      </a>
                    </template>
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
                    <template v-if="p.player_id && gameReport.awayName && gameReport.awayName.toLowerCase().includes('nibacos')">
                      <a href="#" class="player-link" @click.prevent="goToPlayer(p.player_id)">
                        {{ p.name || p.player_name || p.id || JSON.stringify(p) }}
                      </a>
                    </template>
                    <template v-else>
                      {{ p.name || p.player_name || p.id || JSON.stringify(p) }}
                    </template>
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div v-else>Ei otteluraporttia saatavilla.</div>
    <div v-if="!loading && !error && !gameReport">Ei dataa ladattu eikä virhettä havaittu.</div>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  name: 'OtteluView',
  data() {
    return {
      gameReport: null,
      loading: true,
      error: '',
    };
  },
  async created() {
    await this.fetchGameReport();
  },
  watch: {
    '$route.query.season': {
      immediate: true,
      handler() {
        this.fetchGameReport();
      }
    },
    '$route.query.gameid': {
      immediate: true,
      handler() {
        this.fetchGameReport();
      }
    }
  },
  methods: {
    async fetchGameReport() {
      this.loading = true;
      this.error = '';
      this.gameReport = null;
      const gameid = this.$route.query.gameid;
      const season = this.$route.query.season;
      console.log('fetchGameReport', { season, gameid });
      try {
        const baseurl = process.env.VUE_APP_BACKEND_URL;
        if (!gameid) throw new Error('Puuttuva ottelun tunniste');
        if (!season) throw new Error('Puuttuva kausi');
        const url = `${baseurl}/gamestats/?season=${season}&gameid=${gameid}`;
        console.log('OtteluView API url:', url);
        const response = await axios.get(url);
        console.log('API response', response.data);
        const data = response.data;
        if (!data || (Array.isArray(data) && data.length === 0) || (typeof data === 'object' && Object.keys(data).length === 0)) {
          this.error = 'Ei dataa löytynyt.';
          return;
        }
        // --- VANHA MUOTO: pelkkä array (ennen 2023-2024) ---
        if (Array.isArray(data)) {
          // Yritetään päätellä kotijoukkue ja vierasjoukkue reitistä tai datasta
          let homeName = this.$route.query.home || 'Koti';
          let awayName = this.$route.query.away || 'Vieras';
          let date = this.$route.query.date || '';
          const allEvents = data.map(ev => ({
            ...ev,
            type: ev.event || null,
            event_time: ev.time || '',
            team: ev.team || null
          }));
          this.gameReport = {
            date,
            homeId: homeName,
            awayId: awayName,
            homeGoals: [],
            awayGoals: [],
            homePenalties: [],
            awayPenalties: [],
            homeLineup: [],
            awayLineup: [],
            homeName,
            awayName,
            allEvents
          };
          this.loading = false;
          return;
        }
        // --- UUSI MUOTO ---
        const root = data.match ? data.match : data;
        const homeId = root.team_A_id || (root.goals && root.goals[0] && root.goals[0].team_id);
        const awayId = root.team_B_id || (root.goals && root.goals.find(g => g.team_id !== homeId)?.team_id);
        let homeLineup = [];
        let awayLineup = [];
        if (Array.isArray(root.lineups)) {
          homeLineup = root.lineups.filter(p => p.team_id == homeId);
          awayLineup = root.lineups.filter(p => p.team_id == awayId);
        } else if (root.lineups && typeof root.lineups === 'object') {
          homeLineup = root.lineups[homeId] || [];
          awayLineup = root.lineups[awayId] || [];
        }
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
      } catch (e) {
        this.error = 'Otteluraportin haku epäonnistui.';
      } finally {
        this.loading = false;
      }
    },
    goToPlayer(playerId) {
      this.$router.push({ name: 'PelaajaView', params: { player_id: playerId } });
    },
  },
  computed: {
    formattedGameReportTitle() {
      if (!this.gameReport || !this.gameReport.date || !this.gameReport.homeName || !this.gameReport.awayName) return '';
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
.ottelu-view {
  min-height: 60vh;
}
.loading {
  color: #888;
  font-size: 1.2rem;
}
.error {
  color: #b00;
  font-weight: 600;
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
.card-header {
  background: linear-gradient(135deg, var(--primary-color) 0%, var(--primary-light) 100%) !important;
  color: white !important;
}
@media (max-width: 768px) {
  .timeline-dot {
    width: 2em;
    height: 2em;
    font-size: 0.95em;
  }
}
</style> 