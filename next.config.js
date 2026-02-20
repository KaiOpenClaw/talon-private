/** @type {import('next').NextConfig} */
const nextConfig = {
  // Base path for deployment behind /talon
  basePath: process.env.BASE_PATH || '',
  
  // Mark LanceDB as external to avoid bundling native modules  
  // Updated for Next.js 16 - moved from experimental to serverExternalPackages
  serverExternalPackages: ['@lancedb/lancedb'],
  
  // Enhanced build optimization settings for Issue #284
  productionBrowserSourceMaps: false,
  poweredByHeader: false,
  
  // TypeScript incremental compilation for faster builds
  typescript: {
    tsconfigPath: './tsconfig.json',
  },
  
  // Build performance optimizations
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  
  // Configure Turbopack with optimizations
  turbopack: {
    // Optimize module resolution and caching
    resolveAlias: {
      '@': './src',
      '@/components': './src/components',
      '@/lib': './src/lib',
      '@/app': './src/app',
    },
  },
  
  webpack: (config, { isServer, dev }) => {
    if (isServer) {
      // Handle native modules
      config.externals = [...(config.externals || []), '@lancedb/lancedb']
    }
    
    // Build performance optimizations
    if (!dev) {
      config.optimization = {
        ...config.optimization,
        moduleIds: 'deterministic',
        splitChunks: {
          chunks: 'all',
          cacheGroups: {
            vendor: {
              test: /[\\/]node_modules[\\/]/,
              name: 'vendors',
              chunks: 'all',
            },
          },
        },
      }
    }
    
    return config
  },
}

module.exports = nextConfig
