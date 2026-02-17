# Talon - OpenClaw Mission Control Dashboard
# Multi-stage build for production deployment

# Build stage
FROM node:18-alpine AS builder

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci --only=production

# Copy source and build
COPY . .
RUN npm run build

# Production stage
FROM node:18-alpine AS runner

WORKDIR /app

# Add non-root user for security
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy built application
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

# Create LanceDB directory
RUN mkdir -p .lancedb
RUN chown -R nextjs:nodejs .lancedb

# Set permissions
RUN chown -R nextjs:nodejs /app

USER nextjs

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:${PORT:-4000}/api/health || exit 1

# Expose port
EXPOSE ${PORT:-4000}

# Start application
CMD ["npm", "start"]