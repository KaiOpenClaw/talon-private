# Environment Configuration - Talon

This document describes all environment variables required and optional for Talon.

## 🔐 Security Model

Talon uses a **centralized configuration system** with proper security isolation:

- **Server-side only variables**: Never exposed to the client (API keys, tokens, URLs)
- **Client-side safe variables**: Only non-sensitive data exposed to browser
- **Schema validation**: All variables validated using Zod schemas
- **Type safety**: Compile-time type checking for all configuration

## Required Environment Variables

### OpenClaw Gateway Connection

```bash
# Gateway API URL (never exposed to client)
GATEWAY_URL=https://your-gateway.domain.com:5050

# Gateway authentication token (never exposed to client)  
GATEWAY_TOKEN=your_gateway_auth_token_here
```

**⚠️ Critical Security Notes:**
- These are **server-side only** and never sent to the browser
- The WebSocket URL is dynamically constructed to avoid client exposure
- Never use `NEXT_PUBLIC_` prefix for gateway configuration

## Optional Environment Variables

### Search & AI Features

```bash
# OpenAI API key for semantic search (server-side only)
OPENAI_API_KEY=sk-your_openai_key_here

# Enable LanceDB vector search (server-side only)
LANCEDB_ENABLED=true
```

### Talon API Bridge

```bash
# Talon API for workspace data (server-side only)
TALON_API_URL=https://your-talon-api.domain.com:4101
TALON_API_TOKEN=your_talon_api_token
```

### Authentication & Security

```bash
# Authentication token for login (server-side only)
TALON_AUTH_TOKEN=your_secure_auth_token_here

# Logging level (server-side only)
LOG_LEVEL=info  # debug | info | warn | error
```

### Runtime Configuration

```bash
# Node.js environment
NODE_ENV=production  # development | production | test
```

## Development vs Production

### Development (.env.local)

```bash
NODE_ENV=development
GATEWAY_URL=http://localhost:6820
GATEWAY_TOKEN=your_dev_token
TALON_API_URL=http://localhost:4101
TALON_API_TOKEN=your_dev_api_token
OPENAI_API_KEY=sk-your_key
LANCEDB_ENABLED=true
LOG_LEVEL=debug
```

### Production (Render/Vercel)

```bash
NODE_ENV=production
GATEWAY_URL=https://your-production-gateway.com:5050
GATEWAY_TOKEN=your_production_token
TALON_API_URL=https://your-production-api.com:4101
TALON_API_TOKEN=your_production_api_token
OPENAI_API_KEY=sk-your_production_key
LANCEDB_ENABLED=true
TALON_AUTH_TOKEN=your_secure_production_auth_token
LOG_LEVEL=info
```

## Security Features

### 🔒 Environment Variable Protection

1. **No Client Exposure**: Gateway URLs, tokens, and API keys never reach the browser
2. **Schema Validation**: Zod schemas validate all configuration at startup
3. **Type Safety**: TypeScript types prevent configuration errors
4. **Centralized Access**: All environment variables accessed through `@/lib/config`

### 🚫 What NOT to do

```bash
# ❌ NEVER USE - Exposes sensitive data to client
NEXT_PUBLIC_GATEWAY_URL=https://gateway.com
NEXT_PUBLIC_GATEWAY_TOKEN=secret_token

# ❌ NEVER DO - Direct process.env access in components
const token = process.env.GATEWAY_TOKEN
```

### ✅ Secure Configuration Access

```typescript
// ✅ Server-side (API routes, server components)
import { env } from '@/lib/config'
const gatewayUrl = env.server.GATEWAY_URL

// ✅ Client-side (components) - only safe variables
import { env } from '@/lib/config'  
const isDev = env.isDevelopment()
```

## WebSocket Security

The WebSocket URL is **dynamically constructed** to avoid exposing internal gateway endpoints:

- **Development**: `ws://localhost:6820/ws`
- **Production**: Constructed from current hostname using secure protocols

This approach prevents exposing internal infrastructure details to the client.

## Validation & Error Handling

The configuration system provides detailed error messages for missing variables:

```bash
❌ Environment Configuration Error:

Missing required environment variables: GATEWAY_TOKEN

Please check your .env.local file and ensure all required variables are set.
For detailed setup instructions, see the README.md file.
```

## Configuration Schema

See `src/lib/config.ts` for the complete Zod schema definitions and validation logic.

## Migration from Old System

If you have existing code using direct `process.env` access:

### Before (Insecure)
```typescript
const GATEWAY_URL = process.env.NEXT_PUBLIC_GATEWAY_URL || 'localhost'
const TOKEN = process.env.GATEWAY_TOKEN || ''
```

### After (Secure)
```typescript
import { env } from '@/lib/config'
const GATEWAY_URL = env.server.GATEWAY_URL  // Server-side only
const TOKEN = env.server.GATEWAY_TOKEN      // Server-side only
```

## Troubleshooting

### Build Failures
- Ensure all required variables are set in your environment
- Check Zod schema validation errors in build output
- Verify no typos in variable names

### Runtime Issues  
- Check browser network tab for failed API calls
- Verify gateway connectivity from server environment
- Review structured logs for configuration errors

### Security Issues
- Never commit `.env.local` files to version control
- Use different tokens/URLs for development vs production
- Regularly rotate authentication tokens

---

**🔐 Security First**: This configuration system prioritizes security by preventing accidental exposure of sensitive data to client-side code while maintaining developer experience and type safety.