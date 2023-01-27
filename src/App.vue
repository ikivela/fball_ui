<template>
  <div id="app">
    <b-container>
      <b-navbar type="light" variant="faded">
        <b-navbar-brand
          ><img
            height="36"
            src="https://static.jopox.fi/nibacos/imagebank/40875_huge.png"
            alt="logo"
          />
          Nibacos-ottelut
        </b-navbar-brand>
        <b-navbar-nav>
          <b-nav-item
            ><router-link to="/">Ajankohtaiset</router-link></b-nav-item
          >
          <b-nav-item
            ><router-link to="/ottelut">Ottelut</router-link></b-nav-item
          >
          <b-nav-item
            ><router-link to="/tilastot">Tilastot</router-link></b-nav-item
          >
        </b-navbar-nav>
      </b-navbar>

      <router-view />
    </b-container>
  </div>
</template>

<style lang="scss">
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}

nav {
  padding: 30px;

  a {
    font-weight: bold;
    color: #2c3e50;

    &.router-link-exact-active {
      color: #42b983;
    }
  }
}
</style>
