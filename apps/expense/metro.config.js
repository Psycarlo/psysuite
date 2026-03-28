// oxlint-disable unicorn/prefer-module -- Metro config must use CommonJS; ESM is not supported by Metro
const { getDefaultConfig } = require('expo/metro-config')
const { withUniwindConfig } = require('uniwind/metro')

const config = getDefaultConfig(__dirname)

module.exports = withUniwindConfig(config, {
  cssEntryFile: './node_modules/@psysuite/ui-mobile/src/global.css',
  dtsFile: './uniwind-types.d.ts'
})
