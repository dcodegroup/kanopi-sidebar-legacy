let mix = require('laravel-mix');
mix.js('/src/index.js', '/build/')
   .setPublicPath('./')
   .vue()
   .sourceMaps()
   .webpackConfig({
     module: {
       rules: [
         {
           test: /\.js$/,
           use: {
             loader: 'babel-loader'
           }
         }
       ]
     },
     optimization: {
       minimize: false
     },
   })
   .version();