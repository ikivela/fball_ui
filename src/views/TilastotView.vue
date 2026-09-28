<template>
  <div class="tilastot-view">
    <!-- Filters Section -->
    <div class="filters-section">
      <div class="container">
        <div class="row">
          <div class="col-12">
            <div class="filters-card">
              <div class="filters-header">
                <p>
                  Tässä tilastoja aiemmilta kausilta, kun torneopal ei ollut
                  vielä käytössä
                </p>

                <h3 class="filters-title">
                  <i class="fas fa-filter me-2"></i>
                  Suodattimet
                </h3>
              </div>

              <div class="filters-content">
                <!-- All-time Stats -->
                <div class="filter-section">
                  <h4 class="filter-section-title">Kaikkien aikojen pistepörssi</h4>
                  <div class="filter-options-grid">
                    <button
                      class="filter-option-btn alltime-btn"
                      :class="{ active: showAlltime && !alltimeGender }"
                      @click="loadAlltimeStats('')"
                    >
                      <i class="fas fa-star me-1"></i>
                      Kaikki
                    </button>
                    <button
                      class="filter-option-btn alltime-btn"
                      :class="{ active: showAlltime && alltimeGender === 'miesten' }"
                      @click="loadAlltimeStats('miesten')"
                    >
                      Miesten
                    </button>
                    <button
                      class="filter-option-btn alltime-btn"
                      :class="{ active: showAlltime && alltimeGender === 'naisten' }"
                      @click="loadAlltimeStats('naisten')"
                    >
                      Naisten
                    </button>
                  </div>
                </div>

                <!-- Season Filter -->
                <div class="filter-section">
                  <h4 class="filter-section-title">Valitse kausi</h4>
                  <div class="filter-options-grid">
                    <button
                      v-for="season in seasonbuttons"
                      :key="season"
                      class="filter-option-btn"
                      :class="{ active: currentSeason === season }"
                      @click="setSeason(season)"
                    >
                      {{ season }}
                    </button>
                  </div>
                </div>

                <!-- Class Filter -->
                <div v-if="currentSeason" class="filter-section">
                  <h4 class="filter-section-title">Valitse sarja</h4>
                  <div class="filter-options-grid">
                    <button
                      v-for="_class in classbuttons"
                      :key="_class"
                      class="filter-option-btn"
                      :class="{ active: currentClass === _class }"
                      @click="setClass(_class)"
                    >
                      {{ _class }}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Stats Section -->
    <div class="stats-section">
      <div class="container">
        <div class="row">
          <div class="col-12">
            <div v-if="!currentSeason && !showAlltime" class="no-selection">
              <div class="no-selection-content">
                <i class="fas fa-chart-line"></i>
                <h3>Valitse kausi</h3>
                <p>
                  Valitse kausi yllä olevista suodattimista nähdäksesi tilastot.
                </p>
              </div>
            </div>

            <div v-else-if="seasonStats.length === 0" class="no-stats">
              <div class="no-stats-content">
                <i class="fas fa-chart-bar"></i>
                <h3>Ei tilastoja</h3>
                <p>Valitulla kaudella ei löytynyt tilastoja.</p>
              </div>
            </div>

            <div v-else class="stats-content">
              <div
                v-for="key in seasonStats"
                :key="`${key.season}-${key.class}`"
                class="stats-card"
              >
                <div class="stats-header">
                  <h2 class="stats-title">
                    <i class="fas fa-trophy me-2"></i>
                    {{ key.season }} {{ key.class }}
                  </h2>
                  <div class="stats-summary">
                    <span class="summary-badge">
                      <i class="fas fa-users me-1"></i>
                      {{ key.stats.length }} pelaajaa
                    </span>
                  </div>
                </div>

                <div class="stats-table">
                  <!-- Mobile: card list -->
                  <div v-if="isSmallScreen" class="mobile-stats-list">
                    <article
                      v-for="(player, index) in key.stats"
                      :key="player.name"
                      class="mobile-stat-card"
                    >
                      <div class="mobile-stat-top">
                        <span
                          class="rank-badge"
                          :class="getRankClass(index + 1)"
                        >{{ index + 1 }}</span>
                        <span class="mobile-stat-name">{{ player.name }}</span>
                        <span class="mobile-stat-total">{{ player.total || 0 }}</span>
                      </div>
                      <div class="mobile-stat-details">
                        <span class="mobile-stat-item"><span class="mobile-stat-item-label">M</span>{{ player.goals || 0 }}</span>
                        <span class="mobile-stat-item"><span class="mobile-stat-item-label">S</span>{{ player.assists || 0 }}</span>
                        <span class="mobile-stat-item"><span class="mobile-stat-item-label">J</span>{{ player.penalties || 0 }}</span>
                      </div>
                    </article>
                  </div>

                  <!-- Desktop: table -->
                  <div v-else class="table-responsive">
                    <table class="table table-hover">
                      <thead>
                        <tr>
                          <th v-for="field in fields" :key="field.key">
                            <i class="fas fa-sort me-1"></i>
                            {{ field.label }}
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr
                          v-for="(player, index) in key.stats"
                          :key="player.name"
                          class="player-row"
                        >
                          <td class="player-rank">
                            <span
                              class="rank-badge"
                              :class="getRankClass(index + 1)"
                              >{{ index + 1 }}</span
                            >
                            <span class="player-name">{{ player.name }}</span>
                          </td>
                          <td class="player-goals">
                            <span class="stat-value goals">{{
                              player.goals || 0
                            }}</span>
                          </td>
                          <td class="player-assists">
                            <span class="stat-value assists">{{
                              player.assists || 0
                            }}</span>
                          </td>
                          <td class="player-penalties">
                            <span class="stat-value penalties">{{
                              player.penalties || 0
                            }}</span>
                          </td>
                          <td class="player-total">
                            <span class="stat-value total">{{
                              player.total || 0
                            }}</span>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from "axios";

