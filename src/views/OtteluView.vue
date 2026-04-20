<template>
  <div class="ottelu-view container py-4">
    <div v-if="loading" class="state-card loading-state">
      <i class="fas fa-spinner fa-spin me-2"></i>
      Ladataan otteluraporttia...
    </div>
    <div v-else-if="error" class="state-card error-state">{{ error }}</div>
    <div v-else-if="gameReport">
      <section class="report-shell">
        <div class="report-hero">
          <div class="report-meta">
            <span v-if="formattedReportDateTime" class="hero-chip">
              <i class="fas fa-calendar-alt"></i>
              {{ formattedReportDateTime }}
            </span>
            <span v-if="gameReport.class" class="hero-chip muted">
              {{ gameReport.class }}
            </span>
          </div>
          <div class="report-scoreboard">
            <div class="team-block home">
              <div class="team-label">Koti</div>
              <h1 class="team-name">{{ gameReport.homeName }}</h1>
            </div>
            <div class="score-block">
              <div class="score-caption">Lopputulos</div>
              <div class="score-value">{{ finalScore }}</div>
            </div>
            <div class="team-block away">
              <div class="team-label">Vieras</div>
              <h1 class="team-name">{{ gameReport.awayName }}</h1>
            </div>
          </div>
        </div>

        <div class="report-sections">
          <section
            v-if="competitionName || venueName || attendance || periodScores.length || savesDisplay || gameReport.streamUrl"
            class="report-card match-info-card"
          >
            <div class="section-header">
              <h2>Ottelun tiedot</h2>
            </div>

            <div class="match-info-grid">
              <div v-if="competitionName" class="info-item">
                <span class="info-label">Kilpailu</span>
                <span class="info-value">{{ competitionName }}</span>
              </div>
              <div v-if="venueName" class="info-item">
                <span class="info-label">Paikka</span>
                <span class="info-value">{{ venueName }}</span>
              </div>
              <div v-if="attendance" class="info-item">
                <span class="info-label">Katsojat</span>
                <span class="info-value">{{ attendance }}</span>
              </div>
              <div v-if="gameReport.streamUrl" class="info-item">
                <span class="info-label">Striimi</span>
                <span class="info-value">
                  <a :href="gameReport.streamUrl" target="_blank" rel="noopener noreferrer" class="stream-link">
                    <i class="fas fa-play-circle"></i> Katso SalibandyTV
                  </a>
                </span>
              </div>
            </div>

            <div v-if="periodScores.length" class="period-scoreboard">
              <div
                v-for="period in periodScores"
                :key="period.label"
                class="period-chip"
              >
                <span class="period-label">{{ period.label }}</span>
                <span class="period-value">{{ period.score }}</span>
              </div>
            </div>

            <div v-if="savesDisplay" class="saves-section">
              <h3 class="saves-title"><i class="fas fa-hand-paper"></i> Torjunnat</h3>
              <div class="saves-grid">
                <div class="saves-team">
                  <span class="saves-team-name">{{ gameReport.homeName }}</span>
                  <div class="saves-periods">
                    <span
                      v-for="s in savesDisplay.home.periods"
                      :key="s.label"
                      class="saves-chip"
                    >
                      <span class="saves-period-label">{{ s.label }}</span>
                      <span class="saves-period-value">{{ s.value }}</span>
                    </span>
                    <span class="saves-chip saves-total">
                      <span class="saves-period-label">Yht.</span>
                      <span class="saves-period-value">{{ savesDisplay.home.total }}</span>
                    </span>
                  </div>
                </div>
                <div class="saves-team">
                  <span class="saves-team-name">{{ gameReport.awayName }}</span>
                  <div class="saves-periods">
                    <span
                      v-for="s in savesDisplay.away.periods"
                      :key="s.label"
                      class="saves-chip"
                    >
                      <span class="saves-period-label">{{ s.label }}</span>
                      <span class="saves-period-value">{{ s.value }}</span>
                    </span>
                    <span class="saves-chip saves-total">
                      <span class="saves-period-label">Yht.</span>
                      <span class="saves-period-value">{{ savesDisplay.away.total }}</span>
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section class="report-card timeline-card">
            <div class="section-header">
              <h2>Tapahtumat</h2>
              <span class="section-meta">{{ gameReport.allEvents.length }} merkintää</span>
            </div>

            <div v-if="gameReport.allEvents.length" class="timeline">
              <article
                v-for="event in gameReport.allEvents"
                :key="event.event_id || event.time + event.type + event.player_id"
                class="timeline-entry"
                :class="[
                  {
                    club: isClubEvent(event),
                    opponent: isOpponentEvent(event),
                    neutral: !isClubEvent(event) && !isOpponentEvent(event),
                  },
                  event.type ? `event-${event.type}` : '',
                ]"
              >
                <div class="timeline-time-box">{{ event.event_time }}</div>
                <div class="timeline-entry-body">
                  <div class="timeline-entry-top">
                    <span class="timeline-team-tag">
                      {{ getEventSideLabel(event) }}
                    </span>
                    <span class="timeline-event-tag" :class="event.type">
                      <i :class="getEventTypeIcon(event)"></i>
                      {{ getEventTypeLabel(event) }}
                    </span>
                  </div>

                  <div class="timeline-player">
                    <template v-if="canLinkEventPlayer(event)">
                      <router-link
                        v-if="isHomeClubEvent(event)"
                        :to="{ name: 'PelaajaView', params: { player_id: event.player_id } }"
                        class="player-link"
                      >
                        {{ getEventPlayerName(event) }}
                      </router-link>
                      <a
                        v-else
                        href="#"
                        class="player-link"
                        @click.prevent="goToPlayer(event.player_id)"
                      >
                        {{ getEventPlayerName(event) }}
                      </a>
                    </template>
                    <template v-else>
                      {{ getEventPlayerName(event) }}
                    </template>
                  </div>

                  <div v-if="getEventDescription(event)" class="timeline-description">
                    {{ getEventDescription(event) }}
                  </div>
                </div>
              </article>
            </div>
            <div v-else class="empty-state">Ei tapahtumia saatavilla.</div>
          </section>

          <section class="lineups-grid">
            <div class="report-card lineup-card">
              <div class="section-header">
                <h2>{{ gameReport.homeName }}</h2>
                <span class="section-meta">{{ gameReport.homeLineup.length }} pelaajaa</span>
              </div>
              <ul v-if="gameReport.homeLineup.length" class="lineup-list">
                <li
                  v-for="p in gameReport.homeLineup"
                  :key="p.player_id || p.id || p.name"
                  class="lineup-item"
                >
                  <span class="lineup-number">
                    {{ p.player_shirt_number || p.shirt_number || "-" }}
                  </span>
                  <span class="lineup-name">
                    <template
                      v-if="
                        p.player_id &&
                        gameReport.homeName &&
                        gameReport.homeName.toLowerCase().includes(clubName.toLowerCase())
                      "
                    >
                      <router-link
                        :to="{ name: 'PelaajaView', params: { player_id: p.player_id } }"
                        class="player-link"
                      >
                        {{ p.name || p.player_name || p.id || JSON.stringify(p) }}
                      </router-link>
                    </template>
                    <template v-else>
                      {{ p.name || p.player_name || p.id || JSON.stringify(p) }}
                    </template>
                  </span>
                </li>
              </ul>
              <div v-else class="empty-state">Kokoonpanoa ei löytynyt.</div>
            </div>

            <div class="report-card lineup-card">
              <div class="section-header">
                <h2>{{ gameReport.awayName }}</h2>
                <span class="section-meta">{{ gameReport.awayLineup.length }} pelaajaa</span>
              </div>
              <ul v-if="gameReport.awayLineup.length" class="lineup-list">
                <li
                  v-for="p in gameReport.awayLineup"
                  :key="p.player_id || p.id || p.name"
                  class="lineup-item"
                >
                  <span class="lineup-number">
                    {{ p.player_shirt_number || p.shirt_number || "-" }}
                  </span>
                  <span class="lineup-name">
                    <template
                      v-if="
                        p.player_id &&
                        gameReport.awayName &&
                        gameReport.awayName.toLowerCase().includes(clubName.toLowerCase())
                      "
                    >
                      <a
                        href="#"
                        class="player-link"
                        @click.prevent="goToPlayer(p.player_id)"
                      >
                        {{ p.name || p.player_name || p.id || JSON.stringify(p) }}
                      </a>
                    </template>
                    <template v-else>
                      {{ p.name || p.player_name || p.id || JSON.stringify(p) }}
                    </template>
                  </span>
                </li>
              </ul>
              <div v-else class="empty-state">Kokoonpanoa ei löytynyt.</div>
            </div>
          </section>

          <section
            v-if="referees.length || homeStaff.length || awayStaff.length"
            class="report-card officials-card"
          >
            <div class="section-header">
              <h2>Ottelun toimihenkilöt</h2>
            </div>

            <div class="officials-grid">
              <div v-if="referees.length" class="officials-block">
                <h3>Tuomarit</h3>
                <ul class="officials-list">
                  <li v-for="referee in referees" :key="referee">
                    {{ referee }}
                  </li>
                </ul>
              </div>

              <div v-if="homeStaff.length" class="officials-block">
                <h3>{{ gameReport.homeName }}</h3>
                <ul class="officials-list">
                  <li
                    v-for="member in homeStaff"
                    :key="`${gameReport.homeName}-${member.name}-${member.role}`"
                  >
                    <span class="official-role">{{ member.role }}</span>
                    <span>{{ member.name }}</span>
                  </li>
                </ul>
              </div>

              <div v-if="awayStaff.length" class="officials-block">
                <h3>{{ gameReport.awayName }}</h3>
                <ul class="officials-list">
                  <li
                    v-for="member in awayStaff"
                    :key="`${gameReport.awayName}-${member.name}-${member.role}`"
                  >
                    <span class="official-role">{{ member.role }}</span>
                    <span>{{ member.name }}</span>
                  </li>
                </ul>
              </div>
            </div>
          </section>
        </div>
      </section>
    </div>
    <div v-else class="state-card empty-state">
      Ei otteluraporttia saatavilla.
    </div>
    <div v-if="!loading && !error && !gameReport" class="state-card empty-state">
      Ei dataa ladattu eikä virhettä havaittu.
    </div>
    <div class="report-actions">
      <button @click="goToOttelutView" class="btn btn-outline-secondary back-button">
        <i class="fas fa-arrow-left"></i> Takaisin otteluihin
      </button>
    </div>
  </div>
