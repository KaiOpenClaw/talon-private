/** @type {import('next').NextConfig} */
const nextConfig = {
  // Base path for deployment behind /talon
  basePath: process.env.BASE_PATH || '',
  
  // Mark LanceDB as external to avoid bundling native modules
  experimental: {
    serverComponentsExternalPackages: ['@lancedb/lancedb'],
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
