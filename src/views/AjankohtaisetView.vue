<template>
  <!-- <div v-else>Tervetuloa Nibacos-ottelut sivulle </div>-->
  <div>
    <p>Seuraavat Nibacos-ottelut</p>
    <b-container v-if="this.selectedSeason && this.seasons.length > 0">
      <b-table
        small
        :fields="fields"
        hover
        id="1"
        stacked="xs"
        :filter="filter"
        :items="games_table"
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
            {{ `${parseDate(data.item.GameDate + "T" + data.item.GameTime)}` }} <br />
            <a style="font-size: small;" :href="`http://maps.google.com/?q=${data.item.RinkName}`">
             {{  data.item.RinkName }}
            </a>
          </div>
        </template>
        <template #cell(Game)="data">
          <div v-if="selectedSeason.value == seasons[0].value">
            <a :href="`${result_url}${data.item.UniqueID}`">
             <div v-if="!isSmallScreen">
                {{
                  `${data.item.HomeTeamName}&nbsp;-&nbsp;${data.item.AwayTeamName}`
                }}
              </div>
              <div v-else>  
                {{ data.item.HomeTeamName }} -<br />
                {{ data.item.AwayTeamName }}
              </div>
            </a>
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
                    data.item.HomeTeamName + ' - ' + data.item.AwayTeamName,
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
  </div>
</template>

<script>
import axios from "axios";
import { DateTime } from "luxon";
import { BIconArrowUpRightSquare } from "bootstrap-vue";
import { mapActions, mapState } from "vuex";

export default {
  components: { BIconArrowUpRightSquare },
  data() {
    return {
      currentUrl: "",
      result_url: "https://tulospalvelu.salibandy.fi/match/",
      standings_url2:
        "http://tilastopalvelu.fi/fb/index.php/component/content/index.php?option=com_content&view=article&id=14&stgid=",
      standings_url: "https://tulospalvelu.salibandy.fi/category/",
      baseurl: process.env.VUE_APP_BACKEND_URL || "http://localhost:3000",
      show: false,
      pageReady: false,
      isSmallScreen: false,
      updated: "",
      options: [],
      gameStats: "",
      games_table: [],
      loading: false,
      statsData: "",
      selectedSeason: null,
      selectedClass: "",
      showStats: false,
      showGameStat: false,
      currentGame: "",
      sortBy: "",
      sortDesc: "",
      scFields: ["Date", "Game", "class", "Result"],
      filter: "",
      filterOn: [],

      items: [],
      totalRows: 1,
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
  async created() {
    this.currentUrl = window.location.href;
    document.title = "Nibacos ottelut";
    console.log("created() currentUrl:", this.currentUrl);
  },

  async mounted() {
    this.pageReady = true;
    
    this.screenWidth = window.matchMedia("(max-width: 600px)").matches;
    window.addEventListener("resize", this.updateScreenWidth);

    console.log("ajankohtaiset games length", this.games.length);
    console.log("ajankohtaiset season length:", this.seasons.length);
    if (this.seasons.length == 0) await this.fetchSeasons(); //this.seasons[0];
    if (!this.games[this.seasons[0].value]) {
      await this.fetchGames(this.seasons[0].value);
    }
    this.selectedSeason = this.seasons[0];
    console.log("ajankohtaiset mounted() seasons:", this.seasons);
    this.games_table = this.games[this.seasons[0].value];
    this.games_table = this.games_table.filter(
      (x) =>
        x.GameDate >=
          DateTime.now().minus({ days: 3 }).toFormat("yyyy-MM-dd") &&
        x.GameDate <= DateTime.now().plus({ days: 14 }).toFormat("yyyy-MM-dd"),
    );
    console.log("ajankohtaiset mounted() games_table:", this.games_table);
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
      //console.log("isSmallScreen", this.isSmallScreen);
      if (this.isSmallScreen) {
        return this.tablecolumns.filter((x) => this.scFields.includes(x.key));
      } else return this.tablecolumns;
    },
    /*games_table: {
      get: () => {
        console.log("games table", this.selectedSeason, this.games.length);
        if (this.selectedSeason && this.games[this.selectedSeason.value]) {
          return this.games[this.selectedSeason.value].filter(
            (x) =>
              x.GameDate >=
                DateTime.now().minus({ days: 3 }).toFormat("yyyy-MM-dd") &&
              x.GameDate <=
                DateTime.now().plus({ days: 14 }).toFormat("yyyy-MM-dd")
          );
        } else {
          console.log("games table", this.selectedSeason, this.games.length);
          return [];
        }
      },
      set: (value) => {
        return value;
      },  
    },*/
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
          this.gameStats = this.parseGameStat(_season.value, res.data);
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
    parseGameStat(season, data) {
      if (season > 2023 && data.match) {
        let events = [];
        //console.log("parseGameStat", data);
        let clubs = {};
        clubs[data.match.team_A_id] = data.match.team_A_name;
        clubs[data.match.team_B_id] = data.match.team_B_name;

        for (let goal of data.match.goals) {
          let event = {
            event: "goal",
            time: goal.time,
            result: goal.score_A + "-" + goal.score_B,
            yv_av: goal.description,
            team: clubs[goal.team_id],
            scorer: goal.player_name,
            assist: "",
          };
          let assist = data.match.events.filter(
            (x) => x.code == "syotto" && x.time == goal.time,
          );

          if (assist.length > 0) {
            if (Array.isArray(assist)) assist = assist[assist.length - 1];
            event.assist = assist.player_name;
          }
          events.push(event);
          //console.log(goal.time,
        }

        console.log(events);
        return events;
      } else {
        return data;
      }
    },
    /*onFiltered(filteredItems) {
      // Trigger pagination to update the number of buttons/pages due to filtering
      console.log("filtered length", filteredItems.length);
      this.totalRows = filteredItems.length;
      this.currentPage = 1;
    },*/
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
    updateScreenWidth() {
      this.isSmallScreen = window.matchMedia("(max-width: 600px)").matches;
    },
    shorten_classname(_classname) {
      _classname = _classname.replace("SM-SARJA", "SM");
      _classname = _classname.replace("VALTAKUNNALLINEN", "VK");
      _classname = _classname.replace("DIVISIOONA", "DIV");
      _classname = _classname.replace("SÄBÄKIPINÄ", "");

      //console.log("cl", _classname);
      return _classname;
    },
    getResultLink(data) {
      const gameDate = DateTime.fromFormat(
        data.item.GameDate,
        "dd.MM. HH:mm",
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
