# Talon Quick Start Guide

*Get your AI agent command center running in 5 minutes*

## Prerequisites

Before starting, ensure you have:

- [ ] **OpenClaw Gateway** running and accessible
- [ ] **Node.js 18+** installed locally  
- [ ] **OpenAI API key** for vector search (optional)
- [ ] **GitHub account** for deployment

## 1. Environment Setup

### Get Your Gateway URL & Token

1. **Find your OpenClaw Gateway**:
   ```bash
   openclaw status
   ```
   Look for the gateway URL (usually `https://your-server:5050`)

2. **Get your authentication token**:
   ```bash
   cat ~/.openclaw/openclaw.json | grep token
   ```

### Configure Environment Variables

Create `.env.local` in your Talon directory:

```bash
# Required: OpenClaw Gateway connection
GATEWAY_URL=https://your-server.tail123abc.ts.net:5050  
GATEWAY_TOKEN=your-openclaw-token-here

# Optional: Vector search (enables semantic search)
OPENAI_API_KEY=your-openai-key-here

# Optional: Talon API (for workspace file access)
TALON_API_URL=https://your-talon-api-url.com
TALON_API_TOKEN=your-talon-api-token
```

## 2. Local Development

### Clone and Install
```bash
git clone https://github.com/TerminalGravity/talon-private.git
cd talon-private
npm install
```

### Start Development Server
```bash
npm run dev
```

Visit `http://localhost:3000` - you should see the Talon dashboard!

### Test Your Connection

1. **Gateway Health**: Check the top-right status indicator should be green
2. **Agent List**: You should see your OpenClaw agents in the sidebar
3. **Chat Interface**: Try sending a message to any agent

## 3. Quick Deploy to Render

### One-Click Deploy

1. **Fork the Repository** to your GitHub account

2. **Create Render Service**:
   - Go to [render.com](https://render.com)
   - Click "New" → "Web Service"  
   - Connect your forked repository
   - Use these settings:
     ```
     Build Command: npm run build
     Start Command: npm start
     Node Version: 18
     ```

3. **Add Environment Variables** in Render dashboard:
   ```
   GATEWAY_URL=your-gateway-url
   GATEWAY_TOKEN=your-token
   OPENAI_API_KEY=your-openai-key (optional)
   ```

4. **Deploy**: Render will automatically build and deploy your Talon instance

## 4. First Steps in Talon

### Explore the Dashboard
- **Agent Sidebar**: All your OpenClaw agents with status indicators
- **Chat Panel**: Real-time conversation with any agent
- **Session History**: Complete conversation logs with search
- **Skills Dashboard**: Manage your OpenClaw capability packs
- **Cron Jobs**: Schedule and monitor automated tasks

### Enable Vector Search (Optional)
```bash
# In your local Talon directory
npm run index-workspaces
```
This indexes all agent memories for semantic search.

### Try Key Features
1. **Chat with an Agent**: Click any agent in sidebar, send a message
2. **Browse Agent Memory**: Click "Workspace" tab to see agent files
3. **Search Across All Agents**: Use the search bar for semantic queries
4. **Mobile View**: Access Talon from your phone for on-the-go management

## 5. Common Issues & Solutions

### ❌ "Gateway Connection Failed"
- **Check**: Is your OpenClaw gateway running? (`openclaw status`)
- **Verify**: Gateway URL is accessible from your deployment location
- **Test**: Try the gateway URL in your browser

### ❌ "No Agents Found"  
- **Check**: Your gateway token has proper permissions
- **Verify**: Agents are actually running (`openclaw agents list`)
- **Restart**: Try restarting both gateway and Talon

### ❌ "Vector Search Not Working"
- **Check**: OPENAI_API_KEY is set correctly
- **Run**: `npm run index-workspaces` to create the search index
- **Verify**: You have agent workspace files to index

### ❌ "Build Failures"
- **Node Version**: Ensure you're using Node.js 18 or later
- **Dependencies**: Run `npm install` to update packages
- **Clear Cache**: Delete `.next/` folder and rebuild

## 6. Next Steps

### Customize Your Setup
- **Themes**: Enable dark/light mode toggle
- **Mobile**: Configure PWA settings for mobile installation  
- **Performance**: Set up caching for faster load times

### Advanced Features  
- **Multi-Gateway**: Connect multiple OpenClaw instances
- **Team Access**: Set up authentication for team members
- **Custom Skills**: Develop custom dashboard components
- **API Integration**: Build custom tools using Talon's API

### Get Support
- **GitHub Issues**: Report bugs or request features
- **Discord Community**: Join other Talon users for help and tips
- **Documentation**: Complete guides at `/docs/`

---

**🎉 Congratulations!** You now have a fully functional AI agent command center. Start by chatting with your agents and exploring the workspace browser—you'll quickly see why Talon is better than managing agents through Discord.

**Questions?** Check our [troubleshooting guide](./troubleshooting.md) or [open an issue](https://github.com/TerminalGravity/talon-private/issues).