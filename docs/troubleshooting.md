# Troubleshooting Guide

Common issues and solutions for Talon Dashboard.

## 🔍 Quick Diagnosis

### Health Check Commands

```bash
# Check deployment status
curl https://your-talon.com/api/health

# Verify gateway connection  
curl -H "Authorization: Bearer $GATEWAY_TOKEN" \
  https://your-gateway.com:5050/api/health

# Test OpenAI API key
curl -H "Authorization: Bearer $OPENAI_API_KEY" \
  https://api.openai.com/v1/models
```

### System Status Dashboard

Visit `/system-status` on your Talon deployment for real-time diagnostics:
- Gateway connectivity
- Agent discovery status
- Search indexing health
- Cron job scheduler
- Channel connections

---

## 🚨 Common Issues

### 1. Gateway Connection Failed

**Symptoms:**
- Red "Gateway Offline" indicator
- Error: "Failed to connect to OpenClaw Gateway"
- Empty agents list
- No session data

**Diagnosis:**
```bash
# Test direct gateway access
curl https://your-gateway.com:5050/api/health
```

**Solutions:**

#### A. Incorrect Gateway URL
```env
# Wrong (missing protocol)
GATEWAY_URL=your-gateway.com:5050

# Wrong (HTTP instead of HTTPS)  
GATEWAY_URL=http://your-gateway.com:5050

# Correct
GATEWAY_URL=https://your-gateway.com:5050
```

#### B. Firewall/Network Issues
```bash
# If gateway is behind firewall, use Tailscale Funnel
tailscale funnel 5050

# Or configure port forwarding
iptables -t nat -A PREROUTING -p tcp --dport 5050 -j REDIRECT --to-port 5050
```

#### C. Invalid Auth Token
```bash
# Check your OpenClaw config
cat ~/.openclaw/openclaw.json | grep token

# Update environment variable
export GATEWAY_TOKEN="your_actual_token_here"
```

#### D. Gateway Not Running
```bash
# Start OpenClaw gateway
openclaw gateway

# Check status
openclaw status
```

### 2. Authentication Failures

**Symptoms:**
- Stuck on login page
- "Invalid token" errors
- Redirected to login after accessing dashboard

**Solutions:**

#### A. Missing Auth Token
```bash
# Generate secure token
openssl rand -base64 48

# Set in environment
export TALON_AUTH_TOKEN="your_generated_token"
```

#### B. Token Mismatch
Check that login token matches environment variable:
```bash
# In Render dashboard
echo $TALON_AUTH_TOKEN

# Should match login credentials
```

#### C. Cookie Issues
Clear browser cookies and try again:
1. Open Developer Tools (F12)
2. Go to Application/Storage tab
3. Clear cookies for your Talon domain
4. Refresh and login again

### 3. Semantic Search Not Working

**Symptoms:**
- "Search disabled" message
- Empty search results
- "Indexing failed" errors

**Diagnosis:**
```bash
# Check OpenAI API key
curl -H "Authorization: Bearer $OPENAI_API_KEY" \
  https://api.openai.com/v1/models

# Verify embedding model access
curl -H "Authorization: Bearer $OPENAI_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"input": "test", "model": "text-embedding-3-small"}' \
  https://api.openai.com/v1/embeddings
```

**Solutions:**

#### A. Missing OpenAI API Key
```env
# Add to environment variables
OPENAI_API_KEY=sk-your_key_here
```

#### B. Invalid API Key
- Check key is active in OpenAI dashboard
- Verify billing is current
- Ensure embedding model access

#### C. Indexing Errors
```bash
# Force re-index
curl -X POST https://your-talon.com/api/index \
  -H "Authorization: Bearer $GATEWAY_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"force": true}'

# Check indexing logs
curl https://your-talon.com/api/index/status
```

#### D. LanceDB Path Issues
```env
# Ensure writable directory
LANCEDB_PATH=/tmp/lancedb

# Or use relative path
LANCEDB_PATH=./.lancedb
```

### 4. Agents Not Appearing

**Symptoms:**
- Empty agents sidebar
- "No agents found" message
- Agents list shows 0 total

**Solutions:**

#### A. Gateway Agent Discovery
```bash
# Restart OpenClaw gateway
openclaw gateway restart

# Verify agents directory
ls /root/clawd/agents/
```

#### B. Agent Workspace Permissions
```bash
# Check directory permissions
ls -la /root/clawd/agents/

# Fix permissions if needed
chmod -R 755 /root/clawd/agents/
```

#### C. Talon API Configuration
```env
# Set Talon API URL (if using workspace bridge)
TALON_API_URL=https://your-talon-api.com
TALON_API_TOKEN=your_api_token
```

### 5. Real-Time Updates Not Working

**Symptoms:**
- Data doesn't refresh automatically
- Manual refresh required
- "Connection lost" indicators

**Solutions:**

#### A. WebSocket Connection Issues
- Check browser developer console for WebSocket errors
- Verify deployment supports WebSocket connections
- Some reverse proxies block WebSocket upgrades

#### B. Network/Firewall Issues
```bash
# Test WebSocket connection
wscat -c wss://your-talon.com/api/ws
```

