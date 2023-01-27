<template>
  <div>
    <b-nav>
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
        <b-badge
          v-if="this.selectedSeason"
          style="margin-left: 1em; margin-right: 1em"
        >
          Otteluita: {{ numberOfGames }}
        </b-badge>
        <b-input-group prepend="">
          <b-form-checkbox
            id="showPast"
            v-model="showPastValues"
            value="true"
            unchecked-value="false"
          >
            Näytä menneet
          </b-form-checkbox>
          <multiselect
            v-model="selectedSeason"
            label="text"
            placeholder="Valitse kausi"
            :options="this.seasons"
            @select="getSelectedSeason"
          >
            <template slot="singleLabel" slot-scope="{ option }">{{
              option.text
            }}</template>
          </multiselect>

          <multiselect
            v-model="selectedClass"
            v-if="this.selectedSeason"
            :options="classes"
            :multiple="true"
            :close-on-select="false"
            :clear-on-select="false"
            :preserve-search="true"
            placeholder="Suodata sarja"
            :preselect-first="false"
            @close="setFilter"
          >
            <template slot="selection" slot-scope="{ values, isOpen }"
              ><span
                class="multiselect__single"
                v-if="values.length &amp;&amp; !isOpen"
                >{{ values.length }} sarjaa valittu</span
              ></template
            >
          </multiselect>
        </b-input-group>
      </b-nav-form>
    </b-nav>
    <hr />
    <b-table
      v-if="this.selectedSeason"
      small
      stacked="sm"
      :items="games_table"
      :fields="fields"
      @filtered="onFiltered"
      :filter-function="filterTable"
      :filter="filter"
      :filter-included-fields="filterOn"
    >
      <template #cell(Date)="data">
        {{ `${parseDate(data.item.GameDate + "T" + data.item.GameTime)}` }}
      </template>
      <template #cell(Game)="data">
        {{ `${data.item.HomeTeamName}&nbsp;-&nbsp;${data.item.AwayTeamName}` }}
      </template>

      <!--<template #cell(show_details)="row">
          <b-button size="sm" @click="row.toggleDetails" class="mr-2">
            {{ row.detailsShowing ? "Hide" : "Show" }} Details
          </b-button>
        </template>-->
      <!-- <template slot="row-details" slot-scope="data">
          <b-button @click="data.toggleDetails">
            {{ data.detailsShowing ? "Hide" : "Show" }} Details }}
          </b-button>
          <div>
            Details for row go here. data.item contains the row's (item) record
            data
            {{ data.item }}
          </div>
        </template> -->
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
            ><b-icon-link></b-icon-link
          ></a>
        </div>
      </template>
    </b-table>

    <!--<b-container v-if="showStatsPage" id="stats">
      <b-badge>{{ `Kausi ${this.selectedSeason}` }}</b-badge>
      <b-form-select
        v-model="selectedClass"
        v-on:change="getSelectedClass"
        :options="classes"
      ></b-form-select>
      <b-table
        small
        :items="this.statsData.length > 0 ? this.statsData[0].stats : []"
      >
      </b-table>
    </b-container>-->
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
    <hr />
    <pre>
      {{ this.games_table }}
      </pre
    >
  </div>
</template>

<script>
import axios from "axios";
import { DateTime } from "luxon";
import Multiselect from "vue-multiselect";
import { BIconLink } from "bootstrap-vue";
import { mapActions, mapState } from "vuex";

