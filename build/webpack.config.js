"use strict";
var path = require("path");
var HtmlWebpackPlugin = require("html-webpack-plugin");
var spawn = require('child_process').spawn;
module.exports = {
    entry: "./frontend/index.tsx",
    mode: process.env.NODE_ENV,
    devtool: "eval-source-map",
    output: {
        filename: "bundle.js",
        path: path.resolve(__dirname, "dist"),
    },
    module: {
        rules: [
            {
                test: /\.s?css$/,
                use: [
                    {
                        loader: "style-loader",
                    },
                    {
                        loader: "css-loader",
                    },
                    {
                        loader: "postcss-loader",
                        options: {
                            plugins: function () {
                                // postcss plugins, can be exported to postcss.config.js
                                return [require("autoprefixer")];
                            },
                        },
                    },
                    {
                        loader: "sass-loader",
                    },
                ],
            },
            {
                test: /\.jsx?/,
                exclude: /node_modules/,
                use: {
                    loader: "babel-loader",
                    options: {
                        presets: ["@babel/preset-env", "@babel/preset-react"],
                    },
                },
            },
            {
                test: /\.ts(x)?$/,
                exclude: /node_modules/,
                loader: "ts-loader",
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
        extensions: ['.js', '.jsx', '.json', '.scss', '.less', '.css', '.tsx', '.ts'],
    },
    target: "electron-renderer",
    devServer: {
        contentBase: path.resolve(__dirname, "/build/frontend"),
        host: "localhost",
        port: "8080",
        hot: true,
        compress: true,
        watchContentBase: true,
        watchOptions: {
            ignored: /node_modules/,
        },
        before: function () {
            spawn('electron', ['.', 'dev'], {
                shell: true,
                env: process.env,
                stdio: 'inherit',
            })
                .on('close', function (code) { return process.exit(0); })
                .on('error', function (spawnError) { return console.error(spawnError); });
        },
    },
    plugins: [
        new HtmlWebpackPlugin({
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
    ],
};
//# sourceMappingURL=webpack.config.js.map