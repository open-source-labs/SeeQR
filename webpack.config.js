const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { spawn } = require('child_process');

module.exports = {
  entry: './frontend/index.tsx',
  mode: process.env.NODE_ENV,
  devtool: 'eval-source-map',
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist'),
  },
  module: {
    rules: [
      {
        test: /\.s?css$/,
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
      {
        test: /\.(jpg|jpeg|png|ttf|svg)$/,
        use: [
          'file-loader',
          {
            loader: 'image-webpack-loader',
            options: {
              mozjpeg: {
                quality: 10,
              },
            },
          },
        ],
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    // Enable importing JS / JSX files without specifying their extension
    modules: [path.resolve(__dirname, 'node_modules')],
    extensions: [
      '.js',
      '.jsx',
      '.json',
      '.scss',
      '.less',
      '.css',
      '.tsx',
      '.ts',
    ],
  },
  target: 'electron-renderer',
  devServer: {
    contentBase: path.resolve(__dirname, '/tsCompiled/frontend'),
    host: 'localhost',
    port: '8080',
    hot: true,
    compress: true,
    watchContentBase: true,
    watchOptions: {
      ignored: /node_modules/,
    },
    before() {
      spawn('electron', ['.', 'dev'], {
        shell: true,
        env: process.env,
        stdio: 'inherit',
      })
        .on('close', (code) => process.exit(0))
        .on('error', (spawnError) => console.error(spawnError));
    },
  },
  plugins: [
    new HtmlWebpackPlugin({
      filename: 'index.html',
      title: 'SeeQR',
      cspPlugin: {
        enabled: true,
        policy: {
          'base-uri': "'self'",
          'object-src': "'none'",
          'script-src': ["'self'"],
          'style-src': ["'self'"],
        },
        hashEnabled: {
          'script-src': true,
          'style-src': true,
        },
        nonceEnabled: {
          'script-src': true,
          'style-src': true,
        },
      },
    }),
  ],
};
