# Talon Deployment Guide

## Render Deployment (Recommended)

Render supports native modules required for LanceDB vector search.

### 1. Create Render Web Service

1. Go to https://render.com/new
2. Select "Connect a repository" 
3. Choose `KaiOpenClaw/talon-private`
4. Configure service:
   - **Name:** `talon`
   - **Region:** Oregon (or closest to your users)
   - **Branch:** `main` 
   - **Root Directory:** Leave blank
   - **Runtime:** Node
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** `npm run start`
   - **Plan:** Starter ($7/month) - Required for native modules

### 2. Environment Variables

Add these in Render dashboard → Environment tab:

```env
# Core Configuration
NODE_ENV=production
PORT=10000

# OpenClaw Gateway Connection
GATEWAY_URL=https://srv1325349.tail657eaf.ts.net:5050
GATEWAY_TOKEN=[your-gateway-token-from-openclaw-config]

# Talon API (Agent Workspaces)
TALON_API_URL=https://institutions-indicating-limit-were.trycloudflare.com
TALON_API_TOKEN=talon-7k9m2x4pqr8w

# Semantic Search (LanceDB + OpenAI)
OPENAI_API_KEY=sk-proj-[your-key-here]

# Authentication
TALON_AUTH_TOKEN=[generate-secure-token]

# LanceDB Storage
LANCEDB_PATH=/opt/render/project/.lancedb
```

### 3. Deploy

1. Click **Create Web Service**
2. Monitor build logs for any errors
3. First deploy takes ~5-10 minutes
4. Service auto-deploys on every push to `main`

### 4. Post-Deploy Testing

Once deployed, verify:

- [ ] **Dashboard loads** at your-service.render.com
- [ ] **Authentication works** (login page if `TALON_AUTH_TOKEN` set)
- [ ] **Agent list** shows all 27 agents
- [ ] **Gateway connection** works (session data loads)
- [ ] **Semantic search** indexes and searches correctly
- [ ] **WebSocket updates** work (real-time dashboard updates)

### 5. Domain Configuration (Optional)

1. In Render → Settings → Custom Domains
2. Add your domain (e.g., `talon.yourdomain.com`)
3. Configure DNS CNAME to point to your Render service

## Alternative Deployments

### Vercel (Limited)
- ❌ **No LanceDB support** (native modules not supported)
- ✅ **Fast edge deployment** 
- ✅ **Free tier available**

```bash
npx vercel --prod
```

### Docker (Self-Hosted)

```bash
# Build
docker build -t talon .

# Run with environment variables
docker run -p 4000:4000 \
  -e GATEWAY_URL=https://srv1325349.tail657eaf.ts.net:5050 \
  -e GATEWAY_TOKEN=your-token \
  -e TALON_API_URL=your-api-url \
  -e TALON_API_TOKEN=your-api-token \
  -e OPENAI_API_KEY=your-openai-key \
  talon
```

## Troubleshooting

### Build Failures

**Native Module Issues:**
- Ensure you're using Render Starter plan or higher
- LanceDB requires native compilation support

**Memory Issues:**
- Next.js builds can use significant memory
- Render Starter (512MB) should be sufficient
- Consider upgrading to Standard if builds fail

### Runtime Issues

**Gateway Connection Failed:**
- Verify `GATEWAY_URL` is accessible
- Check `GATEWAY_TOKEN` is valid
- Ensure OpenClaw gateway is running

**API Errors:**
- Verify `TALON_API_URL` is accessible from Render
- Check `TALON_API_TOKEN` matches server configuration
- Cloudflare tunnels may need regeneration

**Search Not Working:**
- Verify `OPENAI_API_KEY` is valid and has credits
- Check LanceDB writes to `/opt/render/project/.lancedb`
- Re-index if database is empty

### Health Checks

Render monitors `/api/health` endpoint:

```bash
curl https://your-service.render.com/api/health
# Should return: {"status": "ok", "timestamp": "..."}
```

## Production Monitoring

### Render Dashboard
- **Logs:** Real-time application logs
- **Metrics:** CPU, Memory, Request volume
- **Deployments:** Build history and rollbacks

### Application Health
- **System Status:** `/system` - Dashboard health
- **API Status:** `/api/system/health` - Detailed system info
- **WebSocket Status:** Real-time connection indicator

## Security

### Authentication
- Set strong `TALON_AUTH_TOKEN` for production access
- Tokens stored in httpOnly cookies (7-day expiry)
- Middleware protects all dashboard routes

### API Security  
- Gateway API requires valid Bearer token
- Talon API requires API token authentication
- Rate limiting on expensive operations (search, spawn)

## Performance Optimizations

### Caching
- In-memory cache with TTL for API responses
- Stale-while-revalidate for fast UX
- Configurable cache TTL per data type

### Network
- WebSocket for real-time updates (falls back to polling)
- API request deduplication
- Optimized bundle sizes (<112KB main page)

### Search Performance
- LanceDB vector search optimized for <100ms queries
- Embedding cache to reduce OpenAI API calls
- Async indexing for large workspaces

## Architecture

```
┌─────────────────────────────────────────┐
│         Render (talon.render.com)       │
│  ┌─────────────────────────────────┐    │
│  │  Next.js 14 App                 │    │
│  │  ├── /api/agents                │    │
│  │  ├── /api/search (LanceDB)      │    │  
│  │  ├── /api/sessions              │    │
│  │  ├── /api/ws (WebSocket)        │    │
│  │  └── Dashboard Components       │    │
│  └─────────────────────────────────┘    │
└─────────────────────────────────────────┘
                    │ HTTPS
                    ▼
┌─────────────────────────────────────────┐
│   OpenClaw Gateway (srv1325349:5050)    │
│   ├── Sessions API                      │
│   ├── Agent orchestration               │
│   └── Message routing                   │
└─────────────────────────────────────────┘
                    │
                    ▼  
┌─────────────────────────────────────────┐
│    Talon API (via Cloudflare Tunnel)    │
│   ├── Agent workspace data              │
│   └── Memory file management            │
└─────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────┐
│         /root/clawd/agents/*            │
│   ├── 27 Agent workspaces               │
│   ├── MEMORY.md, SOUL.md files          │
│   └── Session transcripts               │
└─────────────────────────────────────────┘
```

## Support

- **GitHub Issues:** https://github.com/KaiOpenClaw/talon-private/issues
- **Discord:** #talon-support
- **Documentation:** README.md, CHANGELOG.md