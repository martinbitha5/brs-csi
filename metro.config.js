// Learn more https://docs.expo.dev/guides/customizing-metro
const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');
const fs = require('fs');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Fonction de résolution personnalisée pour les packages Supabase
const defaultResolver = config.resolver.resolveRequest;

config.resolver = {
  ...config.resolver,
  // Ordre de résolution des champs dans package.json - 'main' en premier pour Supabase
  resolverMainFields: ['main', 'react-native', 'browser'],
  // Extensions de fichiers supportées
  sourceExts: [
    ...(config.resolver?.sourceExts || []),
    'mjs',
    'cjs',
  ],
  // Forcer la résolution des extensions .js pour les modules CommonJS
  unstable_enablePackageExports: false,
  // Résolution personnalisée pour les packages Supabase et polyfills Node.js
  resolveRequest: (context, realModuleName, platform, moduleName) => {
    const targetModule = realModuleName || moduleName;
    
    // Résolution spéciale pour @supabase/storage-js
    if (targetModule === '@supabase/storage-js') {
      const storageJsPath = path.resolve(
        __dirname,
        'node_modules',
        '@supabase',
        'storage-js',
        'dist',
        'main',
        'index.js'
      );
      if (fs.existsSync(storageJsPath)) {
        return {
          filePath: storageJsPath,
          type: 'sourceFile',
        };
      }
    }
    
    // Polyfill pour le module 'stream' (requis par papaparse)
    if (targetModule === 'stream') {
      const streamPath = path.resolve(
        __dirname,
        'node_modules',
        'stream-browserify',
        'index.js'
      );
      if (fs.existsSync(streamPath)) {
        return {
          filePath: streamPath,
          type: 'sourceFile',
        };
      }
    }
    
    // Utiliser la résolution par défaut pour les autres modules
    if (defaultResolver) {
      return defaultResolver(context, realModuleName, platform, moduleName);
    }
    // Fallback vers la résolution standard
    return context.resolveRequest(context, realModuleName, platform, moduleName);
  },
};

// Configuration du transformer pour mieux gérer les modules CommonJS et ES modules
config.transformer = {
  ...config.transformer,
  // Améliorer la gestion des imports dynamiques
  getTransformOptions: async () => ({
    transform: {
      experimentalImportSupport: true,
      inlineRequires: true,
    },
  }),
};

module.exports = config;

