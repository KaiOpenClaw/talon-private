# 🦅 Talon
> *The OpenClaw command center that transforms Discord chaos into dashboard control*

[![Next.js](https://img.shields.io/badge/Next.js-14-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-38B2AC?style=flat-square&logo=tailwind-css)](https://tailwindcss.com/)
[![LanceDB](https://img.shields.io/badge/LanceDB-Vector%20Search-orange?style=flat-square)](https://lancedb.com/)

Talon is a modern web dashboard for managing AI agents through OpenClaw. Stop scrolling through endless Discord messages—get organized, searchable, and actionable agent management.

![Talon Dashboard Screenshot](docs/images/dashboard-overview.png)

## ✨ Why Talon?

**Discord Pain Points → Talon Solutions**

| Discord Problem | Talon Solution |
|-----------------|----------------|
| 💬 Message truncation | Full response rendering with syntax highlighting |
| 📜 Lost conversation history | Unified session timeline with search |
| 📱 Mobile management nightmare | Touch-optimized responsive design |
| 🔍 No cross-agent search | Semantic search across all agent memories |
| 📁 No workspace access | Complete file browser and editor |
| ⏱️ No real-time status | Live agent monitoring and updates |

## 🚀 Quick Start

### Option 1: Deploy to Render (Recommended)
[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy?repo=https://github.com/TerminalGravity/talon-private)

### Option 2: Local Development
```bash
git clone https://github.com/TerminalGravity/talon-private.git
cd talon-private
npm install
npm run dev
```

### Option 3: One-Line Setup
```bash
curl -fsSL https://raw.githubusercontent.com/TerminalGravity/talon-private/main/scripts/quick-deploy.sh | bash
```

**📚 Complete Guide**: [Quick Start Documentation](docs/quick-start.md)

## 🎯 Key Features

### 🤖 **Agent Management**
- **Live Status Monitoring**: Real-time agent health and activity
- **Session Management**: Organized conversations with full history
- **Workspace Browser**: Direct access to agent memories and files
- **Multi-Agent Orchestration**: Manage dozens of agents from one dashboard

### 🔍 **Semantic Search**  
- **Vector Search**: Find agent responses by meaning, not just keywords
- **Cross-Agent Search**: Search across all agent memories simultaneously  
- **LanceDB Integration**: Fast, scalable vector database
- **Smart Filtering**: Filter by agent, date range, or content type

### ⚡ **Real-Time Dashboard**
- **Live Updates**: WebSocket connections for instant agent responses
- **Cron Management**: Visual job scheduling and monitoring  
- **Skills Dashboard**: Install and manage OpenClaw capability packs
- **Performance Metrics**: Monitor costs, response times, success rates

### 📱 **Mobile-First Design**
- **Touch Navigation**: Thumb-friendly mobile interface
- **Responsive Layout**: Full feature parity across all devices
- **PWA Ready**: Install on mobile home screen
- **Offline Support**: Cached responses and offline-first design

## 🛠️ Tech Stack

| Layer | Technology | Purpose |
|-------|------------|---------|
| **Frontend** | Next.js 14 + TypeScript | Server-side rendering, type safety |
| **Styling** | Tailwind CSS + shadcn/ui | Consistent, responsive design system |
| **Search** | LanceDB + OpenAI Embeddings | Vector similarity search |
| **Real-time** | WebSockets + Server-Sent Events | Live dashboard updates |
| **State** | Zustand + React Query | Client state and data fetching |
| **Backend** | Next.js API Routes | RESTful API with OpenClaw integration |
| **Deployment** | Render + Docker | Production hosting with native modules |

## 📋 Prerequisites

- **OpenClaw Gateway** (running and accessible)
- **Node.js 18+** for local development
- **OpenAI API Key** (optional, for vector search)

## 🚦 Getting Started

### 1. Environment Setup
```bash
# Copy environment template
cp .env.example .env.local

# Configure your OpenClaw connection
GATEWAY_URL=https://your-server:5050
GATEWAY_TOKEN=your-openclaw-token
OPENAI_API_KEY=your-openai-key  # Optional
```

### 2. Install & Run  
```bash
npm install
npm run dev
```

### 3. Index Agent Memories (Optional)
```bash
npm run index-workspaces
```

### 4. Deploy to Production
See our [deployment guides](docs/deployment/) for Render, Vercel, or Docker.

## 📖 Documentation

| Guide | Description |
|-------|-------------|
| [**Quick Start**](docs/quick-start.md) | 5-minute setup guide |
| [**Deployment**](docs/deployment/) | Production deployment options |
| [**API Reference**](docs/api/) | REST API documentation |
| [**Architecture**](docs/architecture.md) | System design and tech decisions |
| [**Contributing**](CONTRIBUTING.md) | How to contribute to Talon |

## 🎥 Demos & Screenshots

### Dashboard Overview
![Dashboard](docs/images/dashboard.png)

### Mobile Interface  
![Mobile](docs/images/mobile.png)

### Vector Search
![Search](docs/images/search.png)

### Agent Workspace
![Workspace](docs/images/workspace.png)

**🎬 Video Demos**: [YouTube Playlist](https://youtube.com/playlist?list=talon-demos)

## 🤝 Contributing

We welcome contributions! See our [Contributing Guide](CONTRIBUTING.md) for details.

### Development Setup
```bash
git clone https://github.com/TerminalGravity/talon-private.git
cd talon-private
npm install
npm run dev
```

### Key Scripts
```bash
npm run dev          # Start development server
npm run build        # Build for production  
npm run test         # Run test suite
npm run lint         # Check code quality
npm run index        # Index agent workspaces for search
```

## 🌟 Roadmap

### Phase 1: Core Dashboard ✅
- [x] Agent management interface
- [x] Real-time chat and session management
- [x] Vector search with LanceDB  
- [x] Mobile-responsive design
- [x] Render deployment

### Phase 2: Advanced Features 🚧
- [ ] Multi-gateway support
- [ ] Cost tracking and budget alerts
- [ ] Team collaboration features
- [ ] Performance analytics dashboard
- [ ] Custom themes and layouts

### Phase 3: Enterprise 🔮
- [ ] SSO integration (OAuth, SAML)
- [ ] Role-based access control
- [ ] Audit logging and compliance
- [ ] White-label deployment options
- [ ] Enterprise support and SLA

## 📊 Status & Metrics

[![Build Status](https://img.shields.io/github/actions/workflow/status/TerminalGravity/talon-private/ci.yml?style=flat-square)](https://github.com/TerminalGravity/talon-private/actions)
[![Test Coverage](https://img.shields.io/codecov/c/github/TerminalGravity/talon-private?style=flat-square)](https://codecov.io/gh/TerminalGravity/talon-private)
[![Code Quality](https://img.shields.io/codeclimate/maintainability/TerminalGravity/talon-private?style=flat-square)](https://codeclimate.com/github/TerminalGravity/talon-private)

**Current Version**: `v0.8.0`  
**OpenClaw Compatibility**: `v2.0+`  
**Production Ready**: ✅

## 🔗 Links

- **Live Demo**: [talon.render.com](https://talon.render.com) *(coming soon)*
- **Documentation**: [docs.talon.dev](https://docs.talon.dev) *(coming soon)*
- **Discord Community**: [Join our Discord](https://discord.gg/talon)
- **OpenClaw Project**: [github.com/OpenClaw/openclaw](https://github.com/OpenClaw/openclaw)

## 📄 License

MIT License - see [LICENSE](LICENSE) for details.

## ❤️ Acknowledgments

Built with love for the OpenClaw community. Special thanks to:
- OpenClaw core team for the amazing agent framework
- LanceDB team for fast vector search
- Next.js team for the incredible developer experience
- All our beta users and contributors

---

<div align="center">

**⭐ Star this repo if Talon helps manage your AI agents!**

*Have questions? [Open an issue](https://github.com/TerminalGravity/talon-private/issues) or join our Discord community.*

</div>