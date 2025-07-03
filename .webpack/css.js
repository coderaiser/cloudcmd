'use strict';

const {env} = require('node:process')

const OptimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

const isDev = env.NODE_ENV === 'development';

const clean = (a) => a.filter(Boolean);

const plugins = clean([
  new MiniCssExtractPlugin({
      filename: '[name].css',
  }),
    !isDev && new OptimizeCssAssetsPlugin(),
]);

const rules = [{
    test: /\.css$/i,
    use: [MiniCssExtractPlugin.loader, {
        loader: "css-loader",
        options: {
            url: true, 
        },
    }],
  }, {
    test: /\.(png|gif|svg|woff|woff2|eot|ttf)$/,
    type: 'asset/inline',
}]


module.exports = {
    plugins,
  module: {
      rules,
  },
};

