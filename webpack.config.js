const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ReactRefreshWebpackPlugin = require('@pmmmwh/react-refresh-webpack-plugin');
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');

const isDevelopment = process.env.NODE_ENV !== 'production';

module.exports = {
  entry: './frontend/index.tsx',
  mode: isDevelopment ? 'development' : 'production',
  devtool: 'eval-cheap-module-source-map',
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist'),
  },
  module: {
    rules: [
      {
        test: /\.s?css$/,
        use: [
          'style-loader', // inject CSS to page
          'css-loader', // translates CSS into CommonJS modules
          'sass-loader', // compiles Sass to CSS
          {
            loader: 'postcss-loader', // Run postcss actions
            options: {
              postcssOptions: {
                plugins() {
                  'autoprefixer';
                },
              },
            },
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
            plugins: [
              isDevelopment && require.resolve('react-refresh/babel'),
            ].filter(Boolean),
          },
        },
      },
      {
        test: /\.ts(x)?$/,
        exclude: /node_modules/,
        loader: 'ts-loader',
        options: {
          // turn off type checking in loader. Type checking is done in parallel but forkts plugin
          transpileOnly: true,
        },
      },
      {
        test: /\.(jpg|jpeg|png|ttf|svg)$/,
        use: [
          {
            loader: 'file-loader',
          },
        ],
        exclude: /node_modules/,
      },
      {
        test: /\.(woff(2)?|ttf|eot|svg)(\?v=\d+\.\d+\.\d+)?$/,
        use: [
          {
            loader: 'file-loader',
            options: {
              name: '[name].[ext]',
              outputPath: 'fonts/',
            },
          },
        ],
      },
    ],
  },
  resolve: {
    // Enable importing JS / JSX files without specifying their extension
    modules: [path.resolve(__dirname, 'node_modules')],
    alias: {
      '@mytypes': path.resolve(__dirname, './shared/types/'),
      // ... any other path aliases ...
    },
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
    // contentBase: path.resolve(__dirname, '/tsCompiled/frontend'),
    static: path.resolve(__dirname, '/dist/'),
    host: 'localhost',
    port: '8080',
    hot: true,
    compress: true,
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
    new ForkTsCheckerWebpackPlugin({
      // // Lint files on error.  Uncomment for Hard Mode :)
      // eslint: {
      //   files: [
      //     './frontend/**/*.{ts,tsx,js,jsx}',
      //     './backend/**/*.{ts,tsx,js,jsx}',
      //   ],
      // },
    }),
    isDevelopment && new ReactRefreshWebpackPlugin(),
  ].filter(Boolean),
  externals: {
    '@mytypes/dbTypes': 'commonjs @mytypes/dbTypes',
  },
};
