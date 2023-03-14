let mix = require('laravel-mix');
const {VueLoaderPlugin} = require("vue-loader");
mix.js('/src/index.js', '/build/')
   .setPublicPath('./')
   .vue()
   .sourceMaps()
   .webpackConfig({
     module: {
       rules: [
         {
           test: /\.vue$/,
           loader: 'vue-loader'
         }
       ]
     },
     plugins: [
       new VueLoaderPlugin()
     ]
   })
   .version();