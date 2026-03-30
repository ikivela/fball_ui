<template>
  <div class="ajankohtaiset-view">
    <!-- Games Section -->
    <!-- Games Section -->
    <div class="games-section">
      <div class="container">
        <div class="row">
          <div class="col-12">
            <div class="games-card">
              <div
                class="games-header d-flex align-items-center justify-content-between"
              >
                <div class="games-info">
                  <h2 class="games-title mb-0">Ajankohtaiset ottelut</h2>
                </div>
                <div class="filter-form ms-3">
                  <input
                    type="text"
                    v-model="filter"
                    class="form-control form-control-sm"
                    placeholder="Suodata otteluita..."
                  />
                </div>
              </div>
              <div class="games-content">
                <div v-if="this.selectedSeason && this.seasons.length > 0">
                  <div v-if="isSmallScreen" class="mobile-games-list">
                    <article
                      v-for="(game, idx) in filteredGames"
                      :key="game.UniqueID"
                      class="mobile-game-card"
                      :ref="setGameRowRef(idx)"
                    >
                      <div class="mobile-game-top">
                        <div class="mobile-game-top-row">
                          <div class="mobile-game-date">
                            {{ parseDate(game.GameDate + "T" + game.GameTime) }}
                          </div>
                          <div class="mobile-game-tags">
                            <span v-if="game.class" class="mobile-class-chip">
                              {{ shorten_classname(game.class || "") }}
                            </span>
                          </div>
                        </div>
                        <a
                          v-if="getMobileLeagueDetail(game)"
                          class="mobile-league-detail"
                          :href="`http://maps.google.com/?q=${game.RinkName}`"
                        >
                          <i class="fas fa-map-marker-alt"></i>
                          {{ getMobileLeagueDetail(game) }}
                        </a>
                      </div>

                      <div class="mobile-game-main">
                        <a
                          v-if="selectedSeason.value == seasons[0].value"
                          :href="liveMatchUrl(game)"
                          class="mobile-teams-link"
                        >
                          <div class="mobile-teams-inline">
                            <span class="mobile-team-name mobile-home-team">
                              {{ game.HomeTeamName }}
                            </span>
                            <router-link
                              v-if="game.GameDate < today && isValidResult(game.Result)"
                              :to="gameDetailRoute(game)"
                              class="mobile-score-pill"
                              :class="getResultColor(game)"
                            >
                              {{ game.Result }}
                            </router-link>
                            <a
                              v-else-if="game.GameDate >= today"
                              :href="liveMatchUrl(game)"
                              class="mobile-score-pill live"
                            >
                              Live
                            </a>
                            <span v-else class="mobile-score-pill neutral">
                            </span>
                            <span class="mobile-team-name mobile-away-team">
                              {{ game.AwayTeamName }}
                            </span>
                          </div>
                        </a>
                        <a
                          v-else
                          class="mobile-teams-link resultStyle"
                          @click="getRoster(game, selectedSeason)"
                        >
                          <div class="mobile-teams-inline">
                            <span class="mobile-team-name mobile-home-team">
                              {{ game.HomeTeamName }}
                            </span>
                            <router-link
                              v-if="game.GameDate < today && isValidResult(game.Result)"
                              :to="gameDetailRoute(game)"
                              class="mobile-score-pill"
                              :class="getResultColor(game)"
                            >
                              {{ game.Result }}
                            </router-link>
                            <a
                              v-else-if="game.GameDate >= today"
                              :href="liveMatchUrl(game)"
                              class="mobile-score-pill live"
                            >
                              Live
                            </a>
                            <span v-else class="mobile-score-pill neutral">
                            </span>
                            <span class="mobile-team-name mobile-away-team">
                              {{ game.AwayTeamName }}
                            </span>
                          </div>
                        </a>
                      </div>

                    </article>

                    <div v-if="filteredGames.length === 0" class="no-games">
                      <div class="no-games-content">
                        <i class="fas fa-calendar-times"></i>
                        <h3>Ei otteluita</h3>
                        <p>Ei löytynyt otteluita valitulla hakuehdolla.</p>
                      </div>
                    </div>
                  </div>
                  <div v-else class="table-responsive">
                    <table class="table table-hover">
                      <thead>
                        <tr>
                          <th
                            v-for="field in fields"
                            :key="field.key"
                          >
                            <i
                             class="fas fa-sort me-1"
                             v-if="false" 
                            ></i>
                            {{ field.label }}
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr
                          v-for="(game, idx) in filteredGames"
                          :key="game.UniqueID"
                          class="game-row"
                          :ref="setGameRowRef(idx)"
                        >
                          <td
                           v-for="field in fields"
                           :key="field.key"
                           :class="getFieldClass(field.key)"
                          >
                           <template v-if="field.key === 'Date'">
                            <div class="date-info">
                              <div class="date-main">
                                {{
                                  parseDate(game.GameDate + "T" + game.GameTime)
                                }}
                              </div>
                              <div
                                v-if="
                                  isSmallScreen &&
                                  game.RinkName
                                "
                                class="date-location-mobile"
                              >
                                <a
                                  :href="`http://maps.google.com/?q=${game.RinkName}`"
                                  class="location-link-mobile"
                                >
                                  <i class="fas fa-map-marker-alt me-1"></i>
                                  <span class="rink-mobile">{{
                                    game.RinkName
                                  }}</span>
                                </a>
                              </div>
                            </div>
                           </template>

                           <template v-else-if="field.key === 'Game'">
                            <div
                              v-if="selectedSeason.value == seasons[0].value"
                            >
                              <a
                                :href="liveMatchUrl(game)"
                                class="team-link"
                              >
                                <div class="team-names">
                                  <span class="home-team">{{
                                    game.HomeTeamName
                                  }}</span>
                                  <span class="vs-separator">vs</span>
                                  <span class="away-team">{{
                                    game.AwayTeamName
                                  }}</span>
                                </div>
                                <div
                                  v-if="isSmallScreen && game.class"
                                  class="mobile-meta"
                                >
                                  <span class="mobile-class-chip">
                                    {{ shorten_classname(game.class || "") }}
                                  </span>
                                </div>
                              </a>
                            </div>
                            <div v-else>
                              <a
                                class="team-link resultStyle"
                                @click="getRoster(game, selectedSeason)"
                              >
                                <div class="team-names">
                                  <span class="home-team">{{
                                    game.HomeTeamName
                                  }}</span>
                                  <span class="vs-separator">vs</span>
                                  <span class="away-team">{{
                                    game.AwayTeamName
                                  }}</span>
                                </div>
                                <div
                                  v-if="isSmallScreen && game.class"
                                  class="mobile-meta"
                                >
                                  <span class="mobile-class-chip">
                                    {{ shorten_classname(game.class || "") }}
                                  </span>
                                </div>
                              </a>
                            </div>
                           </template>

                           <template v-else-if="field.key === 'RinkName'">
                            <a
                              :href="`http://maps.google.com/?q=${game.RinkName}`"
                              class="rink-link"
                            >
                              <i class="fas fa-map-marker-alt me-1"></i>
                              {{ game.RinkName }}
                            </a>
                           </template>

                           <template v-else-if="field.key === 'group'">
                            <router-link
                              :to="standings_link(game)"
                              class="group-link"
                            >
                              {{ game.group }}
                            </router-link>
                           </template>

                           <template v-else-if="field.key === 'class'">
                            <span>{{
                              shorten_classname(game.class || "")
                            }}</span>
                           </template>

                           <template v-else-if="field.key === 'Result'">
                           <div v-if="game.GameDate < today">
                              <div v-if="isValidResult(game.Result)">
                                <router-link
                                  :to="gameDetailRoute(game)"
                                  class="result-link"
                                >
                                  <span
                                    class="result-score"
                                    :class="getResultColor(game)"
                                    >{{ game.Result }}</span
                                  >
                                </router-link>
                              </div>
                              
                            </div>
                            <div v-else>
                              <a
                                :href="liveMatchUrl(game)"
                                class="live-link"
                              >
                                <i class="fas fa-external-link-alt"></i>
                                <span>Live</span>
                              </a>
                            </div>
                           </template>
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
      baseurl: import.meta.env.VITE_APP_BACKEND_URL || "http://localhost:3000",
      show: false,
      pageReady: false,
      isSmallScreen: false,
      updated: "",
      options: [],
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
      scFields: [
        { key: "Date", label: "Aika", sortable: false },
        { key: "Game", label: "Ottelu", sortable: false },
        { key: "Result", label: "Tulos", sortable: false },
      ],
      filter: "",
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
      gameRowRefs: [],
    };
  },
  async created() {
    this.currentUrl = window.location.href;
    document.title = import.meta.env.VITE_APP_SITE_TITLE;
    console.log("created() currentUrl:", this.currentUrl);
  },

  async mounted() {
    this.pageReady = true;

    this.screenWidth = window.matchMedia("(max-width: 480px)").matches;
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

  beforeUnmount() {
    window.removeEventListener("resize", this.updateScreenWidth);
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
      // Date filter: Last weekend (Friday of previous week) + next 10 days
      const now = DateTime.now();
      // startOf('week') returns Monday. Minus 3 days = Friday of previous week.
      const startDate = now.startOf("week").minus({ days: 2 });
      const endDate = now.endOf("week").plus({ days: 1 });

      const dateFiltered = this.games_table.filter((game) => {
        if (!game.GameDate) return false;
        const gameDate = DateTime.fromISO(game.GameDate);
        // Compare dates (ignoring time component of GameDate if it's just YYYY-MM-DD, 
        // but Luxon comparison handles it well if we are consistent. 
        // GameDate is YYYY-MM-DD. startDate/endDate have times.
        // Let's use startOf('day') for comparison to be safe/inclusive.
        const isSabakipina =
          (game.class && game.class.toLowerCase().includes("säbäkipinä")) ||
          (game.group && game.group.toLowerCase().includes("säbäkipinä"));

        return (
          !isSabakipina &&
          gameDate >= startDate.startOf("day") &&
          gameDate <= endDate.endOf("day")
        );
      });

      if (!this.filter) return dateFiltered;

      return dateFiltered.filter((item) => {
        return (
          (item.HomeTeamName &&
            item.HomeTeamName.toLowerCase().includes(
              this.filter.toLowerCase()
            )) ||
          (item.AwayTeamName &&
            item.AwayTeamName.toLowerCase().includes(
              this.filter.toLowerCase()
            )) ||
          (item.RinkName &&
            item.RinkName.toLowerCase().includes(this.filter.toLowerCase())) ||
          (item.group &&
            item.group.toLowerCase().includes(this.filter.toLowerCase())) ||
          (item.class &&
            item.class.toLowerCase().includes(this.filter.toLowerCase()))
        );
      });
    },
  },

  watch: {
    selectedSeason: {
      immediate: true,
      handler(val) {
        if (val) this.selectedSeasonValue = val.value;
      },
    },
  },

  methods: {
    ...mapActions(["fetchGames", "fetchSeasons"]),
    updateScreenWidth() {
      this.isSmallScreen = window.matchMedia("(max-width: 480px)").matches;
    },
    parseDate(dateString) {
      return DateTime.fromISO(dateString).toFormat("dd.MM.yyyy HH:mm");
    },
    shorten_classname(classname) {
      if (!classname) return "";
      return classname.replace("Salibandy", "SB");
    },
    getMobileLeagueDetail(game) {
      if (!game) return "";
      return game.RinkName || "";
    },
    standings_link(game) {
      return {
        name: "SarjataulukotView",
        query: {
          season: this.selectedSeasonValue || "",
          class: game.class || "",
          group: game.groupID || "",
        },
      };
    },
    isValidResult(result) {
      return result && result !== '-' && result !== 'null-null';
    },
    liveMatchUrl(game) {
      return `${this.result_url}${game.match_id || game.UniqueID || game.gameid || ""}/lineups`;
    },
    gameDetailRoute(game) {
      return {
        name: "OtteluView",
        params: {
          season: this.selectedSeasonValue,
          game_id: game.match_id || game.UniqueID || game.gameid,
        },
        state: {
          home: game.HomeTeamName,
          away: game.AwayTeamName,
          date: game.GameDate,
          class: game.class || "",
        },
      };
    },
    async getRoster(game, season) {
      // TODO: Implement roster functionality
      console.log("Roster requested for game:", game, "season:", season);
    },
    getResultColor(game) {
      if (!game.Result || game.Result === "-") return "neutral";

      const teamName = import.meta.env.VITE_APP_CLUB_NAME;
      const isHomeTeam = game.HomeTeamName.includes(teamName);

      if (!isHomeTeam && !game.AwayTeamName.includes(teamName)) {
        return "neutral"; // Club not in this game
      }

      const scores = game.Result.split("-");
      if (scores.length !== 2) return "neutral";

      const homeScore = parseInt(scores[0].trim());
      const awayScore = parseInt(scores[1].trim());

      if (isNaN(homeScore) || isNaN(awayScore)) return "neutral";

      if (isHomeTeam) {
        return homeScore > awayScore
          ? "win"
          : homeScore < awayScore
          ? "loss"
          : "tie";
      } else {
        return awayScore > homeScore
          ? "win"
          : awayScore < homeScore
          ? "loss"
          : "tie";
      }
    },
    onSeasonChange() {
      // Stub for season change if needed, or remove if not used in this view context
      // actually it is used in the template
      this.seasonLoading = true;
      const seasonObj = this.seasons.find(
        (s) => s.value === this.selectedSeasonValue
      );
      this.selectedSeason = seasonObj;
      if (!this.games[seasonObj.value]) {
        this.fetchGames(seasonObj.value);
      }
      this.games_table = this.games[seasonObj.value] || [];
      this.seasonLoading = false;
    },
    getFieldClass(key) {
      if (key === "Date") return "game-date";
      if (key === "Game") return "game-teams";
      if (key === "class")
        return this.isSmallScreen ? "game-class-mobile" : "game-class";
      if (key === "Result") return "game-result";
      if (key === "RinkName") return "game-rink";
      if (key === "group") return "game-group";
      return "";
    },
    setGameRowRef(idx) {
      return (el) => {
        this.gameRowRefs[idx] = el;
      };
    },
  },
};
</script>

