# Getting Started with Talon: Your First OpenClaw Dashboard

*Transform your AI agent management from Discord chaos to professional command center in under 10 minutes.*

![Talon Dashboard Preview](../assets/talon-dashboard-hero.png)

## What is Talon?

Talon is the modern web dashboard for [OpenClaw](https://openclaw.ai), designed to solve the friction of managing AI agents through Discord. Instead of juggling channels, scrolling through chat history, and fighting message limits, Talon gives you a professional interface with real-time monitoring, semantic search, and workspace-first navigation.

**Key Benefits:**
- 🎯 **Workspace-focused navigation** - Each agent gets its own dedicated space
- 🔍 **Semantic search** - Find information across all agent memories instantly  
- ⚡ **Real-time updates** - Live session status and WebSocket notifications
- 📊 **Mission control** - Manage cron jobs, skills, channels, and system health
- 🔒 **Production-ready** - Authentication, rate limiting, and monitoring built-in

## Prerequisites

Before we begin, you'll need:
- A running OpenClaw Gateway instance
- Node.js 18+ for local development (optional)
- A deployment platform account (Render, Vercel, or Docker)

Don't have OpenClaw yet? Check out the [OpenClaw installation guide](https://openclaw.ai/docs/getting-started) first.

## Deployment Options

Talon offers multiple deployment paths to fit your workflow:

### Option 1: Render (Recommended for Production)

Render provides the best experience with full LanceDB support and native module compilation.

[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy?repo=https://github.com/KaiOpenClaw/talon-private)

1. **Connect Repository**: Link your GitHub account and select `KaiOpenClaw/talon-private`
2. **Configure Environment**: Set the required environment variables (see below)
3. **Deploy**: Render handles the build process automatically
4. **Access**: Your dashboard will be available at `https://your-app.onrender.com`

### Option 2: Vercel (Quick Preview)

Perfect for development and previews, but with limited search functionality.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/KaiOpenClaw/talon-private)

### Option 3: Local Development

Clone and run locally for development or customization:

```bash
# Clone the repository
git clone https://github.com/KaiOpenClaw/talon-private.git
cd talon-private

# Install dependencies
npm install

# Configure environment
cp .env.example .env.local
# Edit .env.local with your settings

# Start development server
npm run dev

# Open http://localhost:3000
```

## Environment Configuration

Talon requires several environment variables to connect with your OpenClaw instance:

### Required Variables

```bash
# Gateway Connection
GATEWAY_URL=https://your-gateway-url:5050
GATEWAY_TOKEN=your-gateway-auth-token

# Authentication (Production)
TALON_AUTH_TOKEN=your-secure-auth-password

# Search Functionality (Optional)
OPENAI_API_KEY=your-openai-key-for-embeddings
```

### Finding Your Gateway Information

Your OpenClaw Gateway URL and token can be found in:

```bash
# Check your OpenClaw configuration
cat ~/.openclaw/openclaw.json

# Look for:
# - gateway.url (your GATEWAY_URL)
# - gateway.auth.token (your GATEWAY_TOKEN)
```

If your gateway isn't accessible publicly, consider setting up [Tailscale Funnel](https://tailscale.com/kb/1223/tailscale-funnel) or [Cloudflare Tunnel](https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/) for secure access.

## First Login & Setup

1. **Access Your Dashboard**: Navigate to your deployed Talon URL
2. **Authentication**: Enter your `TALON_AUTH_TOKEN` when prompted
3. **Gateway Connection**: Talon will automatically connect to your OpenClaw Gateway
4. **Agent Discovery**: Your agent workspaces will appear in the sidebar

![Talon Login Screen](../assets/talon-login.png)

## Dashboard Overview

Once logged in, you'll see Talon's main interface:

### Sidebar Navigation
- **🏠 Dashboard** - System overview and health metrics
- **🔍 Search** - Semantic search across all agent memories
- **🤖 Agent Workspaces** - Individual agent management interfaces
- **⚙️ Mission Control** - System management (cron, skills, channels)

### Main Dashboard Panels

#### System Health
Real-time status of your OpenClaw ecosystem:
- Gateway connectivity and response times
- Active sessions and agent status  
- Memory index health and search performance
- Resource usage and performance metrics

#### Recent Activity
Live feed of agent activities:
- New sessions and message exchanges
- Completed tasks and cron job executions
- System events and health notifications

#### Quick Actions
One-click access to common tasks:
- Create new agent sessions
- Trigger cron jobs manually  
- Rebuild search indexes
- View system logs

## Working with Agent Workspaces

Each agent in your OpenClaw instance gets a dedicated workspace in Talon:

### Workspace Features

#### 1. Chat Interface
- **Real-time messaging** with your agents
- **Message history** with full context preservation
- **File attachments** and media support
- **Code syntax highlighting** for technical responses

#### 2. Memory Browser
- **View and edit** agent memory files (MEMORY.md, SOUL.md, etc.)
- **Session transcripts** organized chronologically
- **Search within** specific agent contexts
- **Version history** and change tracking

#### 3. Session Management
- **Active sessions** list with real-time status
- **Session history** with detailed timelines
- **Performance metrics** for response times and token usage
- **Session spawning** for parallel agent tasks

### Example: Managing a Development Agent

Let's walk through managing a coding agent:

1. **Select Agent**: Click on your development agent in the sidebar
2. **Review Memory**: Check the agent's current context and recent work
3. **Start Session**: Create a new coding task session
4. **Monitor Progress**: Watch real-time updates as the agent works
5. **Review Results**: Examine code output and commit history

## Advanced Features

### Semantic Search

Talon's semantic search lets you find information across all your agents instantly:

1. **Navigate to Search**: Click the search icon in the sidebar
2. **Enter Query**: Type natural language questions like "database optimization strategies"
3. **Filter Results**: Narrow by specific agents or time ranges
4. **Explore Matches**: Click through to relevant agent memories and sessions

### Cron Job Management

Monitor and control your scheduled automation:

1. **Mission Control**: Navigate to the cron dashboard
2. **Job Overview**: See all scheduled tasks and their status
3. **Manual Execution**: Trigger jobs on-demand for testing
4. **Performance Tracking**: Review job execution history and success rates

### Skills Management

Control your OpenClaw capabilities:

1. **Skills Dashboard**: View all available and enabled skills
2. **Enable/Disable**: Control which capabilities are active
3. **Installation**: Add new skills from npm packages
4. **Health Monitoring**: Check skill status and dependencies

## Troubleshooting Common Issues

### Connection Problems
- **Check Gateway URL**: Ensure your OpenClaw Gateway is accessible
- **Verify Token**: Confirm your authentication token is correct
- **Network Access**: Check firewall and network connectivity
- **SSL Certificates**: Ensure HTTPS is properly configured

### Search Not Working
- **OpenAI API Key**: Verify your key is set and has credits
- **Index Status**: Check if vector indexes need rebuilding
- **Permissions**: Ensure the service can access agent files

### Performance Issues
- **Resource Limits**: Check memory and CPU usage
- **Cache Settings**: Verify caching is enabled and working
- **Network Latency**: Test connection speed to your Gateway

## Next Steps

Now that you have Talon running, explore these advanced topics:

1. **[Advanced Agent Management](./advanced-agent-management.md)** - Multi-agent orchestration and workflows
2. **[Custom Workflows](./building-custom-workflows.md)** - Creating automated processes
3. **[Performance Optimization](./performance-optimization.md)** - Scaling your setup
4. **[Security Best Practices](./security-guide.md)** - Production deployment security

## Community & Support

Join the Talon community for help and updates:

- **GitHub**: [Issues and Discussions](https://github.com/KaiOpenClaw/talon-private)
- **Discord**: [OpenClaw Community](https://discord.gg/openclaw)
- **Documentation**: [Complete Guide](https://talon-docs.openclaw.ai)

## Conclusion

You now have a professional AI agent management interface that scales with your needs. Talon transforms the Discord-based OpenClaw experience into a modern, searchable, and monitorable platform.

The real power of Talon emerges when managing multiple agents simultaneously - something that becomes unwieldy in Discord but feels natural in a purpose-built dashboard.

Ready to take your AI agent management to the next level? Explore the advanced features and start building your automated workflows today.

---

*Built with ❤️ for the OpenClaw community. Talon is open source and welcomes contributions.*