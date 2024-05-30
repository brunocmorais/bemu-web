const path = require('path');
const { merge } = require('webpack-merge');
const prd = require("./webpack.prd.config.cjs");

module.exports = merge(prd, {
  optimization: {
    minimize: false
  },
  devtool: 'inline-source-map',
  mode: 'development',
  devServer: {
    static: path.join(__dirname, "build"),
    compress: false,
    port: 3000,
    hot: false,
    client: {
      overlay: false
    }
  },
});