module.exports = {
  css: {
    loaderOptions: {
      sass: {
        additionalData: "",
      },
      scss: {
        additionalData: "",
      },
    },
  },
  publicPath: process.env.NODE_ENV === "production" ? "/nibacos" : "/",
  chainWebpack: (config) => {
    config.plugin("html").tap((args) => {
      args[0].title = process.env.VUE_APP_SITE_TITLE
        ? process.env.VUE_APP_SITE_TITLE
        : "fball_ui";
      return args;
    });
  },
};
