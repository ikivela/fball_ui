<template>
  <div id="app">
    <b-navbar sticky toggleable="lg" type="light" variant="light">
      <b-navbar-brand
        ><img
          height="36"
          src="https://static.jopox.fi/nibacos/imagebank/40875_huge.png"
          alt="logo"
        />
        Nibacos
      </b-navbar-brand>
      <b-navbar-toggle target="nav-collapse"></b-navbar-toggle>
      <b-collapse id="nav-collapse" is-nav>
        <b-navbar-nav>
          <b-nav-item
            @click="(showGamesPage = true), (showStatsPage = false)"
            href="#"
            >Ottelut</b-nav-item
          >
          <b-nav-item
            @click="(showGamesPage = false), (showStatsPage = true), setStats()"
            href="#"
            >Tilastot
          </b-nav-item>
        </b-navbar-nav>
        <b-nav-form>
          <b-form-input
            id="filter-input"
            v-model="filter"
            type="search"
            filter-debounce="1000"
            size="sm"
            class="mr-sm-2"
            placeholder="Etsi"
          ></b-form-input>
        </b-nav-form>
      </b-collapse>
    </b-navbar>

    <b-container fluid v-if="showGamesPage" id="games">
      <b-nav-form>
        <b-input-group prepend="">
          <b-form-checkbox
            id="showPast"
            v-model="showPastValues"
            value="true"
            unchecked-value="false"
          >
            Näytä menneet
          </b-form-checkbox>
        </b-input-group>
        <b-form-select
          style="margin-left: 1em"
          v-model="selectedSeason"
          :options="this.seasons"
          v-on:change="updateData()"
        ></b-form-select>

        <b-badge style="margin-left: 1em">
          Ottelut: {{ this.games.length }}
        </b-badge>
        <b-form-select
          v-model="selectedClass"
          v-on:change="getSelectedClass"
          :options="classes"
        ></b-form-select>
      </b-nav-form>
      <b-table
        responsive="lg"
        :items="games"
        :fields="fields"
        @filtered="onFiltered"
        :filter="filter"
        :filter-included-fields="filterOn"
      >
        <template #cell(Result)="data">
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
          ></template
        >
      </b-table>
    </b-container>

    <b-container v-if="showStatsPage" id="stats">
      <b-form-select
        v-model="selectedClass"
        v-on:change="getSelectedClass"
        :options="classes"
      ></b-form-select>
      <b-table small :items="this.statsData[0].stats"> </b-table>
    </b-container>
    <b-modal ok-only v-model="showGameStat">
      <b-spinner v-if="this.loading" label="">Ladataan...</b-spinner>

      <div class="d-block text-center">
        <b>{{ this.currentGame }}</b>
      </div>
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
  </div>
</template>

<script>
import axios from "axios";
import { DateTime } from "luxon";

export default {
  name: "App",
  components: {},
  data() {
    return {
      baseurl: process.env.VUE_APP_BACKEND_URL
        ? process.env.VUE_APP_BACKEND_URL
        : "http://localhost:3000",
      show: true,
      updated: "",
      options: [],
      seasons: [],
      showGamesPage: false,
      showStatsPage: false,
      showGameStats: false,
      showGameStat: false,
      gameStats: "",
      seasonStats: "",
      loading: false,
      allGames: [],
      statsData: "",
      selectedSeason: null,
      selectedClass: "",
      showStats: false,
      currentGame: "",
      items: [],
      filter: null,
      filterOn: [],
      totalRows: 1,
      fields: [
        "GameDate",
        "GameTime",
        "HomeTeamName",
        "AwayTeamName",
        "RinkName",
        "Result",
        "group",
        "class",
      ],
    };
  },
  created() {
    document.title = "Nibacos ottelut";
  },

  async mounted() {
    console.log("backend: %s", process.env.VUE_APP_BACKEND_URL);
    // If season is 2021-2022, the currentSeason has to be 2022
    // Season is changed to new season after 1st of August
    this.seasons = await this.getSeasons();
    this.seasonStats = await this.getStats();
    //console.log(this.seasonStats);
    await this.updateData();
  },
  computed: {
    showPastValues: {
      set: function (value) {
        this.show = value == "true" ? true : false;
      },
      get: function () {
        return this.show;
      },
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
      classes.unshift("Näytä kaikki");
      return classes;
    },
    games() {
      console.log(
        `showPastValue type:${typeof this.showPastValues} value: ${
          this.showPastValues
        }`
      );

      if (this.showPastValues) {
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
      }
    },
  },
  methods: {
    getSelectedClass(_class) {
      console.log("get class", _class);
      _class = _class !== "Näytä kaikki" ? _class : "";
      this.filter = _class;
      if (this.showStats) this.setStats(_class);
    },
    async updateData() {
      console.log("selected season [%s]", this.selectedSeason);
      this.allGames = await this.getGames(this.selectedSeason);
      this.showPastValues = "true";
      console.log("allGames.length:", this.allGames.length);
      this.allGames = this.allGames.sort((a, b) => {
        let a_date = DateTime.fromISO(a.GameDate + "T" + a.GameTime).toMillis();
        let b_date = DateTime.fromISO(b.GameDate + "T" + b.GameTime).toMillis();

        return a_date > b_date ? 1 : -1;
      });
    },
    getGameStats(_id, _season, _game) {
      this.gameStats = "";

      this.showGameStat = true;
      this.loading = true;
      this.currentGame = _game;

      console.log("get gamestats", _season, this.currentGame);
      var url = `${this.baseurl}/gamestats/?season=${_season}&gameid=${_id}`;
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
      this.showStats = toggle ? toggle : true;
      _class = _class ? _class : this.classes[1];
      this.selectedClass = _class;
      console.log("setStat %s %s", _class, this.selectedSeason);
      this.statsData = this.seasonStats.filter(
        (x) => x.season == this.selectedSeason && x.class == _class
      );
    },
    async getStats() {
      let res = await axios.get(`${this.baseurl}/seasonstats`);
      return res.data;
    },
    async getSeasons() {
      let res = await axios.get(`${this.baseurl}/seasons`);
      let seasons = res.data.data;
      console.log(seasons);
      let currentSeason =
        DateTime.now().toObject().month > 9
          ? DateTime.now().toFormat("yyyy")
          : DateTime.now().minus(1, "year").toFormat("yyyy");
      seasons = seasons.map((x) => {
        if (x == "current")
          return {
            value: x,
            text: `${currentSeason}-${parseInt(currentSeason) + 1}`,
          };
        return { value: x, text: `${x - 1}-${x}` };
      });
      //seasons.unshift({ value: null, text: "Valitse kausi" });
      this.selectedSeason = seasons[0].value;

      return seasons;
    },
    async getGames(year) {
      console.log(year);
      let response = await axios.get(`${this.baseurl}/games/?year=${year}`);
      return response.data;
    },
    onFiltered(filteredItems) {
      // Trigger pagination to update the number of buttons/pages due to filtering
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
