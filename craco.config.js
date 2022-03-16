const CracoLessPlugin = require('craco-less')
const RewireBabelLoader = require('craco-babel-loader')
const path = require('path')
const pathResolve = (pathUrl) => path.join(__dirname, pathUrl)
module.exports = {
    webpack: {
        alias: {
            '@': pathResolve('src'),
            '@tangle-pay/common': 'tanglepay/lib/browser/common',
            '@tangle-pay/store': 'tanglepay/lib/browser/store',
            '@tangle-pay/assets': 'tanglepay/lib/browser/assets'
        },
        configure: (config) => {
            config.devtool = false
            config.output = {
                ...config.output,
                filename: 'app.js'
            }
            return config
        }
    },
    plugins: [
        { plugin: CracoLessPlugin },
        {
            plugin: RewireBabelLoader,
            options: {
                includes: [pathResolve('node_modules/tanglepay')]
            }
        }
    ]
}
