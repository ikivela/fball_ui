<template>
  <div class="class-matrix-view container py-4">
    <h2 class="mb-3">Vertaile sarjoja</h2>
    <div v-if="loading" class="text-center my-5">
      <span class="spinner-border" role="status"></span>
      <span class="ms-2">Ladataan otteluita...</span>
    </div>
    <div v-else>
      <div class="mb-3">
        <label class="form-label">Valitse sarjat:</label>
        <div class="d-flex flex-wrap gap-2">
          <div v-for="className in allClasses" :key="className" class="form-check form-check-inline">
            <input class="form-check-input" type="checkbox" :id="className" :value="className" v-model="selectedClasses">
            <label class="form-check-label" :for="className">{{ className }}</label>
          </div>
        </div>
      </div>
      <div class="table-responsive">
        <table class="table table-bordered align-middle wide-matrix-table">
          <thead>
            <tr>
              <th>Päivä</th>
              <th v-for="className in selectedClasses" :key="className">{{ className }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="date in uniqueDates" :key="date">
              <td>{{ formatDate(date) }}</td>
              <td v-for="className in selectedClasses" :key="className">
                <div v-if="gameByDateAndClass(date, className).length">
                  <div v-for="game in gameByDateAndClass(date, className)" :key="game.UniqueID">
                    <span>{{ game.HomeTeamName }} - {{ game.AwayTeamName }}</span><br>
                    <span class="text-muted">{{ game.RinkName }}</span>
                  </div>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <router-link to="/" class="btn btn-outline-primary mt-3">Takaisin otteluihin</router-link>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useStore } from 'vuex';
import { DateTime } from 'luxon';

const store = useStore();
const loading = ref(true);

const selectedSeason = computed(() => store.state.seasons && store.state.seasons.length > 0 ? store.state.seasons[0] : null);
const games = computed(() => selectedSeason.value && store.state.games[selectedSeason.value.value] ? store.state.games[selectedSeason.value.value] : []);

const allClasses = computed(() => {
  const set = new Set();
  games.value.forEach(g => g.class && set.add(g.class));
  return Array.from(set).sort();
});

const selectedClasses = ref([]);

const uniqueDates = computed(() => {
  const set = new Set();
  games.value.forEach(g => g.GameDate && set.add(g.GameDate));
  return Array.from(set).sort();
});

function gameByDateAndClass(date, className) {
  return games.value.filter(g => g.GameDate === date && g.class === className);
}

function formatDate(date) {
  return DateTime.fromISO(date).toFormat('dd.MM.yyyy');
}

async function ensureDataLoaded() {
  if (!store.state.seasons || store.state.seasons.length === 0) {
    await store.dispatch('fetchSeasons');
  }
  if (store.state.seasons && store.state.seasons.length > 0) {
    const season = store.state.seasons[0];
    if (!store.state.games[season.value]) {
      await store.dispatch('fetchGames', season.value);
    }
  }
}

onMounted(async () => {
  await ensureDataLoaded();
  // By default, select only the main classes if they exist
  const preferred = ['Inssi-Divari miehet', 'Naisten Suomisarja', 'T18 SM-SARJA', 'P19 SM-SARJA', 'P16 VALTAKUNNALLINEN', 'T16 VALTAKUNNALLINEN'];
  selectedClasses.value = allClasses.value.filter(c => preferred.includes(c));
  loading.value = false;
});

// If allClasses changes (e.g. after data loads), select preferred if none selected
watch(allClasses, (newVal) => {
  if (selectedClasses.value.length === 0 && newVal.length > 0) {
    const preferred = ['Miehet', 'Naiset', 'T18', 'P19', 'P16', 'T16'];
    selectedClasses.value = newVal.filter(c => preferred.includes(c));
  }
});
</script>

<style scoped>
.wide-matrix-table {
  min-width: 900px;
  background: #fff;
}
.wide-matrix-table th, .wide-matrix-table td {
  text-align: center;
  vertical-align: middle;
  min-width: 160px;
}
</style> 