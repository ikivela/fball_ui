<template>
  <div id="app">
    <!-- Modern Navigation Bar -->
    <nav class="navbar navbar-expand-lg navbar-dark">
      <div class="container">
        <router-link class="navbar-brand d-flex align-items-center" to="/">
          <img
            height="40"
            src="https://static.jopox.fi/nibacos/imagebank/40875_huge.png"
            alt="Nibacos Logo"
            class="me-3"
          />
          <div class="brand-text">
            <h1 class="brand-title">Nibacos</h1>
            <p class="brand-subtitle">Ottelut & Tilastot</p>
          </div>
        </router-link>

        <button
          class="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
          aria-controls="navbarNav"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span class="navbar-toggler-icon"></span>
        </button>

        <div class="collapse navbar-collapse" id="navbarNav">
          <ul class="navbar-nav ms-auto">
            <li class="nav-item">
              <router-link class="nav-link" to="/" @click="closeNavbar">
                <i class="fas fa-home me-2"></i>Koti
              </router-link>
            </li>
            <li class="nav-item">
              <router-link class="nav-link" to="/tilastot" @click="closeNavbar">
                <i class="fas fa-chart-bar me-2"></i>Tilastot
              </router-link>
            </li>
            <li class="nav-item">
              <router-link class="nav-link" to="/pelaajat" @click="closeNavbar">
                <i class="fas fa-users me-2"></i>Pelaajat
              </router-link>
            </li>
            <li class="nav-item">
              <router-link class="nav-link" to="/vertaile" @click="closeNavbar">
                <i class="fas fa-table me-2"></i>Vertaile sarjoja
              </router-link>
            </li>
          </ul>
        </div>
      </div>
    </nav>

    <!-- Main Content Area -->
    <main class="main-content">
      <router-view></router-view>
    </main>

    <!-- Footer -->
    <footer class="footer">
      <div class="container">
        <div class="row">
          <div class="col-md-6">
            <p></p>
          </div>
          <div class="col-md-6 text-end">
            <p></p>
          </div>
        </div>
      </div>
    </footer>
  </div>
</template>

<script>
//import Multiselect from "vue-multiselect";
//import { BIconLink } from "bootstrap-vue";

export default {
  name: "App",
  data() {
    return {};
  },

  async mounted() {
    // Initialize Bootstrap components
    this.initializeBootstrap();
    // Tarkista apitoken
    if (!localStorage.getItem("apitoken") && this.$route.name !== "LoginView") {
      this.$router.replace("/login");
    }
  },

  methods: {
    initializeBootstrap() {
      // Import Bootstrap JavaScript dynamically
      import("bootstrap/dist/js/bootstrap.bundle.min.js")
        .then(() => {
          // Bootstrap is now available globally
          console.log("Bootstrap initialized");
        })
        .catch((error) => {
          console.error("Failed to load Bootstrap:", error);
        });
    },
    closeNavbar() {
      const nav = document.getElementById("navbarNav");
      if (nav && nav.classList.contains("show")) {
        // Bootstrap 5 collapse
        const collapse = window.bootstrap
          ? window.bootstrap.Collapse.getOrCreateInstance(nav)
          : null;
        if (collapse) collapse.hide();
        else nav.classList.remove("show");
      }
    },
  },
};
</script>

<style lang="scss">
// Import Font Awesome for icons
@import url("https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css");

// Custom CSS Variables
:root {
  --primary-color: #1e3a8a;
  --primary-light: #3b82f6;
  --secondary-color: #dc2626;
  --accent-color: #f59e0b;
  --text-dark: #1f2937;
  --text-light: #6b7280;
  --bg-light: #f8fafc;
  --bg-white: #ffffff;
  --border-color: #e5e7eb;
  --shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
  --shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
  --shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1),
    0 4px 6px -4px rgb(0 0 0 / 0.1);
  --border-radius: 8px;
  --border-radius-lg: 12px;
}

// Global Styles
* {
  box-sizing: border-box;
}

body {
  margin: 0;
  font-family: "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
    sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  background-color: var(--bg-light);
  color: var(--text-dark);
  line-height: 1.6;
}

#app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

