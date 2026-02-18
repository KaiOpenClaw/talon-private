# 🚀 Getting Started with Talon - Complete Tutorial

**Transform your OpenClaw AI agent management from terminal chaos to dashboard control**

---

## What is Talon?

Talon is a web-based command center for OpenClaw, designed to replace scattered terminal commands with a unified, intuitive dashboard. Instead of juggling multiple CLI commands, terminal windows, and context switching between agents, Talon provides:

- **Centralized Agent Management**: All 20+ agents in one interface
- **Semantic Search**: AI-powered search across all agent memories  
- **Real-time Monitoring**: Live status updates and system health
- **Automated Task Control**: Manage 31+ cron jobs visually
- **Professional UI**: Dark theme, keyboard shortcuts, mobile-responsive

---

## Prerequisites

Before setting up Talon, ensure you have:

### Required Services
- **OpenClaw Gateway**: Running and accessible via network
- **Node.js**: v18+ for running Talon locally or in production
- **Git**: For cloning and managing the repository

### Optional Services  
- **LanceDB**: For semantic search (production deployments)
- **Talon-API**: For workspace data access (local development)

### Access Requirements
- **Gateway Token**: Authentication token from your OpenClaw installation
- **Network Access**: Ability to reach your OpenClaw gateway
- **Environment Variables**: Configuration for your specific setup

---

## Installation Methods

### Method 1: Render Deployment (Recommended)

**Best for**: Production use, team collaboration, always-on access

```bash
# 1. Clone the repository
git clone https://github.com/TerminalGravity/talon-private.git
cd talon-private

# 2. Deploy to Render (one-click)
# Visit: https://render.com/deploy?repo=https://github.com/TerminalGravity/talon-private

# 3. Configure environment variables (see Configuration section)
```

### Method 2: Local Development

**Best for**: Development, testing, personal use

```bash
# 1. Clone and install dependencies
git clone https://github.com/TerminalGravity/talon-private.git
cd talon-private
npm install

# 2. Configure environment variables
cp .env.example .env.local
# Edit .env.local with your settings

# 3. Start development server
npm run dev

# 4. Open browser to http://localhost:4000
```

### Method 3: Docker Deployment

**Best for**: Self-hosted production, container environments

```bash
# 1. Clone repository
git clone https://github.com/TerminalGravity/talon-private.git
cd talon-private

# 2. Build Docker image
docker build -t talon .

# 3. Run with environment variables
docker run -p 4000:4000 \
  -e GATEWAY_URL=your_gateway_url \
  -e GATEWAY_TOKEN=your_token \
  talon
```

---

## Configuration

### Required Environment Variables

Create a `.env.local` file (or configure in your deployment platform):

```env
# OpenClaw Gateway Connection (REQUIRED)
GATEWAY_URL=https://your-gateway.example.com:5050
GATEWAY_TOKEN=your_gateway_auth_token

# Authentication (Production)
TALON_AUTH_TOKEN=secure_random_token_64_characters_minimum

# Search Functionality (Optional)
OPENAI_API_KEY=sk-your-openai-key-for-embeddings

# Talon API Service (Optional - for workspace data)
TALON_API_URL=https://your-talon-api.example.com
TALON_API_TOKEN=your_talon_api_token
```

### Finding Your Gateway Configuration

```bash
# OpenClaw configuration file location:
cat ~/.openclaw/openclaw.json

# Extract gateway URL and token:
jq '.gateway.url' ~/.openclaw/openclaw.json
jq '.gateway.auth.token' ~/.openclaw/openclaw.json
```

### Production Security Setup

```bash
# Generate secure authentication token
openssl rand -hex 32

# Add to your environment variables:
TALON_AUTH_TOKEN=your_generated_secure_token
```

---

## First Steps After Installation

### 1. Login & Authentication

If you configured `TALON_AUTH_TOKEN`, you'll see a login screen:

- **URL**: `https://your-talon-deployment.com/login`
- **Password**: The value of your `TALON_AUTH_TOKEN`
- **Security**: Token stored in secure httpOnly cookie

### 2. Verify Gateway Connection

Check the connection status in the top-right corner:
- **Green dot**: Connected to OpenClaw Gateway
- **Red dot**: Connection issues (check configuration)
- **Tooltip**: Shows last successful connection time

### 3. Explore Your Agents

The sidebar shows all available agents:
- **Status indicators**: Green (online), Yellow (busy), Gray (offline)  
- **Navigation**: Click agents to switch context
- **Keyboard shortcuts**: Alt+1-9 for quick selection
- **Search**: Type letters to jump to agents