</template>

<script>
import axios from "axios";

export default {
  name: "OtteluView",
  data() {
    return {
      gameReport: null,
      loading: true,
      error: "",
      clubName: import.meta.env.VITE_APP_CLUB_NAME || "",
    };
  },
  watch: {
    "$route.params": {
      immediate: true,
      handler() {
        this.fetchGameReport();
      },
    },
  },
  computed: {
    finalScore() {
      if (!this.gameReport) return "-";
      const home = this.gameReport.homeGoals?.length;
      const away = this.gameReport.awayGoals?.length;
      if (home == null || away == null) return "-";
      return `${home}-${away}`;
    },
    competitionName() {
      return this.gameReport?.competitionName || "";
    },
    venueName() {
      return this.gameReport?.venueName || "";
    },
    attendance() {
      return this.gameReport?.attendance || "";
    },
    periodScores() {
      if (!this.gameReport) return [];
      return this.gameReport.periodScores || [];
    },
    savesDisplay() {
      if (!this.gameReport) return null;
      const homeSaves = this.gameReport.homeSaves;
      const awaySaves = this.gameReport.awaySaves;
      if (!homeSaves && !awaySaves) return null;
      const buildSide = (savesByPeriod) => {
        if (!savesByPeriod || typeof savesByPeriod !== 'object') {
          return { periods: [], total: 0 };
        }
        const keys = Object.keys(savesByPeriod).sort((a, b) => Number(a) - Number(b));
        let total = 0;
        const periods = keys.map((k) => {
          const val = Number(savesByPeriod[k]) || 0;
          total += val;
          return { label: `${k}. erä`, value: val };
        });
        return { periods, total };
      };
      return {
        home: buildSide(homeSaves),
        away: buildSide(awaySaves),
      };
    },
    referees() {
      return this.extractReferees(this.gameReport);
    },
    homeStaff() {
      if (!this.gameReport) return [];
      return this.extractTeamStaff(
        this.gameReport.homeOfficials,
        this.gameReport.homeName
      );
    },
    awayStaff() {
      if (!this.gameReport) return [];
      return this.extractTeamStaff(
        this.gameReport.awayOfficials,
        this.gameReport.awayName
      );
    },
    formattedReportDateTime() {
      if (!this.gameReport?.date) return "";
      let dateStr = this.gameReport.date;
      let timeStr = "";
      if (dateStr.includes(" ")) {
        const parts = dateStr.split(" ");
        dateStr = parts[0];
        timeStr = parts[1] ? parts[1].slice(0, 5) : "";
      }
      const [yyyy, mm, dd] = dateStr.split("-");
      if (!yyyy || !mm || !dd) return this.gameReport.date;
      return `${dd}.${mm}.${yyyy}${timeStr ? ` ${timeStr}` : ""}`;
    },
    formattedGameReportTitle() {
      if (
        !this.gameReport ||
        !this.gameReport.date ||
        !this.gameReport.homeName ||
        !this.gameReport.awayName
      )
        return "";
      let dateStr = this.gameReport.date;
      let timeStr = "";
      if (dateStr.includes(" ")) {
        const parts = dateStr.split(" ");
        dateStr = parts[0];
        timeStr = parts[1] ? parts[1].slice(0, 5) : "";
      }
      const [yyyy, mm, dd] = dateStr.split("-");
      const formatted = `${dd}.${mm}.${yyyy}` + (timeStr ? ` ${timeStr}` : "");
      return `${formatted} ${this.gameReport.homeName} vs ${this.gameReport.awayName}`;
    },
  },
  methods: {
    async fetchGameReport() {
      this.loading = true;
      this.error = "";
      this.gameReport = null;
      const gameid = this.$route.params.game_id;
      const season = this.$route.params.season;
      const state = this.$router && this.$router.options.history.state ? this.$router.options.history.state : {};
      const homeName = state.home || "Koti";
      const awayName = state.away || "Vieras";
      const date = state.date || "";
      const className = state.class || "";
      console.log("fetchGameReport", { season, gameid, homeName, awayName, date, className });
      try {
        const baseurl = import.meta.env.VITE_APP_BACKEND_URL;
        if (!gameid) throw new Error("Puuttuva ottelun tunniste");
        if (!season) throw new Error("Puuttuva kausi");
        const url = `${baseurl}/gamestats/?season=${season}&gameid=${gameid}`;
        console.log("OtteluView API url:", url);
        const response = await axios.get(url);
        console.log("fetchGameReport API response", response.data);
        const data = response.data;
        if (
          !data ||
          (Array.isArray(data) && data.length === 0) ||
          (typeof data === "object" && Object.keys(data).length === 0)
        ) {
          this.error = "Ei dataa löytynyt.";
          return;
        }
        if (Array.isArray(data)) {
          const allEvents = data.map((ev) => ({
            ...ev,
            type: ev.event || null,
            event_time: ev.time || "",
            team: ev.team || null,
          }));
          this.gameReport = {
            date,
            homeId: homeName,
            awayId: awayName,
            homeGoals: [],
            awayGoals: [],
            homePenalties: [],
            awayPenalties: [],
            homeLineup: [],
            awayLineup: [],
            homeOfficials: [],
            awayOfficials: [],
            referees: [],
            homeName,
            awayName,
            venueName: "",
            competitionName: "",
            attendance: "",
            periodScores: [],
            homeSaves: null,
            awaySaves: null,
            streamUrl: "",
            class: className,
            allEvents,
          };
          this.loading = false;
          return;
        }
        const root = data.match ? data.match : data;
        const homeId =
          root.team_A_id ||
          (root.goals && root.goals[0] && root.goals[0].team_id);
        const awayId =
          root.team_B_id ||
          (root.goals && root.goals.find((g) => g.team_id !== homeId)?.team_id);
        let homeLineup = [];
        let awayLineup = [];
        if (Array.isArray(root.lineups)) {
          homeLineup = root.lineups.filter((p) => p.team_id == homeId);
          awayLineup = root.lineups.filter((p) => p.team_id == awayId);
        } else if (root.lineups && typeof root.lineups === "object") {
          homeLineup = root.lineups[homeId] || [];
          awayLineup = root.lineups[awayId] || [];
        }
        const allEvents = [
          ...(root.goals || []).map((g) => ({
            ...g,
            type: "goal",
            event_time: g.time,
            team: g.team_id,
          })),
          ...(root.events || [])
            .filter(
              (e) =>
                e.code &&
                (e.code.toLowerCase().includes("pen") ||
                  e.code.toLowerCase().includes("jäähy") ||
                  e.code.toLowerCase().includes("rangaistus") ||
                  e.code.toLowerCase().includes("pun") ||
                  e.code.toLowerCase().includes("2min") ||
                  e.code.toLowerCase().includes("5min"))
            )
            .map((e) => ({
              ...e,
              type: "penalty",
              event_time: e.time,
              team: e.team_id,
            })),
        ];
        allEvents.sort((a, b) => {
          const toSeconds = (t) => {
            if (!t) return 0;
            const parts = t.split(":");
            return parseInt(parts[0] || 0) * 60 + parseInt(parts[1] || 0);
          };
          return toSeconds(a.event_time) - toSeconds(b.event_time);
        });
        this.gameReport = {
          date: root.date || date || "",
          homeId,
          awayId,
          homeGoals: (root.goals || []).filter((g) => g.team_id == homeId),
          awayGoals: (root.goals || []).filter((g) => g.team_id == awayId),
          homePenalties: (root.events || []).filter(
            (e) =>
              e.code &&
              (e.code.toLowerCase().includes("pen") ||
                e.code.toLowerCase().includes("jäähy") ||
                e.code.toLowerCase().includes("rangaistus") ||
                e.code.toLowerCase().includes("pun") ||
                e.code.toLowerCase().includes("2min") ||
                e.code.toLowerCase().includes("5min")) &&
              e.team_id == homeId
          ),
          awayPenalties: (root.events || []).filter(
            (e) =>
              e.code &&
              (e.code.toLowerCase().includes("pen") ||
                e.code.toLowerCase().includes("jäähy") ||
                e.code.toLowerCase().includes("rangaistus") ||
                e.code.toLowerCase().includes("pun") ||
                e.code.toLowerCase().includes("2min") ||
                e.code.toLowerCase().includes("5min")) &&
              e.team_id == awayId
          ),
          homeLineup,
          awayLineup,
          homeOfficials: this.getTeamOfficials(root, homeId, "home"),
          awayOfficials: this.getTeamOfficials(root, awayId, "away"),
          referees: this.getRefereesFromRoot(root),
          homeName: root.team_A_name || root.team_A_description_en || homeName,
          awayName: root.team_B_name || root.team_B_description_en || awayName,
          venueName: root.venue_name || "",
          competitionName: root.competition_name || root.category_name || "",
          attendance: root.attendance || "",
          periodScores: this.getPeriodScores(root),
          homeSaves: this.getTeamSaves(homeLineup),
          awaySaves: this.getTeamSaves(awayLineup),
          streamUrl: root.stream || "",
          class: className,
          allEvents,
        };
      } catch (e) {
        console.error("fetchGameReport error:", e);
        this.error = "Otteluraportin haku epäonnistui.";
      } finally {
        this.loading = false;
      }
    },
    goToPlayer(playerId) {
      this.$router.push({
        name: "PelaajaView",
        params: { player_id: playerId },
      });
    },
    isHomeEvent(event) {
      if (!event.team || !this.gameReport.homeId) return false;
      return event.team
        .toLowerCase()
        .includes(this.gameReport.homeId.toLowerCase());
    },
    isAwayEvent(event) {
      if (!event.team || !this.gameReport.awayId) return false;
      return event.team
        .toLowerCase()
        .includes(this.gameReport.awayId.toLowerCase());
    },
    isClubEvent(event) {
      if (!this.clubName) return false;
      const teamName = this.isHomeEvent(event)
        ? this.gameReport.homeName
        : this.isAwayEvent(event)
        ? this.gameReport.awayName
        : null;
      return !!teamName && teamName.toLowerCase().includes(this.clubName.toLowerCase());
    },
    isOpponentEvent(event) {
      if (!this.isHomeEvent(event) && !this.isAwayEvent(event)) return false;
      return !this.isClubEvent(event);
    },
    isHomeClubEvent(event) {
      return (
        !!event.player_id &&
        !!this.gameReport.homeName &&
        this.isHomeEvent(event) &&
        this.gameReport.homeName.toLowerCase().includes(this.clubName.toLowerCase())
      );
    },
    isAwayClubEvent(event) {
      return (
        !!event.player_id &&
        !!this.gameReport.awayName &&
        this.isAwayEvent(event) &&
        this.gameReport.awayName.toLowerCase().includes(this.clubName.toLowerCase())
      );
    },
    canLinkEventPlayer(event) {
      return !!event.player_id && (this.isHomeClubEvent(event) || this.isAwayClubEvent(event));
    },
    getEventPlayerName(event) {
      return (
        event.player_name ||
        event.name ||
        (event.type === "goal"
          ? event.scorer
          : event.type === "penalty"
          ? event.player
          : "") ||
        "Tuntematon pelaaja"
      );
    },
    getEventDescription(event) {
      return event.description || event.code || event.reason || "";
    },
    getEventTypeLabel(event) {
      if (event.type === "goal") return "Maali";
      if (event.type === "penalty") return "Jäähy";
      return "Tapahtuma";
    },
    getEventTypeIcon(event) {
      if (event.type === "goal") return "fas fa-futbol";
      if (event.type === "penalty") return "fas fa-clock";
      return "fas fa-flag";
    },
    getEventSideLabel(event) {
      if (this.isHomeEvent(event)) return this.gameReport.homeName;
      if (this.isAwayEvent(event)) return this.gameReport.awayName;
      return "Ottelu";
    },
    toArray(value) {
      if (!value) return [];
      return Array.isArray(value) ? value : [value];
    },
    firstNonEmpty(...values) {
      return values.find((value) => typeof value === "string" && value.trim()) || "";
    },
    normalizeOfficial(entry) {
      if (!entry) return null;
      if (typeof entry === "string") {
        const name = entry.trim();
        return name ? { name, role: "Toimihenkilö" } : null;
      }

      const name = this.firstNonEmpty(
        entry.name,
        entry.person_name,
        entry.full_name,
        entry.player_name,
        entry.official_name,
        [entry.first_name, entry.last_name].filter(Boolean).join(" ")
      );
      if (!name) return null;

      const role = this.firstNonEmpty(
        entry.official_role,
        entry.role_name,
        entry.role,
        entry.staff_role,
        entry.type,
        entry.title,
        entry.job
      );

      return {
        name,
        role: role || "Toimihenkilö",
      };
    },
    extractTeamStaff(source) {
      return this.toArray(source)
        .map((entry) => this.normalizeOfficial(entry))
        .filter(Boolean);
    },
    extractReferees(report) {
      if (!report) return [];
      return this.toArray(report.referees)
        .map((entry) => {
          if (typeof entry === "string") return entry.trim();
          return this.firstNonEmpty(
            entry?.name,
            entry?.person_name,
            entry?.full_name,
            [entry?.first_name, entry?.last_name].filter(Boolean).join(" ")
          ).trim();
        })
        .filter(Boolean);
    },
    getTeamOfficials(root, teamId, side) {
      const lineupOfficials = root?.lineup_officials;
      if (Array.isArray(lineupOfficials) && teamId) {
        return lineupOfficials.filter(
          (entry) => String(entry.team_id) === String(teamId)
        );
      }

      const direct =
        root?.[`${side}_officials`] ||
        root?.[`${side}Officials`] ||
        root?.[`${side}_staff`] ||
        root?.[`${side}Staff`];
      if (direct) return this.toArray(direct);

      const teamOfficials = root?.team_officials || root?.officials || root?.staff;
      if (!teamOfficials) return [];

      if (Array.isArray(teamOfficials)) {
        return teamOfficials.filter((entry) => {
          const entryTeamId =
            entry.team_id ||
            entry.teamId ||
            entry.team ||
            entry.team_name ||
            entry.teamName;
          if (teamId && entryTeamId != null) return String(entryTeamId) === String(teamId);

          const teamName =
            side === "home"
              ? root.team_A_name || root.team_A_description_en
              : root.team_B_name || root.team_B_description_en;
          return (
            teamName &&
            typeof entryTeamId === "string" &&
            entryTeamId.toLowerCase().includes(teamName.toLowerCase())
          );
        });
      }

      if (typeof teamOfficials === "object") {
        if (teamId && teamOfficials[teamId]) return this.toArray(teamOfficials[teamId]);
        if (teamOfficials[side]) return this.toArray(teamOfficials[side]);
      }

      return [];
    },
    getRefereesFromRoot(root) {
      const directNames = [
        root?.referee_1_name,
        root?.referee_2_name,
        root?.assistant_referee_1_name,
        root?.assistant_referee_2_name,
      ].filter((value) => typeof value === "string" && value.trim());
      if (directNames.length) {
        return directNames;
      }

      const source =
        root?.referees ||
        root?.official_referees ||
        root?.match_referees ||
        root?.judges ||
        root?.referee;
      return this.toArray(source);
    },
    getPeriodScores(root) {
      const periods = [
        { label: "1. erä", home: root?.p1s_A, away: root?.p1s_B },
        { label: "2. erä", home: root?.p2s_A, away: root?.p2s_B },
        { label: "3. erä", home: root?.p3s_A, away: root?.p3s_B },
      ];

      return periods
        .filter(
          (period) =>
            period.home !== null &&
            period.home !== undefined &&
            period.away !== null &&
            period.away !== undefined
        )
        .map((period) => ({
          label: period.label,
          score: `${period.home}-${period.away}`,
        }));
    },
    getTeamSaves(lineup) {
      if (!Array.isArray(lineup)) return null;
      const gk = lineup.find(
        (p) =>
          p.saves_by_period &&
          !Array.isArray(p.saves_by_period) &&
          typeof p.saves_by_period === 'object' &&
          Object.keys(p.saves_by_period).length > 0
      );
      return gk ? gk.saves_by_period : null;
    },
    goToOttelutView() {
      this.$router.push({
        name: "OttelutView",
        query: {
          season:
            this.$route.params.season || this.gameReport?.date?.slice(0, 4),
        },
      });
    },
  },
};
</script>

