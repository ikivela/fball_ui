<template>
  <div class="ottelut-view">
    <!-- Games Section -->
    <div class="games-section">
      <div class="container">
        <div class="row">
          <div class="col-12">
            <div class="games-card">
              <div
                class="games-header d-flex align-items-center justify-content-between"
              >
                <div class="games-info d-flex align-items-center">
                  <h2 class="games-title mb-0">
                    <i class="fas fa-hockey-puck me-2"></i>
                    Ottelut
                  </h2>
                  <div class="season-dropdown ms-3">
                    <select
                      v-model="selectedSeasonValue"
                      @change="onSeasonChange"
                      :disabled="seasonLoading"
                      class="form-select form-select-sm clickable"
                    >
                      <option
                        v-for="season in seasons"
                        :key="season.value"
                        :value="season.value"
                      >
                        {{ season.text }}
                      </option>
                    </select>
                    <span
                      v-if="seasonLoading"
                      class="spinner-border spinner-border-sm ms-2"
                      role="status"
                      aria-hidden="true"
                    ></span>
                  </div>
                </div>
                <div class="filter-form ms-3">
                  <input
                    type="text"
                    v-model="filter"
                    class="form-control form-control-sm"
                    placeholder="Suodata otteluita..."
                  />
                </div>
                <div class="games-summary ms-3">
                  <span class="summary-badge">
                    <i class="fas fa-list me-1"></i>
                    {{ filteredGames.length }} ottelua
                    <span v-if="selectedSeason"
                      >, kausi {{ selectedSeason.text }}</span
                    >
                    <span
                      v-if="
                        filteredStats() &&
                        (filteredStats().wins > 0 ||
                          filteredStats().losses > 0 ||
                          filteredStats().ties > 0)
                      "
                      class="stats-badges ms-2"
                    >
                      <span
                        class="badge me-1"
                        data-bs-toggle="tooltip"
                        title="Voitot: Ottelut, joissa Nibacos on tehnyt enemmän maaleja kuin vastustaja."
                        :style="'background: var(--primary-color); color: #fff;'"
                      >
                        <span class="me-1">voitot</span
                        >{{ filteredStats().wins }}
                      </span>
                      <span
                        class="badge me-1"
                        data-bs-toggle="tooltip"
                        title="Tappiot: Ottelut, joissa Nibacos on tehnyt vähemmän maaleja kuin vastustaja."
                        :style="'background: var(--secondary-color); color: #fff;'"
                      >
                        <span class="me-1">tappiot</span
                        >{{ filteredStats().losses }}
                      </span>
                      <span
                        class="badge me-1"
                        data-bs-toggle="tooltip"
                        title="Tasapelit: Ottelut, joissa maalit ovat tasan."
                        :style="'background: var(--accent-color); color: var(--primary-color);'"
                      >
                        <span class="me-1">tasurit</span
                        >{{ filteredStats().ties }}
                      </span>
                      <span
                        class="badge"
                        data-bs-toggle="tooltip"
                        title="Maaliero: Nibacoksen tekemät maalit miinus päästetyt maalit."
                        :style="'background: var(--info-color, #0dcaf0); color: var(--text-dark);'"
                      >
                        <span class="me-1">maaliero</span
                        >{{ filteredStats().goalDifference > 0 ? "+" : ""
                        }}{{ filteredStats().goalDifference }}
                      </span>
                      <span
                        class="badge"
                        data-bs-toggle="tooltip"
                        title="Ka. maaleja/ottelu: Nibacoksen tekemien maalien keskiarvo per ottelu."
                        :style="'background: var(--secondary-color); color: #fff;'"
                      >
                        <span class="me-1">maalikeskiarvo</span
                        >{{ filteredStats().averageGoalsPerGame.toFixed(2) }}
                      </span>
                    </span>
                  </span>
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
                        <th
                          v-for="field in fields"
                          :key="field.key"
                          @click="toggleSort(field.key)"
                          :class="{
                            sortable: true,
                            sorted: sortBy === field.key,
                          }"
                        >
                          <i
                            class="fas fa-sort me-1"
                            v-if="sortBy !== field.key"
                          ></i>
                          <i
                            v-if="sortBy === field.key && !sortDesc"
                            class="fas fa-sort-up me-1"
                          ></i>
                          <i
                            v-if="sortBy === field.key && sortDesc"
                            class="fas fa-sort-down me-1"
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
                                  game.RinkName &&
                                  fields.some((f) => f.key === 'RinkName')
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
                            <div>
                              <a
                                :href="`${result_url}${game.UniqueID}`"
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
                              </a>
                            </div>
                          </template>
                          <template v-else-if="field.key === 'class'">
                            <div class="sarja-info">
                              <div class="sarja-main">
                                {{ shorten_classname(game.class || "") }}
                              </div>
                              <div
                                v-if="game.competition"
                                class="competition-name"
                              >
                                {{ game.competition }}
                              </div>
                            </div>
                          </template>
                          <template v-else-if="field.key === 'Result'">
                            <div v-if="game.GameDate < today">
                              <div v-if="game.Result != '-'">
                                <router-link
                                  :to="{
                                    name: 'OtteluViewQuery',
                                    query: {
                                      season: selectedSeasonValue,
                                      gameid:
                                        game.match_id ||
                                        game.UniqueID ||
                                        game.gameid,
                                      home: game.HomeTeamName,
                                      away: game.AwayTeamName,
                                      date: game.GameDate,
                                      class: currentClass,
                                    },
                                  }"
                                  class="result-score"
                                  :class="getResultColor(game)"
                                  style="
                                    cursor: pointer;
                                    text-decoration: underline;
                                  "
                                >
                                  {{ game.Result }}
                                </router-link>
                              </div>
                              <div v-else class="no-result">
                                <a
                                  :href="`${result_url}${game.UniqueID}`"
                                  class="live-link"
                                >
                                  <i class="fas fa-external-link-alt"></i>
                                  <span>Live</span>
                                </a>
                              </div>
                            </div>
                            <div v-else>
                              <a
                                :href="`${result_url}${game.UniqueID}`"
                                class="live-link"
                              >
                                <i class="fas fa-external-link-alt"></i>
                                <span>Live</span>
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
                            <a
                              :href="standings_link(game.groupID)"
                              class="group-link"
                            >
                              {{ game.group }}
                            </a>
                          </template>
                          <template v-else>
                            {{ game[field.key] }}
                          </template>
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
    <div
      class="modal fade"
      id="gameStatsModal"
      tabindex="-1"
      :class="{ show: showGameStat }"
      v-if="showGameStat"
    >
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">
              <i class="fas fa-chart-line me-2"></i>
              {{ currentGame }}
            </h5>
            <button
              type="button"
              class="btn-close btn-close-white"
              @click="showGameStat = false"
            ></button>
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
                <div
                  v-for="stat in gameStats"
                  :key="stat.time"
                  class="stat-item"
                >
                  <div class="stat-time">{{ stat.time }}</div>
                  <div class="stat-content">
                    <div class="stat-event">
                      <span class="event-type" :class="stat.event">
                        {{
                          stat.event === "goal" ? "⚽ Maali" : "🟨 Rangaistus"
                        }}
                      </span>
                      <span class="event-result">{{
                        stat.event === "goal" ? stat.result : stat.penalty_time
                      }}</span>
                    </div>
                    <div class="stat-details">
                      <span class="team-name">{{ stat.team }}</span>
                      <span v-if="stat.yv_av" class="special-play">
                        {{
                          stat.yv_av === "RL0"
                            ? "Rangaistusl. (epäonnistunut)"
                            : stat.yv_av
                        }}
                      </span>
                    </div>
                    <div v-if="stat.event === 'goal'" class="goal-details">
                      <span class="scorer">{{ stat.scorer }}</span>
                      <span v-if="stat.assist" class="assist"
                        >({{ stat.assist }})</span
                      >
                    </div>
                    <div
                      v-if="stat.event === 'penalty'"
                      class="penalty-details"
                    >
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
    <div
      class="modal fade"
      id="rosterModal"
      tabindex="-1"
      :class="{ show: showRoster }"
      v-if="showRoster"
    >
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">
              <i class="fas fa-users me-2"></i>
              Kokoonpano
            </h5>
            <button
              type="button"
              class="btn-close btn-close-white"
              @click="showRoster = false"
            ></button>
          </div>
          <div class="modal-body">
            <div v-if="loading" class="loading-modal">
              <i class="fas fa-spinner fa-spin"></i>
              <p>Ladataan kokoonpanoa...</p>
            </div>

            <div
              v-else-if="
                !Array.isArray(currentRoster) || currentRoster.length === 0
              "
              class="no-roster"
            >
              <i class="fas fa-users-slash"></i>
              <p>Kokoonpanoa ei löytynyt</p>
            </div>

            <div v-else class="roster-content">
              <div class="roster-header">
                <h6>
                  {{ currentRoster[0].GameDate }},
                  {{ currentRoster[0].StatName }}
                </h6>
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
                    <tr
                      v-for="player in currentRoster"
                      :key="player.PlayerJerseyNr"
                    >
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

    <!-- Otteluraportti-modal -->
    <!-- (Remove the modal markup and all related modal logic) -->
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
      baseurl: import.meta.env.VITE_APP_BACKEND_URL
        ? import.meta.env.VITE_APP_BACKEND_URL
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
      sortDesc: false,
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
        { key: "RinkName", label: "Paikka", sortable: false },
        { key: "group", label: "Lohko", sortable: false },
        { key: "class", label: "Sarja", sortable: false },
      ],
      selectedSeasonValue: null,
      seasonLoading: false,
      gameRowRefs: [],
      gameReport: null,
      reportLoading: false,
      reportError: "",
      showGameReport: false,
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

    // Synkkaa query-parametrin kausi
    if (this.$route.query.season) {
      console.log("Query season found:", this.$route.query.season);
      this.selectedSeasonValue = this.$route.query.season;
    } else if (this.seasons && this.seasons.length > 0) {
      this.selectedSeasonValue = this.seasons[0].value;
    }

    await this.getSelectedSeason(
      this.seasons.find((s) => s.value === this.selectedSeasonValue)
    );
    this.$nextTick(() => {
      this.scrollToUpcomingGame();
      // Initialize Bootstrap tooltips
      const tooltipTriggerList = [].slice.call(
        document.querySelectorAll('[data-bs-toggle="tooltip"]')
      );
      tooltipTriggerList.forEach(function (tooltipTriggerEl) {
        if (window.bootstrap && window.bootstrap.Tooltip) {
          new window.bootstrap.Tooltip(tooltipTriggerEl);
        }
      });
    });
  },

  computed: {
    ...mapState({
      games: (state) => state.games,
      seasons: (state) => state.seasons,
      seasonStats: (state) => state.stats,
    }),

    today() {
      return DateTime.now().toISODate();
    },

    fields() {
      return this.isSmallScreen ? this.mobileFields : this.tablecolumns;
    },

    mobileFields() {
      return [
        { key: "Date", label: "Aika" },
        { key: "Game", label: "Ottelu" },
        { key: "Result", label: "Tulos" },
        { key: "class", label: "Sarja" },
        { key: "RinkName", label: "Paikka" },
        { key: "group", label: "Lohko" },
      ];
    },

    classes() {
      if (
        !this.selectedSeason ||
        !this.games[this.selectedSeason.value] ||
        !Array.isArray(this.games[this.selectedSeason.value])
      )
        return [];
      const uniqueClasses = [
        ...new Set(
          this.games[this.selectedSeason.value].map((game) => game.class)
        ),
      ];
      return uniqueClasses.sort();
    },

    filteredGames() {
      let games = this.currentGames;
      if (!this.filter) {
        games = [...games];
      } else {
        games = games.filter((item) => {
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
              item.RinkName.toLowerCase().includes(
                this.filter.toLowerCase()
              )) ||
            (item.group &&
              item.group.toLowerCase().includes(this.filter.toLowerCase())) ||
            (item.class &&
              item.class.toLowerCase().includes(this.filter.toLowerCase()))
          );
        });
      }
      // Sorting
      if (this.sortBy) {
        games = [...games].sort((a, b) => {
          let aVal = a[this.sortBy] || "";
          let bVal = b[this.sortBy] || "";
          // For date, sort as date
          if (this.sortBy === "Date" || this.sortBy === "GameDate") {
            aVal = a.GameDate + "T" + (a.GameTime || "00:00");
            bVal = b.GameDate + "T" + (b.GameTime || "00:00");
            aVal = new Date(aVal);
            bVal = new Date(bVal);
          } else {
            aVal = aVal.toString().toLowerCase();
            bVal = bVal.toString().toLowerCase();
          }
          if (aVal < bVal) return this.sortDesc ? 1 : -1;
          if (aVal > bVal) return this.sortDesc ? -1 : 1;
          return 0;
        });
      }
      return games;
    },

    formattedGameReportTitle() {
      if (
        !this.gameReport ||
        !this.gameReport.date ||
        !this.gameReport.homeName ||
        !this.gameReport.awayName
      )
        return "";
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

  methods: {
    ...mapActions({
      fetchGames: "fetchGames",
      fetchSeasons: "fetchSeasons",
      fetchStats: "fetchStats",
    }),

    // Muotoilee nimen: SUKUNIMI Etunimi -> Sukunimi Etunimi
    formatName(name) {
      if (!name) return "";
      // Jos nimi on jo oikeassa muodossa, palautetaan sellaisenaan
      if (/^[A-ZÅÄÖ]+ [A-ZÅÄÖa-zåäö]+$/.test(name)) {
        const [last, first] = name.split(" ");
        return (
          last.charAt(0).toUpperCase() +
          last.slice(1).toLowerCase() +
          " " +
          (first.charAt(0).toUpperCase() + first.slice(1).toLowerCase())
        );
      }
      return name;
    },

    updateScreenWidth() {
      this.isSmallScreen = window.matchMedia("(max-width: 600px)").matches;
    },

    parseDate(dateString) {
      return DateTime.fromISO(dateString).toFormat("dd.MM.yyyy HH:mm");
    },

    shorten_classname(classname) {
      if (!classname) return "";
      return classname.replace("Salibandy", "SB");
    },

    standings_link(groupID) {
      if (!groupID || !/^\d+$/.test(groupID)) return "";
      if (this.selectedSeason && this.selectedSeason.text) {
        const year = String(this.selectedSeason.text).split("-")[0];
        return `${this.standings_url}${groupID}!sb${year}`;
      }
      return this.standings_url;
    },

    async getSelectedSeason(season) {
      if (season) {
        this.selectedSeason = season;
      } else if (
        this.selectedSeasonValue &&
        this.seasons &&
        this.seasons.length > 0
      ) {
        const found = this.seasons.find(
          (s) => s.value === this.selectedSeasonValue
        );
        this.selectedSeason = found || this.seasons[0];
      } else if (this.seasons && this.seasons.length > 0) {
        this.selectedSeason = this.seasons[0];
      } else {
        this.selectedSeason = null;
        return;
      }

      console.log("getSelectedSeason:", this.selectedSeason);

      if (this.selectedSeason && !this.games[this.selectedSeason.value]) {
        //console.log('Fetching games for season:', this.selectedSeason.value);
        await this.fetchGames(this.selectedSeason.value);
      }

      this.currentGames =
        this.selectedSeason && this.games[this.selectedSeason.value]
          ? this.games[this.selectedSeason.value]
          : [];
      //console.log('currentGames set to:', this.currentGames);
    },

    setFilter(value) {
      this.currentClass = value;
      if (this.selectedSeason && this.games[this.selectedSeason.value]) {
        this.currentGames = this.games[this.selectedSeason.value].filter(
          (game) => game.class === value
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
          `${this.baseurl}/api/gamestats/${season.value}&${uniqueID}`
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

      return items.filter((item) => {
        return (
          item.HomeTeamName.toLowerCase().includes(filter.toLowerCase()) ||
          item.AwayTeamName.toLowerCase().includes(filter.toLowerCase()) ||
          item.RinkName.toLowerCase().includes(filter.toLowerCase()) ||
          item.group.toLowerCase().includes(filter.toLowerCase())
        );
      });
    },

    getResultColor(game) {
      if (!game.Result || game.Result === "-") return "neutral";

      const teamName = this.currentTeam;
      const isHomeTeam = game.HomeTeamName.includes(teamName);

      if (!isHomeTeam && !game.AwayTeamName.includes(teamName)) {
        return "neutral"; // Nibacos not in this game
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

    cycleSeason() {
      if (!this.seasons || this.seasons.length === 0) return;
      const idx = this.seasons.findIndex(
        (s) => s.value === this.selectedSeason.value
      );
      const nextIdx = (idx + 1) % this.seasons.length;
      this.getSelectedSeason(this.seasons[nextIdx]);
    },

    async onSeasonChange() {
      this.seasonLoading = true;
      console.log(
        "onSeasonChange called with selectedSeasonValue:",
        this.selectedSeasonValue
      );
      const seasonObj = this.seasons.find(
        (s) => s.value === this.selectedSeasonValue
      );
      // update query url
      this.$router.replace({
        query: { ...this.$route.query, season: this.selectedSeasonValue },
      });
      await this.getSelectedSeason(seasonObj);
      this.seasonLoading = false;
    },

    setGameRowRef(idx) {
      return (el) => {
        this.gameRowRefs[idx] = el;
      };
    },

    scrollToUpcomingGame() {
      if (!this.filteredGames || this.filteredGames.length === 0) return;
      const today = this.today;
      let scrollIdx = null;
      for (let i = 0; i < this.filteredGames.length; i++) {
        const game = this.filteredGames[i];
        if (game.GameDate > today) {
          scrollIdx = i;
          break;
        }
      }
      // If all games are in the past, do nothing
      if (scrollIdx === null) return;
      // If the first future game is today, skip to the next one if possible
      if (
        this.filteredGames[scrollIdx].GameDate === today &&
        scrollIdx + 1 < this.filteredGames.length
      ) {
        scrollIdx++;
      }
      const rowEl = this.gameRowRefs[scrollIdx];
      if (rowEl && rowEl.scrollIntoView) {
        rowEl.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    },

    toggleSort(key) {
      if (this.sortBy === key) {
        this.sortDesc = !this.sortDesc;
      } else {
        this.sortBy = key;
        this.sortDesc = false;
      }
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

    filteredStats() {
      let team_name = this.currentTeam;
      let wins = 0;
      let losses = 0;
      let ties = 0;
      let totalGoals = 0;
      let totalGoalsAgainst = 0;
      let validGames = 0;
      let games = this.filteredGames;

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
          game.HomeTeamName &&
          game.AwayTeamName &&
          (game.HomeTeamName.includes(team_name) ||
            game.AwayTeamName.includes(team_name)) &&
          typeof game.Result === "string" &&
          /^\d+\s*-\s*\d+$/.test(game.Result.trim())
        ) {
          const isHomeTeam = game.HomeTeamName.includes(team_name);
          let [home, away] = game.Result.split("-").map((s) =>
            parseInt(s.trim(), 10)
          );
          if (isNaN(home) || isNaN(away)) continue;
          let teamScore = isHomeTeam ? home : away;
          let opponentScore = isHomeTeam ? away : home;

          if (teamScore > opponentScore) {
            wins++;
          } else if (teamScore < opponentScore) {
            losses++;
          } else {
            ties++;
          }

          totalGoals += teamScore;
          totalGoalsAgainst += opponentScore;
          validGames++;
        }
      }

      let goalDifference = totalGoals - totalGoalsAgainst;
      let averageGoalsPerGame = validGames > 0 ? totalGoals / validGames : 0;
      let averageGoalsAgainstPerGame =
        validGames > 0 ? totalGoalsAgainst / validGames : 0;

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

    handlePlayerLinkClick(playerId) {
      this.showGameReport = false;
      this.$nextTick(() => {
        document
          .querySelectorAll(".modal-backdrop")
          .forEach((el) => el.parentNode.removeChild(el));
        document.body.classList.remove("modal-open");
        this.$router.push({
          name: "PelaajaView",
          params: { player_id: playerId },
        });
      });
    },

    goToOttelutView() {
      this.$router.push({
        name: "OttelutView",
        query: {
          season: this.selectedSeasonValue,
        },
      });
    },
  },

  watch: {
    filteredGames() {
      this.$nextTick(() => {
        this.scrollToUpcomingGame();
      });
    },
    selectedSeason() {
      this.$nextTick(() => {
        this.scrollToUpcomingGame();
      });
    },
  },
};
</script>

<style lang="scss" scoped>
.ottelut-view {
  min-height: 100vh;
}

// Games Section
.games-section {
  .games-card {
    background: var(--bg-white);
    border-radius: var(--border-radius-lg);
    box-shadow: var(--shadow-lg);
    border: 1px solid var(--border-color);
    padding: 2rem 2rem 1.5rem 2rem;

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
          padding: 0.5rem 0.5rem;
        }
        @media (max-width: 600px) {
          .games-summary {
            padding: 0.5rem 0.25rem;
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
          padding: 0.6rem 0.75rem;
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
          padding: 0.6rem 0.75rem;
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

        .home-team,
        .away-team {
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
          .home-team,
          .away-team {
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

.modal-lg {
  max-width: 700px;
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
.no-stats,
.no-roster {
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
    font-size: 0.95em;
  }
  td,
  th {
    padding: 0.4rem 0.3rem !important;
  }
  .game-class-mobile .sarja-mobile {
    font-size: 0.95em;
    color: var(--primary-color);
    font-weight: 500;
    letter-spacing: 0.01em;
  }

  .result-score {
    margin: 0.25rem 0;
    display: inline-block;
  }
  .summary-badge {
    margin: 0.25rem 0;
    line-height: 1;
    display: inline-block;
  }
}

.summary-badge.clickable {
  cursor: pointer;
  user-select: none;
  background: var(--bg-light);
  color: var(--text-dark);
  padding: 0.5rem 1rem;
  border-radius: var(--border-radius);
  font-size: 0.875rem;
  font-weight: 500;
  transition: background 0.2s;
}
.summary-badge.clickable:hover {
  background: var(--primary-color);
  color: #fff;
}
.filter-form {
  min-width: 220px;
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

.sortable {
  cursor: pointer;
  user-select: none;
}
.sorted {
  background: var(--primary-light);
}

.date-location-mobile {
  margin-top: 0.15rem;
  font-size: 0.8em;
  color: var(--text-light);
}
.location-link-mobile {
  color: var(--primary-color);
  text-decoration: none;
  font-size: 1.1em;
}
.location-link-mobile:hover {
  text-decoration: underline;
}
.rink-mobile {
  font-size: 1.1em;
  color: var(--text-light);
}

/* PelaajaView:n aikajanan tyylit identtistä muotoilua varten */
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
@media (max-width: 768px) {
  .timeline-dot {
    width: 2em;
    height: 2em;
    font-size: 0.95em;
  }
}

@media (max-width: 600px) {
  .stats-badges .badge {
    margin: 0.25rem 0.25rem !important;
    display: inline-block;
  }
  .stats-badges {
    flex-wrap: wrap !important;
    gap: 0.25rem !important;
  }
  .stats-badges .badge {
    line-height: 0.5;
  }
}
.stats-badges {
  display: flex;
  flex-wrap: wrap;
  gap: 0 0.5em;
  margin: 0.25rem 0;
  align-items: flex-start;
}
.stats-badges .badge {
  margin: 0.15em 0.25em !important;
  line-height: 1.1 !important;
  padding-top: 0.2em !important;
  padding-bottom: 0.2em !important;
  display: inline-block !important;
}

.sarja-info {
  display: flex;
  flex-direction: column;
  gap: 0.1rem;
}
.sarja-main {
  font-size: 0.95em;
  color: var(--primary-color);
  font-weight: 500;
  letter-spacing: 0.01em;
}
.competition-name {
  font-size: 0.8em;
  color: #888;
  font-weight: 400;
  font-style: italic;
}
</style>