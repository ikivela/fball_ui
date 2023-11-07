<template>
  <div id="ottelut">
    <b-container>
      <b-nav-form>
        <b-input-group prepend="Haku" class="mt-3">
          <b-form-input
            id="filter-input"
            v-model="filter"
            filter-debounce="1000"
            placeholder="Suodata"
          ></b-form-input>

          <b-input-group-append>
            <b-button
              variant="outline-primary"
              :pressed.sync="kaudet"
              v-b-toggle.kaudet
              >Kaudet</b-button
            >
            <b-button
              variant="outline-primary"
              :pressed.sync="sarjat"
              v-b-toggle.sarjat
              >Sarjat</b-button
            >
          </b-input-group-append>
        </b-input-group>

        <b-collapse id="kaudet">
          <b-button-toolbar>
            <b-button-group>
              <b-button
                style="font-size: 0.8em; margin: 0.1em"
                variant="outline-primary"
                v-bind:key="season.text"
                @click="getSelectedSeason(season)"
                v-for="season in seasons"
                >{{ season.text }}</b-button
              >
            </b-button-group>
          </b-button-toolbar>
        </b-collapse>

        <b-collapse id="sarjat">
          <b-button-toolbar>
            <b-button-group>
              <b-button
                style="font-size: 0.8em; margin: 0.1em"
                variant="primary"
                @click="setFilter(value)"
                v-bind:key="value"
                v-for="value in classes"
                >{{ value }}</b-button
              >
            </b-button-group>
          </b-button-toolbar>
        </b-collapse>
      </b-nav-form>
    </b-container>

    <b-container id="games">
      <b-badge>
        Valittu kausi:
        {{ this.selectedSeason !== null ? this.selectedSeason.text : "" }}
        {{ this.currentClass }}
      </b-badge>
      <b-badge style="margin-left: 1em; margin-right: 1em">
        Otteluita:
        {{
          this.currentGames.length > 0
            ? this.currentGames.length
            : this.games.length
        }}
        {{
          `Voitot: ${this.currentStats.wins}, Häviöt: ${
            this.currentStats.losses
          }, Tasapelit: ${this.currentStats.ties} Tehdyt maalit: ${
            this.currentStats.totalGoals
          }, 
                Päästetyt maalit: ${this.currentStats.totalGoalsAgainst},
                  Tehdyt maalit/peli ka.: ${this.currentStats.averageGoalsPerGame.toFixed(
                    1
                  )}, 
                  Päästetyt maalit/peli ka.: ${this.currentStats.averageGoalsAgainstPerGame.toFixed(
                    1
                  )}`
        }}
      </b-badge>

      <b-table
        small
        hover
        :items="games"
        :fields="fields"
        @filtered="onFiltered"
        :filter-function="filterTable"
        :filter="filter"
        :filter-included-fields="filterOn"
      >
        <template v-for="field in fields" :slot="`head-${field.key}`">
          {{ field.label }}
        </template>
        <template #cell(Date)="data">
          <div v-if="!isSmallScreen">
            {{ `${parseDate(data.item.GameDate + "T" + data.item.GameTime)}` }}
          </div>
          <div v-else>
            {{ `${parseDate(data.item.GameDate + "T" + data.item.GameTime)}` }}
            <a :href="`http://maps.google.com/?q=${data.item.RinkName}`">
              <b-icon-map></b-icon-map>
            </a>
          </div>
        </template>
        <template #cell(Game)="data">
          <div v-if="selectedSeason.value == seasons[0].value">
            <a :href="`${result_url}${data.item.UniqueID}`">{{
              `${data.item.HomeTeamName}&nbsp;-&nbsp;${data.item.AwayTeamName}`
            }}</a>
          </div>
          <div v-else>
            <a class="resultStyle" @click="getRoster(data, selectedSeason)">
              <div v-if="!isSmallScreen">
                {{
                  `${data.item.HomeTeamName}&nbsp;-&nbsp;${data.item.AwayTeamName}`
                }}
              </div>
              <div v-else>
                {{ data.item.HomeTeamName }} <br />
                {{ data.item.AwayTeamName }}
              </div>
            </a>
          </div>
        </template>
        <template v-if="!isSmallScreen" #cell(RinkName)="data">
          <a :href="`http://maps.google.com/?q=${data.item.RinkName}`">{{
            data.item.RinkName
          }}</a>
        </template>
        <template v-if="!isSmallScreen" #cell(group)="data">
          <a :href="standings_link(data.item.groupID, data.item.class)">{{
            data.item.group
          }}</a>
        </template>
        <template #cell(class)="data">
          {{ shorten_classname(data.item.class) }}
        </template>
        <template #cell(Result)="data">
          <div v-if="data.item.GameDate < today">
            <div v-if="data.value != '-'">
              <a
                class="resultStyle"
                @click="
                  getGameStats(
                    data.item.UniqueID,
                    selectedSeason,
                    data.item.HomeTeamName + ' - ' + data.item.AwayTeamName
                  )
                "
                >{{ data.value }}</a
              >
            </div>
            <div v-else></div>
          </div>
          <div v-else>
            <a :href="`${result_url}${data.item.UniqueID}`" class="resultStyle"
              ><b-icon-arrow-up-right-square></b-icon-arrow-up-right-square
            ></a>
          </div>
        </template>
      </b-table>
    </b-container>

    <b-modal ok-only v-model="showGameStat">
      <b-spinner v-if="this.loading" label="">Ladataan...</b-spinner>
      <div class="d-block text-center">
        <b>{{ this.currentGame }}</b>
      </div>
      <div v-if="gameStats.length == 0 && !this.loading">Ei tilastoja</div>

      <ul v-if="gameStats.length > 0">
        <li v-for="stat in gameStats" v-bind:key="stat.time">
          {{ stat.time }}
          {{ stat.event == "goal" ? stat.result : stat.penalty_time }}
          {{ stat.team }}
          {{
            stat.yv_av
              ? stat.yv_av == "RL0"
                ? "Rangaistusl. (epäonnistunut)"
                : stat.yv_av
              : ""
          }}
          {{
            stat.event == "goal"
              ? stat.scorer + (stat.assist ? " (" + stat.assist + ")" : "")
              : ""
          }}
          {{ stat.event == "penalty" ? stat.player + " " + stat.reason : "" }}
        </li>
      </ul>
    </b-modal>

    <b-modal
      ok-only
      v-model="showRoster"
      v-if="currentRoster && currentRoster.length > 0"
    >
      <b-spinner v-if="this.loading" label="">Ladataan...</b-spinner>

      <div v-if="Array.isArray(currentRoster)" class="d-block text-center">
        <b>{{
          `${this.currentRoster[0].GameDate}, ${this.currentRoster[0].StatName}`
        }}</b>
      </div>
      <div v-else>Kokoonpanoa ei löytynyt</div>
      <b-table
        v-if="Array.isArray(currentRoster) && currentRoster.length > 0"
        small
        hover
        :fields="rosterFields"
        :items="currentRoster"
      ></b-table>
    </b-modal>
  </div>