<style scoped>
@use "../assets/_shared-sections.scss";
.ottelu-view {
  min-height: 60vh;
}

.state-card {
  padding: 1rem 1.2rem;
  border-radius: 18px;
  background: #fff;
  border: 1px solid rgba(148, 163, 184, 0.22);
  box-shadow: 0 18px 40px rgba(15, 23, 42, 0.08);
}

.loading-state,
.empty-state {
  color: var(--text-light);
}

.error-state {
  color: #b42318;
  font-weight: 600;
}

.report-shell {
  display: grid;
  gap: 1.25rem;
}

.report-hero {
  padding: 1.1rem 1.25rem;
  border-radius: 22px;
  background:
    radial-gradient(circle at top right, rgba(255, 255, 255, 0.18), transparent 32%),
    linear-gradient(135deg, var(--primary-color) 0%, var(--primary-light) 100%);
  color: #fff;
  box-shadow: 0 24px 50px rgba(30, 58, 138, 0.18);
}

.report-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 0.6rem;
  margin-bottom: 1rem;
}

.hero-chip {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  padding: 0.35rem 0.8rem;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.16);
  font-size: 0.84rem;
  font-weight: 600;
}

.hero-chip.muted {
  background: rgba(15, 23, 42, 0.16);
}

.report-scoreboard {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto minmax(0, 1fr);
  align-items: center;
  gap: 0.8rem;
}

