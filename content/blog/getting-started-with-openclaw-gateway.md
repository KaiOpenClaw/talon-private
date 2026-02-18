# Getting Started with OpenClaw Gateway: Your First AI Agent in 10 Minutes

*Build your first AI agent workflow with OpenClaw's powerful gateway system*

---

## What You'll Learn

By the end of this tutorial, you'll have:
- ✅ OpenClaw gateway running locally
- ✅ Your first AI agent configured and responsive
- ✅ A working chat interface in Discord/Telegram
- ✅ Understanding of sessions, agents, and skills
- ✅ Foundation for building complex agent workflows

**Time to complete**: ~10 minutes  
**Experience level**: Beginner (no AI experience required)  
**Prerequisites**: Node.js 18+, terminal access

---

## Why OpenClaw?

OpenClaw isn't just another AI wrapper. It's a complete **multi-agent orchestration platform** that makes AI agents feel like team members, not tools.

### What makes OpenClaw different:

| Traditional AI Tools | OpenClaw Gateway |
|---------------------|------------------|
| Single conversation | Persistent multi-agent sessions |
| Manual prompting | Automated workflows & cron jobs |
| Text-only | Rich media, file handling, integrations |
| One-off requests | Long-term memory & context |
| Isolated | Connected ecosystem of specialized agents |

**Real Example**: Instead of manually asking ChatGPT to "analyze this CSV, create a chart, and email the team," OpenClaw can run this as an automated workflow every Monday morning across multiple specialized agents.

---

## Step 1: Install OpenClaw (2 minutes)

OpenClaw Gateway is the central hub that manages all your agents, channels, and workflows.

```bash
# Install globally via npm
npm install -g openclaw

# Or run directly with npx
npx openclaw --version
```

**System Requirements:**
- Node.js 18.0.0 or higher
- 2GB RAM minimum (4GB recommended for multiple agents)
- macOS, Linux, or Windows with WSL2

### Verify Installation

```bash
openclaw --version
# Expected: openclaw v1.2.0 (or latest)

openclaw help
# Shows all available commands
```

---

## Step 2: Initialize Your Gateway (3 minutes)

The gateway needs initial configuration to manage agents and connect to messaging platforms.

```bash
# Create a new OpenClaw workspace
mkdir my-agents
cd my-agents

# Initialize OpenClaw configuration
openclaw init

# This creates:
# ├── openclaw.json         # Gateway configuration
# ├── agents/               # Agent workspace directory
# └── logs/                 # Runtime logs
```

### Configure Your First Channel

OpenClaw can connect to Discord, Telegram, Slack, and more. Let's start with Discord:

```bash
# Configure Discord channel
openclaw channels add discord

# Follow the prompts:
# 1. Create Discord bot at https://discord.com/developers/applications
# 2. Copy bot token
# 3. Enable necessary permissions (Send Messages, Read Message History)
# 4. Invite bot to your server
```