<style lang="scss" scoped>
@use "@/assets/table-styles";
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
    background: linear-gradient(
      135deg,
      var(--primary-color) 0%,
      var(--primary-light) 100%
    );
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

        .goal-details,
        .penalty-details {
          font-size: 0.875rem;
          color: var(--text-light);

          .scorer,
          .player {
            font-weight: 500;
            color: var(--text-dark);
          }

          .assist,
          .reason {
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

.mobile-games-list {
  display: flex;
  flex-direction: column;
  gap: 0;
}

.mobile-game-card {
  border-bottom: 1px solid var(--border-color);
  padding: 0.7rem 0.15rem;
  background: transparent;
}

.mobile-game-top {
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
  margin-bottom: 0.35rem;
}

.mobile-game-top-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.6rem;
}

.mobile-game-date {
  font-size: 0.84rem;
  font-weight: 600;
  color: var(--text-dark);
  line-height: 1.2;
}

.mobile-game-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.3rem;
  justify-content: flex-end;
}

.mobile-game-tags .mobile-class-chip {
  font-size: 0.84rem;
  font-weight: 600;
  line-height: 1.2;
  padding: 0;
  border-radius: 0;
  background: transparent;
  color: var(--text-dark);
  text-transform: none;
}

.mobile-league-detail {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.76rem;
  color: var(--primary-color);
  line-height: 1.2;
  text-decoration: none;
}

