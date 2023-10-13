<template>
  <div id="app">
    <b-container>
      <b-navbar type="light" variant="faded">
        <b-navbar-brand
          ><router-link to="/"
            ><img
              height="36"
              src="https://static.jopox.fi/nibacos/imagebank/40875_huge.png"
              alt="logo"
            />
          </router-link>
          Nibacos-ottelut
        </b-navbar-brand>
        <b-navbar-nav>
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
import { DateTime } from "luxon";
import { mapActions, mapState } from "vuex";
//import Multiselect from "vue-multiselect";
//import { BIconLink } from "bootstrap-vue";

export default {
  name: "App",
  data() {
    return {};
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

    if (this.seasons && this.seasons.length === 0) await this.fetchSeasons();
    if (this.seasonStats && this.seasonStats.length === 0)
      await this.fetchStats();

    //console.log(this.seasonStats);
    console.log(
      "seasons: %s, stats: %s, games: %s",
      this.seasons.length,
      this.seasonStats.length,
      this.allGames.length
    );
    if (this.allGames[this.seasons[0].value])
      await this.fetchGames(this.seasons[0].value);
  },
  computed: {
    ...mapState({
      allGames: (state) => state.games,
      seasons: (state) => state.seasons,
      seasonStats: (state) => state.stats,
      players: (state) => state.players,
    }),
    currentStats() {
      let team_name = this.currentTeam;
      let wins = 0;
      let losses = 0;
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
            if (teamScore > opponentScore) {
              wins++;
            } else if (teamScore < opponentScore) {
              losses++;
            }
            teamScore = teamScore.split(" ")[0];
            opponentScore = opponentScore.split(" ")[0];
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
      console.log(wins, losses);
      return {
        wins: wins,
        losses: losses,
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
      console.log(
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
      }
    },
  },
  methods: {
    ...mapActions({
      fetchGames: "fetchGames",
      fetchSeasons: "fetchSeasons",
      fetchStats: "fetchStats",
    }),
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

    &.router-link-exact-active {
      color: #42b983;
    }
  }
}
</style>
