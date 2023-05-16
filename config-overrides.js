const {
    override,
    addWebpackResolve,
    addWebpackAlias,
    addWebpackPlugin,
    addWebpackModuleRule
} = require('customize-cra')
const Dotenv = require('dotenv-webpack')
const addLessLoader = require('customize-cra-less-loader')
const path = require('path')
const webpack = require('webpack')

module.exports = override(
    addWebpackResolve({
        // extensions: ['.wasm', '.mjs', '.js', '.json', '.jsx'],

        fallback: {
            stream: require.resolve('stream-browserify'),
            crypto: require.resolve('crypto-browserify'),
            http: require.resolve('stream-http'),
            https: require.resolve('https-browserify'),
            assert: require.resolve('assert'),
            url: require.resolve('url'),
            buffer: require.resolve('buffer'),
            path: require.resolve('path-browserify')
        }
    }),
    addWebpackAlias({
        '@': path.resolve(__dirname, 'src'),
        '@tangle-pay/common': 'tanglepay/lib/browser/common',
        '@tangle-pay/store': 'tanglepay/lib/browser/store',
        '@tangle-pay/assets': 'tanglepay/lib/browser/assets',
        '@tangle-pay/domain': 'tanglepay/lib/browser/domain',
        //'@tangle-pay/viewmodel': 'tanglepay/lib/browser/viewmodel'
    }),
    addLessLoader({
        lessLoaderOptions: {
            lessOptions: {
                javascriptEnabled: true
            }
        }
    }),
    // addWebpackModuleRule({
    //     test: [/\.m?js$/, /\.jsx$/],
    //     use: {
    //         loader: 'babel-loader'
    //     }
    // }),
    // addWebpackModuleRule({
    //     test: /\.m?js$/,
    //     resolve: {
    //         fullySpecified: false
    //     }
    // }),
    addWebpackPlugin(
        new webpack.ProvidePlugin({
            Buffer: ['buffer', 'Buffer'],
            process: 'process/browser'
        })
    ),
    addWebpackPlugin(new Dotenv())
)
