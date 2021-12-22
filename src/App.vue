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

          <b-span style="margin-left: 1em">
            Otteluita: {{ this.games.length }}
          </b-span>
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
                currentSeason,
                data.item.HomeTeamName + ' - ' + data.item.AwayTeamName
              )
            "
            >{{ data.value }}</a
          ></template
        >
      </b-table>
      <b-modal ok-only v-model="showGameStat">
        <div class="d-block text-center">
          <b-spinner v-if="gameStats.length == 0" label=""
            >Loading...</b-spinner
          >
          <b>{{ this.currentGame }}</b>
        </div>
        <ul>
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
      baseurl: process.env.BACKEND_URL
        ? process.env.BACKEND_URL
        : "http://localhost:3000",
      show: true,
      updated: "",
      options: [],
      seasons: [],
      showGameStat: false,
      gameStats: "",
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
    console.log("backend: %s", process.env.BACKEND_URL);
    this.currentSeason = DateTime.now().toFormat("yyyy");
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
      this.allGames = await this.getGames(
        this.selectedSeason == null ? "" : this.selectedSeason
      );
      this.showPastValues = "true";
      console.log(this.allGames.length);
      this.allGames = this.allGames.sort((a, b) => {
        let a_date = DateTime.fromISO(a.GameDate + "T" + a.GameTime).toMillis();
        let b_date = DateTime.fromISO(b.GameDate + "T" + b.GameTime).toMillis();

        return a_date > b_date ? 1 : -1;
      });
    },
    async getGameStats(_id, _season, _game) {
      this.gameStats = null;

      /*console.log(_id);
      var season =
        this.selectedSeason == null
          ? DateTime.now().toFormat("yyyy")
          : this.selectedSeason;
      let res = await axios.get(`${this.baseurl}/game/${season}/${_id}`);
      this.gameStats = res.data;
      if (res.data.length > 0) this.showGameStat = true;*/
      this.currentGame = _game;
      this.showGameStat = true;
      this.gameStats = [
        {
          event: "penalty",
          time: "04.29",
          penalty_time: "2 min",
          team: "Nibacos ",
          player: "Potinoja Jenna",
          reason: "MAILAAN LYÖMINEN TAI POTKAISEMINEN",
        },
        {
          event: "goal",
          time: "05.14",
          result: "1-0",
          yv_av: "YV",
          team: "SC Kokkola",
          scorer: "Leskinen Iida",
          assist: "Sikala Mira",
        },
        {
          event: "goal",
          time: "08.09",
          result: "1-1",
          yv_av: "",
          team: "Nibacos ",
          scorer: "Kurikkala Veera",
          assist: "",
        },
        {
          event: "goal",
          time: "10.41",
          result: "1-2",
          yv_av: "",
          team: "Nibacos ",
          scorer: "Kurikkala Veera",
          assist: "",
        },
        {
          event: "penalty",
          time: "11.59",
          penalty_time: "2 min",
          team: "Nibacos ",
          player: "Potinoja Jenna",
          reason: "ESTÄMINEN",
        },
        {
          event: "goal",
          time: "15.48",
          result: "1-3",
          yv_av: "SR",
          team: "Nibacos ",
          scorer: "Tuikka Miisa",
          assist: "Kurikkala Veera",
        },
        {
          event: "goal",
          time: "18.33",
          result: "1-4",
          yv_av: "",
          team: "Nibacos ",
          scorer: "Vähärautio Emma",
          assist: "Palojärvi Milja",
        },
        {
          event: "goal",
          time: "19.18",
          result: "1-5",
          yv_av: "",
          team: "Nibacos ",
          scorer: "Riippa Iitu",
          assist: "Paloaho Marlena",
        },
        {
          event: "goal",
          time: "26.11",
          result: "1-6",
          yv_av: "",
          team: "Nibacos ",
          scorer: "Vähärautio Emma",
          assist: "Riippa Iitu",
        },
        {
          event: "penalty",
          time: "28.16",
          penalty_time: "2 min",
          team: "SC Kokkola",
          player: "Sikala Mira",
          reason: "TYÖNTÄMINEN",
        },
        {
          event: "goal",
          time: "28.51",
          result: "1-7",
          yv_av: "YV",
          team: "Nibacos ",
          scorer: "Vähärautio Emma",
          assist: "Kurikkala Veera",
        },
        {
          event: "goal",
          time: "35.36",
          result: "1-8",
          yv_av: "",
          team: "Nibacos ",
          scorer: "Känsäkangas Milla",
          assist: "Paloaho Marlena",
        },
        {
          event: "goal",
          time: "36.17",
          result: "2-8",
          yv_av: "",
          team: "SC Kokkola",
          scorer: "Ylitolva Lotta",
          assist: "Sikala Mira",
        },
        {
          event: "goal",
          time: "37.35",
          result: "3-8",
          yv_av: "",
          team: "SC Kokkola",
          scorer: "Sikala Mira",
          assist: "Ylitolva Lotta",
        },
        {
          event: "goal",
          time: "37.51",
          result: "3-9",
          yv_av: "",
          team: "Nibacos ",
          scorer: "Kurikkala Veera",
          assist: "",
        },
        {
          event: "goal",
          time: "38.16",
          result: "4-9",
          yv_av: "",
          team: "SC Kokkola",
          scorer: "Sikala Mira",
          assist: "Ylitolva Lotta",
        },
        {
          event: "goal",
          time: "39.26",
          result: "4-9",
          yv_av: "RL0",
          team: "Nibacos ",
          scorer: "Lahti Alexandra",
          assist: "",
        },
        {
          event: "goal",
          time: "41.05",
          result: "4-9",
          yv_av: "RL0",
          team: "Nibacos ",
          scorer: "Riippa Iitu",
          assist: "",
        },
      ];
      return _id;
    },
    async getSeasons() {
      let res = await axios.get(`${this.baseurl}/seasons`);
      let seasons = res.data.data;
      seasons = seasons.map((x) => {
        return { value: x, text: x };
      });
      seasons.unshift({ value: null, text: "Valitse kausi" });
      console.log(seasons);
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
