const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');

module.exports = (env, argv) => {
  const isProduction = argv.mode === 'production';

  return {
    entry: {
      app: ['./assets/js/app.js', './assets/scss/app.scss']
    },
    output: {
      path: path.resolve(__dirname, 'dist'),
      filename: isProduction ? 'app.[contenthash].js' : 'app.js',
      assetModuleFilename: 'img/[name][ext]'
    },
    resolve: {
      modules: [path.resolve(__dirname, 'node_modules'), 'node_modules']
    },
    module: {
      rules: [
        {
          test: /\.scss$/,
          use: [
            MiniCssExtractPlugin.loader,
            'css-loader',
            {
              loader: 'sass-loader',
              options: {
                api: 'modern',
                sassOptions: {
                  includePaths: [path.resolve(__dirname, 'node_modules')]
                }
              }
            }
          ]
        },
        {
          test: /\.(png|jpg|jpeg|gif|svg)$/,
          type: 'asset/resource',
          generator: {
            filename: 'img/[name][ext]'
          }
        },
        {
          test: /\.(woff|woff2|eot|ttf|otf)$/,
          type: 'asset/resource',
          generator: {
            filename: 'fonts/[name][ext]'
          }
        }
      ]
    },
    plugins: [
      new CleanWebpackPlugin(),
      new MiniCssExtractPlugin({
        filename: isProduction ? 'app.[contenthash].css' : 'app.css'
      })
    ],
    devtool: isProduction ? false : 'source-map',
    watch: false
  };
}; 