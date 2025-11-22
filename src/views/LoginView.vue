<template>
  <div class="login-container">
    <div class="login-card card p-4 mx-auto" style="max-width: 400px">
      <h2 class="mb-4 text-center">Kirjaudu sisään</h2>
      <form @submit.prevent="login">
        <div class="mb-3">
          <label for="password" class="form-label">Salasana</label>
          <input
            type="password"
            v-model="password"
            class="form-control"
            id="password"
            required
          />
        </div>
        <button type="submit" class="btn btn-primary w-100">Kirjaudu</button>
        <div v-if="error" class="alert alert-danger mt-3">{{ error }}</div>
      </form>
    </div>
  </div>
</template>

<script>
export default {
  name: "LoginView",
  data() {
    return {
      password: "",
      error: "",
    };
  },
  methods: {
    async login() {
      this.error = "";
      try {
        const response = await fetch(
          `${import.meta.env.VITE_APP_BACKEND_URL || "/api"}/login`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              username: "nibacos",
              password: this.password,
            }),
          }
        );
        if (response.ok) {
          const data = await response.json();
          localStorage.setItem("apitoken", data.token);
          this.$router.replace("/");
        } else {
          this.error = "Väärä salasana";
        }
      } catch (e) {
        this.error = "Kirjautuminen epäonnistui";
      }
    },
  },
};
</script>

<style scoped>
.login-container {
  min-height: 60vh;
  display: flex;
  align-items: center;
  justify-content: center;
}
.login-card {
  box-shadow: var(--shadow-md);
}
</style>