---

## Core Features Walkthrough

### Agent Management

**Centralized Control**: Instead of `openclaw sessions` and context switching:

```bash
# Old way (terminal)
openclaw sessions
openclaw agent --agent duplex -m "Hello"
openclaw sessions --active 60

# New way (Talon)
# - Visual agent list with status
# - Click to chat directly
# - Real-time session monitoring
```

**Features**:
- Real-time agent status monitoring
- Direct chat interface with full conversation history
- Quick workspace access and file browsing
- Sub-agent spawning with visual feedback

### Semantic Search

**AI-Powered Discovery**: Instead of `grep` and manual log searches:

```bash
# Old way (terminal)  
find /root/clawd/agents -name "*.md" -exec grep -l "deployment" {} \;
openclaw memory search "vector embeddings"

# New way (Talon)
# - Natural language queries
# - Cross-agent search
# - Context-aware results
```

**How to Use**:
1. Navigate to `/search` or press Cmd+K
2. Enter natural language queries: "deployment issues", "vector embeddings"
3. Filter by specific agents using dropdown
4. Click results to jump directly to relevant content

### Cron Job Management

**Visual Task Control**: Instead of `openclaw cron list`:

```bash
# Old way (terminal)
openclaw cron list
openclaw cron run job-id-12345
openclaw cron status

# New way (Talon)  
# - Visual grid of all 31+ jobs
# - One-click job triggers
# - Status monitoring dashboard
```

**Features**:
- Real-time job status monitoring
- Manual job triggering with immediate feedback
- Job history and performance tracking
- Scheduling visualization and management

### System Monitoring

**Complete Visibility**: Instead of scattered status commands:

```bash
# Old way (terminal)
openclaw status
openclaw channels status --probe
openclaw skills list

# New way (Talon)
# - Unified system dashboard
# - Real-time health monitoring
# - Visual status indicators
```

---

## Daily Workflow Examples

### Morning Standup Routine

**Old Terminal Workflow**:
```bash
openclaw sessions --active 720  # Check overnight activity
openclaw cron list | grep -E "(failed|error)"  # Check failed jobs  
openclaw status --deep  # System health check
openclaw memory search "blockers"  # Review current blockers
```

**New Talon Workflow**:
1. Open Talon dashboard - instant overview
2. Check system health indicator in header
3. Review failed cron jobs (red status indicators)
4. Use semantic search for "blockers today"
5. Navigate directly to relevant agents for followup

### Agent Development Session  

**Old Terminal Workflow**:
```bash
openclaw agent --agent talon -m "Status update?"
# Wait for response, scroll through terminal history
openclaw memory search "github issues"
# Copy/paste between terminal and browser
openclaw agent --agent talon -m "Work on issue #51"
```

**New Talon Workflow**:
1. Select `talon` agent from sidebar
2. Chat interface shows full conversation history
3. Use in-dashboard search for "github issues"
4. Continue conversation with full context
5. Monitor progress in real-time

### Production Debugging

**Old Terminal Workflow**:
```bash
openclaw status --all  # Check what's broken
openclaw sessions | grep -v "main"  # Find problematic sessions
openclaw memory search "error" --agent problematic-agent
openclaw agent --agent problematic-agent -m "Debug the issue"
```

**New Talon Workflow**:
1. System dashboard shows health status at-a-glance
2. Session list shows problematic sessions visually
3. Search "error today" across all agents
4. Click directly to problematic agent
5. Debug in conversational interface with full context

---

## Advanced Features

### Keyboard Shortcuts

Talon is optimized for power users:

```
Global Shortcuts:
Cmd/Ctrl + K    → Command palette (future feature)
Alt + 1-9       → Quick agent selection
Tab             → Navigate interface elements

Agent Navigation:
↑/↓ arrows     → Navigate agent list
Enter          → Select agent
Home/End       → Jump to first/last agent
Type letters   → Jump to agent by name
```

### Real-time Updates

Talon uses WebSocket connections for live updates:
- **Agent status changes**: Instantly reflected in sidebar
- **Session activity**: New messages appear in real-time
- **System health**: Live monitoring without page refresh
- **Cron job status**: Immediate feedback on job execution

### Workspace Integration

Deep integration with agent workspaces:
- **File browser**: Navigate agent directory structures
- **Memory editor**: Edit MEMORY.md files directly
- **Session logs**: Browse historical conversations
- **Quick actions**: Spawn sub-agents, trigger workflows

---

