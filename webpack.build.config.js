const webpack = require('webpack');
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CspHtmlWebpackPlugin = require("csp-html-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

module.exports = {
  entry: './frontend/index.js',
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "bundle.js",
    publicPath: "./",
  },
  devtool: "nosources-source-map",
  module: {
    rules: [
      {
        test: /\.(scss)$/,
        use: [
          {
            loader: 'style-loader', // inject CSS to page
          },
          {
            loader: 'css-loader', // translates CSS into CommonJS modules
          },
          {
            loader: 'postcss-loader', // Run postcss actions
            options: {
              plugins() {
                // postcss plugins, can be exported to postcss.config.js
                return [require('autoprefixer')];
              },
            },
          },
          {
            loader: 'sass-loader', // compiles Sass to CSS
          },
        ],
      },
      {
        test: /\.jsx?/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env', '@babel/preset-react'],
          },
        },
      },
      {
        test: /\.ts(x)?$/,
        exclude: /node_modules/,
        loader: 'ts-loader',
      },
    ],
  },
  resolve: {
    // Enable importing JS / JSX files without specifying their extension
    modules: [path.resolve(__dirname, 'node_modules')],
    extensions: ['.js', '.jsx', '.json', '.scss', '.less', '.css', '.tsx', '.ts'],
  },
  target: 'electron-renderer',
  plugins: [
    new HtmlWebpackPlugin({
      // template: './frontend/index.html',
      filename: "index.html",
      title: "SeeQR",
      cspPlugin: {
        enabled: true,
        policy: {
          "base-uri": "'self'",
          "object-src": "'none'",
          "script-src": ["'self'"],
          "style-src": ["'self'"],
        },
        hashEnabled: {
          "script-src": true,
          "style-src": true,
        },
        nonceEnabled: {
          "script-src": true,
          "style-src": true,
        },
      },
    }),
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify('production'),
    }),
  ],
};
