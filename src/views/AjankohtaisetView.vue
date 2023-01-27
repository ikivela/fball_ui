<template>
  <div>
    <p>Seuraavat ottelut</p>

    <b-table
      small
      stacked="sm"
      :items="games_table"
      :fields="fields"
      v-if="this.selectedSeason"
    >
      <template #cell(Date)="data">
        {{ `${parseDate(data.item.GameDate + "T" + data.item.GameTime)}` }}
      </template>
      <template #cell(Game)="data">
        {{ `${data.item.HomeTeamName}&nbsp;-&nbsp;${data.item.AwayTeamName}` }}
      </template>

      <template #cell(Result)="data">
        <div v-if="data.item.GameDate < today">
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
        <div v-else>
          <a class="resultStyle" @click="getResultLink(data)"
            ><b-icon-arrow-up-right-square></b-icon-arrow-up-right-square
          ></a>
        </div>
      </template>
    </b-table>
  </div>
</template>

<script>
import axios from "axios";
import { DateTime } from "luxon";
import { BIconArrowUpRightSquare } from "bootstrap-vue";
import { mapActions, mapState } from "vuex";

export default {
  name: "App",
  components: { BIconArrowUpRightSquare },
  data() {
    return {
      currentUrl: "",
      result_url:
        "http://tilastopalvelu.fi/fb/index.php?option=com_content&view=article&id=4&gameid=",
      baseurl: process.env.VUE_APP_BACKEND_URL
        ? process.env.VUE_APP_BACKEND_URL
        : "http://localhost:3000",
      games_table: [],
      show: false,
      pageReady: false,
      updated: "",
      options: [],
      gameStats: "",
      loading: false,
      statsData: "",
      selectedSeason: null,
      selectedClass: "",
      showStats: false,
      currentGame: "",
      sortBy: "",
      sortDesc: "",
      items: [],
      totalRows: 1,
      fields: [
        { key: "Date", label: "Aika", sortable: false },
        { key: "Game", label: "Ottelu", sortable: false },
        { key: "Result", label: "Tulos", sortable: false },
        { key: "group", label: "Lohko", sortable: false },
        { key: "class", label: "Sarja", sortable: false },
        { key: "RinkName", label: "Halli", sortable: false },
      ],
    };
  },
  async created() {
    this.currentUrl = window.location.href;
    document.title = "Nibacos ottelut";

    console.log("created() currentUrl:", this.currentUrl);

    await this.fetchSeasons();
    // Get only the current season
    console.log(this.seasons);
    await this.fetchGames(this.seasons[0].value);
    this.selectedSeason = this.seasons[0];
  },

  mounted() {
    this.pageReady = true;
    console.log(
      "mounted() backend: %s",
      process.env.VUE_APP_BACKEND_URL,
      this.seasons
    );
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

    /*games_table() {
      return this.games[this.selectedSeason.value].filter(
        (x) =>
          x.GameDate >=
            DateTime.now().minus({ days: 3 }).toFormat("yyyy-MM-dd") &&
          x.GameDate <= DateTime.now().plus({ days: 14 }).toFormat("yyyy-MM-dd")
      );
    },*/
  },
  watch: {
    selectedSeason: function () {
      if (
        this.selectedSeason &&
        this.selectedSeason.value &&
        this.games[this.selectedSeason.value]
      ) {
        this.games_table = this.games[this.selectedSeason.value].filter(
          (x) =>
            x.GameDate >=
              DateTime.now().minus({ days: 3 }).toFormat("yyyy-MM-dd") &&
            x.GameDate <=
              DateTime.now().plus({ days: 14 }).toFormat("yyyy-MM-dd")
        );
      } else {
        console.log(this.selectedSeason, this.games);
      }
    },
  },
  methods: {
    ...mapActions({
      fetchGames: "fetchGames",
      fetchSeasons: "fetchSeasons",
      setStats: "setStats",
    }),
    parseDate(_str) {
      // console.log(_str);
      return DateTime.fromISO(_str).toFormat("dd.MM. HH:mm");
    },

    async getSelectedSeason(_season) {
      this.selectedSeason = _season ? _season : this.seasons[0];
      //console.log("selected season", this.selectedSeason.value);
      await this.fetchGames(this.selectedSeason.value);
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

    async getStats() {
      let res = await axios.get(`${this.baseurl}/seasonstats`);
      this.setStats(res.data);
    },
    onFiltered(filteredItems) {
      // Trigger pagination to update the number of buttons/pages due to filtering
      console.log("filtered length", filteredItems.length);
      this.totalRows = filteredItems.length;
      this.currentPage = 1;
    },
    getResultLink(data) {
      const gameDate = DateTime.fromFormat(
        data.item.GameDate,
        "dd.MM. HH:mm"
      ).toISODate();
      if (gameDate <= DateTime.now().toISODate()) {
        console.log(data.item.GameDate, DateTime.now().toISODate());
        return `<a href="#" onclick="this.getGameStats(data.item.UniqueID,
                selectedSeason, data.item.HomeTeamName + ' - ' + data.item.AwayTeamName);return false;
            ">${data.item.Result}</a>`;
      } else {
        console.log("Forwarding", this.result_url + data.item.UniqueID);
        window.open(this.result_url + data.item.UniqueID, "_blank");
        // window.location.href = this.result_url + data.item.UniqueID;
      }
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

<style src="vue-multiselect/dist/vue-multiselect.min.css"></style>
