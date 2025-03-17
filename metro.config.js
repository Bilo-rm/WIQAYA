// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Add custom resolver configuration
config.resolver = {
  ...config.resolver, // Preserve existing resolver settings
  unstable_enableBridgeless: false, // Disable Bridgeless mode
};

module.exports = config;