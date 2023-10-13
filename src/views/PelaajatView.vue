<template>
  <div>
    <b-container id="pelaajat">
      <b-table
        hover
        small
        :fields="tablecolumns"
        :items="Object.values(players)"
      >
        <template #cell(PlayerLastName)="data">
          <div>
            {{ `${data.item.PlayerLastName} ${data.item.PlayerFirstName}` }}
          </div>
        </template>
        <template #cell(PlayerHistory)="data">
          <span
            v-for="[_key, _data] in Object.entries(data.item.PlayerHistory)"
            v-bind:key="_key"
          >
            {{ `[${_key}] ${_data.length}` }}
          </span>
        </template>
      </b-table>
    </b-container>
  </div>
</template>

<script>
import { mapActions, mapGetters } from "vuex";

export default {
  name: "PelaajatView",
  components: {},
  data() {
    return {
      //players: "Pelaajat",
      tablecolumns: [
        {
          key: "PlayerUniqueID",
          label: "ID",
          tdClass: "text-left",
          thClass: "text-left",
          sortable: false,
        },
        {
          key: "PlayerLastName",
          label: "Nimi",
          tdClass: "text-left",
          thClass: "text-left",
          sortable: true,
        },
        {
          key: "PlayerHistory",
          label: "Kaudet(pelit)",
          tdClass: "text-left",
          thClass: "text-left",
          sortable: false,
        },
        {
          key: "totalGames",
          label: "Pelit yhteensä",
          tdClass: "text-left",
          thClass: "text-left",
          sortable: true,
        },
      ],
    };
  },
  computed: {
    players() {
      return this.getPlayers();
    },
  },
  async mounted() {
    if (this.players) await this.fetchPlayers();
  },
  methods: {
    ...mapGetters({
      getPlayers: "getPlayers",
    }),
    ...mapActions({
      fetchPlayers: "fetchPlayers",
    }),
  },
};
</script>