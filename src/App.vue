<template>
  <div id="app">
    <b-container fluid>
      <b-navbar type="light" variant="light">
        <b-nav-form>
          <b-input-group prepend="">
            <b-form-input
              id="filter-input"
              v-model="filter"
              type="search"
              filter-debounce="1000"
            ></b-form-input>
          </b-input-group>
          <b-span style="margin-left: 1em">
            Nibacos otteluita: {{ this.games.length }} Päivitetty:
            {{ FormattedDate }}</b-span
          >
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
      ></b-table>
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
      show: true,
      updated: "",
      items: [],
      games: [],
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
  computed: {
    FormattedDate() {
      if (this.updated && this.updated.length > 0)
        return DateTime.fromISO(this.updated).toFormat("HH:mm dd.LL.yyyy");
      else return "";
    },
  },
  async mounted() {
    /*let search = window.location.search.substring(1);
    if (search.length > 0) {
      search = search.split("=")[1].replace("%20", " ");
      this.filter = search == "" ? null : search;
      console.log("filter = ", this.filter);
    }
    */
    let _games = await this.getGames();
    this.updated = _games.updated;
    this.games = _games.games.sort((a, b) => {
      let a_date = DateTime.fromISO(a.GameDate + "T" + a.GameTime).toMillis();
      let b_date = DateTime.fromISO(b.GameDate + "T" + b.GameTime).toMillis();

      return a_date > b_date ? 1 : -1;
    });
  },
  methods: {
    async getGames() {
      let response = await axios.get("http://localhost:8000/games");
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
</style>
