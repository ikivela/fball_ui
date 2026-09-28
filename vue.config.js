const WebpackObfuscator = require('webpack-obfuscator');

const isProduction = process.env.NODE_ENV === 'production';
const siteTitle = process.env.VITE_APP_SITE_TITLE || 'fball_ui';
const publicPath = process.env.VITE_BASE_PATH || '/';

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

  publicPath: isProduction ? publicPath : '/',
  chainWebpack: (config) => {
    config.plugin("html").tap((args) => {
      args[0].title = siteTitle;
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
    if (isProduction) {
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