// Navigation Styles
.navbar {
  background: linear-gradient(
    135deg,
    var(--primary-color) 0%,
    var(--primary-light) 100%
  );
  box-shadow: var(--shadow-md);
  padding: 1rem 0;
  position: sticky;
  top: 0;
  z-index: 1000;

  .navbar-brand {
    text-decoration: none;
    color: white;

    .brand-text {
      .brand-title {
        font-size: 1.5rem;
        font-weight: 700;
        margin: 0;
        color: white;
      }

      .brand-subtitle {
        font-size: 0.875rem;
        margin: 0;
        color: rgba(255, 255, 255, 0.8);
        font-weight: 400;
      }
    }
  }

  .navbar-nav {
    .nav-link {
      color: rgba(255, 255, 255, 0.9) !important;
      font-weight: 500;
      padding: 0.5rem 1rem;
      border-radius: var(--border-radius);
      transition: all 0.2s ease;
      margin: 0 0.25rem;

      &:hover {
        color: white !important;
        background-color: rgba(255, 255, 255, 0.1);
        transform: translateY(-1px);
      }

      &.router-link-active {
        color: white !important;
        background-color: rgba(255, 255, 255, 0.2);
        box-shadow: var(--shadow-sm);
      }
    }
  }

  .navbar-toggler {
    border: none;
    padding: 0.25rem 0.5rem;

    &:focus {
      box-shadow: none;
    }
  }
}

// Main Content
.main-content {
  flex: 1;
  padding: 2rem 0;
  min-height: calc(100vh - 140px);
}

// Footer
.footer {
  background-color: var(--text-dark);
  color: white;
  padding: 2rem 0;
  margin-top: auto;

  p {
    margin: 0;
    font-size: 0.875rem;
    color: rgba(255, 255, 255, 0.8);
  }
}

// Utility Classes
.card {
  background: var(--bg-white);
  border-radius: var(--border-radius-lg);
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--border-color);
  transition: all 0.2s ease;

  &:hover {
    box-shadow: var(--shadow-md);
    transform: translateY(-2px);
  }
}

.btn-primary {
  background: linear-gradient(
    135deg,
    var(--primary-color) 0%,
    var(--primary-light) 100%
  );
  border: none;
  border-radius: var(--border-radius);
  font-weight: 500;
  padding: 0.75rem 1.5rem;
  transition: all 0.2s ease;

  &:hover {
    transform: translateY(-1px);
    box-shadow: var(--shadow-md);
  }
}

.btn-outline-primary {
  border-color: var(--primary-color);
  color: var(--primary-color);
  border-radius: var(--border-radius);
  font-weight: 500;

  &:hover {
    background-color: var(--primary-color);
    border-color: var(--primary-color);
  }
}

// Responsive Design
@media (max-width: 768px) {
  .navbar {
    .navbar-brand {
      .brand-text {
        .brand-title {
          font-size: 1.25rem;
        }

        .brand-subtitle {
          font-size: 0.75rem;
        }
      }
    }
  }

  .main-content {
    padding: 1rem 0;
  }
}

// Table Styles
.table {
  background: var(--bg-white);
  border-radius: var(--border-radius-lg);
  overflow: hidden;
  box-shadow: var(--shadow-sm);

  thead th {
    background-color: var(--primary-color);
    color: white;
    border: none;
    font-weight: 600;
    padding: 1rem;
  }

  tbody tr {
    transition: background-color 0.2s ease;

    &:hover {
      background-color: rgba(59, 130, 246, 0.05);
    }
  }

  td {
    padding: 1rem;
    border-color: var(--border-color);
    vertical-align: middle;
  }
}

// Badge Styles
.badge {
  background: linear-gradient(135deg, var(--accent-color) 0%, #fbbf24 100%);
  color: white;
  font-weight: 500;
  padding: 0.5rem 1rem;
  border-radius: var(--border-radius);
  font-size: 0.875rem;
}

// Form Styles
.form-control {
  border-radius: var(--border-radius);
  border: 1px solid var(--border-color);
  padding: 0.75rem 1rem;
  transition: all 0.2s ease;

  &:focus {
    border-color: var(--primary-color);
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }
}

// Modal Styles
.modal-content {
  border-radius: var(--border-radius-lg);
  border: none;
  box-shadow: var(--shadow-lg);
}

.modal-header {
  background: linear-gradient(
    135deg,
    var(--primary-color) 0%,
    var(--primary-light) 100%
  );
  color: white;
  border-bottom: none;
  border-radius: var(--border-radius-lg) var(--border-radius-lg) 0 0;
}

// Animation Classes
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

// Custom Scrollbar
::-webkit-scrollbar {
  width: 8px;
}

::-webkit-scrollbar-track {
  background: var(--bg-light);
}

::-webkit-scrollbar-thumb {
  background: var(--primary-light);
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: var(--primary-color);
}
</style>
