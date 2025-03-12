const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');

const config = getDefaultConfig(__dirname, {
  // Add this to allow @env to work
  projectRoot: __dirname,
  watchFolders: [__dirname],
});

module.exports = withNativeWind(config, { input: './global.css' });
