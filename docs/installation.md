# Installation Guide

Get Talon running in production or development in under 5 minutes.

## 🚀 Quick Deploy (Recommended)

### Deploy to Render

The fastest way to get Talon running with full LanceDB support:

[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy?repo=https://github.com/KaiOpenClaw/talon-private)

1. **Click the Deploy button** above
2. **Connect GitHub** - Authorize Render to access the repository
3. **Configure Environment** - Set your OpenClaw gateway details (see below)
4. **Deploy** - Render automatically builds and deploys

**Deployment time: ~3 minutes**

---

## 🔧 Environment Variables

### Required
```env
# OpenClaw Gateway Connection
GATEWAY_URL=https://your-gateway.example.com:5050
GATEWAY_TOKEN=your_gateway_auth_token
```

### Recommended  
```env  
# OpenAI for Semantic Search
OPENAI_API_KEY=sk-your_openai_api_key_here
```

### Optional
```env
# Talon API for Workspace Data
TALON_API_URL=https://your-talon-api.example.com
TALON_API_TOKEN=your_talon_api_token

# LanceDB Storage Path (Render auto-configures)
LANCEDB_PATH=/opt/render/project/.lancedb

# Node Environment
NODE_ENV=production
```

---

## 💻 Local Development

### Prerequisites
- **Node.js 18+** - [Download](https://nodejs.org/)
- **npm or yarn** - Comes with Node.js
- **OpenClaw Gateway** - Running and accessible

### Setup Steps

1. **Clone the repository**
   ```bash
   git clone https://github.com/KaiOpenClaw/talon-private
   cd talon-private
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment**
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your settings
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

5. **Open browser**
   ```
   http://localhost:4000
   ```

---

## 🐳 Docker Deployment

### Using Docker Compose

```yaml
# docker-compose.yml
version: '3.8'
services:
  talon:
    image: node:18-alpine
    ports:
      - "4000:4000"
    environment:
      - GATEWAY_URL=https://your-gateway.com:5050
      - GATEWAY_TOKEN=your_token
      - OPENAI_API_KEY=your_openai_key
    volumes:
      - .:/app
      - /app/node_modules
    working_dir: /app
    command: |
      sh -c "npm install && npm run build && npm start"
```

Run:
```bash
docker-compose up -d
```

### Building Custom Image

```dockerfile
# Dockerfile
FROM node:18-alpine

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 4000
CMD ["npm", "start"]
```

Build and run:
```bash
docker build -t talon .
docker run -p 4000:4000 \
  -e GATEWAY_URL=https://your-gateway.com:5050 \
  -e GATEWAY_TOKEN=your_token \
  talon
```

---

## ☁️ Cloud Deployments

### Vercel (Limited - No LanceDB)

**Note:** Vercel's serverless functions don't support native modules like LanceDB. Vector search will be disabled.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/KaiOpenClaw/talon-private)

1. Click deploy button
2. Set environment variables in Vercel dashboard
3. Deploy automatically

### Railway

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login and deploy
railway login
railway link
railway up
```

### AWS/GCP/Azure

Use the Docker deployment method with your cloud container service:
- **AWS ECS** - Use the Dockerfile above
- **Google Cloud Run** - Native container support
- **Azure Container Instances** - Simple container deployment

---

## 🔧 Gateway Configuration

### OpenClaw Gateway Setup

Talon requires an OpenClaw gateway to be running and accessible. The gateway needs:

1. **HTTP API enabled** on port 5050 (or custom)
2. **Authentication token** configured
3. **Network accessibility** from Talon deployment

### Tailscale Funnel (Recommended)

If your gateway is behind a firewall, use Tailscale Funnel:

```bash
# On your OpenClaw server
tailscale funnel 5050
```

This creates a public HTTPS URL like:
```
https://machine-name.tail-scale-domain.ts.net:5050
```

Use this as your `GATEWAY_URL`.

### Local Gateway

For development with a local gateway:

```bash
# In your OpenClaw directory
openclaw gateway
# Gateway starts on http://localhost:5050
```

Set:
```env
GATEWAY_URL=http://localhost:5050
```

---

## 📊 Verification

### Health Check

After deployment, verify Talon is working:

1. **Visit your deployment URL**
2. **Check System Status page** - Should show green indicators
3. **Test agent connections** - Agents should appear in sidebar
4. **Verify API endpoints** - Visit `/api/health`

### Troubleshooting

**Common issues:**

- **Gateway connection refused** - Check GATEWAY_URL and network access
- **Authentication failed** - Verify GATEWAY_TOKEN is correct
- **LanceDB errors** - Ensure deployment supports native modules (Render ✅, Vercel ❌)
- **Missing agents** - Check Talon API connection or gateway agent discovery

See [Troubleshooting Guide](troubleshooting.md) for detailed solutions.

---

## 🚀 Next Steps

1. **[Configure your dashboards](configuration.md)**
2. **[Set up semantic search](semantic-search.md)**  
3. **[Customize the interface](customization.md)**
4. **[Enable team access](team-setup.md)**

---

**Need help?** Join our [Discord](https://discord.gg/openclaw) or [open an issue](https://github.com/KaiOpenClaw/talon-private/issues).