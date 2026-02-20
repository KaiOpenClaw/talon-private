# Talon User Guide: Complete OpenClaw Dashboard Manual

*Version 2.1 - February 2026*  
*For Talon Dashboard Users*

---

## Table of Contents

1. [Quick Start](#quick-start)
2. [Dashboard Overview](#dashboard-overview)
3. [Agent Management](#agent-management)
4. [Chat Interface](#chat-interface)
5. [Semantic Search](#semantic-search)
6. [Session Management](#session-management)
7. [System Monitoring](#system-monitoring)
8. [Cron Job Management](#cron-job-management)
9. [Skills Dashboard](#skills-dashboard)
10. [Mobile Interface](#mobile-interface)
11. [Advanced Features](#advanced-features)
12. [Troubleshooting](#troubleshooting)
13. [FAQ](#faq)

---

## Quick Start

### Prerequisites
- OpenClaw Gateway running with at least one agent
- Modern web browser (Chrome, Firefox, Safari, Edge)
- Valid authentication credentials

### First-Time Setup
1. **Access Dashboard**: Navigate to your Talon URL
2. **Authenticate**: Enter your gateway token
3. **Verify Connection**: Check that agents appear in left sidebar
4. **Test Chat**: Send a message to any agent
5. **Explore Features**: Try search, monitoring, and mobile view

**⚡ Speed Test**: You should be chatting with agents within 2 minutes of first access.

---

## Dashboard Overview

### Layout Structure

```
┌─────────────────────────────────────────────────────────────────┐
│  Header: System Status | Search | User Menu                     │
├──────────────┬──────────────────────────────┬─────────────────────┤
│              │                              │                     │
│  Left Panel  │         Main Content         │    Right Panel     │
│              │                              │                     │
│  - Agents    │  - Dashboard Cards           │  - Chat Interface   │
│  - Workspaces│  - System Metrics            │  - Quick Actions    │
│  - Navigation│  - Recent Activity           │  - Notifications    │
│              │                              │                     │
└──────────────┴──────────────────────────────┴─────────────────────┘
```

### Status Indicators

| Icon | Meaning | Description |
|------|---------|-------------|
| 🟢 | Healthy | System functioning normally |
| 🟡 | Warning | Performance degraded but functional |
| 🔴 | Error | System issues requiring attention |
| ⚫ | Offline | Component unavailable |
| 🔵 | Active | Currently processing requests |

---

## Agent Management

### Agent States

**Active Agents** (🟢)
- Currently running or recently used
- Available for immediate conversation
- Maintaining active context and memory

**Restored Agents** (⚫)  
- Available but not currently active
- Will activate on first message
- Context may need rebuilding

**Error Agents** (🔴)
- Configuration or connectivity issues
- Require troubleshooting before use
- Check gateway logs for details

### Workspace Organization

Agents are organized by workspace directories:

```
📁 /root/clawd/agents/
├── 🤖 duplex (Active)
│   ├── SOUL.md - Agent identity & purpose
│   ├── MEMORY.md - Current project context  
│   └── memory/ - Session transcripts
├── 🧠 coach (Active)
├── 🎯 vellaco-content (Restored)
└── 📊 0dte (Restored)
```

### Agent Information Panel

Click any agent to view:
- **Identity**: Role, capabilities, specialization
- **Current Status**: Activity level, recent sessions
- **Memory Size**: Context volume and key topics
- **Performance**: Response time, success rate
- **Configuration**: Custom settings and tools

---

## Chat Interface

### Starting Conversations

1. **Select Agent**: Click agent name in sidebar
2. **Chat Panel Opens**: Right side of screen
3. **Type Message**: Use text input at bottom
4. **Send**: Press Enter or click Send button

### Message Features

**Rich Text Support**:
- `Code blocks` with syntax highlighting
- **Bold** and *italic* formatting
- [Clickable links](https://example.com)
- Lists and structured content

**Interactive Elements**:
- **Copy Code**: One-click copying of code blocks
- **Message Actions**: Reply, copy, delete options
- **Context Menu**: Right-click for additional options

**Advanced Chat Options**:
- **Multi-line Input**: Shift+Enter for new lines
- **Message History**: Scroll up to see conversation history
- **Context Preservation**: Long conversations automatically managed

### Chat Commands

| Command | Function |
|---------|----------|
| `/clear` | Clear conversation history |
| `/status` | Show agent status |
| `/help` | List available commands |
| `/memory` | View agent memory summary |

---

## Semantic Search

### Overview
Search across all agent memories, conversations, and documents using natural language queries.

### Search Interface
- **Global Search**: Top navigation bar (🔍)
- **Keyboard Shortcut**: `Cmd/Ctrl + K`
- **Advanced Filters**: Agent selection, date ranges
- **Results Ranking**: Relevance-based ordering

### Search Techniques

**Concept Searching**:
```
"pricing strategy" → finds pricing discussions across all agents
"deployment issues" → locates troubleshooting sessions
"user feedback" → discovers customer interaction summaries
```

**Agent-Specific Searching**:
```
Filter: duplex → "audio processing" → duplex-specific audio work
Filter: coach → "goal setting" → coaching-related guidance
```

**Time-Based Searching**:
```
"database migration" + Last 7 days → recent migration work
"performance optimization" + Last month → recent optimization efforts
```

### Search Results

Results show:
- **Snippet**: Relevant text excerpt with highlighting
- **Source**: Agent and file location
- **Timestamp**: When content was created/modified
- **Relevance Score**: Semantic similarity ranking
- **Context Links**: Jump directly to full content

---

## Session Management

### Session Types

**Active Sessions**
- Current conversations with agents
- Real-time message exchange
- Preserved context and history

**Background Sessions**
- Monitoring and automated tasks
- Long-running processes
- Scheduled or triggered activities

**Archived Sessions**
- Completed conversations
- Searchable via semantic search
- Available for reference and learning

### Session Controls

**Starting Sessions**:
- Click agent → automatic session creation
- Manual session creation via "New Session" button
- Restore from archive for continued conversation

**Managing Sessions**:
- **Pause**: Temporarily stop session
- **Archive**: Move to searchable archive
- **Delete**: Permanently remove (use carefully)
- **Export**: Save conversation history

**Session Information**:
- Duration and message count
- Participants (multi-agent sessions)
- Session health and performance
- Resource usage and costs

---

## System Monitoring

### Dashboard Overview

**System Health Cards**:
- **Gateway Status**: OpenClaw core connectivity
- **Agent Health**: Overall agent ecosystem status  
- **Active Sessions**: Current conversation count
- **System Load**: Resource utilization

**Performance Metrics**:
- **Response Times**: Average agent response latency
- **Success Rates**: Successful vs. failed requests
- **Error Counts**: System errors requiring attention
- **Uptime**: System availability metrics

### Real-Time Monitoring

**Live Updates**: Dashboard refreshes automatically every 30 seconds

**Status Changes**:
- Immediate notification of system issues
- Visual indicators change in real-time
- Alerts for critical system events

**Historical Data**:
- 24-hour performance trends
- Weekly and monthly patterns
- Comparative analysis tools

### Alerting System

**Alert Levels**:
- **Info**: General system notifications
- **Warning**: Performance degradation alerts
- **Error**: System issues requiring action
- **Critical**: Immediate attention required

**Notification Channels**:
- In-dashboard notifications
- Browser notifications (if enabled)
- Discord/Slack integration (optional)
- Email alerts (configurable)

---

## Cron Job Management

### Overview
Manage all scheduled OpenClaw tasks through the web interface.

### Job Dashboard

**Job List View**:
- All scheduled tasks with status
- Next execution times
- Success/failure history
- Resource usage patterns

**Job Categories**:
- **Content Generation**: Blog posts, social media
- **System Maintenance**: Health checks, cleanups
- **Data Processing**: Analytics, reports
- **Monitoring**: Alert generation, status checks

### Job Controls

**Basic Operations**:
- **Enable/Disable**: Toggle job active status
- **Run Now**: Trigger immediate execution
- **Edit**: Modify schedule or configuration
- **Delete**: Remove job permanently

**Advanced Features**:
- **Bulk Operations**: Enable/disable multiple jobs
- **Template Creation**: Reusable job templates
- **Dependency Management**: Job execution ordering
- **Error Handling**: Retry policies and failure actions

### Job Creation

**Wizard Interface**:
1. **Job Type**: Select from predefined templates
2. **Schedule**: Visual cron expression builder
3. **Configuration**: Job-specific settings
4. **Testing**: Validate before saving
5. **Deployment**: Activate and monitor

**Schedule Patterns**:
```
Every 15 minutes: */15 * * * *
Daily at 9 AM: 0 9 * * *
Weekly on Monday: 0 9 * * MON
Monthly 1st day: 0 9 1 * *
```

---

## Skills Dashboard

### Overview
Manage OpenClaw capability packs (skills) that extend agent functionality.

### Skills Categories

**Coding & Development**:
- `coding-agent`: Code generation and review
- `github`: Repository management
- `tmux`: Terminal session control

**Productivity & Communication**:
- `gog`: Google Workspace integration
- `notion`: Knowledge base management
- `weather`: Weather information

**Media & Content**:
- `nano-banana-pro`: Image generation
- `openai-image-gen`: Advanced image creation
- `video-frames`: Video processing

**System & Security**:
- `healthcheck`: System auditing
- `skill-creator`: Custom skill development

### Skill Management

**Installation**:
1. Browse available skills
2. Check dependencies and requirements
3. Install missing prerequisites
4. Enable skill for agents
5. Test functionality

**Status Monitoring**:
- **Ready**: Installed and functional
- **Available**: Can be installed
- **Error**: Missing dependencies or issues
- **Installing**: Installation in progress

**Bulk Operations**:
- Install multiple related skills
- Enable skills for specific agent groups
- Batch updates and dependency resolution

---

## Mobile Interface

### Mobile-First Design

**Touch Optimizations**:
- 44px minimum touch targets
- Swipe gestures for navigation
- Pull-to-refresh functionality
- Safe area handling for notched devices

**Navigation**:
- **Bottom Tab Bar**: Primary navigation
- **Floating Action Button**: Quick command access
- **Contextual Actions**: Swipe actions on lists
- **Back Gestures**: Standard mobile navigation patterns

### Mobile Features

**Agent Management**:
- Full agent list with status indicators
- Quick chat access from any screen
- Session switching with preserved context
- Notification badges for activity

**Dashboard Access**:
- Key metrics in mobile-optimized cards
- Swipe-based metric browsing
- Quick status checks
- Emergency alert handling

**Optimizations**:
- **Offline Support**: Basic functionality without connection
- **Background Sync**: Data updates when app returns to foreground
- **Push Notifications**: Critical alerts and messages
- **Battery Optimization**: Efficient data usage and processing

### Mobile-Specific Gestures

| Gesture | Function |
|---------|----------|
| Pull down | Refresh current view |
| Swipe left on agent | Quick chat |
| Swipe right on message | Reply |
| Long press | Context menu |
| Pinch | Zoom (where applicable) |

---

## Advanced Features

### Command Palette

**Access**: `Cmd/Ctrl + K` or floating action button (mobile)

**Available Commands**:
- **Navigation**: Jump to any dashboard section
- **Agent Actions**: Quick agent selection and chat
- **System Operations**: Restart, status checks
- **Search**: Semantic search with filters
- **Session Management**: Create, switch, archive sessions

### Automation & Workflows

**Custom Workflows**:
- Chain multiple agent interactions
- Conditional logic based on responses
- Automated follow-up actions
- Integration with external systems

**Workflow Templates**:
- Content creation pipelines
- Bug triage and resolution
- Customer support escalation
- Performance monitoring and response

### Integration APIs

**Webhook Support**:
- Incoming webhooks for external triggers
- Outgoing webhooks for notifications
- Custom payload formats
- Authentication and security

**REST API**:
- Full programmatic access to all features
- Authentication via tokens
- Rate limiting and usage monitoring
- Documentation and client libraries

---

## Troubleshooting

### Common Issues

**Connection Problems**
```
❌ Issue: "Can't connect to gateway"
✅ Solution: 
  1. Check OpenClaw Gateway status: `openclaw status`
  2. Verify network connectivity
  3. Confirm gateway URL and token
  4. Check firewall settings
```

**Agent Not Responding**
```
❌ Issue: Agent shows as active but doesn't respond
✅ Solution:
  1. Check agent logs in workspace directory
  2. Verify agent configuration (SOUL.md)
  3. Restart agent via CLI: `openclaw agent restart <name>`
  4. Clear agent memory if needed
```

**Slow Performance**
```
❌ Issue: Dashboard loads slowly or responses are delayed
✅ Solution:
  1. Check system resource usage
  2. Clear browser cache and reload
  3. Verify gateway performance with `openclaw status --deep`
  4. Optimize agent memory usage
```

**Search Not Working**
```
❌ Issue: Semantic search returns no results
✅ Solution:
  1. Verify LanceDB index: `openclaw memory status`
  2. Check OpenAI API key configuration
  3. Re-index workspaces: `openclaw memory index`
  4. Confirm embeddings are being generated
```

### Diagnostic Tools

**Health Checks**:
- Built-in system diagnostics
- Connection testing utilities
- Performance profiling
- Error log analysis

**Debug Mode**:
- Enable detailed logging
- Real-time error reporting
- Performance metrics
- Network request monitoring

### Getting Help

**Self-Service Resources**:
- Comprehensive FAQ section
- Video tutorials and demos
- Community knowledge base
- Troubleshooting wizards

**Community Support**:
- **Discord**: #talon-users channel for peer support
- **GitHub**: Issues and discussions
- **Documentation**: Detailed technical reference
- **Office Hours**: Weekly community support sessions

**Professional Support**:
- Enterprise support packages available
- Custom installation and configuration
- Training and onboarding services
- Priority bug fixes and features

---

## FAQ

### General Questions

**Q: What's the difference between Talon and OpenClaw CLI?**
A: Talon is a web-based dashboard that provides a visual interface for OpenClaw. You can do everything through Talon that you can with CLI, plus additional features like semantic search and real-time monitoring.

**Q: Can I use both Talon and CLI simultaneously?**
A: Yes! Talon and CLI work with the same OpenClaw Gateway. Changes made in one interface are immediately reflected in the other.

**Q: Is my data secure?**
A: Talon connects directly to your OpenClaw Gateway without sending data to external services (except for OpenAI embeddings for search, if configured). All agent conversations remain on your infrastructure.

**Q: Does Talon work offline?**
A: Talon requires connection to your OpenClaw Gateway. However, the mobile app provides basic offline functionality and syncs when connectivity returns.

### Technical Questions

**Q: What browsers are supported?**
A: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+. Mobile browsers are fully supported.

**Q: Can I customize the interface?**
A: Yes! Talon supports custom themes, layout preferences, and dashboard configurations. Advanced users can modify the open-source code.

**Q: How do I backup my Talon configuration?**
A: Talon configuration is stored with your OpenClaw Gateway. Regular OpenClaw backups include all Talon settings.

**Q: Can multiple users access the same Talon dashboard?**
A: Yes, but each user needs their own authentication token. Shared agent access follows OpenClaw's permissions model.

### Feature Questions

**Q: How accurate is semantic search?**
A: Search uses OpenAI's text-embedding-3-small model with 96%+ accuracy for relevant content discovery. Results improve as your agents accumulate more memory.

**Q: Can I create custom dashboard widgets?**
A: Currently, dashboard layout is fixed but customizable. Widget customization is planned for future releases.

**Q: How do I set up mobile notifications?**
A: Enable push notifications in your browser/mobile app settings. Configure notification preferences in Talon's settings panel.

**Q: Can I integrate Talon with other tools?**
A: Yes! Talon provides webhook endpoints and REST APIs. Popular integrations include Slack, Discord, and monitoring tools.

### Billing & Support

**Q: Is Talon free?**
A: Talon is open source and free to use. Some features (like OpenAI embeddings for search) may incur API costs that you pay directly to providers.

**Q: Where can I report bugs or request features?**
A: Use GitHub Issues for bug reports and feature requests. Join Discord for community discussion and support.

**Q: How often is Talon updated?**
A: Talon follows a continuous deployment model. Updates are deployed automatically and announced in the Discord community.

---

*Last updated: February 20, 2026*  
*For the latest information, visit our [documentation site](https://docs.talon.com) or join our [Discord community](https://discord.gg/talon)*