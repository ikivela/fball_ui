# fball_ui

This repository contains frontend code for [fball_backend](https://github.com/ikivela/fball_ui/)

## Configuration

Create `.env` and modify following variables

```
VITE_APP_SITE_TITLE=Demo site
VITE_APP_BACKEND_URL=http://yoursite.com
```

In `vue.config.js`, line 13, set `publicPath`. Root path '/' is used in development mode

## Project setup

```
yarn install
```

### Compiles and hot-reloads for development

```
yarn serve
```

### Compiles and minifies for production

```
yarn build
```

### Lints and fixes files

```
yarn lint
```

### Customize configuration

See [Configuration Reference](https://cli.vuejs.org/config/).