.mobile-league-detail i {
  flex: 0 0 auto;
  font-size: 0.82rem;
}

.mobile-game-main {
  display: flex;
  align-items: center;
  gap: 0.45rem;
}

.mobile-teams-link {
  flex: 1;
  min-width: 0;
  color: inherit;
  text-decoration: none;
}

.mobile-teams-inline {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto minmax(0, 1fr);
  align-items: center;
  column-gap: 0.45rem;
  min-width: 0;
}

.mobile-team-name {
  font-size: 0.92rem;
  font-weight: 700;
  line-height: 1.15;
  color: var(--text-dark);
}

.mobile-home-team,
.mobile-away-team {
  min-width: 0;
  overflow-wrap: anywhere;
}

.mobile-home-team {
  text-align: right;
}

.mobile-away-team {
  text-align: left;
}

.mobile-away-team {
  color: var(--primary-color);
}

.mobile-vs-pill {
  display: none;
}

.mobile-score-pill {
  flex: 0 0 auto;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 3.2rem;
  min-height: 2rem;
  font-size: 0.9rem;
  font-weight: 700;
  padding: 0.18rem 0.48rem;
  border-radius: 999px;
  text-decoration: none;
}

.mobile-score-pill.win {
  background: #10b981;
  color: white;
}

.mobile-score-pill.loss {
  background: #ef4444;
  color: white;
}

