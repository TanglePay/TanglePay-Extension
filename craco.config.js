const CracoLessPlugin = require('craco-less')
const path = require('path')
const pathResolve = (pathUrl) => path.join(__dirname, pathUrl)

module.exports = {
    webpack: {
        alias: {
            '@': pathResolve('src')
        }
        // publicPath: process.env.NODE_ENV === 'production' ? './' : ''
    },
    plugins: [{ plugin: CracoLessPlugin }]
}
