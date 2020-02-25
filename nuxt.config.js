const colors = require('vuetify/es5/util/colors').default;

const features = [
  'fetch',
  'Object.entries',
  'IntersectionObserver',
].join('%2C');

module.exports = {
  mode: 'universal',
  transpileDependencies: ['vuetify'],
  head: {
    titleTemplate: '%s - ' + process.env.npm_package_name,
    title: process.env.npm_package_name || '',
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { hid: 'description', name: 'description', content: process.env.npm_package_description || '' }
    ],
    link: [
      { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }
    ],
    script: [
      { src: `https://polyfill.io/v3/polyfill.min.js?features=${features}`, body: true },
    ],
  },
  loading: { color: '#fff' },
  css: [
    '~assets/style.css'
  ],
  plugins: [
    {src: '@/plugins/socket', ssr: false},
    {src: '@/plugins/firebase', ssr: false}
  ],
  buildModules: [
    '@nuxtjs/vuetify',
  ],
  modules: [
    '@nuxtjs/pwa',
  ],
  vuetify: {
    customVariables: ['~/assets/variables.scss'],
    theme: {
      dark: true,
      themes: {
        dark: {
          primary: colors.blue.darken2,
          accent: colors.grey.darken3,
          secondary: colors.amber.darken3,
          info: colors.teal.lighten1,
          warning: colors.amber.base,
          error: colors.deepOrange.accent4,
          success: colors.green.accent3
        }
      }
    }
  },
  build: {
    extend (config, ctx) {
    }
  }
};