**Discord Bot Setup (if needed):**
1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. "New Application" → Name it "My OpenClaw Bot"
3. Go to "Bot" → "Add Bot"
4. Copy the Token (you'll need this)
5. Under "Privileged Gateway Intents", enable:
   - MESSAGE_CONTENT_INTENT
   - GUILD_MESSAGES_INTENT

```bash
# Test channel connection
openclaw channels status
# Should show: discord [CONNECTED]
```

---

## Step 3: Create Your First Agent (2 minutes)

Agents in OpenClaw are specialized AI personalities with specific roles, skills, and knowledge.

```bash
# Create a helpful assistant agent
openclaw agents create assistant

# This creates:
# agents/assistant/
# ├── SOUL.md              # Agent's identity & personality
# ├── MEMORY.md            # Knowledge & context
# ├── TOOLS.md             # Available skills
# └── memory/              # Session transcripts
```

### Customize Your Agent

Edit the agent's personality:

```bash
# Open agent configuration
openclaw agents edit assistant
```

**Example SOUL.md:**
```markdown
# SOUL.md — Assistant

*I'm your helpful AI assistant, ready to tackle any task with enthusiasm.*

## Core Identity
**Name:** Assistant
**Role:** General-purpose helper
**Personality:** Friendly, thorough, proactive

## What I Do
- Answer questions and provide explanations
- Help with coding and technical tasks  
- Assist with writing and content creation
- Manage your schedule and reminders
- Research topics and summarize findings

## My Style
- Clear, actionable responses
- Ask clarifying questions when needed
- Provide step-by-step guides
- Include relevant examples
- Stay positive and encouraging
```

---

## Step 4: Start the Gateway (1 minute)

Now let's bring everything online:

```bash
# Start the OpenClaw gateway
openclaw gateway start

# Expected output:
# ✅ Gateway starting on port 5050
# ✅ Discord channel connected
# ✅ Agent 'assistant' loaded
# ✅ Skills system ready (12 skills available)
# ✅ Cron scheduler active
# 🚀 OpenClaw Gateway running!
```

The gateway runs in the background and manages:
- **Agent Sessions**: Conversations with each agent
- **Message Routing**: Discord ↔ Agent communication
- **Skill Orchestration**: Tools agents can use
- **Automated Jobs**: Scheduled tasks and workflows

---

## Step 5: Chat with Your Agent (2 minutes)

Your agent is now live! Let's test it:

### Via Discord
Go to your Discord server and type:
```
@YourBotName hello, can you help me with a coding question?
```

### Via CLI (for testing)
```bash
# Send a direct message to your agent
openclaw agent --agent assistant -m "Hello! What can you help me with?"

# Expected response:
# [Assistant] Hello! I'm excited to help you today. I can assist with:
# - Coding & technical questions
# - Writing & content creation  
# - Research & analysis
# - Task planning & organization
# 
# What would you like to work on?
```

### Check Session Status
```bash
# View active sessions
openclaw sessions

# Example output:
# ┌─────────────┬────────┬─────────────┬──────────────────┐
# │ Agent       │ Status │ Last Active │ Messages         │
# ├─────────────┼────────┼─────────────┼──────────────────┤
# │ assistant   │ ACTIVE │ 2 min ago   │ 3 messages       │
# └─────────────┴────────┴─────────────┴──────────────────┘
```

---

## Understanding Key Concepts

### Sessions
Each conversation with an agent is a **session** with persistent memory:
```bash
# List all sessions
openclaw sessions --active 60  # Last 60 minutes

# View session history  
openclaw sessions history <session-id>
```

### Skills
Skills are tools agents can use (like GitHub, Google Calendar, image generation):
```bash
# List available skills
openclaw skills list

# Enable a skill for your agent
openclaw skills enable github --agent assistant
```

### Memory
Agents remember conversations and learn from interactions:
- **MEMORY.md**: Long-term knowledge
- **memory/**: Session transcripts
- **Semantic search**: Agents can search their own history

---

## What's Next? Building on Your Foundation

Congratulations! You now have a working OpenClaw setup. Here are immediate next steps:

### 1. Add More Skills (5 minutes)
```bash
# Enable popular skills
openclaw skills enable github weather notion

# Test them
openclaw agent --agent assistant -m "What's the weather like today?"
```

### 2. Create Specialized Agents (10 minutes)
```bash
# Create a coding specialist
openclaw agents create coder --template coding

# Create a content writer  
openclaw agents create writer --template content
```

### 3. Set Up Automated Workflows (15 minutes)
```bash
# Create a daily standup reminder
openclaw cron add daily-standup \
  --schedule "0 9 * * 1-5" \
  --agent assistant \
  --message "Good morning! Ready for today's standup?"
```

### 4. Build Your First Multi-Agent Workflow
- **Research Agent**: Gathers information
- **Writer Agent**: Creates content  
- **Reviewer Agent**: Quality checks
- **Publisher Agent**: Distributes to channels

---

## Common Issues & Solutions

### "Gateway won't start"
```bash
# Check port availability
lsof -i :5050

# Use different port
openclaw gateway start --port 5051
```

### "Agent not responding"  
```bash
# Check agent status
openclaw agents status

# Restart specific agent
openclaw agents restart assistant
```

### "Discord bot offline"
```bash
# Test channel connection
openclaw channels status --probe

# Reconfigure if needed
openclaw channels configure discord
```

### "Out of memory errors"
```bash
# Check system resources
openclaw status --system

# Adjust memory limits
export NODE_OPTIONS="--max-old-space-size=4096"
```

---

## Production Tips

### 1. Use Environment Variables
```bash
# Create .env file for secrets
echo "DISCORD_TOKEN=your-token-here" > .env
echo "OPENAI_API_KEY=your-key-here" >> .env
```

### 2. Monitor Your Gateway
```bash
# Health check
openclaw health

# Real-time logs
openclaw logs -f

# Performance metrics
openclaw status --metrics
```

### 3. Backup Agent Memory
```bash
# Export all agent data
openclaw backup create agents-backup.zip

# Restore if needed  
openclaw backup restore agents-backup.zip
```

---

## Real-World Example: Customer Support Agent

Let's build something practical - a customer support agent that:
1. ✅ Responds to questions in Discord
2. ✅ Creates GitHub issues for bugs
3. ✅ Logs conversations for analysis
4. ✅ Escalates complex issues to humans

```bash
# Create the support agent
openclaw agents create support

# Enable required skills
openclaw skills enable github slack notion

# Configure auto-escalation
openclaw cron add escalation-check \
  --schedule "*/30 * * * *" \
  --agent support \
  --message "Check for unresolved issues needing human attention"
```

**SOUL.md for Support Agent:**
```markdown
# Customer Support Specialist

## Role
I handle customer questions, bug reports, and feature requests with professionalism and efficiency.

## Capabilities  
- Instant responses to common questions
- GitHub issue creation for bugs
- Escalation paths for complex problems
- Conversation logging and analysis

## Escalation Triggers
- Angry/frustrated customer language
- Technical issues requiring code changes
- Billing/account problems
- Questions unanswered after 3 attempts
```

This agent can handle 80% of support requests automatically, with smart escalation for complex cases.

---

## Join the OpenClaw Community

You're now part of the OpenClaw ecosystem! Connect with other builders:

- 🔧 **GitHub**: [OpenClaw Core](https://github.com/openclaw/openclaw) - Contribute code
- 💬 **Discord**: [Developer Community](https://discord.gg/openclaw) - Get help & share projects  
- 📺 **YouTube**: [OpenClaw Tutorials](https://youtube.com/@openclaw) - Video guides
- 🐦 **Twitter**: [@OpenClawAI](https://twitter.com/openclawai) - Updates & tips
- 📚 **Docs**: [docs.openclaw.dev](https://docs.openclaw.dev) - Full API reference

### Share Your Creation
Built something cool? Share it with the community:
- Tag @OpenClawAI on Twitter
- Post in #showcase on Discord
- Create a tutorial for others

---

## What's Next: Multi-Agent Workflows

Ready to go deeper? In the next tutorial, we'll build a **multi-agent content creation pipeline** where agents collaborate to:

1. **Research Agent** → Gathers market data and trends
2. **Writer Agent** → Creates first draft content
3. **Editor Agent** → Reviews and improves writing
4. **SEO Agent** → Optimizes for search engines
5. **Publisher Agent** → Distributes across platforms

This showcases OpenClaw's real power: **agents working together** like a skilled team.

### Preview: Multi-Agent Content Pipeline
```bash
# Coming in the next tutorial...
openclaw workflow create content-pipeline \
  --agents research,writer,editor,seo,publisher \
  --trigger "New blog post request" \
  --output "Published, optimized content"
```

---

## Summary: You're Ready to Build

In just 10 minutes, you've:

- ✅ **Installed OpenClaw** and configured your first gateway
- ✅ **Created an AI agent** with custom personality and skills  
- ✅ **Connected to Discord** for real-time conversations
- ✅ **Learned core concepts**: sessions, skills, memory, workflows
- ✅ **Built a practical example** with automated support agent
- ✅ **Joined the community** of OpenClaw builders

**You now have the foundation to build any AI-powered workflow imaginable.**

Whether you're automating customer support, building content pipelines, or creating personal AI assistants, OpenClaw gives you the tools to make AI agents work **for you** instead of the other way around.

**Next Steps:**
1. Experiment with different agent personalities
2. Enable more skills and test capabilities  
3. Set up your first automated workflow
4. Follow the next tutorial: "Building a Multi-Agent Workflow"

Welcome to the future of AI agent orchestration! 🚀

---

*Have questions? Join our Discord community or open an issue on GitHub. The OpenClaw team and community are here to help you succeed.*

**Tutorial Series:**
- ✅ **Part 1**: Getting Started with OpenClaw Gateway *(you are here)*
- 📝 **Part 2**: Building a Multi-Agent Workflow *(coming soon)*  
- 🔧 **Part 3**: Advanced OpenClaw: Custom Skills & Integrations *(coming soon)*