export default {
  name: "App",
  components: { Multiselect, BIconLink },
  data() {
    return {
      currentUrl: "",
      result_url:
        "http://tilastopalvelu.fi/fb/index.php?option=com_content&view=article&id=4&gameid=",
      baseurl: process.env.VUE_APP_BACKEND_URL
        ? process.env.VUE_APP_BACKEND_URL
        : "http://localhost:3000",
      show: false,
      updated: "",
      options: [],
      games_table: [],
      showGamesPage: false,
      showStatsPage: false,
      showGameStats: false,
      showGameStat: false,
      gameStats: "",
      loading: false,
      loadingGames: false,
      allGames: [],
      statsData: "",
      selectedSeason: null,
      selectedClass: "",
      showStats: false,
      currentGame: "",
      sortBy: "",
      sortDesc: "",
      items: [],
      filter: null,
      filterOn: [],
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
    console.log("currentUrl:", this.currentUrl);
    await this.fetchSeasons();
    //console.log("selected season", this.selectedSeason.value);

    await this.fetchGames(this.seasons[0].value);

    this.showPastValues =
      this.selectedSeason == this.seasons[0] ? "false" : "true";
    this.filter = "";
    await this.getStats();
    this.selectedSeason = this.seasons[0];
    //console.log(this.seasonStats);
  },

  async mounted() {
    console.log("backend: %s", process.env.VUE_APP_BACKEND_URL);
    // If season is 2021-2022, the currentSeason has to be 2022
    // Season is changed to new season after 1st of August
  },
  computed: {
    ...mapState({
      games: (state) => state.games,
      seasons: (state) => state.seasons,
      seasonStats: (state) => state.stats,
    }),
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
      if (
        this.selectedSeason &&
        this.selectedSeason.value &&
        this.games[this.selectedSeason.value]
      ) {
        console.log("classes ->", this.selectedSeason.value);
        return this.games[this.selectedSeason.value]
          .map((x) => {
            return x.class;
          })
          .filter((_value, _index, _self) => {
            return _self.indexOf(_value) === _index;
          })
          .sort();
      } else return [];
    },
    numberOfGames() {
      return this.games[this.selectedSeason.value]
        ? this.games[this.selectedSeason.value].length
        : "";
    },
  },
  watch: {
    selectedSeason: function () {
      console.log("update", this.selectedSeason.value, this.loadingGames);
      if (
        this.selectedSeason &&
        this.selectedSeason.value &&
        this.games[this.selectedSeason.value]
      ) {
        console.log(
          `showPastValue type:${typeof this.showPastValues} value: ${
            this.showPastValues
          }`
        );
        if (!this.games[this.selectedSeason.value]) return [];
        if (this.showPastValues == "true") {
          console.log("all games");
          this.games_table = this.games[this.selectedSeason.value];
        } else {
          console.log(
            "filtering games",
            DateTime.now().minus({ days: 3 }).toFormat("yyyy-MM-dd")
          );
          this.games_table = this.games[this.selectedSeason.value].filter(
            (x) =>
              x.GameDate >=
              DateTime.now().minus({ days: 3 }).toFormat("yyyy-MM-dd")
          );
        }
      } else {
        this.games_table = [];
      }
    },
    games: {
      handler(newValue) {
        if (newValue.isLoaded) this.loadingGames = false;
      },
      deep: true,
    },
  },
  methods: {
    ...mapActions({
      fetchGames: "fetchGames",
      fetchSeasons: "fetchSeasons", // map `this.add()` to `this.$store.commit('increment')`
      setStats: "setStats",
    }),
    parseDate(_str) {
      // console.log(_str);
      return DateTime.fromISO(_str).toFormat("dd.MM. HH:mm");
    },

    filterTable(_row, _filter) {
      let filters = _filter.split(",");
      let rowstr = JSON.stringify(_row);
      //  console.log(rowstr, filters);
      if (!Array.isArray(filters)) return rowstr.includes(filters[0]);
      else return filters.some((f) => rowstr.includes(f));
    },
    setFilter(_value) {
      this.filter = _value.join(",");
    },
    getSelectedClass(_class) {
      console.log("get class", _class);
      _class = _class !== "Näytä kaikki" ? _class : "";
      console.log("setStats", _class);
      //this.setStats(_class ? _class : "");
    },
    async getSelectedSeason(_season) {
      this.loadingGames = true;
      await this.fetchGames(_season.value);
      console.log(
        "getSelectedSeason() games.length:",
        this.games[this.selectedSeason.value].length,
        "season",
        this.selectedSeason,
        "past",
        this.showPastValues
      );
      this.selectedSeason = _season;
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
    /*setStats(_class, toggle) {
      console.log("setStat class: %s season: %s", _class, this.selectedSeason);
      this.showStats = toggle ? toggle : true;
      _class = _class != "Näytä kaikki" && _class !== undefined ? _class : "";
      console.log("class %s", _class);
      this.selectedClass = _class != "" ? _class : this.classes[1];

      this.statsData = this.seasonStats.filter(
        (x) => x.season == this.selectedSeason && x.class == _class
      );
    },*/
    async getStats() {
      let res = await axios.get(`${this.baseurl}/seasonstats`);
      this.setStats(res.data);
    },

    /*async fetchGames(year) {
      if (!this.games[year]) {
        console.log("fetching year % from api", year);
        let response = await axios.get(`${this.baseurl}/games/?year=${year}`);
        this.setGames({ games: response.data, season: year });
      }

      return this.games[year];
    },*/
    onFiltered(filteredItems) {
      // Trigger pagination to update the number of buttons/pages due to filtering
      console.log("filtered length", filteredItems.length);
      this.totalRows = filteredItems.length;
      this.currentPage = 1;
    },
    getResultLink(data) {
      console.log(data.item.UniqueID);
      if (data.item.GameDate <= DateTime.now().toISODate())
        return `<a href="#" onclick="this.getGameStats(data.item.UniqueID,
                selectedSeason, data.item.HomeTeamName + ' - ' + data.item.AwayTeamName);return false;
            ">${data.item.Result}</a>`;
      else {
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
