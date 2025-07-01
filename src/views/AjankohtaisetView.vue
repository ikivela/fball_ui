<template>
  <div class="ajankohtaiset-view">
    <!-- Games Section -->
    <div class="games-section">
      <div class="container">
        <div class="row">
          <div class="col-12">
            <div class="card games-card">
              <div class="card-header d-flex align-items-center justify-content-between">
                <h2 class="card-title mb-0">
                  <i class="fas fa-list me-2"></i>
                  Ottelut
                </h2>
                <div class="season-dropdown ms-3">
                  <select v-model="selectedSeasonValue" @change="onSeasonChange" :disabled="seasonLoading" class="form-select form-select-sm clickable">
                    <option v-for="season in seasons" :key="season.value" :value="season.value">{{ season.text }}</option>
                  </select>
                  <span v-if="seasonLoading" class="spinner-border spinner-border-sm ms-2" role="status" aria-hidden="true"></span>
                </div>
                <div class="filter-form ms-3">
                  <input type="text" v-model="filter" class="form-control form-control-sm" placeholder="Suodata otteluita..." />
                </div>
              </div>
              <div class="card-body p-0">
                <div v-if="this.selectedSeason && this.seasons.length > 0">
                  <div class="table-responsive">
                    <table class="table table-hover mb-0">
                      <thead>
                        <tr>
                          <th v-for="field in fields" :key="field.key">
                            <i class="fas fa-sort me-1"></i>
                            {{ field.label }}
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr v-for="game in filteredGames" :key="game.UniqueID" class="game-row">
                          <td class="game-date">
                            <div class="date-info">
                              <div class="date-main">
                                {{ parseDate(game.GameDate + "T" + game.GameTime) }}
                              </div>
                              <div v-if="isSmallScreen" class="date-location">
                                <a :href="`http://maps.google.com/?q=${game.RinkName}`" class="location-link">
                                  <i class="fas fa-map-marker-alt me-1"></i>
                                  {{ game.RinkName }}
                                </a>
                              </div>
                            </div>
                          </td>
                          
                          <td class="game-teams">
                            <div v-if="selectedSeason.value == seasons[0].value">
                              <a :href="`${result_url}${game.UniqueID}`" class="team-link">
                                <div class="team-names">
                                  <span class="home-team">{{ game.HomeTeamName }}</span>
                                  <span class="vs-separator">vs</span>
                                  <span class="away-team">{{ game.AwayTeamName }}</span>
                                </div>
                              </a>
                            </div>
                            <div v-else>
                              <a class="team-link resultStyle" @click="getRoster(game, selectedSeason)">
                                <div class="team-names">
                                  <span class="home-team">{{ game.HomeTeamName }}</span>
                                  <span class="vs-separator">vs</span>
                                  <span class="away-team">{{ game.AwayTeamName }}</span>
                                </div>
                              </a>
                            </div>
                          </td>
                          
                          <td v-if="!isSmallScreen" class="game-rink">
                            <a :href="`http://maps.google.com/?q=${game.RinkName}`" class="rink-link">
                              <i class="fas fa-map-marker-alt me-1"></i>
                              {{ game.RinkName }}
                            </a>
                          </td>
                          
                          <td v-if="!isSmallScreen" class="game-group">
                            <a :href="standings_link(game.groupID)" class="group-link">
                              {{ game.group }}
                            </a>
                          </td>
                          
                          <td class="game-class">
                            <span class="class-badge">{{ shorten_classname(game.class || '') }}</span>
                          </td>
                          
                          <td class="game-result">
                            <div v-if="game.GameDate < today">
                              <div v-if="game.Result != '-'">
                                <a
                                  class="result-link"
                                  @click="getGameStats(game.UniqueID, selectedSeason, game.HomeTeamName + ' - ' + game.AwayTeamName)"
                                >
                                  <span class="result-score" :class="getResultColor(game)">{{ game.Result }}</span>
                                </a>
                              </div>
                              <div v-else class="no-result">-</div>
                            </div>
                            <div v-else>
                              <a :href="`${result_url}${game.UniqueID}`" class="live-link">
                                <i class="fas fa-external-link-alt"></i>
                                <span>Live</span>
                              </a>
                            </div>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                  
                  <div v-if="filteredGames.length === 0" class="no-games">
                    <div class="no-games-content">
                      <i class="fas fa-calendar-times"></i>
                      <h3>Ei otteluita</h3>
                      <p>Ei löytynyt otteluita valitulla hakuehdolla.</p>
                    </div>
                  </div>
                </div>
                
                <div v-else class="loading-section">
                  <div class="loading-content">
                    <i class="fas fa-spinner fa-spin"></i>
                    <p>Ladataan otteluita...</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Game Stats Modal -->
    <div class="modal fade" id="gameStatsModal" tabindex="-1" :class="{ show: showGameStat }" v-if="showGameStat">
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">
              <i class="fas fa-chart-line me-2"></i>
              {{ currentGame }}
            </h5>
            <button type="button" class="btn-close btn-close-white" @click="showGameStat = false"></button>
          </div>
          <div class="modal-body">
            <div v-if="loading" class="loading-modal">
              <i class="fas fa-spinner fa-spin"></i>
              <p>Ladataan tilastoja...</p>
            </div>
            
            <div v-else-if="gameStats.length === 0" class="no-stats">
              <i class="fas fa-chart-bar"></i>
              <p>Ei tilastoja saatavilla</p>
            </div>
            
            <div v-else class="game-stats">
              <div class="stats-timeline">
                <div v-for="stat in gameStats" :key="stat.time" class="stat-item">
                  <div class="stat-time">{{ stat.time }}</div>
                  <div class="stat-content">
                    <div class="stat-event">
                      <span class="event-type" :class="stat.event">
                        {{ stat.event === 'goal' ? '⚽ Maali' : '🟨 Rangaistus' }}
                      </span>
                      <span class="event-result">{{ stat.event === 'goal' ? stat.result : stat.penalty_time }}</span>
                    </div>
                    <div class="stat-details">
                      <span class="team-name">{{ stat.team }}</span>
                      <span v-if="stat.yv_av" class="special-play">
                        {{ stat.yv_av === 'RL0' ? 'Rangaistusl. (epäonnistunut)' : stat.yv_av }}
                      </span>
                    </div>
                    <div v-if="stat.event === 'goal'" class="goal-details">
                      <span class="scorer">{{ stat.scorer }}</span>
                      <span v-if="stat.assist" class="assist">({{ stat.assist }})</span>
                    </div>
                    <div v-if="stat.event === 'penalty'" class="penalty-details">
                      <span class="player">{{ stat.player }}</span>
                      <span class="reason">{{ stat.reason }}</span>
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
import axios from "axios";
import { DateTime } from "luxon";
import { mapActions, mapState } from "vuex";

