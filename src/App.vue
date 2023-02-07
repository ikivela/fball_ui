<template>
  <div id="app">
    <b-navbar sticky toggleable="lg" type="light" variant="light">
      <b-navbar-brand
        ><img
          height="36"
          src="https://static.jopox.fi/nibacos/imagebank/40875_huge.png"
          alt="logo"
        />
        Nibacos-ottelut
      </b-navbar-brand>

      <b-navbar-toggle target="nav-collapse"></b-navbar-toggle>
      <b-collapse id="nav-collapse" is-nav>
        <!--<b-navbar-nav>
          <b-nav-item
            @click="(showGamesPage = true), (showStatsPage = false)"
            href="#"
            >Ottelut</b-nav-item
          >-->
        <!--<b-nav-item
            @click="(showGamesPage = false), (showStatsPage = true), setStats()"
            href="#"
            Tilastot
          </b-nav-item>
        </b-navbar-nav>-->
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
            <b-badge style="margin-left: 1em; margin-right: 1em">
              Otteluita: {{ this.games.length }}
            </b-badge>
            <multiselect
              v-model="selectedClass"
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
      </b-collapse>
    </b-navbar>

    <b-container id="games">
      <p>Valittu kausi: {{ this.selectedSeason.text }}</p>
      <b-table
        small
        hover
        stacked="xs"
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
            <br />
            <span style="font-size: 0.8em"
              ><a :href="`http://maps.google.com/?q=${data.item.RinkName}`">{{
                data.item.RinkName
              }}</a></span
            >
          </div>
        </template>
        <template #cell(Game)="data">
          <div v-if="!isSmallScreen">
            {{
              `${data.item.HomeTeamName}&nbsp;-&nbsp;${data.item.AwayTeamName}`
            }}
          </div>
          <div v-else>
            {{ data.item.HomeTeamName }} <br />
            {{ data.item.AwayTeamName }}
          </div>
        </template>
        <template v-if="!isSmallScreen" #cell(RinkName)="data">
          <a :href="`http://maps.google.com/?q=${data.item.RinkName}`">{{
            data.item.RinkName
          }}</a>
        </template>
        <template v-if="!isSmallScreen" #cell(group)="data">
          <a :href="`${standings_url}${data.item.groupID}`">{{
            data.item.group
          }}</a>
        </template>
        <template v-if="isSmallScreen" #cell(class)="data">
          {{ data.item.class }} <br />
          <a :href="`${standings_url}${data.item.groupID}`"
            ><span style="font-size: 0.8em">{{ data.item.group }}</span></a
          >
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
  </div>
</template>

<script>
import axios from "axios";
import { DateTime } from "luxon";
import Multiselect from "vue-multiselect";
import { BIconArrowUpRightSquare } from "bootstrap-vue";

export default {
  name: "App",
  components: { Multiselect, BIconArrowUpRightSquare },
  data() {
    return {
      currentUrl: "",
      standings_url:
        "http://tilastopalvelu.fi/fb/index.php?option=com_content&view=article&id=11&stgid=",
      result_url:
        "http://tilastopalvelu.fi/fb/index.php?option=com_content&view=article&id=4&gameid=",
      baseurl: process.env.VUE_APP_BACKEND_URL
        ? process.env.VUE_APP_BACKEND_URL
        : "http://localhost:3000",
      show: false,
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
      sortBy: "",
      sortDesc: "",
      items: [],
      filter: null,
      filterOn: [],
      totalRows: 1,
      isSmallScreen: false,
      scFields: ["Date", "Game", "class", "Result"],
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

    this.seasons = await this.getSeasons();
    this.seasonStats = await this.getStats();

    //console.log(this.seasonStats);
    await this.getSelectedSeason();
  },
  computed: {
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
      console.log(
        `showPastValue type:${typeof this.showPastValues} value: ${
          this.showPastValues
        }`
      );

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
      }
    },
  },
  methods: {
    formatScore(data) {
      console.log("SCORE", data);
      let values = data.split("-");
      return `${values[0]}<br />${values[1]}`;
    },
    parseDate(_str) {
      // console.log(_str);
      return DateTime.fromISO(_str).toFormat("dd.MM. HH:mm");
    },

    updateScreenWidth() {
      this.isSmallScreen = window.matchMedia("(max-width: 600px)").matches;
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
    async getSeasons() {
      let res = await axios.get(`${this.baseurl}/seasons`);
      let seasons = res.data.data;
      seasons = seasons.sort((a, b) => (a > b ? -1 : 1));
      seasons = seasons.map((x) => {
        return {
          text: `${x - 1}-${x}`,
          value: x,
        };
      });
      this.selectedSeason = seasons[0];
      console.log(seasons, this.selectedSeason);
      return seasons;
    },
    async getGames(year) {
      console.log(year);
      let response = await axios.get(`${this.baseurl}/games/?year=${year}`);
      return response.data;
    },
    onFiltered(filteredItems) {
      // Trigger pagination to update the number of buttons/pages due to filtering
      console.log("filtered length", filteredItems.length);
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

<style src="vue-multiselect/dist/vue-multiselect.min.css"></style>
