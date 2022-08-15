const fs = require('fs')
const path = require('path')
const temPath = path.join(__dirname, './template/iota-next-index-browser.js')
const toPath = path.join(__dirname, '../node_modules/@iota/iota.js-next/dist/cjs/index-browser.js')

fs.copyFileSync(temPath, toPath)