#### C. Fallback to Polling
WebSocket failures automatically fall back to 30-second polling. This is expected behavior in restrictive network environments.

### 6. Cron Jobs Not Running

**Symptoms:**
- Jobs stuck in "idle" status
- "Scheduler offline" errors
- Jobs not triggering on schedule

**Solutions:**

#### A. Check Gateway Cron Status
```bash
# Via OpenClaw CLI
openclaw cron status

# Via API
curl -H "Authorization: Bearer $GATEWAY_TOKEN" \
  https://your-gateway.com:5050/api/cron/status
```

#### B. Enable Cron Scheduler
```bash
# In OpenClaw config
{
  "cron": {
    "enabled": true
  }
}
```

#### C. Job Permissions
- Verify jobs have proper session targets
- Check agent availability for job execution
- Review job configuration syntax

### 7. Skills Not Loading

**Symptoms:**
- Skills page shows "No skills available"
- Install buttons don't work
- "Missing dependencies" for all skills

**Solutions:**

#### A. Check Skills Directory
```bash
# Verify skills installation
openclaw skills list

# Check skills directory
ls ~/.openclaw/skills/
```

#### B. Install Missing Dependencies
```bash
# Example for Docker skill
apt-get update && apt-get install docker.io

# For npm-based skills
npm install -g some-package
```

#### C. Refresh Skills Cache
```bash
# Restart gateway to refresh skills
openclaw gateway restart
```

---

## 🔧 Performance Issues

### Slow Loading Times

#### Database Optimization
```bash
# Clear old cache files
rm -rf /tmp/talon-cache/*

# Restart deployment to clear memory cache
```

#### Search Index Optimization
```bash
# Rebuild search index
curl -X POST https://your-talon.com/api/index \
  -d '{"force": true, "cleanup": true}'
```

### Memory Usage High

#### Check Process Memory
```bash
# Monitor Node.js memory usage
ps aux | grep node

# Check available system memory
free -h
```

#### Optimize LanceDB
```bash
# Compact LanceDB files
curl -X POST https://your-talon.com/api/index/optimize
```

### Rate Limiting

```bash
# Check rate limit status
curl -I https://your-talon.com/api/sessions

# Headers show remaining quota:
# X-RateLimit-Remaining: 95
# X-RateLimit-Reset: 1703123456
```

---

## 📊 Debug Information

### Enable Debug Logging

```env
# Add to environment variables
DEBUG=talon:*
LOG_LEVEL=debug

# Or for specific modules
DEBUG=talon:gateway,talon:search
```

### Collect System Information

```bash
# Create debug report
curl -H "Authorization: Bearer $GATEWAY_TOKEN" \
  https://your-talon.com/api/system/debug > debug.json

# Upload to GitHub issue for support
```

### Browser Developer Tools

1. Open Developer Tools (F12)
2. Check **Console** tab for JavaScript errors
3. Check **Network** tab for failed API requests
4. Check **Application** tab for storage issues

---

## 🆘 Getting Help

### Before Asking for Help

1. **Check this troubleshooting guide**
2. **Review system status dashboard** 
3. **Collect debug information** (see above)
4. **Try basic solutions** (restart, clear cache)

### Support Channels

#### GitHub Issues
- [Bug reports](https://github.com/TerminalGravity/talon-private/issues/new?template=bug_report.md)
- [Feature requests](https://github.com/TerminalGravity/talon-private/issues/new?template=feature_request.md)
- [Questions & Help](https://github.com/TerminalGravity/talon-private/discussions)

#### Discord Community  
- [OpenClaw Discord](https://discord.gg/openclaw)
- `#talon-support` channel
- Real-time help from community

### Information to Include

When reporting issues, please include:

```bash
# System info
cat /etc/os-release
node --version
npm --version

# Talon version
curl https://your-talon.com/api/health | jq '.version'

# Gateway info  
curl -H "Authorization: Bearer $GATEWAY_TOKEN" \
  https://your-gateway.com:5050/api/health

# Error logs (last 50 lines)
curl https://your-talon.com/api/system/logs | tail -50
```

---

## 🔄 Emergency Recovery

### Complete Reset

If everything is broken:

1. **Redeploy from GitHub**:
   - Delete current Render service
   - Create new service from GitHub repo
   - Reconfigure environment variables

2. **Reset Gateway Connection**:
   ```bash
   # Regenerate gateway token
   openclaw gateway --reset-token
   
   # Update GATEWAY_TOKEN in deployment
   ```

3. **Clear All Data**:
   ```bash
   # Remove search index
   rm -rf .lancedb/
   
   # Clear cache
   rm -rf /tmp/talon-cache/
   ```

### Backup & Restore

```bash
# Backup search index
tar -czf lancedb-backup.tar.gz .lancedb/

# Backup configuration
cp .env.local config-backup.env

# Restore from backup
tar -xzf lancedb-backup.tar.gz
cp config-backup.env .env.local
```

---

**Still having issues?** Join our [Discord](https://discord.gg/openclaw) or [open an issue](https://github.com/TerminalGravity/talon-private/issues) with your debug information.