# Integration Guide

Complete guide for connecting Talon to your OpenClaw infrastructure and integrating with existing workflows.

## 🔗 OpenClaw Gateway Integration

### Gateway Discovery & Connection

Talon connects to your OpenClaw gateway through the REST API. The gateway must be accessible and properly configured.

#### 1. Verify Gateway Status

First, confirm your OpenClaw gateway is running and accessible:

```bash
# On your OpenClaw server
openclaw status
# Should show: Gateway: ✅ Running on port 5050

# Check API accessibility
curl https://your-gateway.com:5050/api/health
```

#### 2. Get Gateway Authentication Token

Extract your authentication token from OpenClaw configuration:

```bash
# Method 1: From OpenClaw config
openclaw config get gateway.auth.token

# Method 2: From config file
cat ~/.openclaw/openclaw.json | jq '.gateway.auth.token'

# Method 3: Auto-extract (Linux/macOS)
export GATEWAY_TOKEN=$(jq -r '.gateway.auth.token' ~/.openclaw/openclaw.json)
echo $GATEWAY_TOKEN
```

#### 3. Test API Connection

Verify Talon can connect to your gateway:

```bash
# Test basic connectivity
curl -H "Authorization: Bearer $GATEWAY_TOKEN" \
  https://your-gateway.com:5050/api/sessions

# Should return JSON with your sessions
```

### Network Configuration

#### Option A: Public Access (Tailscale Funnel)

If your gateway is behind NAT/firewall, use Tailscale Funnel:

```bash
# On your OpenClaw server
tailscale funnel 5050

# Output will show your public URL:
# https://machine-name.tail-domain.ts.net:5050
```

Use this URL as your `GATEWAY_URL` in Talon.

#### Option B: VPN Access

Connect Talon deployment to your private network:
- **Tailscale mesh** - Install Tailscale on both servers
- **WireGuard** - Set up VPN tunnel
- **AWS VPC** - Deploy Talon in same VPC as gateway

#### Option C: Reverse Proxy

Expose gateway through reverse proxy (nginx, Cloudflare, etc.):

```nginx
# nginx example
server {
    listen 443 ssl;
    server_name gateway.yourdomain.com;
    
    location /api/ {
        proxy_pass http://localhost:5050/api/;
        proxy_set_header Authorization $http_authorization;
        proxy_set_header Host $host;
    }
}
```

---

## 🏢 Production Architecture Patterns

### Single Gateway Setup

Simple setup for small teams (1-20 agents):

```
┌─────────────────┐    HTTPS    ┌─────────────────┐
│  Talon Dashboard│ ──────────> │ OpenClaw Gateway │
│  (Render Cloud) │             │   (Your Server)  │
└─────────────────┘             └─────────────────┘
                                          │
                                          v
                                ┌─────────────────┐
                                │  Agent Fleet    │
                                │ (20+ agents)    │
                                └─────────────────┘
```

### Multi-Gateway Setup

For large teams or isolated environments:

```
┌─────────────────┐              ┌─────────────────┐
│  Talon Dashboard│ ──────────>  │ Gateway Load    │
│  (Render Cloud) │              │ Balancer        │
└─────────────────┘              └─────────────────┘
                                          │
                    ┌─────────────────────┼─────────────────────┐
                    │                     │                     │
                    v                     v                     v
          ┌─────────────────┐   ┌─────────────────┐   ┌─────────────────┐
          │  Dev Gateway    │   │ Staging Gateway │   │  Prod Gateway   │
          │   (5 agents)    │   │   (10 agents)   │   │   (50 agents)   │
          └─────────────────┘   └─────────────────┘   └─────────────────┘
```

### High Availability Setup

Enterprise setup with redundancy:

```
┌─────────────────┐              ┌─────────────────┐
│  Talon Primary  │ ──────────>  │ Primary Gateway │
│                 │              │                 │
└─────────────────┘              └─────────────────┘
         │                                │
         │ Sync                           │ Replicas
         v                                v
┌─────────────────┐              ┌─────────────────┐
│  Talon Replica  │ ──────────>  │ Backup Gateway  │
│                 │              │                 │
└─────────────────┘              └─────────────────┘
```

---

## 🛠️ Workspace & Memory Integration

### Agent Workspace Access

Talon needs access to agent workspace files for full functionality:

#### Method 1: Talon API Service (Recommended)

Deploy the Talon API service on your OpenClaw server:

```bash
# On your OpenClaw server
git clone https://github.com/KaiOpenClaw/talon-api
cd talon-api
npm install
npm run build

# Configure service
cat > .env << EOF
PORT=4101
WORKSPACES_PATH=/root/clawd/agents
AUTH_TOKEN=talon-$(openssl rand -hex 16)
EOF

# Start service
npm start

# Or install as systemd service
sudo cp talon-api.service /etc/systemd/system/
sudo systemctl enable talon-api
sudo systemctl start talon-api
```

Configure Talon environment:
```env
TALON_API_URL=https://your-server.com:4101
TALON_API_TOKEN=talon-your-generated-token
```

#### Method 2: Direct File Access

If Talon runs on the same server as OpenClaw:

```env
# Point to local workspace directory
WORKSPACES_PATH=/root/clawd/agents
```

#### Method 3: Network File System

Mount agent workspaces on Talon server:

```bash
# NFS mount example
sudo mount -t nfs your-openclaw-server:/root/clawd/agents /mnt/agents

# Configure Talon
WORKSPACES_PATH=/mnt/agents
```

### Memory Indexing for Search

Enable semantic search across all agent memories:

```bash
# Set OpenAI API key in Talon environment
OPENAI_API_KEY=sk-your-key-here

# Index all workspaces (run once after deployment)
curl -X POST https://your-talon.com/api/index \
  -H "Authorization: Bearer $GATEWAY_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"force": true}'

# Monitor indexing progress
curl https://your-talon.com/api/system/health | jq '.search'
```

---

## 🔐 Security & Authentication

### Authentication Methods

#### Option 1: Shared Token (Simple)

Single token for all team members:

```env
# Generate secure token
TALON_AUTH_TOKEN=$(openssl rand -hex 32)
```

Share this token with your team for login.

#### Option 2: Individual Tokens (Recommended)

Generate unique tokens per user:

```bash
# Generate user tokens
alice_token=$(openssl rand -hex 32)
bob_token=$(openssl rand -hex 32)

# Configure in environment (comma-separated)
TALON_AUTH_TOKENS="${alice_token},${bob_token}"
```

#### Option 3: OAuth Integration (Coming Soon)

Integration with GitHub, Google, Microsoft authentication.

### Network Security

#### SSL/TLS Configuration

Ensure all connections use HTTPS:

```env
# Force HTTPS in production
NODE_ENV=production
FORCE_HTTPS=true
```

#### IP Allowlists

Restrict access to trusted networks:

```env
# Comma-separated CIDR ranges
ALLOWED_IPS="10.0.0.0/8,192.168.0.0/16,your.office.ip/32"
```

#### Rate Limiting

Built-in rate limiting protects against abuse:

```env
# Requests per minute per IP
RATE_LIMIT_RPM=100

# Requests per minute for expensive operations
RATE_LIMIT_SEARCH_RPM=20
RATE_LIMIT_INDEXING_RPM=5
```

---

## 📊 Monitoring & Observability

### Health Monitoring

Monitor Talon and gateway health:

```bash
# Automated health checks
curl https://your-talon.com/api/system/health

# Gateway connectivity test
curl https://your-talon.com/api/system/gateway-test
```

### Logging Configuration

Configure structured logging:

```env
# Log levels: error, warn, info, debug
LOG_LEVEL=info

# Log destinations
LOG_TO_CONSOLE=true
LOG_TO_FILE=false
LOG_FILE_PATH=/var/log/talon.log
```

### Metrics Collection

Enable metrics for monitoring:

```env
# Prometheus metrics endpoint
ENABLE_METRICS=true
METRICS_PORT=9090
```

Access metrics at `https://your-talon.com:9090/metrics`

### Alert Configuration

Set up alerts for critical issues:

```bash
# Webhook for alerts (Slack, Discord, etc.)
ALERT_WEBHOOK_URL=https://hooks.slack.com/your-webhook

# Alert conditions
ALERT_ON_GATEWAY_DOWN=true
ALERT_ON_HIGH_ERROR_RATE=true
ALERT_ON_SEARCH_FAILURES=true
```

---

## 🔄 CI/CD Integration

### Automated Deployment

#### GitHub Actions

```yaml
# .github/workflows/deploy.yml
name: Deploy to Production
on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Deploy to Render
        env:
          RENDER_API_KEY: ${{ secrets.RENDER_API_KEY }}
        run: |
          curl -X POST https://api.render.com/v1/services/$SERVICE_ID/deploys \
            -H "Authorization: Bearer $RENDER_API_KEY"
```

