# Quick Start Guide

Get up and running with Talon in 5 minutes. This guide assumes you have an OpenClaw Gateway already running.

## 🚀 5-Minute Setup

### Step 1: Deploy to Render (Recommended)

[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy?repo=https://github.com/TerminalGravity/talon-private)

1. **Click Deploy** - Opens Render deployment dialog
2. **Connect GitHub** - Authorize Render to access the repository
3. **Name your service** - e.g., "talon-dashboard"
4. **Set environment variables** (see Step 2 below)
5. **Click Deploy** - Takes ~3 minutes to build and deploy

### Step 2: Configure Environment

In Render's environment variable section, add:

```env
# Required: OpenClaw Gateway Connection
GATEWAY_URL=https://your-gateway.example.com:5050
GATEWAY_TOKEN=your_gateway_auth_token

# Recommended: OpenAI for semantic search
OPENAI_API_KEY=sk-your_openai_api_key_here

# Optional: Authentication (generates random if not set)
TALON_AUTH_TOKEN=your_secure_random_token
```

**💡 Pro Tip:** If your gateway is behind a firewall, use Tailscale Funnel:
```bash
tailscale funnel 5050
# Creates: https://machine-name.tail-domain.ts.net:5050
```

### Step 3: Access Your Dashboard

1. **Open your deployment** - Render provides the URL after deployment
2. **Login** - Use the auth token from Step 2 (or auto-generated)
3. **Verify connection** - System Status should show green indicators

---

## ✅ First Steps Checklist

Once deployed, verify everything is working:

- [ ] **System Status** - All indicators green
- [ ] **Agents List** - Your OpenClaw agents appear in sidebar  
- [ ] **Chat Panel** - Send a test message to an agent
- [ ] **Memory Browser** - View agent workspace files
- [ ] **Search** - Try semantic search across your agent memories
- [ ] **Cron Jobs** - View your scheduled tasks
- [ ] **Skills** - Check available capabilities

---

## 🎯 Key Features Overview

### Mission Control Dashboard
Your command center for OpenClaw:
- **Agents Overview** - All 20+ agents with status indicators
- **Session Management** - Active conversations and history
- **System Health** - Gateway, skills, channels status
- **Cron Dashboard** - Monitor and control scheduled tasks

### Real-Time Chat Interface
Better than Discord:
- **Syntax highlighting** - Code blocks render beautifully
- **Full responses** - No message truncation
- **File attachments** - Upload and share files directly
- **Message history** - Complete conversation timeline

### Semantic Search
Find anything across all agent workspaces:
- **Vector search** - Powered by OpenAI embeddings
- **Agent filtering** - Search within specific agents
- **Smart results** - Ranked by relevance with context
- **Auto-indexing** - Keeps search current

### Memory & Workspace Management
Direct access to agent files:
- **File browser** - Navigate all workspace directories
- **Live editing** - Modify MEMORY.md and other files
- **Syntax highlighting** - Markdown, code, and logs
- **Auto-save** - Changes persist immediately

### Skills & Capabilities
Manage your OpenClaw capabilities:
- **49 skills available** - From coding to image generation
- **Dependency tracking** - See what's missing for each skill
- **One-click install** - Enable new capabilities instantly
- **Usage monitoring** - Track skill utilization

---

## 🔧 Common Configuration

### Enable Semantic Search

1. **Set OpenAI API key** in environment variables
2. **Index your workspaces**:
   ```bash
   curl -X POST https://your-talon.com/api/index \
     -H "Authorization: Bearer $GATEWAY_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{"force": true}'
   ```
3. **Wait for indexing** - Usually takes 1-2 minutes
4. **Test search** - Try searching for "deployment" or "cron jobs"

### Set Up Team Access

1. **Generate auth tokens** for each team member
2. **Share deployment URL** and their individual token
3. **Configure permissions** (coming in v0.9.0)

### Connect Additional Channels

Talon monitors your messaging channels:
- **Discord** - Multiple bot accounts supported
- **Telegram** - Bot API integration  
- **Slack** - Coming soon
- **Teams** - Coming soon

---

## 🐛 Troubleshooting

### Gateway Connection Issues

**Symptom:** Red indicators in System Status
```bash
# Test gateway connectivity
curl https://your-gateway.com:5050/api/health
```

**Solutions:**
- Verify `GATEWAY_URL` is correct and accessible
- Check `GATEWAY_TOKEN` matches your OpenClaw config
- Ensure firewall allows connections to port 5050
- Try Tailscale Funnel if behind NAT/firewall

### Search Not Working  

**Symptom:** Empty search results or "Search disabled"
1. **Set OpenAI API key** - Required for embeddings
2. **Trigger indexing** - POST to `/api/index`
3. **Check indexing logs** - View in System Status
4. **Verify permissions** - OpenAI API key needs embedding access

### Agents Not Appearing

**Symptom:** Empty agents list
1. **Check gateway connection** - Must be online
2. **Verify agent discovery** - Gateway needs access to agent workspaces
3. **Restart gateway** - Sometimes agents need rediscovery
4. **Check file permissions** - Gateway needs read access to `/root/clawd/agents/`

---

## 🚀 Next Steps

### Explore Advanced Features
- **[WebSocket real-time updates](websockets.md)** - Live dashboard updates
- **[Custom themes and layouts](customization.md)** - Personalize your interface
- **[API integration](api.md)** - Build custom tools and automations
- **[Mobile optimization](mobile.md)** - Use Talon on your phone

### Join the Community
- **[Discord Server](https://discord.gg/openclaw)** - Get help and share tips
- **[GitHub Discussions](https://github.com/TerminalGravity/talon-private/discussions)** - Feature requests and ideas
- **[Contributing Guide](../CONTRIBUTING.md)** - Help improve Talon

### Advanced Deployment
- **[Custom domains](custom-domains.md)** - Use your own domain
- **[Load balancing](scaling.md)** - Handle high traffic
- **[Backup strategies](backup.md)** - Protect your data
- **[Monitoring setup](monitoring.md)** - Production observability

---

**🎉 Congratulations!** You now have a powerful command center for your OpenClaw agents. 

**Need help?** Join our [Discord](https://discord.gg/openclaw) or [create an issue](https://github.com/TerminalGravity/talon-private/issues).