</template>

<script>
import axios from "axios";
import { DateTime } from "luxon";
import { BIconArrowUpRightSquare, BIconMap } from "bootstrap-vue";
import { mapActions, mapState } from "vuex";

export default {
  name: "OttelutView",
  components: { BIconArrowUpRightSquare, BIconMap },
  data() {
    return {
      currentUrl: "",
      currentTeam: "Nibacos",
      kaudet: true,
      sarjat: true,
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
    // detect screenwidth, set false if lower than 600px
    this.screenWidth = window.matchMedia("(max-width: 600px)").matches;
    window.addEventListener("resize", this.updateScreenWidth);

    // If season is 2021-2022, the currentSeason has to be 2022
    // Season is changed to new season after 1st of August

    if (this.seasons.length == 0) await this.fetchSeasons();
    if (this.seasonStats.length == 0) await this.fetchStats();

    //console.log(this.seasonStats);
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
      let games = this.currentGames.length > 0 ? this.currentGames : this.games;

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
            //console.log(game.HomeTeamName, game.AwayTeamName, game.Result, wins, losses);

            //console.log(game.HomeTeamName, game.AwayTeamName, teamScore, opponentScore);
            totalGoals += teamScore != "" ? parseInt(teamScore) : 0;
            totalGoalsAgainst +=
              opponentScore != "" ? parseInt(opponentScore) : 0;
            //console.log("Total goals", totalGoals);
            //console.log("Total goals against", totalGoalsAgainst);
          }
        }
      }

      goalDifference = totalGoals - totalGoalsAgainst;
      goalDifference =
        goalDifference > 0 ? `+${goalDifference}` : `-${goalDifference}`;
      let totalGames = wins + losses;
      let averageGoalsPerGame = totalGoals / totalGames;
      let averageGoalsAgainstPerGame = totalGoalsAgainst / totalGames;

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

    classes() {
      let classes = this.allGames
        .map((x) => {
          return x.class;
        })
        .filter((_value, _index, _self) => {
          return _self.indexOf(_value) === _index;
        })
        .sort();
      //classes.unshift("Näytä kaikki");
      return classes;
    },
    fields() {
      //console.log("isSmallScreen", this.isSmallScreen);
      if (this.isSmallScreen) {
        return this.tablecolumns.filter((x) => this.scFields.includes(x.key));
      } else return this.tablecolumns;
    },
    games() {
      return this.allGames;
      /*console.log(
        `showPastValue type:${typeof this.showPastValues} value: ${
          this.showPastValues
        }`
      );
      if (
        this.allGames.filter(
          (x) =>
            x.GameDate >=
            DateTime.now().minus({ days: 3 }).toFormat("yyyy-MM-dd")
        ).length == 0
      )
        return this.allGames;

      if (this.showPastValues == "true") {
        console.log("all games");
        return this.allGames;
      } else {
        console.log(
          "filtering games",
          DateTime.now().minus({ days: 3 }).toFormat("yyyy-MM-dd")
        );
        return this.allGames.filter(
          (x) =>
            x.GameDate >=
            DateTime.now().minus({ days: 3 }).toFormat("yyyy-MM-dd")
        );
      }*/
    },
  },
  methods: {
    ...mapActions({
      fetchGames: "fetchGames",
      fetchSeasons: "fetchSeasons",
      setStats: "setStats",
    }),
    formatScore(data) {
      console.log("SCORE", data);
      let values = data.split("-");
      return `${values[0]}<br />${values[1]}`;
    },
    parseDate(_str, cr) {
      // console.log(_str);
      let date = DateTime.fromISO(_str).toFormat("dd.MM.");
      let time = DateTime.fromISO(_str).toFormat("HH:mm");
      if (cr) return `${date}<br />${time}`;
      else return DateTime.fromISO(_str).toFormat("dd.MM. HH:mm");
    },

    updateScreenWidth() {
      this.isSmallScreen = window.matchMedia("(max-width: 600px)").matches;
    },
    standings_link(_id, _class) {
      //console.log("class", _class);
      if (this.seasons[0].value == this.selectedSeason.value) {
        if (_class.includes("PM"))
          return this.standings_url + _id + "!sb2023pm/tables";
        else return this.standings_url + _id + "!sb2023/tables";
      } else {
        return this.standings_url2 + _id + "&ssn=" + this.selectedSeason.value;
      }
    },
    shorten_classname(_classname) {
      _classname = _classname.replace("SM-SARJA", "SM");
      _classname = _classname.replace("VALTAKUNNALLINEN", "VK");
      _classname = _classname.replace("DIVISIOONA", "DIV");
      _classname = _classname.replace("SÄBÄKIPINÄ", "");

      //console.log("cl", _classname);
      return _classname;
    },
    roster_link(_id) {
      return this.result_url_url + _id + "/lineups";
    },
    filterTable(_row, _filter) {
      let filters = _filter.split(",");
      let rowstr = JSON.stringify(_row);
      //  console.log(rowstr, filters);
      if (!Array.isArray(filters)) return rowstr.includes(filters[0]);
      else return filters.some((f) => rowstr.includes(f));
    },
    setFilter(_value) {
      console.log("set filter value", _value);
      this.currentClass = _value;
      if (!Array.isArray(_value)) _value = [_value];
      this.filter = _value.join(",");
    },
    getSelectedClass(_class) {
      console.log("get class", _class);
      _class = _class !== "Näytä kaikki" ? _class : "";
      console.log("setStats", _class);
      this.setStats(_class ? _class : "");
    },
    async getSelectedSeason(_season) {
      this.selectedSeason = _season ? _season : this.seasons[0];
      //console.log("selected season", this.selectedSeason.value);
      this.allGames = await this.getGames(this.selectedSeason.value);
      this.showPastValues =
        this.selectedSeason == this.seasons[0] ? "false" : "true";
      this.filter = "";
      console.log(
        "allGames.length:",
        this.allGames.length,
        "season",
        this.selectedSeason,
        "past",
        this.showPastValues
      );
      this.allGames = this.allGames.sort((a, b) => {
        let a_date = DateTime.fromISO(a.GameDate + "T" + a.GameTime).toMillis();
        let b_date = DateTime.fromISO(b.GameDate + "T" + b.GameTime).toMillis();

        return a_date > b_date ? 1 : -1;
      });
    },
    getRoster(_game, _season) {
      console.log("get roster ", _season.value, _game.item.UniqueID);
      var url = `${this.baseurl}/roster/?season=${_season.value}&gameid=${_game.item.UniqueID}`;
      this.loading = true;
      this.showRoster = true;
      axios
        .get(url)
        .then((res) => {
          this.currentRoster = res.data;
          this.loading = false;
        })
        .catch((err) => {
          this.showRoster = true;
          this.loading = false;
          this.currentRoster = err.message;
          console.error(err);
        });
    },
    getGameStats(_id, _season, _game) {
      this.gameStats = "";

      this.showGameStat = true;
      this.loading = true;
      this.currentGame = _game;

      console.log("get gamestats", _season.value, this.currentGame);
      var url = `${this.baseurl}/gamestats/?season=${_season.value}&gameid=${_id}`;
      axios
        .get(url)
        .then((res) => {
          this.gameStats = res.data;
          this.loading = false;
        })
        .catch((err) => {
          this.showGameStat = false;
          console.error(err);
        });

      return _id;
    },
    setStats(_class, toggle) {
      console.log("setStat class: %s season: %s", _class, this.selectedSeason);
      this.showStats = toggle ? toggle : true;
      _class = _class != "Näytä kaikki" && _class !== undefined ? _class : "";
      console.log("class %s", _class);
      this.selectedClass = _class != "" ? _class : this.classes[1];

      this.statsData = this.seasonStats.filter(
        (x) => x.season == this.selectedSeason && x.class == _class
      );
    },
    async getStats() {
      let res = await axios.get(`${this.baseurl}/seasonstats`);
      return res.data;
    },

    /*async getSeasons() {
      let res = await axios.get(`${this.baseurl}/seasons`);
      let seasons = res.data.data;
      seasons = seasons.sort((a, b) => (a > b ? -1 : 1));
      seasons = seasons.map((x) => {
        return {
          text: `${x - 1}-${x}`,
          value: x,
        };
      });
      this.seasons = seasons;
      this.selectedSeason = seasons[0];
      console.log(seasons, this.selectedSeason);
      return seasons;
    },*/
    async getGames(year) {
      console.log(year);
      let response = await axios.get(`${this.baseurl}/games/?year=${year}`);
      if (year > 2023) {
        /*
                { key: "Date", label: "Aika", sortable: false },
        { key: "Game", label: "Ottelu", sortable: false },
        { key: "Result", label: "Tulos", sortable: false },
        { key: "group", label: "Lohko", sortable: false },
        { key: "class", label: "Sarja", sortable: false },
        { key: "RinkName", label: "Halli", sortable: false },*/

        /*response.data = response.data.matches.map((match) => {
          return {
            GameDate: match.date,
            GameTime: match.time,
            UniqueID: match.match_id,
            HomeTeamName: match.team_A_description_en,
            AwayTeamName: match.team_B_description_en,
            Result: `${match.fs_A}-${match.fs_B}`,
            Game: `${match.team_A_description_en}-${match.team_B_description_en}`,
            group: match.group_name,
            groupID: match.category_abbrevation,
            class: match.category_name,
            RinkName: match.venue_name,
          };
        });*/
        return response.data;
      } else {
        return response.data;
      }
    },
    onFiltered(filteredItems) {
      // Trigger pagination to update the number of buttons/pages due to filtering
      console.log("filtered length", filteredItems.length);
      this.currentGames = filteredItems;
      this.totalRows = filteredItems.length;
      this.currentPage = 1;
    },
  },
};
</script>

<style lang="scss">
@import "~@/assets/scss/vendors/bootstrap-vue/index";

a.resultStyle:hover {
  color: green;
  background-color: yellow;
  text-decoration: underline;
}
</style>