export default {
  name: "TilastotView",
  components: {},
  data() {
    return {
      isSmallScreen: false,
      seasonStats: [],
      allStats: [],
      showAlltime: false,
      alltimeGender: "",
      currentSeason: "",
      currentClass: "",
      fields: [
        {
          key: "name",
          label: "Pelaaja",
          sortable: false,
        },
        {
          key: "goals",
          label: "M",
          sortable: false,
        },
        {
          key: "assists",
          label: "S",
          sortable: false,
        },
        {
          key: "penalties",
          label: "J",
          sortable: false,
        },
        {
          key: "total",
          label: "Yht",
          sortable: false,
        },
      ],
      baseurl: import.meta.env.VITE_APP_BACKEND_URL || "http://localhost:3000",
    };
  },

  async mounted() {
    this.updateScreenWidth();
    window.addEventListener("resize", this.updateScreenWidth);
    try {
      console.log("baseurl", this.baseurl);
      this.allStats = await this.getStats();
    } catch (error) {
      console.error("Error fetching stats:", error);
      this.allStats = [];
    }
  },

  beforeUnmount() {
    window.removeEventListener("resize", this.updateScreenWidth);
  },

  computed: {
    seasonbuttons() {
      if (this.allStats.length > 0) {
        return [...new Set(this.allStats.map((item) => item.season))]
          .sort()
          .reverse();
      }
      return [];
    },

    classbuttons() {
      if (this.allStats.length > 0 && this.currentSeason !== "") {
        return [
          ...new Set(
            this.allStats
              .filter((x) => x.season === this.currentSeason)
              .map((item) => item.class)
          ),
        ].sort();
      }
      return [];
    },

    totalPlayers() {
      return this.seasonStats.reduce(
        (total, stat) => total + (stat.stats ? stat.stats.length : 0),
        0
      );
    },

    totalGoals() {
      return this.seasonStats.reduce((total, stat) => {
        if (stat.stats) {
          return (
            total +
            stat.stats.reduce((sum, player) => sum + (player.goals || 0), 0)
          );
        }
        return total;
      }, 0);
    },
  },

  methods: {
    updateScreenWidth() {
      this.isSmallScreen = window.matchMedia("(max-width: 480px)").matches;
    },

    async loadAlltimeStats(gender) {
      this.showAlltime = true;
      this.alltimeGender = gender;
      this.currentSeason = "";
      this.currentClass = "";
      try {
        const params = gender ? { gender } : {};
        const response = await axios.get(`${this.baseurl}/alltime-stats`, { params });
        const title = gender ? `Kaikki kaudet (${gender})` : "Kaikki kaudet";
        this.seasonStats = [{ season: title, class: "", stats: response.data }];
      } catch (error) {
        console.error("Error fetching alltime stats:", error);
        this.seasonStats = [];
      }
    },

    setSeason(season) {
      this.showAlltime = false;
      this.currentSeason = season;
      this.currentClass = "";
      this.seasonStats = this.allStats.filter((x) => x.season === season);
    },

    setClass(_class) {
      this.currentClass = _class;
      this.seasonStats = this.allStats.filter(
        (x) => x.season === this.currentSeason && x.class === _class
      );
    },

    async getStats() {
      const response = await axios.get(`${this.baseurl}/seasonstats`);
      return response.data;
    },

    getRankClass(rank) {
      if (rank === 1) return "rank-gold";
      if (rank === 2) return "rank-silver";
      if (rank === 3) return "rank-bronze";
      return "rank-normal";
    },
  },
};
</script>

