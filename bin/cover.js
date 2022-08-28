const fs = require('fs')
const path = require('path')
const temPath = path.join(__dirname, './template/iota-next-index-browser.js')
const toPath = path.join(__dirname, '../node_modules/@iota/iota.js-next/dist/cjs/index-browser.js')
fs.copyFileSync(temPath, toPath)

const temIotaPPath = path.join(__dirname, './template/iota-package.json')
const toIotaPPath = path.join(__dirname, '../node_modules/@iota/iota.js/package.json')
fs.copyFileSync(temIotaPPath, toIotaPPath)

const temIotaNextPPath = path.join(__dirname, './template/iota-next-package.json')
const toIotaNextPPath = path.join(__dirname, '../node_modules/@iota/iota.js-next/package.json')
fs.copyFileSync(temIotaNextPPath, toIotaNextPPath)
