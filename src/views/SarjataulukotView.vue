<template>
  <div class="sarjataulukot-view">
    <!-- Filters Section -->
    <div class="filters-section">
      <div class="container">
        <div class="row">
          <div class="col-12">
            <div class="filters-card">
              <div class="filters-header">
                <h3 class="filters-title">
                  <i class="fas fa-filter me-2"></i>
                  Suodattimet
                </h3>
              </div>

              <div class="filters-content">
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
      <!-- create table from standings array, each group side by side -->
    <div class="container">
      <div class="row">
        <div v-if="currentClass" v-for="group in standings[0].groups" :key="group.group_id" class="col-12 col-md-6 px-md-3">
          <h5 class="mb-2">{{ group.group_name }}</h5>

              <table class="table table-hover table-sm">
                <thead>
                  <tr>
                    <th v-for="field in standing_fields" :key="field.key">
                      {{ field.label }}
                    </th>
                  </tr> 
                </thead>
                <tbody>
                  <tr v-for="team in group.teams" :key="team.team_id">
                    <td>{{ team.team_name }}</td>
                    <td>{{ team.matches_played }}</td>
                    <td>{{ team.matches_won }}</td>
                    <td>{{ team.matches_tied }}</td>
                    <td>{{ team.matches_lost }}</td>
                    <td>{{ team.goals_for }}</td>
                    <td>{{ team.goals_against }}</td>
                    <td>{{ team.goals_diff }}</td>
                    <td>{{ team.points }}</td>
                  </tr>
                </tbody>
              </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from "axios";

export default {
  name: "SarjataulukotView",
  components: {},
  data() {
    return {
      allStandings: [],
      standings: [],
      standing_fields: [
        { key: "team_name", label: "Joukkue" },
        { key: "played", label: "O" },
        { key: "wins", label: "V" },
        { key: "draws", label: "T" },
        { key: "losses", label: "H" },
        { key: "goals_for", label: "TM" },
        { key: "goals_against", label: "PM" },
        { key: "goal_difference", label: "ME" },
        { key: "points", label: "P" },
      ],
      currentSeason: "",
      currentClass: "",
      baseurl: import.meta.env.VITE_APP_BACKEND_URL || "http://localhost:3000",
    };
  },

  async mounted() {
    try {
      console.log("baseurl", this.baseurl);
      this.allStandings = await this.getStandings();
      this.standings = this.allStandings;
      // set default season
      if (this.seasonbuttons.length > 0) {
        this.setSeason(this.seasonbuttons[0]);
      }
    } catch (error) {
      console.error("Error fetching stats:", error);
      this.allStandings = [];
      this.standings = [];
    }
  },

  computed: {
    seasonbuttons() {
      if (this.allStandings.length > 0) {
        return [...new Set(this.allStandings.map((item) => item.season))]
          .sort()
          .reverse();
      }
      return [];
    },

    classbuttons() {
      if (this.allStandings.length > 0 && this.currentSeason !== "") {
        return [
          ...new Set(
            this.allStandings
              .filter((x) => x.season === this.currentSeason)
              .map((item) => item.category_name),
          ),
        ].sort();
      }
      return [];
    },
  },
  methods: {
    setSeason(season) {
      this.currentSeason = season;
      this.currentClass = "";
      this.standings = this.allStandings.filter((x) => x.season === season);
    },

    setClass(_class) {
      this.currentClass = _class;
      this.standings = this.allStandings.filter(
        (x) => x.season === this.currentSeason && (x.class === _class || x.category_name === _class)
      );
    },

    async getStandings() {
      const response = await axios.get(`${this.baseurl}/standings`);
      return response.data;
    },
  },
};
</script>

<style lang="scss" scoped>
.standings-view {
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
      background: #10b981;
      color: white;
    }

    &.assists {
      background: #3b82f6;
      color: white;
    }

    &.penalties {
      background: #ef4444;
      color: white;
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

.games-card {
  padding: 2rem 2rem 1.5rem 2rem;
}
</style>