<style lang="scss" scoped>
.tilastot-view {
  min-height: 100vh;
}

// Filters Section
.filters-section {
  margin-bottom: 1.5rem;

  .filters-card {
    background: var(--bg-white);
    border-radius: var(--border-radius-lg);
    box-shadow: var(--shadow-sm);
    border: 1px solid var(--border-color);

    .filters-header {
      padding: 1rem 1rem 0;

      .filters-title {
        font-size: 1.125rem;
        font-weight: 600;
        margin: 0;
        color: var(--text-dark);

        i {
          color: var(--primary-color);
        }
      }
    }

    .filters-content {
      padding: 1rem;

      .filter-section {
        margin-bottom: 1rem;

        &:last-child {
          margin-bottom: 0;
        }

        .filter-section-title {
          font-size: 0.875rem;
          font-weight: 600;
          color: var(--text-dark);
          margin-bottom: 0.75rem;
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

            &.alltime-btn {
              font-weight: 600;
            }
          }
        }
      }
    }
  }
}

// Stats Section
.stats-section {
  .no-selection,
  .no-stats {
    padding: 3rem 1rem;
    text-align: center;

    .no-selection-content,
    .no-stats-content {
      i {
        font-size: 3rem;
        color: var(--text-light);
        margin-bottom: 1rem;
      }

      h3 {
        color: var(--text-dark);
        margin-bottom: 0.5rem;
      }

      p {
        color: var(--text-light);
        margin: 0;
      }
    }
  }

  .stats-content {
    .stats-card {
      background: var(--bg-white);
      border-radius: var(--border-radius-lg);
      box-shadow: var(--shadow-lg);
      border: 1px solid var(--border-color);
      margin-bottom: 2rem;

      &:last-child {
        margin-bottom: 0;
      }

      .stats-header {
        padding: 1.5rem;
        border-bottom: 1px solid var(--border-color);
        display: flex;
        justify-content: space-between;
        align-items: center;
        flex-wrap: wrap;
        gap: 1rem;

        .stats-title {
          font-size: 1.5rem;
          font-weight: 600;
          margin: 0;
          color: var(--text-dark);

          i {
            color: var(--primary-color);
          }
        }

        .stats-summary {
          .summary-badge {
            background: var(--bg-light);
            color: var(--text-dark);
            padding: 0.5rem 1rem;
            border-radius: var(--border-radius);
            font-size: 0.875rem;
            font-weight: 500;

            i {
              color: var(--primary-color);
            }
          }
        }
      }

      .stats-table {
        .table {
          margin: 0;

          thead th {
            background: var(--primary-color);
            color: white;
            font-weight: 600;
            padding: 1rem;
            border: none;

            i {
              opacity: 0.7;
            }
          }

          tbody tr {
            transition: all 0.2s ease;

            &:hover {
              background-color: rgba(59, 130, 246, 0.05);
              transform: translateY(-1px);
              box-shadow: var(--shadow-sm);
            }
          }

          td {
            padding: 1rem;
            vertical-align: middle;
            border-color: var(--border-color);
          }
        }
      }
    }
  }
}

