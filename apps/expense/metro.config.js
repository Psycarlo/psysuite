// oxlint-disable unicorn/prefer-module, typescript-eslint/no-unsafe-call, typescript-eslint/no-unsafe-argument -- Metro config must use CommonJS
const { getDefaultConfig } = require('expo/metro-config')
const { withUniwindConfig } = require('uniwind/metro')

const config = getDefaultConfig(__dirname)

module.exports = withUniwindConfig(config, {
  cssEntryFile: './global.css',
  dtsFile: './uniwind-types.d.ts'
})
