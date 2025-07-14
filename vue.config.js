const WebpackObfuscator = require('webpack-obfuscator');

module.exports = {
  css: {
    extract: true,
    loaderOptions: {
      sass: {
        additionalData: "",
      },
      scss: {
        additionalData: "",
      },
    },
    sourceMap: false
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
  // Lisää tämä osio:
  configureWebpack: config => {
    const baseConfig = {
      optimization: {
        minimize: true
      },
      plugins: []
    };
    if (process.env.NODE_ENV === 'production') {
      baseConfig.plugins.push(
        new WebpackObfuscator({
          rotateStringArray: true
        }, [])
      );
    }
    return baseConfig;
  },
  transpileDependencies: [],
};
