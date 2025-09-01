const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Configuración mínima para evitar problemas de bundling
config.resolver.assetExts.push('cjs');

module.exports = config;