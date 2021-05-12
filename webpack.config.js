const path = require("path");
var webpack = require('webpack');
const autoprefixer = require('autoprefixer');

new webpack.ProvidePlugin({
    $: 'jquery',
    jQuery: 'jquery',
});

module.exports = {
    watch: true,
    mode: 'development',
    entry: {
        index: "./src/webpack/index.js",
        index_style: "./src/webpack/index.scss",
        checkin: "./src/webpack/checkin.js",
        checkin_style: "./src/webpack/checkin.scss",
        strecke: "./src/webpack/strecke.js",
        strecke_style: "./src/webpack/strecke.scss",
        management: "./src/webpack/management.js",
        management_style: "./src/webpack/management.scss",
        apotheke: "./src/webpack/apotheke.js",
        apotheke_style: "./src/webpack/apotheke.scss",
        list: "./src/webpack/list.js",
        list_style: "./src/webpack/list.scss",
        settings: "./src/webpack/settings.js",
        settings_style: "./src/webpack/settings.scss",
        statistics: "./src/webpack/statistics.js",
        statistics_style: "./src/webpack/statistics.scss",
    },
    output: {
        path: path.join(__dirname, "./src/dist"),
        filename: "[name].js"
    },
    module: {
        rules: [
            {
                test: /\.scss$/,
                use: [
                    {
                        loader: 'file-loader',
                        options: {
                            name: '[name].css',
                        },
                    },
                    { loader: 'extract-loader' },
                    { loader: 'css-loader' },
                    {
                        loader: 'postcss-loader',
                        options: {
                            postcssOptions: {
                                plugins: [
                                    autoprefixer()
                                ]
                            }
                        }
                    },
                    {
                        loader: 'sass-loader',
                        options: {
                            // Prefer Dart Sass
                            implementation: require('sass'),

                            // See https://github.com/webpack-contrib/sass-loader/issues/804
                            webpackImporter: false,
                            sassOptions: {
                                includePaths: ['./node_modules']
                            },
                        }
                    },
                ]
            },
            {
                test: /\.css$/,
                use: ['style-loader', 'css-loader']
            },
            {
                test: /\.(woff(2)?|ttf|eot|svg)(\?v=\d+\.\d+\.\d+)?$/,
                use: [
                    {
                        loader: 'file-loader',
                        options: {
                            name: '[name].[ext]',
                            outputPath: 'fonts/'
                        }
                    }
                ]
            }
        ]
    },
};