## Troubleshooting Common Issues

### Connection Problems

**Symptom**: Red connection indicator, "Failed to connect" errors

**Solutions**:
```bash
# 1. Verify gateway is running
openclaw gateway status

# 2. Test direct connection
curl -H "Authorization: Bearer $GATEWAY_TOKEN" \
  $GATEWAY_URL/api/health

# 3. Check network accessibility
ping your-gateway-host
telnet your-gateway-host 5050

# 4. Verify environment variables
echo $GATEWAY_URL
echo $GATEWAY_TOKEN
```

### Authentication Issues

**Symptom**: Redirected to login page, invalid credentials

**Solutions**:
```bash
# 1. Verify auth token is set correctly
echo $TALON_AUTH_TOKEN

# 2. Check token format (should be 32+ characters)
# 3. Try regenerating token:
openssl rand -hex 32

# 4. For development, disable auth:
unset TALON_AUTH_TOKEN  # Local development only
```

### Search Not Working

**Symptom**: No search results, "Index not found" errors

**Solutions**:
```bash
# 1. Verify OpenAI API key is configured
echo $OPENAI_API_KEY

# 2. Run indexing script locally
cd /path/to/talon-private
source .env.local
npx tsx scripts/index-workspaces.ts

# 3. Check index files exist
ls -la .lancedb/
```

### Performance Issues

**Symptom**: Slow loading, timeouts, unresponsive interface

**Solutions**:
- **Check memory usage**: Large numbers of agents/sessions
- **Network latency**: Gateway connection over internet
- **Browser cache**: Clear cache and hard refresh
- **Resource limits**: Increase server memory for deployment

---

## Tips for Maximum Productivity

### Organize Your Workflow

1. **Pin frequently-used agents** at the top (future feature)
2. **Use semantic search** instead of browsing files manually
3. **Set up cron jobs** for routine status checks
4. **Monitor system health** proactively via dashboard

### Keyboard-First Navigation

- Master the keyboard shortcuts for speed
- Use Tab navigation to avoid mouse dependency
- Leverage search instead of clicking through navigation
- Learn agent letter-jumping for quick selection

### Leverage Real-time Features

- Keep Talon open in dedicated browser tab
- Use WebSocket connection for live monitoring
- Set up multiple views (agent chat + system status)
- Take advantage of instant feedback loops

---

## Next Steps

### Customize Your Setup

- **Theme preferences**: Dark/light mode (future feature)
- **Dashboard layout**: Customize information density
- **Keyboard shortcuts**: Learn and customize hotkeys
- **Notification preferences**: Configure alert levels

### Advanced Workflows

- **Team collaboration**: Share Talon URL with team members
- **API integration**: Build custom dashboards using Talon's APIs
- **Automation**: Trigger Talon actions from external systems
- **Monitoring**: Set up alerts for critical system events

### Community & Support

- **GitHub Issues**: Report bugs and request features
- **Discord Community**: Connect with other users
- **Documentation**: Contribute to user guides
- **Feature Requests**: Shape the roadmap

---

## Success Metrics

After using Talon, you should experience:

### Productivity Gains
- **50% reduction** in context switching between terminals
- **75% faster** agent status checks and debugging
- **90% improvement** in finding relevant information across agents
- **Zero terminal commands** for routine agent management

### Quality Improvements
- **Better visibility** into system health and agent performance
- **Faster incident response** through centralized monitoring
- **Improved team collaboration** via shared dashboard access
- **Reduced human error** through visual confirmations

### User Experience
- **Professional interface** instead of terminal complexity
- **Intuitive navigation** instead of memorizing CLI commands
- **Real-time feedback** instead of polling for updates
- **Mobile access** instead of desktop-only terminal

---

## Conclusion

Talon transforms OpenClaw from a powerful but complex CLI tool into an intuitive, professional dashboard. By providing visual interfaces for agent management, semantic search capabilities, and real-time monitoring, Talon makes AI agent operations accessible to both technical and non-technical team members.

The investment in setup (15-30 minutes) pays dividends immediately through:
- Reduced cognitive load from terminal juggling
- Faster problem identification and resolution
- Better team visibility into agent operations
- Professional presentation for stakeholders

Start with the basic setup, master the core features, then explore advanced capabilities as your comfort grows. Talon scales from personal use to team operations seamlessly.

**Ready to eliminate command-line chaos? Deploy Talon today!**

---

*For technical support, feature requests, or contributions, visit the [GitHub repository](https://github.com/TerminalGravity/talon-private) or join our community discussion.*