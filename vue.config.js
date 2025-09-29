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

  publicPath: import.meta.env.NODE_ENV === "production" ? "/nibacos" : "/",
  chainWebpack: (config) => {
    config.plugin("html").tap((args) => {
      args[0].title = import.meta.env.VITE_APP_SITE_TITLE
        ? import.meta.env.VITE_APP_SITE_TITLE
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
    if (import.meta.env.NODE_ENV === 'production') {
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