.team-block {
  min-width: 0;
}

.team-block.away {
  text-align: right;
}

.team-label {
  font-size: 0.78rem;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  opacity: 0.8;
  margin-bottom: 0.35rem;
}

.team-name {
  margin: 0;
  font-size: clamp(1.35rem, 3.1vw, 2.15rem);
  line-height: 1.08;
  font-weight: 800;
  overflow-wrap: anywhere;
}

.score-block {
  display: grid;
  justify-items: center;
  gap: 0.2rem;
  padding: 0.65rem 0.85rem;
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.12);
  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.18);
}

.score-caption {
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  opacity: 0.76;
}

.score-value {
  font-size: clamp(1.7rem, 5vw, 2.8rem);
  line-height: 1;
  font-weight: 900;
}

.report-sections {
  display: grid;
  gap: 1.25rem;
}

.match-info-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 0.9rem;
}

.info-item {
  min-width: 0;
}

.info-label {
  display: block;
  margin-bottom: 0.2rem;
  font-size: 0.74rem;
  font-weight: 700;
  color: var(--text-light);
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

.info-value {
  display: block;
  color: var(--text-dark);
  font-weight: 600;
  overflow-wrap: anywhere;
}

.stream-link {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  color: var(--primary-color);
  font-weight: 700;
  text-decoration: none;
}

.stream-link:hover {
  text-decoration: underline;
}

.period-scoreboard {
  display: flex;
  flex-wrap: wrap;
  gap: 0.6rem;
  margin-top: 1rem;
}

.period-chip {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.38rem 0.7rem;
  border-radius: 999px;
  background: rgba(30, 58, 138, 0.08);
}

.period-label {
  font-size: 0.74rem;
  font-weight: 700;
  color: var(--text-light);
}

.period-value {
  font-size: 0.92rem;
  font-weight: 800;
  color: var(--primary-color);
}

/* ── Saves / Torjunnat ────────────────────────────── */
.saves-section {
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid rgba(226, 232, 240, 0.7);
}

.saves-title {
  margin: 0 0 0.7rem;
  font-size: 0.92rem;
  font-weight: 800;
  color: var(--text-dark);
  display: flex;
  align-items: center;
  gap: 0.4rem;
}

.saves-title i {
  color: var(--primary-color);
}

.saves-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.9rem;
}