// Player Row Styles
.player-row {
  .player-rank {
    display: flex;
    align-items: center;
    gap: 1rem;

    .rank-badge {
      width: 30px;
      height: 30px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 600;
      font-size: 0.875rem;

      &.rank-gold,
      &.rank-silver,
      &.rank-bronze {
        background: var(--bg-light);
        color: var(--text-dark);
      }

      &.rank-normal {
        background: var(--bg-light);
        color: var(--text-dark);
      }
    }

    .player-name {
      font-weight: 600;
      color: var(--text-dark);
    }
  }

  .stat-value {
    font-weight: 600;
    padding: 0.25rem 0.75rem;
    border-radius: var(--border-radius);
    font-size: 0.875rem;

    &.goals {
      background: var(--bg-light);
      color: var(--text-dark);
    }

    &.assists {
      background: var(--bg-light);
      color: var(--text-dark);
    }

    &.penalties {
      background: var(--bg-light);
      color: var(--text-dark);
    }

    &.total {
      background: var(--primary-color);
      color: white;
    }
  }
}

// Responsive Design
@media (max-width: 768px) {
  .filters-section {
    .filters-card {
      .filters-content {
        .filter-section {
          .filter-options-grid {
            justify-content: center;
          }
        }
      }
    }
  }

  .stats-section {
    .stats-content {
      .stats-card {
        .stats-header {
          flex-direction: column;
          align-items: stretch;
          text-align: center;
        }
      }
    }
  }

  .table {
    font-size: 0.875rem;

    td {
      padding: 0.75rem 0.5rem;
    }
  }

  .player-row {
    .player-rank {
      flex-direction: column;
      align-items: flex-start;
      gap: 0.5rem;
    }
  }
}

// Tiivistetyt taulukko-otsikot
.stats-table .table thead th {
  font-size: 0.95rem;
  padding: 0.4rem 0.5rem;
}
.stats-table .table td {
  padding: 0.4rem 0.5rem;
}

// Mobile stats cards
.mobile-stats-list {
  display: flex;
  flex-direction: column;
  gap: 0;
}

.mobile-stat-card {
  padding: 0.6rem 0.5rem;
  border-bottom: 1px solid var(--border-color);
  background: transparent;

  &:last-child {
    border-bottom: none;
  }
}

.mobile-stat-top {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.25rem;

  .rank-badge {
    width: 26px;
    height: 26px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 600;
    font-size: 0.8rem;
    flex-shrink: 0;

    &.rank-gold {
      background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
      color: white;
    }
    &.rank-silver {
      background: linear-gradient(135deg, #9ca3af 0%, #6b7280 100%);
      color: white;
    }
    &.rank-bronze {
      background: linear-gradient(135deg, #d97706 0%, #b45309 100%);
      color: white;
    }
    &.rank-normal {
      background: var(--bg-light);
      color: var(--text-dark);
    }
  }
}

.mobile-stat-name {
  flex: 1;
  font-weight: 700;
  font-size: 0.92rem;
  color: var(--text-dark);
}

.mobile-stat-total {
  font-weight: 700;
  font-size: 1rem;
  color: #fff;
  background: var(--primary-color);
  padding: 0.15rem 0.55rem;
  border-radius: 999px;
  min-width: 2rem;
  text-align: center;
}

.mobile-stat-details {
  display: flex;
  gap: 0.8rem;
  padding-left: 2.25rem;
}

.mobile-stat-item {
  font-size: 0.82rem;
  font-weight: 600;
  color: var(--text-dark);
}

.mobile-stat-item-label {
  font-weight: 500;
  color: var(--text-light);
  margin-right: 0.2rem;
  font-size: 0.75rem;
}

@media (max-width: 480px) {
  .tilastot-view .container {
    padding-left: 0.25rem;
    padding-right: 0.25rem;
  }
}

.games-card {
  padding: 2rem 2rem 1.5rem 2rem;
}
</style>
