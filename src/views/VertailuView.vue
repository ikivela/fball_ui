<template>
  <div class="class-matrix-view container py-4">
    <h2 class="mb-3">Vertaile sarjoja</h2>
    <h5>Tällä sivulle voit katsoa pelipäivien päällekkäisyyksiä eri sarjojen välillä</h5>
    <div v-if="loading" class="text-center my-5">
      <span class="spinner-border" role="status"></span>
      <span class="ms-2">Ladataan otteluita...</span>
    </div>
    <div v-else>
      <div class="mb-3">
        <label class="form-label">Valitse sarjat:</label>
        <div v-if="selectedClasses && selectedClasses.length > 0" class="d-flex flex-wrap gap-2">
          <div v-for="className in allClasses" :key="className" class="filter-options-grid">
            <button class="filter-option-btn" :id="className" :value="className" :class="{ active: selectedClasses.includes(className) }" @click="toggleClassSelection(className)">{{ className }}</button>
          </div>
        </div>
      </div>

      <!-- Mobile: card list per date -->
      <div v-if="isSmallScreen" class="mobile-matrix-list">
        <article
          v-for="date in uniqueDates"
          :key="date"
          class="mobile-matrix-card"
        >
          <div class="mobile-matrix-date">{{ formatDate(date) }}</div>
          <div class="mobile-matrix-games">
            <template v-for="className in selectedClasses" :key="className">
              <div
                v-if="gameByDateAndClass(date, className).length"
                class="mobile-matrix-class"
              >
                <span class="mobile-matrix-class-name">{{ className }}</span>
                <div
                  v-for="game in gameByDateAndClass(date, className)"
                  :key="game.UniqueID"
                  class="mobile-matrix-game"
                >
                  <span>{{ game.HomeTeamName }} - {{ game.AwayTeamName }}</span>
                  <span class="mobile-matrix-rink">{{ game.RinkName }}</span>
                </div>
              </div>
            </template>
          </div>
          <div
            v-if="selectedClasses.every(c => gameByDateAndClass(date, c).length === 0)"
            class="mobile-matrix-empty"
          >
            Ei otteluita
          </div>
        </article>
      </div>

      <!-- Desktop: table -->
      <div v-else class="table-responsive">
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
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue';
import { useStore } from 'vuex';
import { DateTime } from 'luxon';

const store = useStore();
const loading = ref(true);
const isSmallScreen = ref(false);

function updateScreenWidth() {
  isSmallScreen.value = window.matchMedia("(max-width: 480px)").matches;
}

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
function toggleClassSelection(className) {
  const index = selectedClasses.value.indexOf(className);
  if (index === -1) {
    selectedClasses.value.push(className);
  } else {
    selectedClasses.value.splice(index, 1);
  }
  console.log('Selected classes:', selectedClasses.value);
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
  updateScreenWidth();
  window.addEventListener("resize", updateScreenWidth);
  await ensureDataLoaded();
  // By default, select only the main classes if they exist
  const preferred = ['Inssi-Divari miehet', 'Naisten Suomisarja', 'T18 SM-SARJA', 'P19 SM-SARJA', 'P16 VALTAKUNNALLINEN', 'T16 VALTAKUNNALLINEN'];
  selectedClasses.value = allClasses.value.filter(c => preferred.includes(c));
  console.log('Initially selected classes:', selectedClasses);
  loading.value = false;
});

onBeforeUnmount(() => {
  window.removeEventListener("resize", updateScreenWidth);
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
 .filter-options-grid {
          display: flex;
          flex-wrap: wrap;
          gap: 0.375rem;

          .filter-option-btn {
            padding: 0.375rem 0.75rem;
            border: 1px solid var(--border-color);
            background: var(--bg-white);
            color: var(--text-dark);
            border-radius: var(--border-radius);
            font-size: 0.75rem;
            font-weight: 500;
            transition: all 0.2s ease;
            cursor: pointer;

            &:hover {
              background-color: var(--bg-light);
              border-color: var(--primary-color);
            }

            &.active {
              background-color: var(--primary-color);
              border-color: var(--primary-color);
              color: white;
            }
          }
        }

/* Mobile matrix cards */
.mobile-matrix-list {
  display: flex;
  flex-direction: column;
  gap: 0;
}

.mobile-matrix-card {
  padding: 0.7rem 0.15rem;
  border-bottom: 1px solid var(--border-color);
}

.mobile-matrix-card:last-child {
  border-bottom: none;
}

.mobile-matrix-date {
  font-weight: 700;
  font-size: 0.9rem;
  color: var(--text-dark);
  margin-bottom: 0.35rem;
}

.mobile-matrix-games {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  padding-left: 0.5rem;
}

.mobile-matrix-class {
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
}

.mobile-matrix-class-name {
  font-weight: 600;
  font-size: 0.8rem;
  color: var(--primary-color);
}

.mobile-matrix-game {
  display: flex;
  flex-direction: column;
  font-size: 0.85rem;
  color: var(--text-dark);
  padding-left: 0.5rem;
}

.mobile-matrix-rink {
  font-size: 0.75rem;
  color: var(--text-light);
}

.mobile-matrix-empty {
  font-size: 0.82rem;
  color: var(--text-light);
  font-style: italic;
  padding-left: 0.5rem;
}

@media (max-width: 480px) {
  .class-matrix-view.container {
    padding-left: 0.5rem;
    padding-right: 0.5rem;
  }
}
</style> 