.saves-team {
  min-width: 0;
}

.saves-team-name {
  display: block;
  margin-bottom: 0.4rem;
  font-size: 0.82rem;
  font-weight: 700;
  color: var(--text-dark);
}

.saves-periods {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
}

.saves-chip {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.3rem 0.6rem;
  border-radius: 999px;
  background: rgba(30, 58, 138, 0.06);
}

.saves-chip.saves-total {
  background: rgba(30, 58, 138, 0.12);
}

.saves-period-label {
  font-size: 0.72rem;
  font-weight: 700;
  color: var(--text-light);
}

.saves-period-value {
  font-size: 0.88rem;
  font-weight: 800;
  color: var(--primary-color);
}

.saves-chip.saves-total .saves-period-value {
  color: var(--primary-color);
  font-size: 0.94rem;
}

@media (max-width: 480px) {
  .saves-grid {
    grid-template-columns: 1fr;
  }
}

.officials-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 1rem;
}

.officials-block {
  min-width: 0;
}

.officials-block h3 {
  margin: 0 0 0.65rem;
  font-size: 0.98rem;
  font-weight: 800;
  color: var(--text-dark);
}

.officials-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: grid;
  gap: 0.45rem;
}

.officials-list li {
  display: grid;
  gap: 0.1rem;
  color: var(--text-dark);
  overflow-wrap: anywhere;
}