.mobile-score-pill.tie {
  background: #f59e0b;
  color: white;
}

.mobile-score-pill.neutral {
  background: var(--secondary-color);
  color: white;
}

.mobile-score-pill.live {
  background: rgba(245, 158, 11, 0.14);
  color: var(--accent-color);
}

@media (min-width: 481px) {
  .mobile-games-list {
    display: none;
  }
}

@media (max-width: 480px) {
  .games-section .container {
    padding-left: 0;
    padding-right: 0;
  }

  .games-section .row {
    --bs-gutter-x: 0;
  }

  .games-card {
    border-radius: 0;
    border-left: 0;
    border-right: 0;
    box-shadow: none;
    padding: 0.35rem 0.35rem 0.5rem;
  }

  .games-header {
    padding-left: 0.15rem;
    padding-right: 0.15rem;
  }

  .games-content > .table-responsive {
    display: none;
  }
}

@media (max-width: 380px) {
  .mobile-game-top {
    gap: 0.2rem;
  }

  .mobile-game-top-row {
    align-items: center;
    flex-direction: row;
    gap: 0.4rem;
  }

  .mobile-game-tags {
    justify-content: flex-end;
  }

  .mobile-game-main {
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto;
    align-items: center;
    gap: 0.4rem;
  }

  .mobile-teams-inline {
    column-gap: 0.35rem;
  }
}
</style>
