<template>
  <div class="tietoja-view container py-4">
    <div class="tietoja-card">
      <h2>Tietoja sivustosta</h2>
      <p>
        Tämä sivusto on harrastusprojekti, joka kokoaa yhteen
        <strong>{{ clubName }}</strong>-seuran ottelutiedot, tilastot ja
        pelaajatiedot.
      </p>
      <p>
        Data haetaan Torneopal API -rajapinnasta ja esitetään
        selainpohjaisessa käyttöliittymässä.
      </p>

      <h3>Lähdekoodi</h3>
      <p>
        Projektin lähdekoodi on saatavilla GitHubissa:
        <a
          href="https://github.com/ikivela/fball_ui"
          target="_blank"
          rel="noopener noreferrer"
          class="github-link"
        >
          <i class="fab fa-github"></i> github.com/ikivela/fball_ui
        </a>
      </p>
    </div>
  </div>
</template>

<script>
export default {
  name: "TietojaView",
  data() {
    return {
      clubName: import.meta.env.VITE_APP_CLUB_NAME || "Seura",
    };
  },
};
</script>

<style scoped>
@use "../assets/_shared-sections.scss";

.tietoja-view {
  min-height: 60vh;
}

.tietoja-card {
  background: rgba(255, 255, 255, 0.94);
  border: 1px solid rgba(148, 163, 184, 0.2);
  border-radius: 20px;
  padding: 1.5rem 1.5rem;
  box-shadow: 0 18px 40px rgba(15, 23, 42, 0.06);
  max-width: 700px;
}

.tietoja-card h2 {
  margin: 0 0 1rem;
  font-size: 1.4rem;
  font-weight: 800;
  color: var(--text-dark);
}

.tietoja-card h3 {
  margin: 1.25rem 0 0.5rem;
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--text-dark);
}

.tietoja-card p {
  color: var(--text-dark);
  line-height: 1.6;
}

.tietoja-card ul {
  padding-left: 1.2rem;
  color: var(--text-dark);
}

.tietoja-card li {
  margin-bottom: 0.3rem;
}

.github-link {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  color: var(--primary-color);
  font-weight: 700;
  text-decoration: none;
}

.github-link:hover {
  text-decoration: underline;
}

@media (max-width: 480px) {
  .tietoja-card {
    padding: 1rem;
    border-radius: 16px;
  }
}
</style>