.official-role {
  font-size: 0.74rem;
  font-weight: 700;
  color: var(--text-light);
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.report-card {
  background: rgba(255, 255, 255, 0.94);
  border: 1px solid rgba(148, 163, 184, 0.2);
  border-radius: 20px;
  padding: 1rem 1.05rem;
  box-shadow: 0 18px 40px rgba(15, 23, 42, 0.06);
}

.section-header {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.section-header h2 {
  margin: 0;
  font-size: 1.15rem;
  font-weight: 800;
  color: var(--text-dark);
}

.section-meta {
  font-size: 0.82rem;
  color: var(--text-light);
}

.timeline {
  display: grid;
  gap: 0.8rem;
}

/* ── Timeline entry base ─────────────────────────── */
.timeline-entry {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr);
  gap: 0.75rem;
  align-items: start;
  padding: 0.75rem 0.8rem;
  border-radius: 14px;
  background: linear-gradient(180deg, #ffffff 0%, #f8fafc 100%);
  border: 1px solid rgba(226, 232, 240, 0.92);
  transition: transform 0.12s ease;
}

.timeline-entry:hover {
  transform: translateX(2px);
}

/* ── Club (Nibacos) – blue theme ──────────────────── */
.timeline-entry.club {
  background: linear-gradient(135deg, rgba(219, 234, 254, 0.7) 0%, rgba(239, 246, 255, 0.5) 50%, #ffffff 100%);
  border-color: rgba(59, 130, 246, 0.22);
  box-shadow: inset 5px 0 0 var(--primary-color);
}

.timeline-entry.club.event-goal {
  background: linear-gradient(135deg, rgba(191, 219, 254, 0.75) 0%, rgba(219, 234, 254, 0.5) 50%, #ffffff 100%);
  border-color: rgba(37, 99, 235, 0.3);
  box-shadow: inset 5px 0 0 #2563eb, 0 4px 16px rgba(37, 99, 235, 0.1);
}

/* ── Opponent – red theme ─────────────────────────── */
.timeline-entry.opponent {
  background: linear-gradient(135deg, rgba(254, 226, 226, 0.7) 0%, rgba(254, 242, 242, 0.5) 50%, #ffffff 100%);
  border-color: rgba(239, 68, 68, 0.22);
  box-shadow: inset 5px 0 0 #dc2626;
}

.timeline-entry.opponent.event-goal {
  background: linear-gradient(135deg, rgba(254, 202, 202, 0.75) 0%, rgba(254, 226, 226, 0.5) 50%, #ffffff 100%);
  border-color: rgba(220, 38, 38, 0.3);
  box-shadow: inset 5px 0 0 #dc2626, 0 4px 16px rgba(220, 38, 38, 0.1);
}

/* ── Penalty – amber/yellow theme ─────────────────── */
.timeline-entry.event-penalty {
  background: linear-gradient(135deg, rgba(254, 243, 199, 0.75) 0%, rgba(254, 249, 195, 0.4) 50%, #ffffff 100%);
  border-color: rgba(217, 119, 6, 0.25);
  box-shadow: inset 5px 0 0 #d97706, 0 4px 12px rgba(217, 119, 6, 0.08);
}

/* ── Neutral ──────────────────────────────────────── */
.timeline-entry.neutral {
  background: linear-gradient(180deg, rgba(248, 250, 252, 0.95) 0%, #ffffff 100%);
  border-color: rgba(148, 163, 184, 0.2);
}

/* ── Time box ─────────────────────────────────────── */
.timeline-time-box {
  min-width: 3.8rem;
  padding: 0.42rem 0.6rem;
  border-radius: 999px;
  background: #e8f0ff;
  color: var(--primary-color);
  font-weight: 800;
  text-align: center;
  font-size: 0.88rem;
}

.timeline-entry.club.event-goal .timeline-time-box {
  background: rgba(37, 99, 235, 0.15);
  color: #1d4ed8;
}

.timeline-entry.opponent .timeline-time-box {
  background: rgba(254, 226, 226, 0.9);
  color: #b91c1c;
}

.timeline-entry.opponent.event-goal .timeline-time-box {
  background: rgba(220, 38, 38, 0.15);
  color: #991b1b;
}

.timeline-entry.event-penalty .timeline-time-box {
  background: rgba(254, 243, 199, 0.9);
  color: #92400e;
}

.timeline-entry.neutral .timeline-time-box {
  background: rgba(226, 232, 240, 0.9);
  color: #475569;
}

.timeline-entry-body {
  min-width: 0;
}

.timeline-entry-top {
  display: flex;
  flex-wrap: wrap;
  gap: 0.45rem;
  margin-bottom: 0.4rem;
}

/* ── Tags ─────────────────────────────────────────── */
.timeline-team-tag,
.timeline-event-tag {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.22rem 0.6rem;
  border-radius: 999px;
  font-size: 0.74rem;
  font-weight: 700;
}

.timeline-team-tag {
  background: rgba(30, 58, 138, 0.08);
  color: var(--primary-color);
}

.timeline-entry.club .timeline-team-tag {
  background: rgba(30, 58, 138, 0.14);
  color: var(--primary-color);
}

.timeline-entry.opponent .timeline-team-tag {
  background: rgba(239, 68, 68, 0.14);
  color: #b91c1c;
}

.timeline-entry.event-penalty .timeline-team-tag {
  background: rgba(217, 119, 6, 0.12);
  color: #92400e;
}

.timeline-entry.neutral .timeline-team-tag {
  background: rgba(148, 163, 184, 0.14);
  color: #475569;
}

.timeline-event-tag {
  background: rgba(15, 23, 42, 0.08);
  color: var(--text-dark);
}

/* Goal tag: blue for club, red for opponent */
.timeline-entry.club .timeline-event-tag.goal {
  background: rgba(37, 99, 235, 0.16);
  color: #1d4ed8;
}

.timeline-entry.opponent .timeline-event-tag.goal {
  background: rgba(220, 38, 38, 0.16);
  color: #991b1b;
}

.timeline-event-tag.goal {
  background: rgba(16, 185, 129, 0.14);
  color: #047857;
}

/* Penalty tag: always amber */
.timeline-event-tag.penalty {
  background: rgba(217, 119, 6, 0.16);
  color: #92400e;
}

/* ── Player name ──────────────────────────────────── */
.timeline-player {
  font-size: 1rem;
  font-weight: 700;
  color: var(--text-dark);
  overflow-wrap: anywhere;
}

.timeline-entry.club.event-goal .timeline-player {
  color: #1e3a8a;
  font-size: 1.05rem;
}

.timeline-entry.opponent.event-goal .timeline-player {
  color: #7f1d1d;
  font-size: 1.05rem;
}

.timeline-entry.opponent .timeline-player {
  color: #7f1d1d;
}

.timeline-entry.event-penalty .timeline-player {
  color: #78350f;
}

.timeline-description {
  margin-top: 0.3rem;
  color: var(--text-light);
  line-height: 1.35;
}

.timeline-entry.event-penalty .timeline-description {
  color: #92400e;
}

.player-link {
  color: var(--primary-color);
  text-decoration: none;
}

.player-link:hover {
  text-decoration: underline;
}

.lineups-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1rem;
}

.lineup-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: grid;
  gap: 0.55rem;
}

.lineup-item {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr);
  gap: 0.65rem;
  align-items: baseline;
  padding: 0.42rem 0;
  border-bottom: 1px solid rgba(226, 232, 240, 0.9);
}

.lineup-item:last-child {
  border-bottom: 0;
  padding-bottom: 0;
}

.lineup-number {
  min-width: 2rem;
  font-weight: 800;
  color: var(--primary-color);
}

.lineup-name {
  min-width: 0;
  overflow-wrap: anywhere;
  color: var(--text-dark);
}

.report-actions {
  margin-top: 1.25rem;
}

.back-button {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  border-radius: 999px;
  padding: 0.6rem 1rem;
}

@media (max-width: 991px) {
  .lineups-grid {
    grid-template-columns: 1fr;
  }

  .match-info-grid,
  .officials-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 767px) {
  .ottelu-view {
    padding-left: 0.6rem;
    padding-right: 0.6rem;
  }

  .report-hero {
    padding: 0.9rem;
    border-radius: 18px;
  }

  .report-scoreboard {
    grid-template-columns: minmax(0, 1fr) auto minmax(0, 1fr);
    align-items: center;
    text-align: left;
  }

  .team-block {
    text-align: left;
  }

  .team-block.away {
    text-align: right;
  }

  .score-block {
    width: auto;
    min-width: 5.25rem;
    max-width: none;
  }

  .report-card {
    padding: 0.9rem;
    border-radius: 16px;
  }

  .section-header {
    margin-bottom: 0.75rem;
  }

  .timeline-entry {
    grid-template-columns: auto minmax(0, 1fr);
    gap: 0.65rem;
    padding: 0.7rem 0.75rem;
  }

  .timeline-time-box {
    min-width: 3.5rem;
    width: auto;
  }

  .timeline-player {
    font-size: 0.96rem;
  }
}

@media (max-width: 480px) {
  .ottelu-view {
    padding-left: 0.35rem;
    padding-right: 0.35rem;
  }

  .report-hero {
    padding: 0.75rem;
  }

  .report-meta {
    gap: 0.45rem;
    margin-bottom: 0.8rem;
  }

  .hero-chip {
    font-size: 0.76rem;
    padding: 0.32rem 0.7rem;
  }

  .team-name {
    font-size: 1.1rem;
  }

  .score-value {
    font-size: 1.6rem;
  }

  .timeline-entry-top {
    gap: 0.35rem;
  }

  .score-caption {
    font-size: 0.68rem;
  }

  .section-header h2 {
    font-size: 1.02rem;
  }

  .timeline-team-tag,
  .timeline-event-tag {
    font-size: 0.7rem;
  }

  .timeline-entry {
    padding: 0.65rem 0.7rem;
  }

  .timeline-time-box {
    min-width: 3.2rem;
    padding: 0.35rem 0.5rem;
    font-size: 0.84rem;
  }

  .lineup-item {
    gap: 0.6rem;
    padding: 0.36rem 0;
  }
}
</style>
