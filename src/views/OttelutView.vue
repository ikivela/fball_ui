<template>
  <div class="ottelut-view">
    <!-- Hero Section -->
    <div class="hero-section">
      <div class="container">
        <div class="row align-items-center">
          <div class="col-lg-8">
            <h1 class="hero-title">
              <i class="fas fa-list-alt me-3"></i>
              Kaikki Nibacos-ottelut
            </h1>
            <p class="hero-subtitle">
              Selaa ja suodata joukkueen otteluhistoriaa
            </p>
          </div>
          <div class="col-lg-4 text-end">
            <div class="stats-overview">
              <div class="stat-card">
                <div class="stat-icon">
                  <i class="fas fa-trophy"></i>
                </div>
                <div class="stat-content">
                  <div class="stat-value">{{ currentStats.wins }}</div>
                  <div class="stat-label">Voitot</div>
                </div>
              </div>
              <div class="stat-card">
                <div class="stat-icon">
                  <i class="fas fa-times-circle"></i>
                </div>
                <div class="stat-content">
                  <div class="stat-value">{{ currentStats.losses }}</div>
                  <div class="stat-label">Häviöt</div>
                </div>
              </div>
              <div class="stat-card">
                <div class="stat-icon">
                  <i class="fas fa-minus-circle"></i>
                </div>
                <div class="stat-content">
                  <div class="stat-value">{{ currentStats.ties }}</div>
                  <div class="stat-label">Tasapelit</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Filters Section -->
    <div class="filters-section">
      <div class="container">
        <div class="row">
          <div class="col-12">
            <div class="filters-card">
              <div class="filters-header">
                <h3 class="filters-title">
                  <i class="fas fa-filter me-2"></i>
                  Suodattimet
                </h3>
              </div>
              
              <div class="filters-content">
                <div class="row">
                  <div class="col-md-6">
                    <div class="search-group">
                      <label class="form-label">Haku</label>
                      <div class="search-input-wrapper">
                        <i class="fas fa-search search-icon"></i>
                        <input
                          type="text"
                          v-model="filter"
                          placeholder="Suodata otteluita..."
                          class="form-control search-input"
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div class="col-md-6">
                    <div class="filter-buttons">
                      <button
                        class="btn btn-outline-primary filter-btn"
                        :class="{ active: kaudet }"
                        @click="kaudet = !kaudet"
                      >
                        <i class="fas fa-calendar-alt me-2"></i>
                        Kaudet
                      </button>
                      <button
                        class="btn btn-outline-primary filter-btn"
                        :class="{ active: sarjat }"
                        @click="sarjat = !sarjat"
                      >
                        <i class="fas fa-layer-group me-2"></i>
                        Sarjat
                      </button>
                    </div>
                  </div>
                </div>
                
                <!-- Seasons Filter -->
                <div v-if="kaudet" class="filter-options">
                  <div class="filter-section">
                    <h4 class="filter-section-title">Valitse kausi</h4>
                    <div class="filter-options-grid">
                      <button
                        v-for="season in seasons"
                        :key="season.text"
                        class="filter-option-btn"
                        :class="{ active: selectedSeason && selectedSeason.value === season.value }"
                        @click="getSelectedSeason(season)"
                      >
                        {{ season.text }}
                      </button>
                    </div>
                  </div>
                </div>
                
                <!-- Classes Filter -->
                <div v-if="sarjat" class="filter-options">
                  <div class="filter-section">
                    <h4 class="filter-section-title">Valitse sarja</h4>
                    <div class="filter-options-grid">
                      <button
                        v-for="value in classes"
                        :key="value"
                        class="filter-option-btn"
                        :class="{ active: currentClass === value }"
                        @click="setFilter(value)"
                      >
                        {{ value }}
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

    <!-- Games Section -->
    <div class="games-section">
      <div class="container">
        <div class="row">
          <div class="col-12">
            <div class="games-card">
              <div class="games-header">
                <div class="games-info">
                  <h2 class="games-title">
                    <i class="fas fa-hockey-puck me-2"></i>
                    Ottelut
                  </h2>
                  <div class="games-summary">
                    <span class="summary-badge">
                      <i class="fas fa-calendar me-1"></i>
                      {{ selectedSeason ? selectedSeason.text : '' }}
                    </span>
                    <span class="summary-badge">
                      <i class="fas fa-gamepad me-1"></i>
                      {{ currentClass || 'Kaikki sarjat' }}
                    </span>
                    <span class="summary-badge">
                      <i class="fas fa-list me-1"></i>
                      {{ currentGames.length > 0 ? currentGames.length : games.length }} ottelua
                    </span>
                  </div>
                </div>
                
                <div class="games-stats">
                  <div class="stat-item">
                    <span class="stat-label">Voitot:</span>
                    <span class="stat-value">{{ currentStats.wins }}</span>
                  </div>
                  <div class="stat-item">
                    <span class="stat-label">Häviöt:</span>
                    <span class="stat-value">{{ currentStats.losses }}</span>
                  </div>
                  <div class="stat-item">
                    <span class="stat-label">Tasapelit:</span>
                    <span class="stat-value">{{ currentStats.ties }}</span>
                  </div>
                  <div class="stat-item">
                    <span class="stat-label">Maalit:</span>
                    <span class="stat-value">{{ currentStats.totalGoals }}</span>
                  </div>
                  <div class="stat-item">
                    <span class="stat-label">Päästetyt:</span>
                    <span class="stat-value">{{ currentStats.totalGoalsAgainst }}</span>
                  </div>
                </div>
              </div>
              
              <div class="games-content">
                <div v-if="!selectedSeason" class="loading-section">
                  <div class="loading-content">
                    <i class="fas fa-spinner fa-spin"></i>
                    <p>Ladataan otteluita...</p>
                  </div>
                </div>
                <div v-else class="table-responsive">
                  <table class="table table-hover">
                    <thead>
                      <tr>
                        <th v-for="field in fields" :key="field.key">
                          <i class="fas fa-sort me-1"></i>
                          {{ field.label }}
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-for="game in currentGames" :key="game.UniqueID" class="game-row">
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
                          <div v-if="selectedSeason && selectedSeason.value == seasons[0].value">
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

    <!-- Roster Modal -->
    <div class="modal fade" id="rosterModal" tabindex="-1" :class="{ show: showRoster }" v-if="showRoster">
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">
              <i class="fas fa-users me-2"></i>
              Kokoonpano
            </h5>
            <button type="button" class="btn-close btn-close-white" @click="showRoster = false"></button>
          </div>
          <div class="modal-body">
            <div v-if="loading" class="loading-modal">
              <i class="fas fa-spinner fa-spin"></i>
              <p>Ladataan kokoonpanoa...</p>
            </div>
            
            <div v-else-if="!Array.isArray(currentRoster) || currentRoster.length === 0" class="no-roster">
              <i class="fas fa-users-slash"></i>
              <p>Kokoonpanoa ei löytynyt</p>
            </div>
            
            <div v-else class="roster-content">
              <div class="roster-header">
                <h6>{{ currentRoster[0].GameDate }}, {{ currentRoster[0].StatName }}</h6>
              </div>
              
              <div class="table-responsive">
                <table class="table table-hover">
                  <thead>
                    <tr>
                      <th v-for="field in rosterFields" :key="field.key">
                        {{ field.label }}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="player in currentRoster" :key="player.PlayerJerseyNr">
                      <td>{{ player.PlayerJerseyNr }}</td>
                      <td>{{ player.PlayerFirstName }}</td>
                      <td>{{ player.PlayerLastName }}</td>
                      <td>{{ player.RoleAbbrv }}</td>
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
import { DateTime } from "luxon";
import { mapActions, mapState } from "vuex";