#### Automated Testing

Test Talon integration before deployment:

```bash
# Test gateway connectivity
npm run test:integration

# Test API endpoints
npm run test:api

# Test search functionality
npm run test:search
```

### Environment Promotion

Promote changes through environments:

```bash
# Development environment
GATEWAY_URL=https://dev-gateway.example.com
ENVIRONMENT=development

# Staging environment  
GATEWAY_URL=https://staging-gateway.example.com
ENVIRONMENT=staging

# Production environment
GATEWAY_URL=https://prod-gateway.example.com
ENVIRONMENT=production
```

---

## 🤝 Team Workflows

### Agent Assignment

Assign team members to specific agents:

```json
// Team configuration (coming in v0.9.0)
{
  "teams": {
    "frontend": ["alice", "bob"],
    "backend": ["charlie", "david"],
    "ops": ["eve"]
  },
  "agentAssignments": {
    "ui-agent": "frontend",
    "api-agent": "backend", 
    "deploy-agent": "ops"
  }
}
```

### Notification Routing

Route alerts to appropriate team members:

```json
{
  "alerts": {
    "agent-errors": ["ops", "oncall"],
    "deployment-failures": ["ops", "leads"],
    "performance-issues": ["backend", "ops"]
  }
}
```

### Workspace Permissions

Control access to agent workspaces:

```json
{
  "permissions": {
    "read": ["all-team-members"],
    "write": ["leads", "ops"],
    "admin": ["ops"]
  }
}
```

---

## 🚀 Advanced Features

### Custom Agent Types

Register custom agent types with specific UI handling:

```javascript
// Custom agent configuration
const agentTypes = {
  "deployment-agent": {
    icon: "🚀",
    color: "#00ff00",
    capabilities: ["deploy", "rollback", "status"],
    ui: {
      showMetrics: true,
      showLogs: true,
      customActions: ["deploy-prod", "rollback"]
    }
  }
};
```

### Custom Skills Integration

Add organization-specific skills:

```javascript
// Custom skill definitions
const customSkills = {
  "company-deployer": {
    name: "Company Deployment Tool",
    description: "Deploy to our Kubernetes clusters",
    dependencies: ["kubectl", "helm"],
    actions: ["deploy", "status", "logs", "rollback"]
  }
};
```

### Webhook Integration

Receive external events in Talon:

```bash
# Configure webhook endpoint
WEBHOOK_ENDPOINT=https://your-talon.com/webhooks/github

# Handle GitHub webhooks
curl -X POST $WEBHOOK_ENDPOINT/github \
  -H "Content-Type: application/json" \
  -d '{"action": "deployment", "status": "success"}'
```

---

## 🔧 Troubleshooting

### Common Integration Issues

#### Gateway Connection Refused
```bash
# Check gateway accessibility
curl -v https://your-gateway.com:5050/api/health

# Verify network routing
traceroute your-gateway.com

# Check firewall rules
sudo ufw status
```

#### Authentication Failures
```bash
# Verify token format
echo $GATEWAY_TOKEN | base64 -d

# Check token expiration
curl -H "Authorization: Bearer $GATEWAY_TOKEN" \
  https://your-gateway.com:5050/api/auth/verify
```

#### Workspace Access Issues
```bash
# Check file permissions
ls -la /root/clawd/agents/

# Verify Talon API service
systemctl status talon-api

# Test direct file access
curl https://your-talon-api.com/agents
```

### Performance Optimization

#### Reduce API Latency
```env
# Enable response caching
API_CACHE_TTL=300

# Connection pooling
API_CONNECTION_POOL_SIZE=20
```

#### Optimize Search Performance
```env
# Batch indexing
INDEXING_BATCH_SIZE=100

# Search result caching
SEARCH_CACHE_TTL=900
```

---

## 📚 Additional Resources

- **[API Reference](api.md)** - Complete endpoint documentation
- **[Troubleshooting Guide](troubleshooting.md)** - Solutions for common issues
- **[Performance Tuning](performance.md)** - Optimization best practices
- **[Security Hardening](security.md)** - Production security guide

---

**Need help with integration?** 

- 💬 [Join our Discord](https://discord.gg/openclaw) 
- 🐛 [Open an issue](https://github.com/KaiOpenClaw/talon-private/issues)
- 📧 [Email support](mailto:support@openclaw.com)