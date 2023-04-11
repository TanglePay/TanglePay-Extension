const fs = require('fs')
const path = require('path')
const temPath = path.join(__dirname, './template/iota-next-index-browser.js')
const toPath = path.join(__dirname, '../node_modules/@iota/iota.js-next/dist/cjs/index-browser.js')
fs.copyFileSync(temPath, toPath)

const temIotaPath = path.join(__dirname, './template/iota-index-browser.js')
const toIotaPath = path.join(__dirname, '../node_modules/@iota/iota.js/dist/cjs/index-browser.js')
fs.copyFileSync(temIotaPath, toIotaPath)

const temIotaPPath = path.join(__dirname, './template/iota-package.json')
const toIotaPPath = path.join(__dirname, '../node_modules/@iota/iota.js/package.json')
fs.copyFileSync(temIotaPPath, toIotaPPath)

const temIotaNextPPath = path.join(__dirname, './template/iota-next-package.json')
const toIotaNextPPath = path.join(__dirname, '../node_modules/@iota/iota.js-next/package.json')
fs.copyFileSync(temIotaNextPPath, toIotaNextPPath)

const temMqttNextPath = path.join(__dirname, './template/mqtt-next-index-browser.js')
const toMqttNextPath = path.join(__dirname, '../node_modules/@iota/mqtt.js-next/dist/cjs/index-browser.js')
fs.copyFileSync(temMqttNextPath, toMqttNextPath)

const temMqttPPath = path.join(__dirname, './template/mqtt-package.json')
const toMqttPPath = path.join(__dirname, '../node_modules/@iota/mqtt.js/package.json')
fs.copyFileSync(temMqttPPath, toMqttPPath)

const temMqttNextPPath = path.join(__dirname, './template/mqtt-next-package.json')
const toMqttNextPPath = path.join(__dirname, '../node_modules/@iota/mqtt.js-next/package.json')
fs.copyFileSync(temMqttNextPPath, toMqttNextPPath)
