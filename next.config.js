/** @type {import('next').NextConfig} */
const nextConfig = {
  // Base path for deployment behind /talon
  basePath: process.env.BASE_PATH || '',
  
  // Mark LanceDB as external to avoid bundling native modules  
  // Updated for Next.js 16 - moved from experimental to serverExternalPackages
  serverExternalPackages: ['@lancedb/lancedb'],
  
  // Safe build optimization settings  
  productionBrowserSourceMaps: false,
  poweredByHeader: false,
  
  // Configure Turbopack (Next.js 16 default)
  turbopack: {
    // Empty config to silence warnings - many apps work fine with default Turbopack
  },
  
  webpack: (config, { isServer }) => {
    if (isServer) {
      // Handle native modules
      config.externals = [...(config.externals || []), '@lancedb/lancedb']
    }
    return config
  },
}

module.exports = nextConfig
