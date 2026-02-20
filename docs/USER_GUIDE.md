# Talon User Guide

**Complete guide to using Talon for OpenClaw agent management**

*Last updated: February 20, 2026*

---

## Table of Contents

1. [Getting Started](#getting-started)
2. [Core Features](#core-features)
3. [Advanced Usage](#advanced-usage)
4. [Mobile Experience](#mobile-experience)
5. [Troubleshooting](#troubleshooting)
6. [FAQ](#frequently-asked-questions)

---

## Getting Started

### What is Talon?

Talon is a professional web dashboard designed specifically for managing OpenClaw AI agents. It solves the common pain points of using Discord for agent management:

| Discord Problems | Talon Solutions |
|-----------------|----------------|
| Message truncation | Full response rendering |
| Poor code formatting | Syntax-highlighted code blocks |
| Limited search | Semantic search across all agents |
| Mobile experience | Native mobile-first design |
| Session management | Unified session timeline |
| File access | Direct workspace file management |

### Feature Comparison Matrix

| Feature | Discord | Talon | Advantage |
|---------|---------|-------|-----------|
| **Message Display** | Truncated, basic | Full rendering, syntax highlighting | 🚀 Much better |
| **Search** | Basic text search | Vector semantic search | 🚀 Revolutionary |
| **Mobile** | Clunky, limited | PWA with bottom nav | 🚀 Native-like |
| **File Access** | None | Direct workspace browser | 🚀 Game changer |
| **Session Management** | Channel switching | Unified timeline | 🚀 Streamlined |
| **Real-time Updates** | Manual refresh | WebSocket live updates | 🚀 Instant |
| **System Monitoring** | External tools | Integrated dashboard | 🚀 Centralized |

### Quick Setup (5 Minutes)

1. **Deploy to Render**: [![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy?repo=https://github.com/KaiOpenClaw/talon-private)

2. **Set Environment Variables**:
   ```env
   GATEWAY_URL=https://your-gateway:5050
   GATEWAY_TOKEN=your_token_here
   OPENAI_API_KEY=sk-your_key_for_search
   ```

3. **Access Your Dashboard**: Use the Render URL and login with your auth token

4. **Verify Connection**: Check System Status for green indicators

---

## Core Features

### 1. Dashboard Navigation

#### Workspace-First Design
- **Agent Sidebar**: All 20+ agents with status indicators
- **Primary Navigation**: Dashboard, Search, Memory, Sessions
- **Quick Access**: Recent sessions, active agents, system alerts

#### Dashboard Overview
- **Agent Status Cards**: Health, last activity, session count
- **System Health**: Gateway connection, skills status, channel monitoring
- **Recent Activity**: Latest sessions, errors, performance metrics
- **Quick Actions**: Start new session, trigger cron job, search memories

### 2. Real-Time Chat Interface

#### Message Rendering
- **Full Response Display**: No Discord truncation
- **Syntax Highlighting**: Code blocks with proper language detection
- **Rich Media**: Images, attachments, embedded links
- **Message Actions**: Copy, edit, retry, reference

#### Session Management
- **Active Sessions**: Live conversations with real-time updates
- **Session History**: Complete timeline with search and filtering
- **Session Routing**: Messages delivered to correct agent workspace
- **Typing Indicators**: Real-time typing status from agents

#### Advanced Features
- **Message Threading**: Organize complex conversations
- **File Attachments**: Upload files directly to agent workspace
- **Voice Commands**: Coming in v0.9.0
- **Collaborative Sessions**: Multiple users in same conversation

### 3. Semantic Search

#### Vector Search Engine
- **LanceDB Integration**: High-performance vector database
- **OpenAI Embeddings**: text-embedding-3-small model
- **780+ Chunks Indexed**: Across 27 agent workspaces
- **Real-time Indexing**: Auto-updates when files change

#### Search Features
- **Cross-Agent Search**: Find information across all agent memories
- **Agent Filtering**: Search within specific agent workspaces
- **Similarity Scoring**: Results ranked by relevance
- **Context Snippets**: Preview matching content with highlighting

#### Search Interface
- **Global Search Bar**: Available on every page
- **Advanced Filters**: Date range, agent selection, file type
- **Search History**: Recent searches with one-click repeat
- **Export Results**: Save search results for reference

### 4. Memory & Workspace Management

#### File Browser
- **Workspace Navigation**: Browse all agent directories
- **File Types**: MEMORY.md, SOUL.md, session logs, custom files
- **Permissions**: Read/write access with version control
- **Bulk Operations**: Upload, download, organize files

#### Memory Editor
- **Live Editing**: Modify agent memory files directly
- **Syntax Highlighting**: Markdown, YAML, JSON support
- **Auto-save**: Changes persist automatically
- **Version History**: Track changes with timestamps
- **Collaborative Editing**: Multiple users with conflict resolution

#### Memory Analytics
- **Memory Usage**: Track how agents use their memory
- **Content Analysis**: Identify patterns and optimization opportunities
- **Search Insights**: Most searched topics and queries
- **Performance Metrics**: Memory access patterns and bottlenecks

---

## Advanced Usage

### 1. Command Palette (⌘K)

#### Power User Interface
- **Global Shortcut**: ⌘K (Mac) or Ctrl+K (Windows/Linux)
- **Fuzzy Search**: Type partial matches for any action
- **Keyboard Navigation**: ↑↓ to move, Enter to select, Esc to close
- **Action Categories**: Navigation, Agents, Sessions, System

#### Available Commands
- **Navigation**: Quick jump to any page or feature
- **Agent Actions**: Start session, view memory, check status
- **System Actions**: Trigger cron job, restart service, view logs
- **Search Actions**: Semantic search, filter by agent, export results

### 2. Mission Control Dashboard

#### Skills Management
- **49 Available Skills**: From coding to image generation
- **Dependency Tracking**: See requirements for each skill
- **Installation**: One-click enable/disable skills
- **Usage Analytics**: Track which skills are most used

#### Cron Job Management
- **31+ Active Jobs**: Monitor all scheduled tasks
- **Job Controls**: Trigger manually, pause, modify schedule
- **Execution History**: View past runs with success/failure details
- **Custom Jobs**: Create new scheduled tasks

#### Channel Monitoring
- **Multi-Platform**: Discord, Telegram, Slack integration
- **Status Dashboard**: Connection health for all channels
- **Message Analytics**: Volume, response times, error rates
- **Channel Configuration**: Manage accounts and permissions

#### System Health
- **Performance Metrics**: Response times, memory usage, CPU load
- **Error Monitoring**: Real-time error tracking with alerts
- **Connection Status**: Gateway, database, external services
- **Maintenance Windows**: Scheduled downtime and updates

### 3. Real-Time Updates

#### WebSocket Integration
- **Live Dashboard**: No manual refresh needed
- **Session Updates**: Real-time message delivery
- **Status Changes**: Instant agent status updates
- **System Alerts**: Immediate notification of issues

#### Performance Optimization
- **Efficient Updates**: Only changed data transmitted
- **Connection Management**: Auto-reconnect with exponential backoff
- **Bandwidth Optimization**: Compressed message format
- **Offline Handling**: Graceful degradation when disconnected

---

## Mobile Experience

### 1. Progressive Web App (PWA)

#### Installation
- **Add to Home Screen**: Native app-like experience
- **Offline Support**: Core features work without internet
- **Push Notifications**: Agent messages and system alerts
- **Background Sync**: Updates when connection restored

#### Mobile Navigation
- **Bottom Navigation Bar**: Thumb-friendly design
- **Gesture Support**: Swipe, pinch, pull-to-refresh
- **Touch Optimization**: 44px minimum touch targets
- **Safe Areas**: Respects iPhone notch and Android navigation

### 2. Mobile-Optimized Features

#### Chat Interface
- **Touch-Friendly**: Large message bubbles, easy scrolling
- **Voice Input**: Speech-to-text for message composition
- **Image Sharing**: Camera integration for screenshots
- **Haptic Feedback**: Tactile feedback for interactions

#### Dashboard Adaptations
- **Responsive Cards**: Stack on smaller screens
- **Collapsible Sections**: Expand/collapse for space efficiency
- **Quick Actions**: Floating action button for common tasks
- **Performance Mode**: Reduced animations on slower devices

---

## Troubleshooting

### Common Issues

#### Gateway Connection Problems
**Symptom**: Red indicators in System Status

**Solutions**:
1. Verify `GATEWAY_URL` is correct and accessible
2. Check `GATEWAY_TOKEN` matches OpenClaw configuration
3. Ensure firewall allows connections to port 5050
4. Test connectivity: `curl https://your-gateway:5050/api/health`

#### Search Not Working
**Symptom**: Empty search results or "Search disabled" message

**Solutions**:
1. Set `OPENAI_API_KEY` environment variable
2. Trigger manual indexing: POST to `/api/index`
3. Check indexing status in System Dashboard
4. Verify API key has embedding permissions

#### Agents Not Loading
**Symptom**: Empty agents list or loading forever

**Solutions**:
1. Check gateway connection status
2. Verify agent workspace permissions
3. Restart OpenClaw Gateway service
4. Check gateway logs for discovery errors

#### Mobile Issues
**Symptom**: Features not working on mobile devices

**Solutions**:
1. Use Safari (iOS) or Chrome (Android) for best compatibility
2. Enable "Add to Home Screen" for PWA features
3. Allow notifications for real-time updates
4. Clear browser cache if experiencing issues

### Performance Optimization

#### Slow Loading
- **Clear Browser Cache**: Ctrl+Shift+R for hard refresh
- **Check Network**: Verify stable internet connection
- **Reduce Concurrent Sessions**: Limit active conversations
- **Enable Performance Mode**: In settings for slower devices

#### High Memory Usage
- **Close Unused Tabs**: Each Talon tab uses memory
- **Limit Search Results**: Use filters to reduce result sets
- **Restart Browser**: Clear memory leaks in long sessions
- **Update Browser**: Use latest version for best performance

### Getting Help

#### Support Resources
- **Discord Community**: [#talon-support channel](https://discord.gg/openclaw)
- **GitHub Issues**: [Report bugs and request features](https://github.com/KaiOpenClaw/talon-private/issues)
- **Documentation**: [Complete developer docs](./development.md)
- **Video Tutorials**: [YouTube channel](https://youtube.com/@openclaw)

#### Diagnostic Information
When reporting issues, please include:
- **Browser**: Name and version
- **Operating System**: Windows/Mac/Linux version
- **Error Messages**: Full error text and stack trace
- **Steps to Reproduce**: Detailed reproduction steps
- **System Status**: Screenshot of dashboard health indicators

---

## Frequently Asked Questions

### General Usage

**Q: Is Talon free to use?**
A: Yes! Talon is open source and free to deploy yourself. We also offer managed hosting plans.

**Q: Can multiple people use the same Talon instance?**
A: Yes, Talon supports multiple users with shared access to OpenClaw agents.

**Q: Does Talon replace Discord entirely?**
A: Talon is specifically for OpenClaw agent management. You can still use Discord for team communication.

**Q: How is my data protected?**
A: Talon processes data locally in your deployment. We never see your agent conversations or files.

### Technical Questions

**Q: What happens if Talon goes down?**
A: Your OpenClaw agents continue working normally. Talon is just a dashboard interface.

**Q: Can I customize Talon's appearance?**
A: Yes! Themes, layouts, and custom CSS are supported (documentation coming in v0.9.0).

**Q: How much does it cost to run Talon?**
A: Render hosting costs ~$7-25/month depending on usage. OpenAI API for search costs ~$0.10/month.

**Q: Can I integrate Talon with other tools?**
A: Yes! Talon provides REST API and WebSocket endpoints for custom integrations.

### Advanced Usage

**Q: How do I backup my Talon configuration?**
A: Environment variables and custom settings can be exported. Agent data is stored in OpenClaw.

**Q: Can I run multiple Talon instances?**
A: Yes, you can deploy multiple instances for different teams or environments.

**Q: How do I contribute to Talon development?**
A: See our [Contributing Guide](../CONTRIBUTING.md) for code contributions and feature requests.

**Q: What's the roadmap for future features?**
A: Check our [GitHub Issues](https://github.com/KaiOpenClaw/talon-private/issues) and [Project Board](https://github.com/KaiOpenClaw/talon-private/projects) for planned features.

---

## Next Steps

### Explore Advanced Features
- **[Developer Setup Guide](./development.md)** - Set up local development environment
- **[API Reference](./api-reference.md)** - Build custom integrations
- **[Deployment Guide](../DEPLOY.md)** - Advanced deployment options
- **[Security Guide](./security-guide.md)** - Production security best practices

### Join the Community
- **[Discord Server](https://discord.gg/openclaw)** - Get help and share experiences
- **[GitHub Discussions](https://github.com/KaiOpenClaw/talon-private/discussions)** - Feature ideas and feedback
- **[Contributing](../CONTRIBUTING.md)** - Help improve Talon for everyone

### Stay Updated
- **[Changelog](../CHANGELOG.md)** - Latest features and improvements
- **[Blog](https://blog.openclaw.ai)** - Deep dives and tutorials
- **[Twitter](https://twitter.com/openclaw)** - News and updates

---

**🎉 Welcome to the future of AI agent management!**

*Need help? Have questions? Join our [Discord community](https://discord.gg/openclaw) - we're here to help!*