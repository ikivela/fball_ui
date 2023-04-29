<template>
  <div>
    <b-container>
      <b-row><b-button style="margin: 0.1em" pill variant="outline-primary" v-bind:key="button" @click="setSeason(button)" v-for="button in seasonbuttons" variant-outlier="primary">{{ button }}</b-button></b-row>
      <b-row><b-button style="margin: 0.1em" pill variant="outline-primary" v-bind:key="_class" @click="setClass(_class)" v-for="_class in classbuttons" variant-outlier="primary">{{ _class }}</b-button></b-row>

      <div v-if="currentSeason">
        <b-card v-for="key in seasonStats" v-bind:key="`${key.season}-${key.class}`">
        <h4>{{ `${key.season} ${key.class}` }}</h4>
          <b-table small hover :items="key.stats" :fields="fields"></b-table>
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
      fields: ['name', 'goals', 'assists', 'penalties', 'total'],
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
      if ( this.seasonStats.length > 0 )
        return [...new Set(this.seasonStats.map(item => item.class))];
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

