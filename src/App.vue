<template>
  <div id="app">
    <b-container fluid>
      <b-navbar type="light" variant="light">
        <b-navbar-brand
          ><img
            height="36"
            src="https://static.jopox.fi/nibacos/imagebank/40875_huge.png"
            alt="logo"
        /></b-navbar-brand>
        <b-nav-form>
          <b-input-group prepend="">
            <b-form-input
              id="filter-input"
              v-model="filter"
              type="search"
              filter-debounce="1000"
              placeholder="Etsi.."
            ></b-form-input>
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
        </b-nav-form>
      </b-navbar>

      <b-table
        responsive="sm"
        small
        :items="games"
        :fields="fields"
        @filtered="onFiltered"
        :filter="filter"
        :filter-included-fields="filterOn"
        sticky-header="true"
        style="max-height: 800px"
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
            {{ stat.event == "penalty" ? stat.reason : "" }}
          </li>
        </ul>
      </b-modal>
    </b-container>
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
      showGameStat: false,
      gameStats: "",
      loading: false,
      allGames: [],
      selectedSeason: null,
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
    if (DateTime.now().toObject().month < 8) {
      this.currentSeason = DateTime.now().toFormat("yyyy");
      console.log("not yet august, current season:", this.currentSeason);
    } else {
      this.currentSeason = DateTime.now().plus(1, "year").toFormat("yyyy");
      console.log("else current season", this.currentSeason);
    }
    this.seasons = await this.getSeasons();
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
    async updateData() {
      console.log("selected season [%s]", this.selectedSeason);
      this.allGames = await this.getGames(this.selectedSeason);
      this.showPastValues = "true";
      console.log(this.allGames.length);
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
      axios
        .get(`${this.baseurl}/game/${_season - 1}/${_id}`)
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
    async getSeasons() {
      let res = await axios.get(`${this.baseurl}/seasons`);
      let seasons = res.data.data;
      seasons = seasons.map((x) => {
        return { value: x, text: `${x - 1}-${x}` };
      });
      //seasons.unshift({ value: null, text: "Valitse kausi" });
      this.selectedSeason = seasons[0].value;

      return seasons;
    },
    async getGames(year) {
      console.log(year);
      let response = await axios.get(`${this.baseurl}/games/${year}`);
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