export default {
  components: {},
  data() {
    return {
      currentUrl: "",
      result_url: "https://tulospalvelu.salibandy.fi/match/",
      standings_url2:
        "http://tilastopalvelu.fi/fb/index.php/component/content/index.php?option=com_content&view=article&id=14&stgid=",
      standings_url: "https://tulospalvelu.salibandy.fi/category/",
      baseurl: process.env.VUE_APP_BACKEND_URL || "http://localhost:3000",
      show: false,
      pageReady: false,
      isSmallScreen: false,
      updated: "",
      options: [],
      gameStats: "",
      games_table: [],
      loading: false,
      statsData: "",
      selectedSeason: null,
      selectedClass: "",
      showStats: false,
      showGameStat: false,
      currentGame: "",
      sortBy: "",
      sortDesc: "",
      scFields: ["Date", "Game", "class", "Result"],
      filter: '',
      filterOn: [],

      items: [],
      totalRows: 1,
      rosterFields: [
        { key: "PlayerJerseyNr", label: "Nro" },
        { key: "PlayerFirstName", label: "Etunimi" },
        { key: "PlayerLastName", label: "Sukunimi" },
        { key: "RoleAbbrv", label: "Pelipaikka" },
      ],
      tablecolumns: [
        { key: "Date", label: "Aika", sortable: false },
        { key: "Game", label: "Ottelu", sortable: false },
        { key: "Result", label: "Tulos", sortable: false },
        { key: "group", label: "Lohko", sortable: false },
        { key: "class", label: "Sarja", sortable: false },
        { key: "RinkName", label: "Halli", sortable: false },
      ],
      selectedSeasonValue: null,
      seasonLoading: false,
    };
  },
  async created() {
    this.currentUrl = window.location.href;
    document.title = "Nibacos ottelut";
    console.log("created() currentUrl:", this.currentUrl);
  },

  async mounted() {
    this.pageReady = true;

    this.screenWidth = window.matchMedia("(max-width: 600px)").matches;
    window.addEventListener("resize", this.updateScreenWidth);

    console.log("ajankohtaiset games length", this.games.length);
    console.log("ajankohtaiset season length:", this.seasons.length);
    if (this.seasons.length == 0) await this.fetchSeasons();
    if (this.seasons.length > 0) {
      if (!this.games[this.seasons[0].value]) {
        await this.fetchGames(this.seasons[0].value);
      }
      this.selectedSeason = this.seasons[0];
      this.games_table = this.games[this.seasons[0].value] || [];
    } else {
      this.selectedSeason = null;
      this.games_table = [];
    }
    this.updateScreenWidth();
  },

  computed: {
    ...mapState(["games", "seasons"]),
    fields() {
      return this.isSmallScreen ? this.scFields : this.tablecolumns;
    },
    today() {
      return DateTime.now().toFormat("yyyy-MM-dd");
    },
    filteredGames() {
      if (!this.filter) return this.games_table;
      return this.games_table.filter(item => {
        return (
          (item.HomeTeamName && item.HomeTeamName.toLowerCase().includes(this.filter.toLowerCase())) ||
          (item.AwayTeamName && item.AwayTeamName.toLowerCase().includes(this.filter.toLowerCase())) ||
          (item.RinkName && item.RinkName.toLowerCase().includes(this.filter.toLowerCase())) ||
          (item.group && item.group.toLowerCase().includes(this.filter.toLowerCase())) ||
          (item.class && item.class.toLowerCase().includes(this.filter.toLowerCase()))
        );
      });
    },
  },

  watch: {
    selectedSeason: {
      immediate: true,
      handler(val) {
        if (val) this.selectedSeasonValue = val.value;
      }
    }
  },

  methods: {
    ...mapActions(["fetchGames", "fetchSeasons"]),
    updateScreenWidth() {
      this.isSmallScreen = window.matchMedia("(max-width: 600px)").matches;
    },
    parseDate(dateString) {
      return DateTime.fromISO(dateString).toFormat("dd.MM.yyyy HH:mm");
    },
    shorten_classname(classname) {
      if (!classname) return '';
      return classname.replace("Salibandy", "SB");
    },
    standings_link(groupID) {
      if (!groupID || !/^\d+$/.test(groupID)) return '';
      if (this.selectedSeason && this.selectedSeason.text) {
        const year = String(this.selectedSeason.text).split('-')[0];
        return `${this.standings_url}${groupID}!sb${year}`;
      }
      return this.standings_url;
    },
    async getRoster(game, season) {
      // TODO: Implement roster functionality
      console.log('Roster requested for game:', game, 'season:', season);
    },
    async getGameStats(uniqueID, season, gameName) {
      this.loading = true;
      this.currentGame = gameName;
      this.showGameStat = true;
      
      try {
        const response = await axios.get(
          `${this.baseurl}/api/game-stats/${uniqueID}/${season.value}`
        );
        this.gameStats = response.data;
      } catch (error) {
        console.error("Error fetching game stats:", error);
        this.gameStats = [];
      } finally {
        this.loading = false;
      }
    },
    
    getResultColor(game) {
      if (!game.Result || game.Result === '-') return 'neutral';
      
      const teamName = 'Nibacos';
      const isHomeTeam = game.HomeTeamName.includes(teamName);
      
      if (!isHomeTeam && !game.AwayTeamName.includes(teamName)) {
        return 'neutral'; // Nibacos not in this game
      }
      
      const scores = game.Result.split('-');
      if (scores.length !== 2) return 'neutral';
      
      const homeScore = parseInt(scores[0].trim());
      const awayScore = parseInt(scores[1].trim());
      
      if (isNaN(homeScore) || isNaN(awayScore)) return 'neutral';
      
      if (isHomeTeam) {
        return homeScore > awayScore ? 'win' : homeScore < awayScore ? 'loss' : 'tie';
      } else {
        return awayScore > homeScore ? 'win' : awayScore < homeScore ? 'loss' : 'tie';
      }
    },
    async onSeasonChange() {
      this.seasonLoading = true;
      const seasonObj = this.seasons.find(s => s.value === this.selectedSeasonValue);
      this.selectedSeason = seasonObj;
      if (!this.games[seasonObj.value]) {
        await this.fetchGames(seasonObj.value);
      }
      this.games_table = this.games[seasonObj.value] || [];
      this.seasonLoading = false;
    },
  },
};
</script>

