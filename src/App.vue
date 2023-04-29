<template>
  <div id="app">
    <b-container>
      <b-navbar type="light" variant="faded">
        <b-navbar-brand
          ><img
            height="36"
            src="https://static.jopox.fi/nibacos/imagebank/40875_huge.png"
            alt="logo"
          />
          Nibacos-ottelut
        </b-navbar-brand>
        <b-navbar-nav>
          <b-nav-item
            ><router-link to="/">Ajankohtaiset</router-link></b-nav-item
          >
          <b-nav-item
            ><router-link to="/ottelut">Ottelut</router-link></b-nav-item
          >
          <b-nav-item
            ><router-link to="/tilastot">Tilastot</router-link></b-nav-item
          >
        </b-navbar-nav>
      </b-navbar>
    </b-container>
    <router-view></router-view>
  </div>
</template>

<script>
import axios from "axios";
import { DateTime } from "luxon";
//import Multiselect from "vue-multiselect";
//import { BIconLink } from "bootstrap-vue";

export default {
  name: "App",
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
  created() {
    this.currentUrl = window.location.href;
    document.title = "Nibacos ottelut";
    console.log("currentUrl:", this.currentUrl);
  },

  async mounted() {
    console.log("backend: %s", process.env.VUE_APP_BACKEND_URL);
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
    getResultLink(data) {
      console.log(data.item.UniqueID);
      if (data.item.GameDate <= DateTime.now().toISODate())
        return `<a href="#" onclick="this.getGameStats(data.item.UniqueID,
                selectedSeason, data.item.HomeTeamName + ' - ' + data.item.AwayTeamName);return false;
            ">${data.item.Result}</a>`;
      else window.location.href = this.result_url + data.item.UniqueID;
    },
  },
};
</script>

<style lang="scss">
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}

nav {
  padding: 30px;

  a {
    font-weight: bold;
    color: #2c3e50;
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}

nav {
  padding: 30px;

  a {
    font-weight: bold;
    color: #2c3e50;

    &.router-link-exact-active {
      color: #42b983;
    }
  }
}
</style>
