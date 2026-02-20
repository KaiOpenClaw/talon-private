# Talon Developer Guide

**Complete guide for developers wanting to deploy, contribute to, or extend Talon**

*Last updated: February 20, 2026*

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Local Development Setup](#local-development-setup)  
3. [Production Deployment](#production-deployment)
4. [Contributing Guidelines](#contributing-guidelines)
5. [API Documentation](#api-documentation)
6. [Extending Talon](#extending-talon)

---

## Architecture Overview

### System Architecture

```
┌─────────────────────────────────────────┐
│         Talon Dashboard (Next.js)       │
│  ┌─────────────────────────────────┐    │
│  │  Frontend (React + TypeScript)  │    │
│  │  - Real-time WebSocket client   │    │
│  │  - Responsive UI components     │    │
│  │  - Progressive Web App (PWA)    │    │
│  └─────────────────────────────────┘    │
│  ┌─────────────────────────────────┐    │
│  │  API Routes (Next.js)          │    │
│  │  - Gateway Bridge APIs         │    │
│  │  - WebSocket server             │    │
│  │  - LanceDB search integration   │    │
│  └─────────────────────────────────┘    │
└─────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────┐
│   OpenClaw Gateway (srv1325349:5050)    │
│   - Sessions API                        │
│   - Agent orchestration                 │
│   - Cron job management                 │
│   - Skills and channel management       │
└─────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────┐
│         /root/clawd/agents/*            │
│   - 20+ agent workspaces                │
│   - MEMORY.md, SOUL.md files            │
│   - Session transcripts                 │
└─────────────────────────────────────────┘
```

### Technology Stack

| Layer | Technology | Purpose |
|-------|------------|---------|
| **Frontend** | Next.js 14 + React 18 | Server-side rendering, routing |
| **Styling** | Tailwind CSS + shadcn/ui | Responsive design, components |
| **State Management** | Zustand | Client-side state |
| **Search Engine** | LanceDB + OpenAI embeddings | Vector semantic search |
| **Real-time** | WebSockets (ws library) | Live updates |
| **API Layer** | Next.js API routes | Gateway bridge |
| **Deployment** | Render Web Service | Production hosting |
| **Gateway** | OpenClaw via Tailscale | Agent orchestration |

### Data Flow

1. **User Interaction** → Next.js frontend component
2. **API Call** → Next.js API route handler  
3. **Gateway Bridge** → OpenClaw Gateway REST/CLI calls
4. **Response Processing** → Data transformation and caching
5. **Real-time Updates** → WebSocket broadcast to all clients
6. **UI Update** → React component re-render

### Key Components

```typescript
src/
├── app/                    # Next.js 14 App Router
│   ├── (dashboard)/       # Dashboard layout group
│   ├── api/               # API route handlers
│   └── globals.css        # Global styles
├── components/            # React components
│   ├── ui/               # shadcn/ui base components
│   └── dashboard/        # Dashboard-specific components
├── lib/                  # Utility libraries
│   ├── gateway.ts        # OpenClaw Gateway client
│   ├── lancedb.ts        # Vector search engine
│   └── websocket.ts      # Real-time WebSocket server
└── types/                # TypeScript type definitions
```

---

## Local Development Setup

### Prerequisites

- **Node.js 18+** (LTS recommended)
- **npm 9+** (comes with Node.js)
- **Git** with SSH access to repository
- **OpenClaw Gateway** running and accessible
- **OpenAI API Key** (for semantic search)

### Step 1: Clone Repository

```bash
# Clone the repository
git clone git@github.com:KaiOpenClaw/talon-private.git
cd talon-private

# Install dependencies
npm install
```

### Step 2: Environment Configuration

```bash
# Copy environment template
cp .env.example .env.local
```

Edit `.env.local` with your configuration:

```env
# Required: OpenClaw Gateway Connection
GATEWAY_URL=https://srv1325349.tail657eaf.ts.net:5050
GATEWAY_TOKEN=e22aedbcae546aba7af4ec09bbd74e1f1e3c7c8c3767f87b

# Optional: OpenAI for semantic search (recommended)
OPENAI_API_KEY=sk-your_openai_api_key_here

# Optional: Custom authentication token
TALON_AUTH_TOKEN=your_secure_random_token_here

# Development: Talon API for workspace access
TALON_API_URL=http://localhost:4101
TALON_API_TOKEN=talon-7k9m2x4pqr8w

# Optional: Next.js configuration
NEXT_PUBLIC_APP_NAME=Talon Dashboard
NODE_ENV=development
```

### Step 3: Start Development Server

```bash
# Start Next.js development server
npm run dev

# Open browser to http://localhost:4000
```

### Step 4: Verify Setup

✅ **Development Checklist**:
- [ ] Dashboard loads at `http://localhost:4000`
- [ ] System Status shows green Gateway connection
- [ ] Agents list populates from OpenClaw
- [ ] Chat interface can send test messages
- [ ] Search functionality works (if OpenAI key provided)
- [ ] WebSocket real-time updates function
- [ ] No console errors in browser DevTools

### Development Workflow

#### Hot Reloading
- **Frontend changes**: Automatically reload in browser
- **API route changes**: Restart automatically with Next.js
- **Environment changes**: Requires server restart (`Ctrl+C` then `npm run dev`)

#### Debugging
```bash
# Enable debug logging
DEBUG=talon:* npm run dev

# View API logs
tail -f .next/server.log

# Check WebSocket connections
curl -i -N -H "Connection: Upgrade" -H "Upgrade: websocket" \
  -H "Sec-WebSocket-Version: 13" -H "Sec-WebSocket-Key: test" \
  http://localhost:4000/api/ws
```

#### Testing
```bash
# Run type checking
npm run type-check

# Build production bundle (tests all routes)
npm run build

# Test production build locally  
npm run start
```

---

## Production Deployment

### Deployment Options

#### Option 1: Render (Recommended)

**Automated Deployment**:
[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy?repo=https://github.com/KaiOpenClaw/talon-private)

**Manual Deployment**:
1. **Create Render Account** at https://render.com
2. **Connect GitHub** repository `KaiOpenClaw/talon-private`
3. **Create Web Service** with these settings:
   - **Runtime**: Node.js 18+
   - **Build Command**: `npm run build`
   - **Start Command**: `npm start`
   - **Auto-Deploy**: Yes (deploy on git push)

4. **Set Environment Variables** (see Environment Configuration below)

#### Option 2: Vercel

**Limitations**: Cannot use LanceDB (requires native modules)
**Good for**: Testing, simple deployments without search

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy to Vercel
vercel --prod

# Set environment variables
vercel env add GATEWAY_URL
vercel env add GATEWAY_TOKEN
# ... repeat for all variables
```

#### Option 3: Docker

```dockerfile
# Dockerfile (already included in repository)
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
```

Deploy with Docker:
```bash
# Build image
docker build -t talon-dashboard .

# Run container
docker run -p 3000:3000 \
  -e GATEWAY_URL=https://your-gateway:5050 \
  -e GATEWAY_TOKEN=your_token \
  -e OPENAI_API_KEY=sk-your_key \
  talon-dashboard
```

### Environment Configuration

#### Required Variables

```env
# OpenClaw Gateway (mandatory)
GATEWAY_URL=https://srv1325349.tail657eaf.ts.net:5050
GATEWAY_TOKEN=e22aedbcae546aba7af4ec09bbd74e1f1e3c7c8c3767f87b
```

#### Recommended Variables

```env
# Semantic search (highly recommended)
OPENAI_API_KEY=sk-your_openai_api_key_here

# Authentication (generates random if not set)
TALON_AUTH_TOKEN=your_64_character_random_token

# Optional: Custom app configuration
NEXT_PUBLIC_APP_NAME=Your Company Talon
NEXT_PUBLIC_APP_VERSION=1.0.0
```

#### Advanced Variables

```env
# Performance tuning
WS_HEARTBEAT_INTERVAL=30000
API_CACHE_TTL=60
SEARCH_INDEX_BATCH_SIZE=100

# Security hardening  
CSP_ENABLED=true
RATE_LIMIT_ENABLED=true
SESSION_TIMEOUT=7d

# External integrations
DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/...
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/...
```

### Getting Environment Values

#### Extract from OpenClaw Configuration

```bash
# Get Gateway Token from OpenClaw config
cd /root/clawd
grep -r "token" ~/.openclaw/openclaw.json

# Get Gateway URL (if using Tailscale Funnel)
tailscale funnel status
```

#### Generate Secure Tokens

```bash
# Generate 64-character authentication token
openssl rand -hex 32

# Or using Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Performance Optimization

#### Caching Strategy
- **Static Assets**: CDN caching with long TTL
- **API Responses**: In-memory cache with 60s TTL  
- **Search Results**: 5-minute cache with stale-while-revalidate
- **WebSocket Data**: Real-time updates bypass cache

#### Scaling Configuration
```env
# Handle high traffic
MAX_CONCURRENT_REQUESTS=100
WS_MAX_CONNECTIONS=500
SEARCH_RATE_LIMIT=10/minute
API_RATE_LIMIT=100/minute
```

---

## Contributing Guidelines

### Development Process

#### 1. Issue-Driven Development
- All work should reference a GitHub issue
- Use issue templates for bugs, features, and improvements
- Follow issue labeling conventions (priority, type, area)

#### 2. Branch Strategy
```bash
# Create feature branch from main
git checkout main
git pull origin main
git checkout -b feature/issue-123-description

# Make changes and commit
git add .
git commit -m "feat: implement feature description (#123)"

# Push and create PR
git push origin feature/issue-123-description
```

#### 3. Code Quality Standards

**TypeScript Requirements**:
- Zero `any` types (use proper interfaces)
- Strict mode enabled
- All functions typed with return types
- Use centralized type definitions in `src/types/`

**Code Style**:
```typescript
// ✅ Good: Proper component structure
interface ComponentProps {
  title: string;
  onAction: (id: string) => void;
  isLoading?: boolean;
}

export function Component({ title, onAction, isLoading = false }: ComponentProps) {
  return (
    <div className="p-4 bg-white dark:bg-gray-900">
      {/* Component content */}
    </div>
  );
}

// ❌ Bad: Missing types, inline styles
export function Component(props: any) {
  return <div style={{padding: 16}}>{props.title}</div>;
}
```

**Error Handling**:
```typescript
// ✅ Good: Structured logging with context
import { logApiError } from '@/lib/logger';

try {
  const result = await gatewayClient.listSessions();
  return result;
} catch (error) {
  logApiError('SessionsList', 'Failed to fetch sessions', error, {
    action: 'listSessions',
    timestamp: new Date().toISOString()
  });
  throw error;
}

// ❌ Bad: Console statements without context
try {
  const result = await fetch('/api/sessions');
} catch (error) {
  console.error('Error:', error);
}
```

### Testing Requirements

#### Unit Tests
```bash
# Run tests
npm test

# Run with coverage
npm run test:coverage

# Watch mode for development
npm run test:watch
```

#### Integration Tests
```typescript
// Example API route test
import { testApiHandler } from 'next-test-api-route-handler';
import handler from '@/app/api/sessions/route';

describe('/api/sessions', () => {
  it('returns sessions list', async () => {
    await testApiHandler({
      handler,
      test: async ({ fetch }) => {
        const res = await fetch({
          method: 'GET',
          headers: { Authorization: 'Bearer test-token' }
        });
        expect(res.status).toBe(200);
        const data = await res.json();
        expect(data.sessions).toBeDefined();
      }
    });
  });
});
```

#### Build Validation
```bash
# Ensure build passes
npm run build

# Type checking
npm run type-check

# Lint and format
npm run lint
npm run format
```

### Pull Request Process

#### PR Template
```markdown
## Description
Brief description of changes and motivation

## Type of Change
- [ ] Bug fix
- [ ] New feature  
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Unit tests pass
- [ ] Integration tests pass
- [ ] Manual testing completed
- [ ] Build validation successful

## Screenshots/Videos
Include screenshots for UI changes

## Related Issues
Closes #123
Related to #456
```

#### Review Checklist
- [ ] Code follows TypeScript strict mode
- [ ] No console.log statements (use structured logging)
- [ ] Components are properly typed
- [ ] Error handling follows project patterns
- [ ] Tests cover new functionality
- [ ] Documentation updated if needed

---

## API Documentation

### REST API Endpoints

#### Authentication
All API routes require authentication via Authorization header:
```http
Authorization: Bearer your_gateway_token_here
```

#### Core Endpoints

**Sessions Management**
```typescript
// GET /api/sessions - List all sessions
interface SessionsResponse {
  sessions: Session[];
  activeCount: number;
  totalCount: number;
}

// POST /api/sessions/send - Send message to session
interface SendMessageRequest {
  sessionKey: string;
  message: string;
  agentId?: string;
}
```

**Agent Management**
```typescript
// GET /api/agents - List all agents  
interface AgentsResponse {
  agents: Agent[];
  activeCount: number;
  totalCount: number;
}

interface Agent {
  id: string;
  name: string;
  status: 'active' | 'idle' | 'offline';
  lastActivity: string;
  sessionCount: number;
  workspace: string;
}
```

**Search Functionality**
```typescript
// POST /api/search - Semantic search
interface SearchRequest {
  query: string;
  agentFilter?: string;
  limit?: number;
  minScore?: number;
}

interface SearchResponse {
  results: SearchResult[];
  query: string;
  processingTime: number;
  totalResults: number;
}
```

**System Monitoring**
```typescript
// GET /api/system/health - System health check
interface HealthResponse {
  gateway: 'connected' | 'disconnected' | 'error';
  database: 'healthy' | 'degraded' | 'error';
  search: 'available' | 'disabled' | 'error';
  websocket: 'active' | 'inactive';
  uptime: number;
}
```

#### Error Responses

All API routes follow consistent error response format:
```typescript
interface ApiError {
  error: string;
  message: string;
  statusCode: number;
  timestamp: string;
  requestId: string;
}

// Example error responses
{
  "error": "GATEWAY_UNAVAILABLE",
  "message": "Cannot connect to OpenClaw Gateway",
  "statusCode": 502,
  "timestamp": "2026-02-20T03:00:00.000Z",
  "requestId": "req_123456"
}
```

### WebSocket API

#### Connection
```javascript
const ws = new WebSocket('wss://your-talon.com/api/ws');
ws.addEventListener('message', (event) => {
  const data = JSON.parse(event.data);
  console.log('WebSocket message:', data);
});
```

#### Message Types
```typescript
interface WebSocketMessage {
  type: 'session_update' | 'agent_status' | 'system_alert' | 'heartbeat';
  payload: any;
  timestamp: string;
}

// Session updates
{
  "type": "session_update",
  "payload": {
    "sessionKey": "session_123",
    "newMessage": {...},
    "agentId": "duplex"
  },
  "timestamp": "2026-02-20T03:00:00.000Z"
}

// System alerts
{
  "type": "system_alert", 
  "payload": {
    "level": "warning" | "error" | "info",
    "message": "Gateway connection restored",
    "component": "gateway"
  },
  "timestamp": "2026-02-20T03:00:00.000Z"
}
```

---

## Extending Talon

### Custom Components

#### Creating New Dashboard Widgets
```typescript
// src/components/custom/my-widget.tsx
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useSafeApiCall } from '@/lib/hooks';

interface MyWidgetProps {
  agentId?: string;
  refreshInterval?: number;
}

export function MyWidget({ agentId, refreshInterval = 30000 }: MyWidgetProps) {
  const { data, loading, error, refetch } = useSafeApiCall(
    `/api/custom/my-data${agentId ? `?agentId=${agentId}` : ''}`,
    { refreshInterval }
  );

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <Card>
      <CardHeader>
        <CardTitle>My Custom Widget</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Your custom widget content */}
      </CardContent>
    </Card>
  );
}
```

#### Adding to Dashboard
```typescript
// src/app/(dashboard)/page.tsx
import { MyWidget } from '@/components/custom/my-widget';

export default function Dashboard() {
  return (
    <div className="space-y-6">
      {/* Existing dashboard content */}
      <MyWidget />
    </div>
  );
}
```

### Custom API Routes

#### Creating New Endpoints
```typescript
// src/app/api/custom/my-endpoint/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest } from '@/lib/auth';
import { logApiError } from '@/lib/logger';

export async function GET(request: NextRequest) {
  try {
    // Authenticate request
    const authResult = await authenticateRequest(request);
    if (!authResult.success) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Your custom logic here
    const customData = await getCustomData();

    return NextResponse.json({
      data: customData,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logApiError('CustomEndpoint', 'Failed to fetch custom data', error);
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    );
  }
}

async function getCustomData() {
  // Implement your custom data fetching logic
  return { message: 'Hello from custom endpoint!' };
}
```

### Plugins and Extensions

#### Plugin Architecture (Coming in v0.9.0)
```typescript
// Plugin interface definition
interface TalonPlugin {
  name: string;
  version: string;
  description: string;
  
  // Lifecycle hooks
  onInstall?: () => Promise<void>;
  onUninstall?: () => Promise<void>;
  onEnable?: () => Promise<void>;
  onDisable?: () => Promise<void>;
  
  // Extension points
  dashboardWidgets?: React.ComponentType[];
  apiRoutes?: { path: string; handler: Function }[];
  menuItems?: MenuItem[];
}

// Example plugin
export const ExamplePlugin: TalonPlugin = {
  name: 'example-plugin',
  version: '1.0.0',
  description: 'Example plugin for Talon',
  
  dashboardWidgets: [MyWidget],
  menuItems: [
    {
      label: 'My Plugin',
      href: '/plugins/example',
      icon: 'plugin'
    }
  ]
};
```

### Integration Examples

#### Slack Integration
```typescript
// src/lib/integrations/slack.ts
interface SlackWebhook {
  url: string;
  channel?: string;
}

export async function sendSlackNotification(
  webhook: SlackWebhook, 
  message: string
) {
  const response = await fetch(webhook.url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      text: message,
      channel: webhook.channel
    })
  });
  
  if (!response.ok) {
    throw new Error(`Slack webhook failed: ${response.statusText}`);
  }
}

// Usage in API route
export async function POST(request: NextRequest) {
  const { message } = await request.json();
  
  if (process.env.SLACK_WEBHOOK_URL) {
    await sendSlackNotification(
      { url: process.env.SLACK_WEBHOOK_URL },
      `Talon Alert: ${message}`
    );
  }
  
  return NextResponse.json({ success: true });
}
```

#### Custom Gateway Commands
```typescript
// src/lib/gateway-extensions.ts
import { gatewayClient } from '@/lib/gateway';

export class CustomGatewayCommands {
  static async getCustomMetrics(agentId: string) {
    return gatewayClient.executeCommand(
      `openclaw agent --agent ${agentId} -m "Get performance metrics"`
    );
  }
  
  static async triggerCustomWorkflow(workflowName: string) {
    return gatewayClient.executeCommand(
      `openclaw skills run custom-workflow --name ${workflowName}`
    );
  }
}
```

---

## Conclusion

This developer guide provides everything needed to:
- ✅ Set up local development environment
- ✅ Deploy Talon to production  
- ✅ Contribute high-quality code
- ✅ Build custom extensions and integrations

### Next Steps

1. **Start Development**: Follow the [Local Development Setup](#local-development-setup)
2. **Join Community**: [Discord](https://discord.gg/openclaw) and [GitHub Discussions](https://github.com/KaiOpenClaw/talon-private/discussions)
3. **Find Issues**: Check [Good First Issues](https://github.com/KaiOpenClaw/talon-private/issues?q=is%3Aissue+is%3Aopen+label%3A%22good+first+issue%22)
4. **Read Code**: Explore the codebase and understand the patterns

### Resources

- **[User Guide](./USER_GUIDE.md)** - Complete user documentation
- **[API Reference](./api-reference.md)** - Detailed API documentation  
- **[Contributing Guide](../CONTRIBUTING.md)** - Code contribution process
- **[Security Guide](./security-guide.md)** - Security best practices

---

**🚀 Ready to build the future of AI agent management?**

*Questions? Join our [Discord community](https://discord.gg/openclaw) - we're here to help!*