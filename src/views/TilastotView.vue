<template>
  <div>
    <b-container>
      <p>Tilastot ovat vielä kehityksen alla, ja puutteellisia tietoja löytyy varmasti...</p>
      <b-row><b-button style="margin: 0.1em" pill variant="outline-primary" v-bind:key="button" @click="setSeason(button)" v-for="button in seasonbuttons" variant-outlier="primary">{{ button }}</b-button></b-row>
      <b-row><b-button style="margin: 0.1em" pill variant="outline-primary" v-bind:key="_class" @click="setClass(_class)" v-for="_class in classbuttons" variant-outlier="primary">{{ _class }}</b-button></b-row>

      <div v-if="currentSeason">
        <b-card v-for="key in seasonStats" v-bind:key="`${key.season}-${key.class}`">
        <h4>{{ `${key.season} ${key.class}` }}</h4>
          <b-table small stack="sm" hover :items="key.stats" :fields="fields"></b-table>
        </b-card>
      </div>
    </b-container>
    </div>
</template>

<script>

import axios from 'axios';

export default {
  components: {},
  data() {
    return {
      seasonStats: {},
      button: "",
      allStats: [],
      currentSeason: '',
      fields: [
        { key: "name", label: "Pelaaja", sortable: false, tdClass: "text-left", thClass: "text-left" },
        { key: "goals", label: "M", sortable: false, tdClass: "text-left", thClass: "text-left" },
        { key: "assists", label: "S", sortable: false, tdClass: "text-left", thClass: "text-left" },
        { key: "penalties", label: "J", sortable: false, tdClass: "text-left", thClass: "text-left" },
        { key: "total", label: "Yht", sortable: false, tdClass: "text-left", thClass: "text-left" },
      ],
      baseurl: process.env.VUE_APP_BACKEND_URL,
      value: {}
    }
  },
  async mounted() {
    this.allStats = await this.getStats();
  },
  computed: {
    seasonbuttons() {
      
      if ( this.allStats.length > 0 )
        return [...new Set(this.allStats.map(item => item.season))];
      else
        return [];
    },
    classbuttons() {
      if ( this.allStats.length > 0 && this.currentSeason != "")
        return [...new Set(this.allStats.filter(x => x.season == this.currentSeason).map(item => item.class))];
      else
        return [];
    }
  },
  methods: {
    setSeason( _season ) {
      this.currentSeason = _season;
      this.seasonStats = this.allStats.filter( x => x.season == _season);
    },
    setClass(_class) {
      this.seasonStats = this.allStats.filter( x=> x.season == this.currentSeason && x.class == _class);
    },
    async getStats() {
      let res = await axios.get(`${this.baseurl}/seasonstats`);
      return res.data;
    },
  }
}
</script>