<style lang="scss" scoped>
.ajankohtaiset-view {
  min-height: 100vh;
}

// Games Section
.games-section {
  .games-card {
    border: none;
    box-shadow: var(--shadow-lg);
    
    .card-header {
      background: var(--bg-white);
      border-bottom: 1px solid var(--border-color);
      padding: 1.5rem;
      display: flex;
      justify-content: between;
      align-items: center;
      flex-wrap: wrap;
      gap: 1rem;
      
      .card-title {
        font-size: 1.5rem;
        font-weight: 600;
        margin: 0;
        color: var(--text-dark);
        
        i {
          color: var(--primary-color);
        }
      }
    }
  }
}

// Table Styles
.table {
  margin: 0;
  
  thead th {
    background: var(--primary-color);
    color: white;
    font-weight: 600;
    padding: 1rem;
    border: none;
    
    i {
      opacity: 0.7;
    }
  }
  
  tbody tr {
    transition: all 0.2s ease;
    
    &:hover {
      background-color: rgba(59, 130, 246, 0.05);
      transform: translateY(-1px);
      box-shadow: var(--shadow-sm);
    }
  }
  
  td {
    padding: 1rem;
    vertical-align: middle;
    border-color: var(--border-color);
  }
}

// Game Row Styles
.game-row {
  .game-date {
    .date-info {
      .date-main {
        font-weight: 600;
        color: var(--text-dark);
      }
      
      .date-location {
        margin-top: 0.25rem;
        
        .location-link {
          color: var(--primary-color);
          text-decoration: none;
          font-size: 0.875rem;
          
          &:hover {
            text-decoration: underline;
          }
        }
      }
    }
  }
  
  .game-teams {
    .team-link {
      text-decoration: none;
      color: inherit;
      
      .team-names {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        flex-wrap: wrap;
        
        .home-team, .away-team {
          font-weight: 600;
          color: var(--text-dark);
        }
        
        .vs-separator {
          color: var(--text-light);
          font-size: 0.875rem;
          font-weight: 500;
        }
      }
      
      &:hover {
        .team-names {
          .home-team, .away-team {
            color: var(--primary-color);
          }
        }
      }
    }
  }
  
  .game-rink {
    .rink-link {
      color: var(--primary-color);
      text-decoration: none;
      
      &:hover {
        text-decoration: underline;
      }
    }
  }
  
  .game-group {
    .group-link {
      color: var(--primary-color);
      text-decoration: none;
      font-weight: 500;
      
      &:hover {
        text-decoration: underline;
      }
    }
  }
  
  .game-class {
    .class-badge {
      background: linear-gradient(135deg, var(--accent-color) 0%, #fbbf24 100%);
      color: white;
      padding: 0.25rem 0.75rem;
      border-radius: var(--border-radius);
      font-size: 0.75rem;
      font-weight: 600;
      text-transform: uppercase;
    }
  }
  
  .game-result {
    .result-link {
      text-decoration: none;
      
      .result-score {
        padding: 0.25rem 0.75rem;
        border-radius: var(--border-radius);
        font-weight: 600;
        font-size: 0.875rem;
        transition: all 0.2s ease;
        
        &.win {
          background: #10b981;
          color: white;
        }
        
        &.loss {
          background: #ef4444;
          color: white;
        }
        
        &.tie {
          background: #f59e0b;
          color: white;
        }
        
        &.neutral {
          background: var(--secondary-color);
          color: white;
        }
        
        &:hover {
          transform: scale(1.05);
          box-shadow: var(--shadow-sm);
        }
      }
    }
    
    .no-result {
      color: var(--text-light);
      font-style: italic;
    }
    
    .live-link {
      color: var(--accent-color);
      text-decoration: none;
      font-weight: 600;
      
      i {
        margin-right: 0.25rem;
      }
      
      &:hover {
        text-decoration: underline;
      }
    }
  }
}

// No Games State
.no-games {
  padding: 3rem 1rem;
  text-align: center;
  
  .no-games-content {
    i {
      font-size: 3rem;
      color: var(--text-light);
      margin-bottom: 1rem;
    }
    
    h3 {
      color: var(--text-dark);
      margin-bottom: 0.5rem;
    }
    
    p {
      color: var(--text-light);
      margin: 0;
    }
  }
}

// Loading State
.loading-section {
  padding: 3rem 1rem;
  text-align: center;
  
  .loading-content {
    i {
      font-size: 2rem;
      color: var(--primary-color);
      margin-bottom: 1rem;
    }
    
    p {
      color: var(--text-light);
      margin: 0;
    }
  }
}

// Modal Styles
.modal {
  .modal-content {
    border-radius: var(--border-radius-lg);
    border: none;
    box-shadow: var(--shadow-lg);
  }
  
  .modal-header {
    background: linear-gradient(135deg, var(--primary-color) 0%, var(--primary-light) 100%);
    color: white;
    border-bottom: none;
    border-radius: var(--border-radius-lg) var(--border-radius-lg) 0 0;
    
    .modal-title {
      font-weight: 600;
    }
  }
  
  .modal-body {
    padding: 2rem;
  }
  
  &.show {
    display: block;
    background-color: rgba(0, 0, 0, 0.5);
  }
}

// Loading Modal
.loading-modal {
  text-align: center;
  padding: 2rem;
  
  i {
    font-size: 2rem;
    color: var(--primary-color);
    margin-bottom: 1rem;
  }
  
  p {
    color: var(--text-light);
    margin: 0;
  }
}

// No Stats
.no-stats {
  text-align: center;
  padding: 2rem;
  
  i {
    font-size: 3rem;
    color: var(--text-light);
    margin-bottom: 1rem;
  }
  
  p {
    color: var(--text-light);
    margin: 0;
  }
}

// Game Stats
.game-stats {
  .stats-timeline {
    .stat-item {
      display: flex;
      margin-bottom: 1.5rem;
      padding: 1rem;
      background: var(--bg-light);
      border-radius: var(--border-radius);
      border-left: 4px solid var(--primary-color);
      
      &:last-child {
        margin-bottom: 0;
      }
      
      .stat-time {
        font-weight: 600;
        color: var(--primary-color);
        min-width: 60px;
        margin-right: 1rem;
      }
      
      .stat-content {
        flex: 1;
        
        .stat-event {
          margin-bottom: 0.5rem;
          
          .event-type {
            font-weight: 600;
            margin-right: 0.5rem;
            
            &.goal {
              color: var(--secondary-color);
            }
            
            &.penalty {
              color: var(--accent-color);
            }
          }
          
          .event-result {
            font-weight: 500;
          }
        }
        
        .stat-details {
          margin-bottom: 0.25rem;
          
          .team-name {
            font-weight: 500;
            color: var(--text-dark);
            margin-right: 0.5rem;
          }
          
          .special-play {
            color: var(--primary-color);
            font-size: 0.875rem;
          }
        }
        
        .goal-details, .penalty-details {
          font-size: 0.875rem;
          color: var(--text-light);
          
          .scorer, .player {
            font-weight: 500;
            color: var(--text-dark);
          }
          
          .assist, .reason {
            margin-left: 0.25rem;
          }
        }
      }
    }
  }
}

// Responsive Design
@media (max-width: 768px) {
  .games-section {
    .games-card {
      .card-header {
        flex-direction: column;
        align-items: stretch;
      }
    }
  }
  
  .table {
    font-size: 0.875rem;
    
    td {
      padding: 0.75rem 0.5rem;
    }
  }
  
  .game-row {
    .game-teams {
      .team-link {
        .team-names {
          flex-direction: column;
          align-items: flex-start;
          gap: 0.25rem;
          
          .vs-separator {
            display: none;
          }
        }
      }
    }
  }
}

.season-dropdown {
  min-width: 160px;
  display: flex;
  align-items: center;
}
.clickable {
  cursor: pointer;
  user-select: none;
}
.filter-form {
  min-width: 220px;
}
</style>