export default {
  name: "OttelutView",
  components: {},
  data() {
    return {
      currentUrl: "",
      currentTeam: "Nibacos",
      kaudet: false,
      sarjat: false,
      currentRoster: "",
      currentClass: "",
      standings_url2:
        "http://tilastopalvelu.fi/fb/index.php/component/content/index.php?option=com_content&view=article&id=14&stgid=",
      standings_url: "https://tulospalvelu.salibandy.fi/category/",
      result_url: "https://tulospalvelu.salibandy.fi/match/",
      baseurl: process.env.VUE_APP_BACKEND_URL
        ? process.env.VUE_APP_BACKEND_URL
        : "http://localhost:3000",
      show: false,
      updated: "",
      options: [],

      showGamesPage: false,
      showStatsPage: false,
      showGameStats: false,
      showGameStat: false,
      showRoster: false,
      gameStats: "",

      loading: false,
      allGames: [],
      statsData: "",
      selectedSeason: null,
      selectedClass: "",
      showStats: false,
      currentGame: "",
      currentGames: [],
      sortBy: "",
      sortDesc: "",
      items: [],
      filter: "",
      filterOn: [],
      totalRows: 1,
      isSmallScreen: false,
      scFields: ["Date", "Game", "class", "Result"],
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
    };
  },
  created() {
    this.currentUrl = window.location.href;
    document.title = "Nibacos ottelut";
    console.log("currentUrl:", this.currentUrl);
  },

  async mounted() {
    this.screenWidth = window.matchMedia("(max-width: 600px)").matches;
    window.addEventListener("resize", this.updateScreenWidth);

    if (this.seasons.length == 0) await this.fetchSeasons();
    if (this.seasonStats.length == 0) await this.fetchStats();

    await this.getSelectedSeason();
  },
  
  computed: {
    ...mapState({
      games: (state) => state.games,
      seasons: (state) => state.seasons,
      seasonStats: (state) => state.stats,
    }),

    currentStats() {
      let team_name = this.currentTeam;
      let wins = 0;
      let losses = 0;
      let ties = 0;
      let totalGoals = 0;
      let totalGoalsAgainst = 0;
      let goalDifference = 0;
      let games = this.currentGames;

      if (!games || games.length === 0) {
        return {
          wins: 0,
          losses: 0,
          ties: 0,
          totalGoals: 0,
          totalGoalsAgainst: 0,
          averageGoalsPerGame: 0,
          averageGoalsAgainstPerGame: 0,
          goalDifference: 0,
        };
      }

      for (let i = 0; i < games.length; i++) {
        const game = games[i];

        if (
          game.HomeTeamName.includes(team_name) ||
          game.AwayTeamName.includes(team_name)
        ) {
          const isHomeTeam = game.HomeTeamName.includes(team_name);
          let teamScore = isHomeTeam
            ? game.Result.split("-")[0]
            : game.Result.split("-")[1];
          let opponentScore = isHomeTeam
            ? game.Result.split("-")[1]
            : game.Result.split("-")[0];

          if (teamScore != "" && opponentScore != "") {
            teamScore = teamScore.split(" ")[0];
            teamScore = parseInt(teamScore);
            opponentScore = opponentScore.split(" ")[0];
            opponentScore = parseInt(opponentScore);

            if (teamScore > opponentScore) {
              wins++;
            } else if (teamScore < opponentScore) {
              losses++;
            } else if (teamScore === opponentScore) {
              ties++;
            }

            totalGoals += teamScore != "" ? parseInt(teamScore) : 0;
            totalGoalsAgainst +=
              opponentScore != "" ? parseInt(opponentScore) : 0;
          }
        }
      }

      goalDifference = totalGoals - totalGoalsAgainst;
      goalDifference =
        goalDifference > 0 ? `+${goalDifference}` : `-${goalDifference}`;
      let totalGames = wins + losses;
      let averageGoalsPerGame = totalGames > 0 ? totalGoals / totalGames : 0;
      let averageGoalsAgainstPerGame = totalGames > 0 ? totalGoalsAgainst / totalGames : 0;

      return {
        wins: wins,
        losses: losses,
        ties: ties,
        totalGoals: totalGoals,
        totalGoalsAgainst: totalGoalsAgainst,
        averageGoalsPerGame: averageGoalsPerGame,
        averageGoalsAgainstPerGame: averageGoalsAgainstPerGame,
        goalDifference: goalDifference,
      };
    },
    
    showPastValues: {
      set: function (value) {
        this.show = value;
      },
      get: function () {
        return this.show;
      },
    },
    
    today() {
      return DateTime.now().toISODate();
    },

    fields() {
      return this.isSmallScreen ? this.scFields : this.tablecolumns;
    },

    classes() {
      if (!this.selectedSeason || !this.games[this.selectedSeason.value] || !Array.isArray(this.games[this.selectedSeason.value])) return [];
      const uniqueClasses = [...new Set(this.games[this.selectedSeason.value].map(game => game.class))];
      return uniqueClasses.sort();
    },
  },

  methods: {
    ...mapActions({
      fetchGames: "fetchGames",
      fetchSeasons: "fetchSeasons",
      fetchStats: "fetchStats",
    }),
    
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
      return `${this.standings_url}${groupID}`;
    },
    
    async getSelectedSeason(season) {
      if (season) {
        this.selectedSeason = season;
      } else if (this.seasons && this.seasons.length > 0) {
        this.selectedSeason = this.seasons[0];
      } else {
        this.selectedSeason = null;
        return;
      }
      
      console.log('getSelectedSeason:', this.selectedSeason);
      console.log('games for season:', this.games[this.selectedSeason.value]);
      
      if (this.selectedSeason && !this.games[this.selectedSeason.value]) {
        console.log('Fetching games for season:', this.selectedSeason.value);
        await this.fetchGames(this.selectedSeason.value);
      }
      
      this.currentGames = this.selectedSeason && this.games[this.selectedSeason.value] ? this.games[this.selectedSeason.value] : [];
      console.log('currentGames set to:', this.currentGames);
    },
    
    setFilter(value) {
      this.currentClass = value;
      if (this.selectedSeason && this.games[this.selectedSeason.value]) {
        this.currentGames = this.games[this.selectedSeason.value].filter(
          game => game.class === value
        );
      }
    },
    
    async getRoster(game, season) {
      this.loading = true;
      this.showRoster = true;
      
      try {
        const response = await axios.get(
          `${this.baseurl}/api/roster/${game.UniqueID}/${season.value}`
        );
        this.currentRoster = response.data;
      } catch (error) {
        console.error("Error fetching roster:", error);
        this.currentRoster = [];
      } finally {
        this.loading = false;
      }
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
    
    onFiltered(filteredItems) {
      this.totalRows = filteredItems.length;
    },
    
    filterTable(items, filter) {
      if (!filter) return items;
      
      return items.filter(item => {
        return (
          item.HomeTeamName.toLowerCase().includes(filter.toLowerCase()) ||
          item.AwayTeamName.toLowerCase().includes(filter.toLowerCase()) ||
          item.RinkName.toLowerCase().includes(filter.toLowerCase()) ||
          item.group.toLowerCase().includes(filter.toLowerCase())
        );
      });
    },

    getResultColor(game) {
      if (!game.Result || game.Result === '-') return 'neutral';
      
      const teamName = this.currentTeam;
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
  },
};
</script>

<style lang="scss" scoped>
.ottelut-view {
  min-height: 100vh;
}

// Hero Section
.hero-section {
  background: linear-gradient(135deg, var(--primary-color) 0%, var(--primary-light) 100%);
  color: white;
  padding: 3rem 0;
  margin-bottom: 2rem;
  
  .hero-title {
    font-size: 2.5rem;
    font-weight: 700;
    margin-bottom: 1rem;
    
    i {
      color: var(--accent-color);
    }
  }
  
  .hero-subtitle {
    font-size: 1.125rem;
    opacity: 0.9;
    margin-bottom: 0;
  }
  
  .stats-overview {
    display: flex;
    gap: 1rem;
    justify-content: flex-end;
    
    .stat-card {
      background: rgba(255, 255, 255, 0.1);
      border-radius: var(--border-radius);
      padding: 1rem;
      text-align: center;
      backdrop-filter: blur(10px);
      min-width: 80px;
      
      .stat-icon {
        font-size: 1.5rem;
        color: var(--accent-color);
        margin-bottom: 0.5rem;
      }
      
      .stat-content {
        .stat-value {
          font-size: 1.5rem;
          font-weight: 700;
          line-height: 1;
        }
        
        .stat-label {
          font-size: 0.75rem;
          opacity: 0.8;
          margin-top: 0.25rem;
        }
      }
    }
  }
}

// Filters Section
.filters-section {
  margin-bottom: 2rem;
  
  .filters-card {
    background: var(--bg-white);
    border-radius: var(--border-radius-lg);
    box-shadow: var(--shadow-sm);
    border: 1px solid var(--border-color);
    
    .filters-header {
      padding: 1.5rem 1.5rem 0;
      
      .filters-title {
        font-size: 1.25rem;
        font-weight: 600;
        margin: 0;
        color: var(--text-dark);
        
        i {
          color: var(--primary-color);
        }
      }
    }
    
    .filters-content {
      padding: 1.5rem;
      
      .search-group {
        .form-label {
          font-weight: 600;
          color: var(--text-dark);
          margin-bottom: 0.5rem;
        }
        
        .search-input-wrapper {
          position: relative;
          
          .search-icon {
            position: absolute;
            left: 1rem;
            top: 50%;
            transform: translateY(-50%);
            color: var(--text-light);
            z-index: 2;
          }
          
          .search-input {
            padding-left: 2.5rem;
            border-radius: var(--border-radius);
            border: 1px solid var(--border-color);
            
            &:focus {
              border-color: var(--primary-color);
              box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
            }
          }
        }
      }
      
      .filter-buttons {
        display: flex;
        gap: 1rem;
        margin-top: 2rem;
        
        .filter-btn {
          flex: 1;
          padding: 0.75rem 1.5rem;
          border-radius: var(--border-radius);
          font-weight: 500;
          transition: all 0.2s ease;
          
          &.active {
            background-color: var(--primary-color);
            border-color: var(--primary-color);
            color: white;
          }
          
          &:hover {
            transform: translateY(-1px);
            box-shadow: var(--shadow-sm);
          }
        }
      }
      
      .filter-options {
        margin-top: 1.5rem;
        padding-top: 1.5rem;
        border-top: 1px solid var(--border-color);
        
        .filter-section {
          .filter-section-title {
            font-size: 1rem;
            font-weight: 600;
            color: var(--text-dark);
            margin-bottom: 1rem;
          }
          
          .filter-options-grid {
            display: flex;
            flex-wrap: wrap;
            gap: 0.5rem;
            
            .filter-option-btn {
              padding: 0.5rem 1rem;
              border: 1px solid var(--border-color);
              background: var(--bg-white);
              color: var(--text-dark);
              border-radius: var(--border-radius);
              font-size: 0.875rem;
              font-weight: 500;
              transition: all 0.2s ease;
              cursor: pointer;
              
              &:hover {
                background-color: var(--bg-light);
                border-color: var(--primary-color);
              }
              
              &.active {
                background-color: var(--primary-color);
                border-color: var(--primary-color);
                color: white;
              }
            }
          }
        }
      }
    }
  }
}

// Games Section
.games-section {
  .games-card {
    background: var(--bg-white);
    border-radius: var(--border-radius-lg);
    box-shadow: var(--shadow-lg);
    border: 1px solid var(--border-color);
    
    .games-header {
      padding: 1.5rem;
      border-bottom: 1px solid var(--border-color);
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      flex-wrap: wrap;
      gap: 1rem;
      
      .games-info {
        .games-title {
          font-size: 1.5rem;
          font-weight: 600;
          margin: 0 0 1rem 0;
          color: var(--text-dark);
          
          i {
            color: var(--primary-color);
          }
        }
        
        .games-summary {
          display: flex;
          gap: 1rem;
          flex-wrap: wrap;
          
          .summary-badge {
            background: var(--bg-light);
            color: var(--text-dark);
            padding: 0.5rem 1rem;
            border-radius: var(--border-radius);
            font-size: 0.875rem;
            font-weight: 500;
            
            i {
              color: var(--primary-color);
            }
          }
        }
      }
      
      .games-stats {
        display: flex;
        gap: 1.5rem;
        flex-wrap: wrap;
        
        .stat-item {
          text-align: center;
          
          .stat-label {
            display: block;
            font-size: 0.75rem;
            color: var(--text-light);
            margin-bottom: 0.25rem;
          }
          
          .stat-value {
            display: block;
            font-size: 1.25rem;
            font-weight: 700;
            color: var(--text-dark);
          }
        }
      }
    }
    
    .games-content {
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
    }
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

// No Stats/Roster
.no-stats, .no-roster {
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

// Roster Content
.roster-content {
  .roster-header {
    margin-bottom: 1.5rem;
    padding-bottom: 1rem;
    border-bottom: 1px solid var(--border-color);
    
    h6 {
      margin: 0;
      color: var(--text-dark);
      font-weight: 600;
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

// Responsive Design
@media (max-width: 768px) {
  .hero-section {
    padding: 2rem 0;
    
    .hero-title {
      font-size: 2rem;
    }
    
    .hero-subtitle {
      font-size: 1rem;
    }
    
    .stats-overview {
      justify-content: center;
      margin-top: 1rem;
    }
  }
  
  .filters-section {
    .filters-card {
      .filters-content {
        .filter-buttons {
          flex-direction: column;
        }
      }
    }
  }
  
  .games-section {
    .games-card {
      .games-header {
        flex-direction: column;
        align-items: stretch;
        
        .games-stats {
          justify-content: center;
        }
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
</style>
