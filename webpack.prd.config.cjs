const path = require('path');
const CopyPlugin = require("copy-webpack-plugin");

module.exports = {
  optimization: {
    minimize: true,
    
  },
  plugins: [
    new CopyPlugin({
      patterns: [
        { from: "assets" }
      ],
    }),
  ],
  entry: './src/App.ts',
  mode: 'production',
  module: {
    rules: [
      {
        test: /\.ts?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.jsx', '.js'],
  },
  output: {
    filename: 'index.js',
    path: path.resolve(__dirname, 'build'),
  }
};