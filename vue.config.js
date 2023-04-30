const bootstrapSassAbstractsImports = require("vue-cli-plugin-bootstrap-vue/sassAbstractsImports.js");
module.exports = {
  css: {
    loaderOptions: {
      sass: {
        additionalData: bootstrapSassAbstractsImports.join("\n"),
      },
      scss: {
        additionalData: [...bootstrapSassAbstractsImports, ""].join(";\n"),
      },
    },
  },
  publicPath: process.env.NODE_ENV === "production" ? "/" : "/",
  chainWebpack: (config) => {
    config.plugin("html").tap((args) => {
      args[0].title = process.env.VUE_APP_SITE_TITLE
        ? process.env.VUE_APP_SITE_TITLE
        : "fball_ui";
      return args;
    });
  },
};
